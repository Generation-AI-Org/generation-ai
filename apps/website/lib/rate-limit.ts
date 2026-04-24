// apps/website/lib/rate-limit.ts
// Rate-limit helper for Server Actions in the Website app.
// Pattern copied from apps/tools-app/lib/ratelimit.ts (Phase 6).
//
// Phase 23 D-06: 5 requests / 15 min per IP for /join waitlist submit.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitResult =
  | { success: true; remaining?: number }
  | { success: false; retryAfter: number; reset: number }

let ratelimit: Ratelimit | null = null

function getLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit
  // Graceful: if env vars missing, disable (fail-open)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[rate-limit] Upstash env vars missing — rate limiting disabled')
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
    console.warn('[rate-limit] Upstash init failed:', err)
    return null
  }
}

/**
 * Check if an IP can submit the waitlist form.
 * Gracefully fails open if Redis is unavailable.
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
    console.warn('[rate-limit] limit() failed, failing open:', err)
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
