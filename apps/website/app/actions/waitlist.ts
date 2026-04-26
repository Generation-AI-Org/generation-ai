'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createAdminClient } from '@genai/auth'
import type { WaitlistInsert } from '@genai/auth'
import { WaitlistConfirmationEmail } from '@genai/emails'
import { checkWaitlistRateLimit, getClientIp } from '@/lib/rate-limit'
import { submitJoinSignup } from './signup'

// ---------------------------------------------------------------------------
// Result types — keep stable (D-10: Phase 25 swaps implementation, not interface)
// ---------------------------------------------------------------------------

export type WaitlistFieldErrors = Partial<{
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
  source: string
  pre: string
  skills: string
  test_result: string
}>

export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: WaitlistFieldErrors }

// ---------------------------------------------------------------------------
// Validation schema (D-08: Zod, deutsch VOICE.md-konform)
// ---------------------------------------------------------------------------

const ERR_REQUIRED = 'Das Feld darf nicht leer sein.'
const ERR_EMAIL = 'Hmm, die Mail-Adresse passt noch nicht ganz.'
const ERR_CONSENT =
  'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'
const ERR_GENERIC =
  "Ups, da ist was schiefgelaufen. Probier's nochmal oder schreib uns: admin@generation-ai.org"
const ERR_RATE_LIMIT = 'Zu viele Versuche. Bitte warte einen Moment.'
const ERR_INVALID = 'Ungültige Anfrage.'

const waitlistStatusSchema = z.enum([
  'student',
  'early_career',
  'working',
  'alumni',
  'other',
])

