'use server'

import { headers } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createAdminClient } from '@genai/auth'
import { addMemberToSpace, CircleApiError, createMember } from '@genai/circle'
import { ConfirmSignupEmail } from '@genai/emails'
import { checkSignupRateLimit, getClientIp } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

// ---------------------------------------------------------------------------
// Result types (identical shape to Phase 23 WaitlistResult for drop-in swap)
// ---------------------------------------------------------------------------

export type SignupFieldErrors = Partial<{
  email: string
  name: string
  university: string
  study_program: string
  consent: string
  redirect_after: string
}>

export type SignupResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: SignupFieldErrors }

// ---------------------------------------------------------------------------
// Error strings (VOICE.md-konform, match Phase 23 wording for consistency)
// ---------------------------------------------------------------------------

const ERR_REQUIRED = 'Das Feld darf nicht leer sein.'
const ERR_EMAIL = 'Hmm, die Mail-Adresse passt noch nicht ganz.'
const ERR_CONSENT = 'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'
const ERR_GENERIC =
  "Ups, da ist was schiefgelaufen. Probier's nochmal oder schreib uns: admin@generation-ai.org"
const ERR_RATE_LIMIT = 'Zu viele Versuche. Bitte warte einen Moment.'
const ERR_INVALID = 'Ungültige Anfrage.'
const ERR_SIGNUP_CLOSED = 'Anmeldung ist momentan geschlossen.'

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const schema = z.object({
  email: z.string().trim().min(1, ERR_REQUIRED).email(ERR_EMAIL).max(320),
  name: z.string().trim().min(1, ERR_REQUIRED).max(200),
  university: z.string().trim().min(1, ERR_REQUIRED).max(200),
  study_program: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  marketing_opt_in: z.boolean().default(false),
  consent: z.literal(true, { message: ERR_CONSENT }),
  redirect_after: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined))
    .refine(
      (v) => !v || /^\/[A-Za-z0-9_\-][A-Za-z0-9_\-/?=&.%#]*$/.test(v),
      'redirect_after must be a same-origin absolute path',
    ),
  // Optional R4/R5 fields (carried through from /join flow)
  status: z.enum(['student', 'pre-studium', 'early-career']).optional(),
  motivation: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  level: z.coerce.number().int().min(1).max(5).optional(),
})

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Phase 25 — Unified signup.
 *
 * Flow: honeypot → rate-limit → zod → supabase createUser (email_confirm:false,
 * has_password:false, random placeholder pw never shown to user) →
 * Circle createMember + addMemberToSpace (non-blocking, D-03) →
 * upsert user_circle_links + update user_metadata.circle_member_id →
 * generateLink('magiclink') to trigger the "confirm-signup" email.
 *
 * Returns { ok: true } for duplicate emails as well (no-leak).
 */
