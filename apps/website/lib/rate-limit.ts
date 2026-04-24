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

let waitlistLimiter: Ratelimit | null = null
let confirmLimiter: Ratelimit | null = null
let signupLimiter: Ratelimit | null = null
let adminLimiter: Ratelimit | null = null

function envPresent(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function getLimiter(): Ratelimit | null {
  if (waitlistLimiter) return waitlistLimiter
  if (!envPresent()) return null
  try {
    const redis = Redis.fromEnv()
    waitlistLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // D-06
      prefix: 'ratelimit:waitlist:ip',
      analytics: true,
    })
    return waitlistLimiter
  } catch (err) {
    console.error('[rate-limit] Upstash init failed — falling back to unlimited:', err)
    return null
  }
}

function getConfirmLimiter(): Ratelimit | null {
  if (confirmLimiter) return confirmLimiter
  if (!envPresent()) return null
  try {
    const redis = Redis.fromEnv()
    confirmLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // Phase 25 Plan D
      prefix: 'ratelimit:confirm:ip',
      analytics: true,
    })
    return confirmLimiter
  } catch (err) {
    console.error('[rate-limit] Upstash confirm-limiter init failed:', err)
    return null
  }
}

function getSignupLimiter(): Ratelimit | null {
  if (signupLimiter) return signupLimiter
  if (!envPresent()) return null
  try {
    const redis = Redis.fromEnv()
    signupLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // Phase 25 Plan E — matches waitlist budget
      prefix: 'ratelimit:signup:ip',
      analytics: true,
    })
    return signupLimiter
  } catch (err) {
    console.error('[rate-limit] Upstash signup-limiter init failed:', err)
    return null
  }
}

function getAdminLimiter(): Ratelimit | null {
  if (adminLimiter) return adminLimiter
  if (!envPresent()) return null
  try {
    const redis = Redis.fromEnv()
    adminLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '15 m'), // Phase 25 Plan F — admin-user quota
      prefix: 'ratelimit:admin-reprovision:userid',
      analytics: true,
    })
    return adminLimiter
  } catch (err) {
    console.error('[rate-limit] Upstash admin-limiter init failed:', err)
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
 * Check if an IP can hit the /auth/confirm route (Phase 25).
 * Same 5/15min budget as waitlist. Fails open on Upstash outage.
 */
export async function checkConfirmRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getConfirmLimiter()
  if (!limiter) return { success: true }
  try {
    const { success, reset, remaining } = await limiter.limit(ip)
    if (success) return { success: true, remaining }
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { success: false, retryAfter, reset }
  } catch (err) {
    console.error('[rate-limit] confirm limit() failed — failing open:', err)
    return { success: true }
  }
}

/**
 * Check if an IP can POST /api/auth/signup (Phase 25 Plan E).
 * 5 requests / 15 min budget. Fails open on Upstash outage.
 */
export async function checkSignupRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getSignupLimiter()
  if (!limiter) return { success: true }
  try {
    const { success, reset, remaining } = await limiter.limit(ip)
    if (success) return { success: true, remaining }
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { success: false, retryAfter, reset }
  } catch (err) {
    console.error('[rate-limit] signup limit() failed — failing open:', err)
    return { success: true }
  }
}

/**
 * Check if an admin can hit /api/admin/circle-reprovision (Phase 25 Plan F).
 * Keyed by admin user-id (not IP) — 20 requests / 15 min.
 */
export async function checkAdminReprovisionRateLimit(
  adminUserId: string,
): Promise<RateLimitResult> {
  const limiter = getAdminLimiter()
  if (!limiter) return { success: true }
  try {
    const { success, reset, remaining } = await limiter.limit(adminUserId)
    if (success) return { success: true, remaining }
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { success: false, retryAfter, reset }
  } catch (err) {
    console.error('[rate-limit] admin-reprovision limit() failed — failing open:', err)
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
