// Phase 25 — Confirm route with Circle SSO handoff
// Handles Supabase PKCE email-confirm URL + redirects to Circle-SSO if the
// user has a linked Circle-member-id. Falls back to /welcome?circle=pending
// when Circle is unavailable (D-03 non-blocking).

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@genai/auth/server'
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

const FALLBACK_PATH = '/welcome?circle=pending'
const ERROR_PATH_BASE = '/auth/error'

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
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error || !data?.user) {
    // Do NOT log token_hash — treat as secret-ish
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'confirm.verifyOtp.failed',
      level: 'warning',
      data: { reason: error?.message ?? 'no_user', type },
    })
    return NextResponse.redirect(
      new URL(`${ERROR_PATH_BASE}?reason=invalid_or_expired`, origin),
      { status: 303 },
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
    return NextResponse.redirect(new URL(FALLBACK_PATH, origin), { status: 303 })
  }

  // -- 5. Generate Circle SSO URL -------------------------------------------
  try {
    const { ssoUrl } = await generateSsoUrl({
      memberId: circleMemberId,
      redirectPath: '/',
    })
    return NextResponse.redirect(ssoUrl, { status: 303 })
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
    return NextResponse.redirect(new URL(FALLBACK_PATH, origin), { status: 303 })
  }
}
