/**
 * Phase 25 — typed error class for all Circle-API calls.
 *
 * Used by:
 * - `apps/website/app/actions/signup.ts` (Plan 25-E) for non-blocking fallback
 * - `apps/website/app/api/admin/circle-reprovision/route.ts` (Plan 25-F)
 * - Sentry `circle-api` tag (R6.7)
 */

export type CircleErrorCode =
  | 'UNAUTHORIZED'     // 401/403 — token invalid or revoked
  | 'RATE_LIMITED'     // 429
  | 'NOT_FOUND'        // 404
  | 'CONFLICT'         // 409 — duplicate member, already in space (often benign)
  | 'SERVER_ERROR'     // 5xx
  | 'NETWORK_ERROR'    // fetch threw (timeout, DNS, reset)
  | 'CONFIG_MISSING'   // CIRCLE_API_TOKEN or CIRCLE_COMMUNITY_ID not set
  | 'UNKNOWN'

export class CircleApiError extends Error {
  readonly code: CircleErrorCode
  readonly statusCode?: number
  readonly correlationId?: string
  constructor(
    code: CircleErrorCode,
    message: string,
    opts?: { statusCode?: number; correlationId?: string; cause?: unknown },
  ) {
    super(message, opts?.cause !== undefined ? { cause: opts.cause } : undefined)
    this.name = 'CircleApiError'
    this.code = code
    this.statusCode = opts?.statusCode
    this.correlationId = opts?.correlationId
  }
}
