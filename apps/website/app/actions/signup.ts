'use server'

import { headers } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createAdminClient } from '@genai/auth/admin'
import { CircleApiError, createMember } from '@genai/circle'
import { ConfirmSignupEmail } from '@genai/emails'
import { checkSignupRateLimit, getClientIp } from '@/lib/rate-limit'
import { parseTestResultMetadata } from '@/lib/assessment/test-result-metadata'

const resend = new Resend(process.env.RESEND_API_KEY)

// ---------------------------------------------------------------------------
// Result types (identical shape to Phase 23 WaitlistResult for drop-in swap)
// ---------------------------------------------------------------------------

export type SignupFieldErrors = Partial<{
  email: string
  name: string
  first_name: string
  last_name: string
  status: string
  university: string
  university_other: string
  study_field: string
  study_field_other: string
  study_program: string
  birth_year: string
  highest_degree: string
  career_field: string
  context: string
  consent: string
  redirect_after: string
  source: string
  pre: string
  skills: string
  test_result: string
}>

export type SignupResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: SignupFieldErrors }

// ---------------------------------------------------------------------------
// Error strings (VOICE.md-konform, match Phase 23 wording for consistency)
// ---------------------------------------------------------------------------

const ERR_REQUIRED = 'Das Feld darf nicht leer sein.'
const ERR_EMAIL = 'Hmm, die Mail-Adresse passt noch nicht ganz.'
const ERR_CONSENT =
  'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'
const ERR_GENERIC =
  "Ups, da ist was schiefgelaufen. Probier's nochmal oder schreib uns: admin@generation-ai.org"
const ERR_RATE_LIMIT = 'Zu viele Versuche. Bitte warte einen Moment.'
const ERR_INVALID = 'Ungültige Anfrage.'
const ERR_SIGNUP_CLOSED = 'Anmeldung ist momentan geschlossen.'