export async function submitJoinSignup(formData: FormData): Promise<SignupResult> {
  // -- 0. Feature-flag defense-in-depth (REVIEW MD-02) ----------------------
  // `/api/auth/signup` checks this too, but the server action is a
  // separate public surface (server-form-actions). A stale flag check
  // there is cheap; a flag bypass here is expensive.
  if (process.env.SIGNUP_ENABLED !== 'true') {
    return { ok: false, error: ERR_SIGNUP_CLOSED }
  }

  // -- 1. Honeypot ----------------------------------------------------------
  const honeypot = formData.get('website')
  if (honeypot !== null && honeypot !== '') {
    return { ok: false, error: ERR_INVALID }
  }

  // -- 2. Rate-limit --------------------------------------------------------
  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const rate = await checkSignupRateLimit(ip)
  if (!rate.success) {
    return { ok: false, error: ERR_RATE_LIMIT }
  }

  // -- 3. Parse + validate --------------------------------------------------
  const raw = {
    email: formData.get('email')?.toString() ?? '',
    name: formData.get('name')?.toString() ?? '',
    university: formData.get('university')?.toString() ?? '',
    study_program: formData.get('study_program')?.toString() ?? '',
    marketing_opt_in:
      formData.get('marketing_opt_in') === 'on' ||
      formData.get('marketing_opt_in') === 'true',
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    redirect_after: formData.get('redirect_after')?.toString() ?? '',
    status: (formData.get('status')?.toString() as
      | 'student'
      | 'pre-studium'
      | 'early-career'
      | undefined) ?? undefined,
    motivation: formData.get('motivation')?.toString() ?? '',
    level: formData.get('level')?.toString() ?? undefined,
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: SignupFieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !(key in fieldErrors)) {
        fieldErrors[key as keyof SignupFieldErrors] = issue.message
      }
    }
    return { ok: false, error: ERR_GENERIC, fieldErrors }
  }
  const data = parsed.data

  // -- 4. Create Supabase user ---------------------------------------------
  const supabase = createAdminClient()
  const email = data.email.toLowerCase()

  const sanitizedRedirect = data.redirect_after
    ? data.redirect_after.replace(/\\/g, '').replace(/^\/+/, '/')
    : null

  const baseMetadata: Record<string, unknown> = {
    full_name: data.name,
    university: data.university,
    ...(data.study_program ? { study_program: data.study_program } : {}),
    marketing_opt_in: data.marketing_opt_in,
    ...(sanitizedRedirect ? { redirect_after: sanitizedRedirect } : {}),
    ...(data.status ? { status: data.status } : {}),
    ...(data.motivation ? { motivation: data.motivation } : {}),
    ...(data.level !== undefined ? { level: data.level } : {}),
    has_password: false, // Phase 19 first-login-set-password pattern
  }

  const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: false,
    // Random 32-byte password — never shown to user. They'll set one via
    // Phase-19 set-password flow. Supabase requires a password on createUser
    // but the magic-link/confirm flow does not use it.
    password: randomBytes(32).toString('base64url'),
    user_metadata: baseMetadata,
  })

  if (createErr) {
    const code = (createErr as unknown as { code?: string }).code
    const msg = createErr.message?.toLowerCase() ?? ''
    if (
      code === 'email_exists' ||
      msg.includes('already been registered') ||
      msg.includes('already registered') ||
      msg.includes('user already registered')
    ) {
      // No-leak: do not reveal enumeration, do not re-send confirmation.
      return { ok: true }
    }
    Sentry.captureException(createErr, {
      tags: { op: 'supabase.admin.createUser' },
    })
    return { ok: false, error: ERR_GENERIC }
  }

  const user = createData?.user
  if (!user) {
    Sentry.captureMessage('createUser returned no user', 'error')
    return { ok: false, error: ERR_GENERIC }
  }

  // -- 5. Circle-Provisioning (non-blocking per D-03) -----------------------
  let circleMemberId: string | null = null
  let circleError: string | null = null
  try {
    const result = await createMember({ email, name: data.name })
    circleMemberId = result.circleMemberId

    // Auto-join welcome space (D-06)
    const spaceId = process.env.CIRCLE_DEFAULT_SPACE_ID
    if (spaceId) {
      try {
        await addMemberToSpace(email, spaceId)
      } catch (spaceErr) {
        // Sub-non-blocking: member exists, just not in welcome space
        if (spaceErr instanceof CircleApiError) {
          Sentry.captureException(spaceErr, {
            tags: { 'circle-api': 'true', op: 'addMemberToSpace' },
            extra: {
              code: spaceErr.code,
              correlationId: spaceErr.correlationId,
            },
          })
        } else {
          Sentry.captureException(spaceErr, {
            tags: { 'circle-api': 'true', op: 'addMemberToSpace' },
          })
        }
      }
    } else {
      console.warn(
        '[signup] CIRCLE_DEFAULT_SPACE_ID not set — skipping welcome space join',
      )
    }
  } catch (err) {
    if (err instanceof CircleApiError) {
      circleError = `${err.code}: ${err.message}`
      Sentry.captureException(err, {
        tags: { 'circle-api': 'true', op: 'createMember' },
        extra: {
          code: err.code,
          correlationId: err.correlationId,
          statusCode: err.statusCode,
        },
      })
    } else {
      circleError = String(err)
      Sentry.captureException(err, {
        tags: { 'circle-api': 'true', op: 'createMember' },
      })
    }
  }

  // -- 6. Persist user_circle_links + user_metadata.circle_member_id --------
  try {
    if (circleMemberId) {
      const nowIso = new Date().toISOString()
      await supabase.from('user_circle_links').upsert(
        {
          user_id: user.id,
          circle_member_id: circleMemberId,
          circle_provisioned_at: nowIso,
          last_error: null,
          last_error_at: null,
        },
        { onConflict: 'user_id' },
      )
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...baseMetadata,
          circle_member_id: circleMemberId,
          circle_provisioned_at: nowIso,
        },
      })
    } else if (circleError) {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...baseMetadata,
          circle_provision_error: circleError,
          circle_provision_failed_at: new Date().toISOString(),
        },
      })
    }
  } catch (persistErr) {
    Sentry.captureException(persistErr, {
      tags: { op: 'persistCircleLink' },
    })
  }

  // -- 7. Trigger confirmation email ---------------------------------------
  // admin.generateLink in Supabase-JS v2 ONLY generates the link —
  // it does NOT send an email, even with Custom-SMTP enabled.
  // So we: generate the link → render our ConfirmSignup template →
  // send via Resend directly (same path the waitlist-flow uses).
  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://generation-ai.org')

    // Use 'signup' type — it's the correct action for an unconfirmed user
    // created via admin.createUser({ email_confirm: false }). Returns an
    // action_link that points to Supabase's /verify endpoint which then
    // redirects to redirectTo after verifying the token.
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: randomBytes(32).toString('base64url'),
      options: {
        redirectTo: `${origin}/auth/confirm`,
      },
    })

    if (linkErr || !linkData?.properties?.hashed_token) {
      Sentry.captureException(linkErr ?? new Error('generateLink: no hashed_token'), {
        tags: { op: 'generateLink' },
      })
      // Don't return ok:false — user is created, just mail is missing.
      // Admin can re-trigger via a future resend-confirmation endpoint.
      return { ok: true }
    }

    // Build our own confirm URL that points directly to our PKCE-style
    // verifyOtp route. We bypass Supabase's /auth/v1/verify endpoint (which
    // uses the implicit flow and is subject to the Site-URL-fallback bug).
    // The hashed_token from generateLink IS the token_hash verifyOtp expects.
    const confirmUrl = new URL(`${origin}/auth/confirm`)
    confirmUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
    confirmUrl.searchParams.set('type', 'signup')

    const html = await render(
      ConfirmSignupEmail({ name: data.name, confirmationUrl: confirmUrl.toString() }),
    )

    const { error: sendErr } = await resend.emails.send({
      from: 'Generation AI <noreply@generation-ai.org>',
      to: email,
      subject: 'Willkommen bei Generation AI 👋',
      html,
    })

    if (sendErr) {
      Sentry.captureException(sendErr, { tags: { op: 'resend.emails.send' } })
    }
  } catch (mailErr) {
    console.error('[signup] confirm-mail send threw (non-blocking):', mailErr)
    Sentry.captureException(mailErr, { tags: { op: 'confirm-mail-send' } })
  }

  return { ok: true }
}
