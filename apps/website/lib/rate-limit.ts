// apps/website/lib/rate-limit.ts
// Rate-limit helper for Server Actions in the Website app.
// Pattern copied from apps/tools-app/lib/ratelimit.ts (Phase 6).
//
// Phase 23 D-06: 5 requests / 15 min per IP for /join waitlist submit.
//
// WR-05: fail-open on Upstash outage is INTENTIONAL per plan (graceful
// degradation > blocking legitimate users on a transient infra issue), but
// silence is not. We log at module-load, on init failures, and on every
// limit() failure so the outage is visible in Vercel / Better Stack logs.
// TODO(phase-27): integrate Sentry alert when Upstash error rate >5% in a
// rolling 5-min window. Until then, Better Stack alerting on `[rate-limit]`
// log patterns is the backstop.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitResult =
  | { success: true; remaining?: number }
  | { success: false; retryAfter: number; reset: number }

// WR-05: startup-time visibility — log once when env vars are missing so we
// notice during deploy/boot rather than first-request. Runs at module-load,
// not per-request (no log spam).
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    '[rate-limit] Upstash env vars missing at startup — /join waitlist submissions will NOT be rate-limited. Honeypot remains as sole spam gate.',
  )
}

let ratelimit: Ratelimit | null = null

function getLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit
  // Graceful: if env vars missing, disable (fail-open) — see WR-05 startup warn above
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  try {
    const redis = Redis.fromEnv()
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // D-06
      prefix: 'ratelimit:waitlist:ip',
      analytics: true,
    })
    return ratelimit
  } catch (err) {
    // WR-05: elevate to console.error so log aggregators (Better Stack,
    // Vercel logs) surface it as an error, not a warning.
    console.error('[rate-limit] Upstash init failed — falling back to unlimited:', err)
    return null
  }
}

/**
 * Check if an IP can submit the waitlist form.
 * Gracefully fails open if Redis is unavailable (WR-05: logged, not silent).
 */
export async function checkWaitlistRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getLimiter()
  if (!limiter) return { success: true }

  try {
    const { success, reset, remaining } = await limiter.limit(ip)
    if (success) return { success: true, remaining }

    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { success: false, retryAfter, reset }
  } catch (err) {
    // WR-05: elevate to console.error so the outage is visible in log
    // aggregation. TODO(phase-27): Sentry.captureException(err, { level: 'warning' })
    // with a rate-limited breadcrumb so we don't flood Sentry on sustained outages.
    console.error('[rate-limit] Upstash limit() failed — failing open for this request:', err)
    return { success: true }
  }
}

/**
 * Extract client IP from headers for Server Actions (Next.js App Router).
 * Server Actions receive request via next/headers; pass the header entries in.
 */
export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return headers.get('x-real-ip') ?? '127.0.0.1'
}
