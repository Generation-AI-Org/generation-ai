import { CircleApiError, type CircleErrorCode } from './errors'
import type {
  CircleMember,
  CircleSsoToken,
  CreateMemberInput,
  GenerateSsoInput,
} from './types'

const BASE_URL = 'https://app.circle.so/api/admin/v2'
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_SSO_TTL_SECONDS = 7 * 24 * 60 * 60 // Q4: 7 days
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

/** Lazy-read env vars so tests can mock. Throws CONFIG_MISSING if unset. */
function getConfig(): CircleConfig {
  const token = process.env.CIRCLE_API_TOKEN
  const communityId = process.env.CIRCLE_COMMUNITY_ID
  if (!token || !communityId) {
    const missing = [!token && 'CIRCLE_API_TOKEN', !communityId && 'CIRCLE_COMMUNITY_ID']
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
 */
async function circleFetch<T>(
  path: string,
  init: RequestInit & { method: 'GET' | 'POST' | 'PUT' | 'DELETE' },
): Promise<T> {
  const { token } = getConfig()
  const url = `${BASE_URL}${path}`
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
 * Add a Circle member to a space. Idempotent — 409 CONFLICT
 * (already in space) is swallowed as success.
 */
export async function addMemberToSpace(
  memberId: string,
  spaceId: string,
): Promise<void> {
  try {
    await circleFetch<unknown>('/space_members', {
      method: 'POST',
      body: JSON.stringify({
        space_id: spaceId,
        community_member_id: memberId,
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
 * Generate a passwordless SSO login URL for a Circle member.
 * TTL defaults to 7 days (Q4) to match Supabase confirm-link lifetime.
 *
 * NOTE: Exact endpoint may be `/headless_auth_tokens` or
 * `/community_members/:id/sso_token` depending on Circle plan. Plan H E2E
 * will catch a path mismatch. The response shape accepts both `sso_url`
 * (preferred) and `access_token` + composed URL fallback.
 */
export async function generateSsoUrl(
  input: GenerateSsoInput,
): Promise<{ ssoUrl: string; expiresAt: string }> {
  const token = await circleFetch<CircleSsoToken>('/headless_auth_tokens', {
    method: 'POST',
    body: JSON.stringify({
      community_member_id: input.memberId,
      redirect_path: input.redirectPath ?? '/',
      ttl_seconds: input.ttlSeconds ?? DEFAULT_SSO_TTL_SECONDS,
    }),
  })

  // Prefer `sso_url`; fall back to composing from `access_token` + CIRCLE_COMMUNITY_URL.
  let ssoUrl = token.sso_url
  if (!ssoUrl && token.access_token) {
    const base = process.env.CIRCLE_COMMUNITY_URL ?? 'https://community.generation-ai.org'
    const redirect = encodeURIComponent(input.redirectPath ?? '/')
    ssoUrl = `${base.replace(/\/$/, '')}/sso?token=${encodeURIComponent(token.access_token)}&redirect=${redirect}`
  }
  if (!ssoUrl) {
    throw new CircleApiError(
      'UNKNOWN',
      'Circle SSO response missing both sso_url and access_token',
    )
  }
  return { ssoUrl, expiresAt: token.expires_at }
}
