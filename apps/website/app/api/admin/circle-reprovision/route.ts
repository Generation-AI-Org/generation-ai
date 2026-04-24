import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { createAdminClient } from '@genai/auth'
import { CircleApiError, createMember } from '@genai/circle'
import { checkAdminAuth } from '@/lib/admin-auth'
import { checkAdminReprovisionRateLimit } from '@/lib/rate-limit'

/**
 * Phase 25 Plan F — Admin-only Circle reprovisioning endpoint (D-05).
 *
 * Auth: session required + (user_metadata.role === 'admin' OR email in ADMIN_EMAIL_ALLOWLIST).
 * Rate-limit: 20/15min per admin user-id.
 * Body: { email: string } (Content-Type: application/json).
 *
 * Success: 200 { ok, circleMemberId, alreadyExists }
 * Failure: 400 | 401 | 403 | 404 | 429 | 502 | 500
 */

const bodySchema = z.object({
  email: z.string().trim().min(1).email().max(320),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  // -- 1. Admin-Auth --------------------------------------------------------
  const auth = await checkAdminAuth(request)
  if (!auth.ok) {
    Sentry.addBreadcrumb({
      category: 'admin',
      message: 'admin.reprovision.denied',
      level: 'warning',
      data: { reason: auth.reason },
    })
    return NextResponse.json({ error: auth.reason }, { status: auth.status })
  }

  // -- 2. Rate-limit per admin-user-id --------------------------------------
  const rate = await checkAdminReprovisionRateLimit(auth.userId)
  if (!rate.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // -- 3. Parse body --------------------------------------------------------
  const ct = request.headers.get('content-type') ?? ''
  if (!ct.toLowerCase().startsWith('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 400 },
    )
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid email', details: parsed.error.issues },
      { status: 400 },
    )
  }
  const targetEmail = parsed.data.email.toLowerCase()

  // -- 4. Look up target user via admin-client ------------------------------
  const supabase = createAdminClient()
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
    // Supabase doesn't expose "getByEmail" in admin API; list + filter.
    // V1: assume <1k users total. Paginate if needed later.
    perPage: 1000,
  })
  if (listErr) {
    Sentry.captureException(listErr, {
      tags: { op: 'admin.listUsers' },
      extra: { admin_user_id: auth.userId },
    })
    return NextResponse.json({ error: 'Failed to lookup user' }, { status: 500 })
  }
  // REVIEW LO-03 — fail loud once user count hits the unpaginated ceiling.
  // Without this guard, a user past position 1000 would silently 404 and the
  // admin would assume the account doesn't exist. The alert forces us to
  // either upgrade to pagination or widen perPage before shipping signup.
  if (listData.users.length >= 1000) {
    Sentry.captureMessage(
      'admin.reprovision.listUsers_ceiling_hit',
      'error',
    )
    return NextResponse.json(
      {
        error:
          'User lookup exceeded 1000-row ceiling; upgrade the reprovision route to paginate before retrying.',
      },
      { status: 500 },
    )
  }
  const targetUser = listData.users.find(
    (u) => (u.email ?? '').toLowerCase() === targetEmail,
  )
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const meta = (targetUser.user_metadata as Record<string, unknown> | null) ?? {}
  const targetName =
    typeof meta.full_name === 'string' && meta.full_name.length > 0
      ? (meta.full_name as string)
      : targetEmail.split('@')[0]

  // -- 5. Circle provisioning (idempotent, atomic with space-add) -----------
  try {
    const spaceIdEnv = process.env.CIRCLE_DEFAULT_SPACE_ID
    const spaceIds = spaceIdEnv ? [Number(spaceIdEnv)] : undefined
    const { circleMemberId, alreadyExists } = await createMember({
      email: targetEmail,
      name: targetName,
      spaceIds,
      // skipInvitation defaults to false → Circle re-sends Set-Password mail
      // on reprovision, which is what an admin-triggered reprovision should
      // do (e.g. user lost their original invitation).
    })

    // -- 6. Persist link + metadata ----------------------------------------
    const now = new Date().toISOString()
    await supabase.from('user_circle_links').upsert(
      {
        user_id: targetUser.id,
        circle_member_id: circleMemberId,
        circle_provisioned_at: now,
        last_error: null,
        last_error_at: null,
      },
      { onConflict: 'user_id' },
    )
    await supabase.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...meta,
        circle_member_id: circleMemberId,
        circle_provisioned_at: now,
        circle_provision_error: null,
      },
    })

    Sentry.addBreadcrumb({
      category: 'circle-api',
      message: 'admin.reprovision.success',
      level: 'info',
      data: {
        target_user_id: targetUser.id,
        admin_user_id: auth.userId,
        already_exists: alreadyExists,
      },
    })

    return NextResponse.json({ ok: true, circleMemberId, alreadyExists })
  } catch (err) {
    if (err instanceof CircleApiError) {
      const apiErr: CircleApiError = err
      Sentry.captureException(apiErr, {
        tags: { 'circle-api': 'true', op: 'adminReprovision.createMember' },
        extra: {
          target_user_id: targetUser.id,
          admin_user_id: auth.userId,
          code: apiErr.code,
          correlationId: apiErr.correlationId,
        },
      })
      return NextResponse.json(
        {
          error: 'Circle API failed',
          code: apiErr.code,
          correlationId: apiErr.correlationId,
        },
        { status: 502 },
      )
    }
    Sentry.captureException(err, {
      tags: { 'circle-api': 'true', op: 'adminReprovision.unknown' },
      extra: { target_user_id: targetUser.id, admin_user_id: auth.userId },
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
