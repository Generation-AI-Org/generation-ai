import { randomBytes } from 'node:crypto'
import { CircleApiError, type CircleErrorCode } from './errors'
import type {
  CircleMember,
  CircleSsoToken,
  CreateMemberInput,
  CreateMemberResponse,
  GenerateSsoInput,
} from './types'

// Circle exposes two distinct API surfaces with different auth-token types:
// - Admin API v2: members, spaces, etc. — auth via CIRCLE_API_TOKEN (Admin token)
// - Headless API v1: auth_token (SSO), used to mint per-member JWTs for
//   seamless community login — auth via CIRCLE_HEADLESS_TOKEN (Headless-Auth token)
// The two tokens are minted separately in Circle Dashboard → Developers → Tokens.
const ADMIN_BASE_URL = 'https://app.circle.so/api/admin/v2'
const HEADLESS_BASE_URL = 'https://app.circle.so/api/v1/headless'
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RETRIES = 3
// REVIEW NT-01/NT-02 — two attempts are retried (between attempts 0→1 and
// 1→2), so we only need two wait entries. `DEFAULT_RETRY_DELAY_MS` remains
// defensive — typed `?? DEFAULT_RETRY_DELAY_MS` fallback is unreachable
// today but keeps the code safe if `MAX_RETRIES` is bumped without updating
// the delays array.
const DEFAULT_RETRY_DELAY_MS = 1000
const RETRY_DELAYS_MS: readonly number[] = [500, 1500]

interface CircleConfig {
  token: string
  communityId: string
}

type CircleTokenType = 'admin' | 'headless'

/**
 * Lazy-read env vars so tests can mock. Throws CONFIG_MISSING if unset.
 * `tokenType` decides which env var holds the API token:
 * - 'admin'    → CIRCLE_API_TOKEN (Admin API v2 surface)
 * - 'headless' → CIRCLE_HEADLESS_TOKEN (Headless API v1 surface, e.g. SSO)
 */
function getConfig(tokenType: CircleTokenType = 'admin'): CircleConfig {
  const tokenEnvVar = tokenType === 'headless' ? 'CIRCLE_HEADLESS_TOKEN' : 'CIRCLE_API_TOKEN'
  const token = process.env[tokenEnvVar]
  const communityId = process.env.CIRCLE_COMMUNITY_ID
  if (!token || !communityId) {
    const missing = [!token && tokenEnvVar, !communityId && 'CIRCLE_COMMUNITY_ID']
      .filter(Boolean)
      .join(', ')
    throw new CircleApiError('CONFIG_MISSING', `Circle config missing: ${missing}`)
  }
  return { token, communityId }
}

