// Phase 25 — Confirm route with Circle SSO handoff
// Handles Supabase PKCE email-confirm URL + redirects to Circle-SSO if the
// user has a linked Circle-member-id. Falls back to /welcome?circle=pending
// when Circle is unavailable (D-03 non-blocking).

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import {
  createServerClient,
  type CookieOptionsWithName,
} from '@supabase/ssr'
import { CircleApiError, generateSsoUrl } from '@genai/circle'
import { checkConfirmRateLimit, getClientIp } from '@/lib/rate-limit'

// Supabase allowed confirm types per @supabase/supabase-js EmailOtpType
type EmailOtpType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'email'

const ERROR_PATH_BASE = '/auth/error'

/**
 * REVIEW MD-03 — Centralise the `/welcome` fallback URL so the `circle` query
 * reason stays consistent across all call-sites. Prevents drift if we ever add
 * new fallback reasons (e.g. `blocked`, `outage`).
 */
type CircleFallbackReason = 'pending'
function fallbackUrl(
  origin: string,
  reason: CircleFallbackReason = 'pending',
): URL {
  return new URL(`/welcome?circle=${reason}`, origin)
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // -- 1. Basic validation --------------------------------------------------
  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL(`${ERROR_PATH_BASE}?reason=missing_params`, origin),
      { status: 303 },
    )
  }

  // -- 2. Rate-limit (5 / 15min per IP) -------------------------------------
  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const rate = await checkConfirmRateLimit(ip)
  if (!rate.success) {
    return NextResponse.redirect(
      new URL(`${ERROR_PATH_BASE}?reason=rate_limited`, origin),
      { status: 303 },
    )
  }

  // -- 3. Supabase verifyOtp ------------------------------------------------
  //
  // REVIEW HI-01 — The Supabase SSR client sets session cookies via the
  // `setAll` callback below. We MUST capture those cookies onto the exact
  // response object we return; otherwise a subsequent
  // `NextResponse.redirect(externalUrl)` constructs a fresh response that
  // does not carry the `Set-Cookie` headers and the user lands on Circle
  // without a valid Supabase session on generation-ai.org. Pattern mirrors
  // `@genai/auth/middleware.updateSession` — cookies are mirrored onto a
  // local `carrier` response, then copied onto the final redirect response
  // right before returning it.
  const cookiesToPropagate: Array<{
    name: string
    value: string
    options?: Parameters<NextResponse['cookies']['set']>[2]
  }> = []

  const envDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const cookieOptions: CookieOptionsWithName | undefined = envDomain
    ? { domain: envDomain }
    : undefined

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(toSet) {
          for (const { name, value, options } of toSet) {
            cookiesToPropagate.push({ name, value, options })
          }
        },
      },
      ...(cookieOptions ? { cookieOptions } : {}),
    },
  )

  /**
   * Build a redirect response and re-apply any session cookies the SSR
   * client wrote during `verifyOtp`. Without this step cookies were being
   * dropped when the redirect target is an external URL (Circle-SSO), which
   * regressed Phase 12 + Phase 19 session handling in earlier phases.
   */
  const redirectWithCookies = (url: URL | string): NextResponse => {
    const response = NextResponse.redirect(url, { status: 303 })
    for (const { name, value, options } of cookiesToPropagate) {
      response.cookies.set(name, value, options)
    }
    return response
  }

  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error || !data?.user) {
    // Do NOT log token_hash — treat as secret-ish
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'confirm.verifyOtp.failed',
      level: 'warning',
      data: { reason: error?.message ?? 'no_user', type },
    })
    return redirectWithCookies(
      new URL(`${ERROR_PATH_BASE}?reason=invalid_or_expired`, origin),
    )
  }

  const user = data.user
  const meta = (user.user_metadata as Record<string, unknown> | null) ?? null
  const circleMemberIdRaw = meta?.circle_member_id
  const circleMemberId =
    typeof circleMemberIdRaw === 'string' && circleMemberIdRaw.length > 0
      ? circleMemberIdRaw
      : null

  // -- 4. No Circle link → Fallback -----------------------------------------
  if (!circleMemberId) {
    Sentry.addBreadcrumb({
      category: 'circle-api',
      message: 'confirm.no_circle_link',
      level: 'info',
      data: { hasMetadata: !!meta },
    })
    return redirectWithCookies(fallbackUrl(origin))
  }

  // -- 5. Generate Circle SSO URL -------------------------------------------
  try {
    const { ssoUrl } = await generateSsoUrl({
      memberId: circleMemberId,
      redirectPath: '/',
    })
    // HI-01: If we fail to attach session cookies before the external
    // redirect, users cannot re-use the magic-link (it's consumed). Log an
    // explicit breadcrumb when we hand off without captured cookies so the
    // regression is visible in Sentry.
    if (cookiesToPropagate.length === 0) {
      Sentry.captureMessage(
        'confirm.sso_redirect.no_session_cookies',
        'warning',
      )
    }
    return redirectWithCookies(ssoUrl)
  } catch (err) {
    // Non-blocking — Supabase session is set (D-03)
    if (err instanceof CircleApiError) {
      const apiErr: CircleApiError = err
      Sentry.captureException(apiErr, {
        tags: { 'circle-api': 'true', op: 'generateSsoUrl' },
        extra: {
          code: apiErr.code,
          statusCode: apiErr.statusCode,
          correlationId: apiErr.correlationId,
        },
      })
    } else {
      Sentry.captureException(err, {
        tags: { 'circle-api': 'true', op: 'generateSsoUrl' },
      })
    }
    return redirectWithCookies(fallbackUrl(origin))
  }
}
