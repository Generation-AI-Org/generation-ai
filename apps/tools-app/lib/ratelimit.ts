// lib/ratelimit.ts
// Dual-layer rate limiting: IP + Session
// Source: CONTEXT.md D-12 to D-16, RESEARCH.md Pattern 3

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client from environment variables
// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv()

// IP-based rate limit: 10 requests per minute
const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:chat:ip',
  analytics: true,
})

// Session-based rate limit: 60 requests per hour (per D-14)
const sessionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 h'),
  prefix: 'ratelimit:chat:session',
  analytics: true,
})

interface RateLimitResult {
  success: boolean
  reset?: number
  retryAfter?: number
  limit?: number
  remaining?: number
}

/**
 * Check rate limits for both IP and session.
 * Both must pass for the request to proceed.
 *
 * @param ip - Client IP address
 * @param sessionId - Chat session ID
 * @returns Rate limit result with success flag and retry info
 */
export async function checkRateLimit(
  ip: string,
  sessionId: string
): Promise<RateLimitResult> {
  try {
    const [ipResult, sessionResult] = await Promise.all([
      ipRatelimit.limit(ip),
      sessionRatelimit.limit(sessionId),
    ])

    // Both must pass
    if (!ipResult.success || !sessionResult.success) {
      // Use the longer reset time
      const reset = Math.max(ipResult.reset, sessionResult.reset)
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)

      return {
        success: false,
        reset,
        retryAfter: Math.max(1, retryAfter), // Minimum 1 second
        limit: ipResult.success ? sessionResult.limit : ipResult.limit,
        remaining: 0,
      }
    }

    return {
      success: true,
      limit: ipResult.limit,
      remaining: Math.min(ipResult.remaining, sessionResult.remaining),
    }
  } catch (error) {
    // Graceful degradation: if Redis fails, allow the request (per CONTEXT.md specifics)
    // Log warning for monitoring
    console.warn('[RateLimit] Redis error, bypassing rate limit:', error)
    return { success: true }
  }
}

/**
 * Extract client IP from request headers (Vercel-specific).
 * Uses x-forwarded-for which Vercel overwrites to prevent spoofing.
 *
 * @param request - Incoming request
 * @returns Client IP address
 */
export function getClientIp(request: Request): string {
  // x-forwarded-for is the client IP on Vercel
  // Vercel overwrites this header, no spoofing possible
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // With proxy chains, first IP is the client
    return forwarded.split(',')[0].trim()
  }
  // Fallback for local development
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}