function classifyError(statusCode: number): CircleErrorCode {
  if (statusCode === 401 || statusCode === 403) return 'UNAUTHORIZED'
  if (statusCode === 404) return 'NOT_FOUND'
  if (statusCode === 409) return 'CONFLICT'
  if (statusCode === 429) return 'RATE_LIMITED'
  if (statusCode >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN'
}

function shouldRetry(code: CircleErrorCode): boolean {
  return code === 'NETWORK_ERROR' || code === 'RATE_LIMITED' || code === 'SERVER_ERROR'
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Core fetch wrapper with timeout + retry + typed errors.
 * Returns parsed JSON on success, throws CircleApiError on failure.
 *
 * `tokenType` selects both the auth token (CIRCLE_API_TOKEN vs
 * CIRCLE_HEADLESS_TOKEN) and the base URL (admin v2 vs headless v1).
 */
async function circleFetch<T>(
  path: string,
  init: RequestInit & { method: 'GET' | 'POST' | 'PUT' | 'DELETE' },
  tokenType: CircleTokenType = 'admin',
): Promise<T> {
  const { token } = getConfig(tokenType)
  const baseUrl = tokenType === 'headless' ? HEADLESS_BASE_URL : ADMIN_BASE_URL
  const url = `${baseUrl}${path}`
  let lastError: CircleApiError | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })

      const correlationId = res.headers.get('x-request-id') ?? undefined

      if (!res.ok) {
        const code = classifyError(res.status)
        // Do NOT include response body in message (could leak tokens in
        // debug logs if Circle echoes auth-header in some error paths).
        lastError = new CircleApiError(
          code,
          `Circle API ${init.method} ${path} failed with status ${res.status}`,
          { statusCode: res.status, correlationId },
        )
        if (shouldRetry(code) && attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAYS_MS[attempt] ?? DEFAULT_RETRY_DELAY_MS)
          continue
        }
        throw lastError
      }

      return (await res.json()) as T
    } catch (err) {
      if (err instanceof CircleApiError) throw err
      // fetch threw (timeout/DNS/reset)
      lastError = new CircleApiError(
        'NETWORK_ERROR',
        `Circle API ${init.method} ${path} network error: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      )
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS_MS[attempt] ?? DEFAULT_RETRY_DELAY_MS)
        continue
      }
      throw lastError
    }
  }

  // Should be unreachable, but TypeScript wants it
  throw lastError ?? new CircleApiError('UNKNOWN', 'Circle API exhausted retries')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a Circle member by email. Returns null if not found.
 *
 * SECURITY-CRITICAL — uses `/community_members/search?email=` which is the
 * ONLY Circle Admin v2 endpoint that actually filters by email. The plain
 * `/community_members?email=` (without `/search`) silently ignores the query
 * and returns the unfiltered list, which led to a Phase-25 incident where
 * `getMemberByEmail` would return the first member of the community for
 * EVERY new signup (verified live 2026-04-25 — see debug log).
 *
 * Live-verified contract:
 *   match     → HTTP 200, single CircleMember object `{id, email, ...}`
 *   no-match  → HTTP 404, `{success:false, message:"Oops!..."}`
 */
export async function getMemberByEmail(
  email: string,
): Promise<{ circleMemberId: string } | null> {
  // Touch communityId to keep the CONFIG_MISSING signal here too — callers
  // expect this function to fail fast when env is incomplete.
  getConfig()
  try {
    const member = await circleFetch<CircleMember>(
      `/community_members/search?email=${encodeURIComponent(email)}`,
      { method: 'GET' },
    )
    if (!member?.id) return null
    return { circleMemberId: String(member.id) }
  } catch (err) {
    if (err instanceof CircleApiError && err.code === 'NOT_FOUND') {
      return null
    }
    throw err
  }
}

/**
 * Generate a Circle-policy-compliant random password.
 * Circle requires: ≥6 chars, 1 uppercase, 1 number, 1 symbol.
 *
 * Used for headless-only members who never type a password — login happens
 * via Headless SSO. The password exists only because Circle requires one
 * on member-create when `skip_invitation:true` (otherwise their own
 * invitation flow would set it).
 */
function generateCirclePassword(): string {
  // 32 random base64url chars + fixed suffix that guarantees the four
  // class requirements (uppercase 'A', digit '1', symbol '!').
  return `${randomBytes(24).toString('base64url')}A1!`
}

/**
 * Create a Circle community member. Idempotent: if a member with the same
 * email already exists, returns `{ alreadyExists: true }` with the existing ID
 * (no space-re-add — existing members keep their current space membership).
 *
 * For new members the request is atomic — Circle's POST /community_members
 * accepts all of: space assignment (space_ids), email-suppression
 * (skip_invitation), and password in a single call. Verified live 2026-04-25.
 *
 * Defaults:
 *   skipInvitation = true   (we send the confirmation email ourselves)
 *   spaceIds       = []     (caller passes CIRCLE_DEFAULT_SPACE_ID)
 *   password       = random (Circle requires one but it's never used —
 *                            members log in via Headless SSO)
 */
export async function createMember(
  input: CreateMemberInput,
): Promise<{ circleMemberId: string; alreadyExists: boolean }> {
  const existing = await getMemberByEmail(input.email)
  if (existing) {
    return { circleMemberId: existing.circleMemberId, alreadyExists: true }
  }

  const { communityId } = getConfig()
  const skipInvitation = input.skipInvitation ?? true

  const response = await circleFetch<CreateMemberResponse>('/community_members', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      community_id: communityId,
      skip_invitation: skipInvitation,
      password: generateCirclePassword(),
      ...(input.spaceIds && input.spaceIds.length > 0 ? { space_ids: input.spaceIds } : {}),
      // Q9: keine Uni/Motivation an Circle — bleibt in Supabase-Metadata
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }),
  })

  // BUG #6 fix: Circle wraps the new member in `community_member`, not at top
  // level. Reading `response.id` directly returned undefined → "undefined"
  // string ended up in Supabase user_metadata.circle_member_id.
  const member = response.community_member
  if (!member?.id) {
    throw new CircleApiError(
      'UNKNOWN',
      'Circle POST /community_members response missing community_member.id',
    )
  }

  return { circleMemberId: String(member.id), alreadyExists: false }
}

/**
 * Add a Circle member to a space by email. Idempotent — 409 CONFLICT
 * (already in space) is swallowed as success.
 *
 * Circle's `POST /space_members` resolves the member by email, not by
 * community_member_id (verified live against Circle MCP schema 2026-04-24:
 * required params are `{email, space_id}`). `space_id` must be an integer;
 * we coerce so callers can pass the env-var string directly.
 */
export async function addMemberToSpace(
  email: string,
  spaceId: string,
): Promise<void> {
  try {
    await circleFetch<unknown>('/space_members', {
      method: 'POST',
      body: JSON.stringify({
        space_id: Number(spaceId),
        email,
      }),
    })
  } catch (err) {
    if (err instanceof CircleApiError && err.code === 'CONFLICT') {
      // Already in space — idempotent success
      return
    }
    throw err
  }
}

/**
 * Generate a seamless-login URL for a Circle community member via the
 * Circle Headless Auth API.
 *
 * Two-step flow (per https://api.circle.so/apis/headless/quick-start +
 * https://api.circle.so/apis/headless/member-api/cookies):
 *   1. POST /api/v1/headless/auth_token → returns RS256 JWT (~1h TTL)
 *   2. Compose redirect: `${CIRCLE_COMMUNITY_URL}/session/cookies?access_token=<jwt>`
 *      Circle drops a session cookie on the community domain and lands the
 *      user at the community root.
 *
 * Requires CIRCLE_HEADLESS_TOKEN env var (mint in Circle Dashboard →
 * Developers → Tokens → type "Headless Auth"). The Admin token used by
 * other operations cannot authenticate against this endpoint.
 */
export async function generateSsoUrl(
  input: GenerateSsoInput,
): Promise<{ ssoUrl: string; expiresAt: string }> {
  const token = await circleFetch<CircleSsoToken>(
    '/auth_token',
    {
      method: 'POST',
      // Circle accepts the member ID as a number; we coerce so callers can
      // pass either string (from Supabase metadata) or number.
      body: JSON.stringify({ community_member_id: Number(input.memberId) }),
    },
    'headless',
  )

  if (!token.access_token) {
    throw new CircleApiError(
      'UNKNOWN',
      'Circle Headless auth_token response missing access_token',
    )
  }

  const base = (process.env.CIRCLE_COMMUNITY_URL ?? 'https://community.generation-ai.org')
    .replace(/\/$/, '')
  const ssoUrl = `${base}/session/cookies?access_token=${encodeURIComponent(token.access_token)}`

  return { ssoUrl, expiresAt: token.access_token_expires_at }
}