const signupStatusSchema = z.enum([
  'student',
  'early_career',
  'working',
  'alumni',
  'other',
])

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const schema = z
  .object({
    email: z.string().trim().min(1, ERR_REQUIRED).email(ERR_EMAIL).max(320),
    name: z.string().trim().min(1, ERR_REQUIRED).max(200),
    status: signupStatusSchema.default('student'),
    university: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    university_other: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    study_field: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    study_field_other: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    study_program: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    birth_year: z.coerce
      .number()
      .int()
      .min(1950)
      .max(2010)
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
    motivation: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    level: z.coerce.number().int().min(1).max(5).optional(),
    source: z
      .enum(['test', 'test-sparring', 'join-page'])
      .optional()
      .or(z.literal('').transform(() => undefined)),
    pre: z
      .enum(['neugieriger', 'einsteiger', 'fortgeschritten', 'pro', 'expert'])
      .optional()
      .or(z.literal('').transform(() => undefined)),
    skills: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    test_result: z
      .string()
      .trim()
      .max(3000)
      .optional()
      .or(z.literal('').transform(() => undefined)),
  })
  .superRefine((data, ctx) => {
    if (
      (data.status === 'student' || data.status === 'early_career') &&
      !data.university
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['university'],
        message: ERR_REQUIRED,
      })
    }
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
export async function submitJoinSignup(
  formData: FormData,
): Promise<SignupResult> {
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
    status: formData.get('status')?.toString() ?? 'student',
    university: formData.get('university')?.toString() ?? '',
    university_other: formData.get('university_other')?.toString() ?? '',
    study_field: formData.get('study_field')?.toString() ?? '',
    study_field_other: formData.get('study_field_other')?.toString() ?? '',
    study_program: formData.get('study_program')?.toString() ?? '',
    birth_year: formData.get('birth_year')?.toString() ?? '',
    marketing_opt_in:
      formData.get('marketing_opt_in') === 'on' ||
      formData.get('marketing_opt_in') === 'true',
    consent:
      formData.get('consent') === 'on' || formData.get('consent') === 'true',
    redirect_after: formData.get('redirect_after')?.toString() ?? '',
    motivation: formData.get('motivation')?.toString() ?? '',
    level: formData.get('level')?.toString() ?? undefined,
    source: formData.get('source')?.toString() ?? '',
    pre: formData.get('pre')?.toString() ?? '',
    skills: formData.get('skills')?.toString() ?? '',
    test_result: formData.get('test_result')?.toString() ?? '',
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
  const testResult = parseTestResultMetadata({
    source: data.source,
    pre: data.pre,
    skills: data.skills,
    testResult: data.test_result,
  })

  const baseMetadata: Record<string, unknown> = {
    full_name: data.name,
    status: data.status,
    ...(data.university ? { university: data.university } : {}),
    ...(data.university_other
      ? { university_other: data.university_other }
      : {}),
    ...(data.study_field ? { study_field: data.study_field } : {}),
    ...(data.study_field_other
      ? { study_field_other: data.study_field_other }
      : {}),
    ...(data.study_program ? { study_program: data.study_program } : {}),
    ...(data.birth_year ? { birth_year: data.birth_year } : {}),
    marketing_opt_in: data.marketing_opt_in,
    ...(sanitizedRedirect ? { redirect_after: sanitizedRedirect } : {}),
    ...(data.motivation ? { motivation: data.motivation } : {}),
    ...(data.level !== undefined ? { level: data.level } : {}),
    ...(testResult ? { test_result: testResult } : {}),
    has_password: false, // Phase 19 first-login-set-password pattern
  }

  const { data: createData, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      // Auto-confirm: Circle's Set-Password mail (skip_invitation:false in
      // createMember below) is the de-facto email-validation; if the user can
      // accept Circle's invitation, the email is theirs. We trust that signal.
      // This removes the need for our own confirm-mail in the happy path.
      email_confirm: true,
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
  // Single atomic call: createMember handles space-add and email-suppression
  // server-side via Circle's `space_ids` + `skip_invitation` params (live-
  // verified 2026-04-25). No separate addMemberToSpace call needed.
  let circleMemberId: string | null = null
  let circleError: string | null = null
  const spaceIdEnv = process.env.CIRCLE_DEFAULT_SPACE_ID
  const spaceIds = spaceIdEnv ? [Number(spaceIdEnv)] : undefined
  if (!spaceIdEnv) {
    console.warn(
      '[signup] CIRCLE_DEFAULT_SPACE_ID not set — member will be community-only, no welcome space',
    )
  }

  try {
    const result = await createMember({
      email,
      name: data.name,
      spaceIds,
      // skipInvitation defaults to false → Circle sends its Set-Password
      // email. This is the only way to flip the new member from active:false
      // to active:true (verified live 2026-04-25 — no admin or headless API
      // can activate). After Set-Password, future logins via Headless SSO.
    })
    circleMemberId = result.circleMemberId
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

  // -- 7. Send branded Welcome mail with auto-login Magic-Link to tools-app --
  // Welcome mail explains what's coming + the "Zu den KI-Tools"-CTA is a
  // Supabase magic-link that auto-logs the user into tools.generation-ai.org
  // via the shared Supabase session cookie (cross-subdomain on .generation-
  // ai.org). User clicks → tools-app /auth/confirm → verifyOtp → cookie set
  // → user lands logged-in. No separate login step.
  try {
    // Generate a magic-link hashed_token. We bypass Supabase's /verify
    // endpoint (which has the Site-URL implicit-flow bug we hit in Bug #2)
    // by constructing our own URL pointing directly at tools-app's PKCE-
    // style /auth/confirm route — same pattern as website/auth/confirm.
    const { data: linkData, error: linkErr } =
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })

    let toolsLoginUrl: string | undefined
    if (linkErr || !linkData?.properties?.hashed_token) {
      Sentry.captureException(
        linkErr ?? new Error('generateLink: no hashed_token for tools'),
        {
          tags: { op: 'generateLink.magiclink' },
        },
      )
      // Fall back to bare tools URL — user lands on /login instead of being
      // auto-logged-in, but mail still ships and is functional.
    } else {
      const url = new URL('https://tools.generation-ai.org/auth/confirm')
      url.searchParams.set('token_hash', linkData.properties.hashed_token)
      url.searchParams.set('type', 'magiclink')
      url.searchParams.set('next', '/')
      toolsLoginUrl = url.toString()
    }

    const html = await render(
      ConfirmSignupEmail({
        name: data.name,
        toolsLoginUrl,
        circleProvisioned: !!circleMemberId,
      }),
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
    console.error('[signup] welcome-mail send threw (non-blocking):', mailErr)
    Sentry.captureException(mailErr, { tags: { op: 'welcome-mail-send' } })
  }

  return { ok: true }
}