const schema = z
  .object({
    email: z.string().trim().min(1, ERR_REQUIRED).email(ERR_EMAIL).max(320), // RFC 5321
    name: z.string().trim().min(1, ERR_REQUIRED).max(200),
    status: waitlistStatusSchema.default('student'),
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
    // consent must be literal true — checkbox either 'on' (HTML default) or 'true'
    consent: z.literal(true, { message: ERR_CONSENT }),
    // CR-01 fix: block protocol-relative URLs (`//evil.com`) and backslash tricks
    // (`/\evil.com`). Only accept same-origin absolute paths starting with a
    // safe character class. Persisted to DB and consumed by Phase 25 — see D-03
    // and WR-06. Must NOT land in an `href` without an additional
    // `new URL(value, expectedOrigin)` origin check on the consumer side.
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
// Resend client (singleton)
// ---------------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY)

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Phase 23 — /join Waitlist submit (V1 implementation, kept for feature-flag rollback).
 *
 * D-10 Interface Contract (stable across Phase 25 swap):
 *   Input:  FormData with fields (email, name, status, university?,
 *           study_field?, study_program?, marketing_opt_in?, consent,
 *           redirect_after?, website [honeypot])
 *   Output: WaitlistResult — { ok: true } | { ok: false, error, fieldErrors? }
 *
 * Phase 25 keeps this function internally and adds `submitJoinSignup` as V2.
 * `submitJoinWaitlist` (the exported API) becomes a router (see bottom of file).
 */
async function legacySubmitWaitlist(
  formData: FormData,
): Promise<WaitlistResult> {
  // -- 1. Honeypot check (silent reject, no hint to bots) -------------------
  const honeypot = formData.get('website')
  if (honeypot !== null && honeypot !== '') {
    return { ok: false, error: ERR_INVALID }
  }

  // -- 2. Rate-limit by IP (D-06) -------------------------------------------
  const hdrs = await headers()
  const ip = getClientIp(hdrs)
  const rate = await checkWaitlistRateLimit(ip)
  if (!rate.success) {
    return { ok: false, error: ERR_RATE_LIMIT }
  }

  // -- 3. Zod-validate FormData ---------------------------------------------
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
    // checkboxes: 'on' in default HTML, '' or null otherwise; we coerce manually
    marketing_opt_in:
      formData.get('marketing_opt_in') === 'on' ||
      formData.get('marketing_opt_in') === 'true',
    consent:
      formData.get('consent') === 'on' || formData.get('consent') === 'true',
    redirect_after: formData.get('redirect_after')?.toString() ?? '',
    source: formData.get('source')?.toString() ?? '',
    pre: formData.get('pre')?.toString() ?? '',
    skills: formData.get('skills')?.toString() ?? '',
    test_result: formData.get('test_result')?.toString() ?? '',
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: WaitlistFieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !(key in fieldErrors)) {
        fieldErrors[key as keyof WaitlistFieldErrors] = issue.message
      }
    }
    return { ok: false, error: ERR_GENERIC, fieldErrors }
  }
  const data = parsed.data

  // -- 4. Insert into waitlist (D-05) ---------------------------------------
  // CR-01 defense-in-depth: even after Zod validation, strip backslashes and
  // collapse leading-slash runs (e.g. `///foo`) so that downstream consumers
  // in Phase 25 cannot be tricked by any validation gap. redirect_after is
  // persisted for Phase 25 Circle-Auth-Sync to use as post-signup redirect
  // target (WR-06). V1 Waitlist does not consume it — Phase 25 reads it from
  // the waitlist row during user activation and MUST re-validate origin before
  // navigating (see `new URL(value, 'https://generation-ai.org')`).
  const sanitizedRedirect = data.redirect_after
    ? data.redirect_after.replace(/\\/g, '').replace(/^\/+/, '/')
    : null

  const supabase = createAdminClient()
  const payload: WaitlistInsert = {
    email: data.email.toLowerCase(),
    name: data.name,
    status: data.status,
    university: data.university ?? null,
    study_field: data.study_field ?? null,
    study_program: data.study_program ?? null,
    birth_year: data.birth_year ?? null,
    marketing_opt_in: data.marketing_opt_in,
    redirect_after: sanitizedRedirect,
    source: data.source ?? 'join-page',
  }

  const { error: insertError } = await supabase.from('waitlist').insert(payload)

  if (insertError) {
    // Unique-constraint violation on lower(email) → no-leak: treat as success
    // (do not tell bots or curious users "this email is already on the list")
    // Postgres error code for unique_violation is '23505'
    if (insertError.code === '23505') {
      console.log(
        '[waitlist] duplicate email — returning ok without re-sending mail',
      )
      return { ok: true }
    }
    console.error('[waitlist] insert failed:', insertError)
    return { ok: false, error: ERR_GENERIC }
  }

  // -- 5. Send confirmation email (D-07) ------------------------------------
  // Resend failures must NOT block the flow — DB is source of truth.
  try {
    const html = await render(WaitlistConfirmationEmail({ name: data.name }))
    await resend.emails.send({
      from: 'noreply@generation-ai.org',
      to: data.email,
      subject: 'Du stehst auf der Warteliste — Generation AI',
      html,
    })
  } catch (mailError) {
    console.error(
      '[waitlist] confirmation mail failed (non-blocking):',
      mailError,
    )
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// Phase 25 — Feature-flag router (Q11 SIGNUP_ENABLED)
// ---------------------------------------------------------------------------

/**
 * Phase 25 — Router between V1 waitlist (Phase 23) and V2 unified signup (Phase 25).
 *
 * Client-side code (`components/join/join-form.tsx`) calls this function
 * unchanged. The router inspects `SIGNUP_ENABLED` at request time to decide
 * which backend path runs.
 *
 * - `SIGNUP_ENABLED=true`  → Phase 25 `submitJoinSignup` (real user + Circle + mail)
 * - `SIGNUP_ENABLED=false` → Phase 23 `legacySubmitWaitlist` (waitlist insert)
 *
 * The shapes of `SignupResult` and `WaitlistResult` are structurally identical
 * (`{ ok: true } | { ok: false; error: string; fieldErrors?: ... }`), so the
 * cast below is safe.
 */
export async function submitJoinWaitlist(
  formData: FormData,
): Promise<WaitlistResult> {
  if (process.env.SIGNUP_ENABLED === 'true') {
    const result = await submitJoinSignup(formData)
    return result as WaitlistResult
  }
  return legacySubmitWaitlist(formData)
}
