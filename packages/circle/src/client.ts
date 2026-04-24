import { CircleApiError, type CircleErrorCode } from './errors'
import type {
  CircleMember,
  CircleSsoToken,
  CreateMemberInput,
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
 * Look up a Circle member by email. Returns null if not found (404).
 * Any other error bubbles up as CircleApiError.
 *
 * NOTE: Exact search path may vary across Circle Admin API versions.
 * Current best-guess: `GET /community_members?email=<email>&community_id=<id>`.
 * Adjust path/query if live API rejects it.
 */
export async function getMemberByEmail(
  email: string,
): Promise<{ circleMemberId: string } | null> {
  const { communityId } = getConfig()
  try {
    const result = await circleFetch<CircleMember | { records?: CircleMember[] }>(
      `/community_members?email=${encodeURIComponent(email)}&community_id=${encodeURIComponent(communityId)}`,
      { method: 'GET' },
    )
    // Circle sometimes returns an array wrapper, sometimes a single object.
    const member: CircleMember | undefined =
      'records' in result && Array.isArray(result.records)
        ? result.records[0]
        : 'id' in (result as CircleMember)
          ? (result as CircleMember)
          : undefined
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
 * Create a Circle community member. Idempotent: if a member with the same
 * email already exists, returns `{ alreadyExists: true }` with the existing ID.
 * (We do a GET-first to avoid Circle's 409 cost.)
 */
export async function createMember(
  input: CreateMemberInput,
): Promise<{ circleMemberId: string; alreadyExists: boolean }> {
  const existing = await getMemberByEmail(input.email)
  if (existing) {
    return { circleMemberId: existing.circleMemberId, alreadyExists: true }
  }

  const { communityId } = getConfig()
  const member = await circleFetch<CircleMember>('/community_members', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      community_id: communityId,
      // Q9: keine Uni/Motivation an Circle — bleibt in Supabase-Metadata
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }),
  })

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
