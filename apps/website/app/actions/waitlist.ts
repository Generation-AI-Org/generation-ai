'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createAdminClient } from '@genai/auth'
import type { WaitlistInsert } from '@genai/auth'
import { WaitlistConfirmationEmail } from '@genai/emails'
import { checkWaitlistRateLimit, getClientIp } from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// Result types — keep stable (D-10: Phase 25 swaps implementation, not interface)
// ---------------------------------------------------------------------------

export type WaitlistFieldErrors = Partial<{
  email: string
  name: string
  university: string
  study_program: string
  consent: string
}>

export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: WaitlistFieldErrors }

// ---------------------------------------------------------------------------
// Validation schema (D-08: Zod, deutsch VOICE.md-konform)
// ---------------------------------------------------------------------------

const ERR_REQUIRED = 'Das Feld darf nicht leer sein.'
const ERR_EMAIL = 'Hmm, die Mail-Adresse passt noch nicht ganz.'
const ERR_CONSENT = 'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'
const ERR_GENERIC =
  "Ups, da ist was schiefgelaufen. Probier's nochmal oder schreib uns: admin@generation-ai.org"
const ERR_RATE_LIMIT = 'Zu viele Versuche. Bitte warte einen Moment.'
const ERR_INVALID = 'Ungültige Anfrage.'

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, ERR_REQUIRED)
    .email(ERR_EMAIL)
    .max(320), // RFC 5321
  name: z.string().trim().min(1, ERR_REQUIRED).max(200),
  university: z.string().trim().min(1, ERR_REQUIRED).max(200),
  study_program: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  marketing_opt_in: z.boolean().default(false),
  // consent must be literal true — checkbox either 'on' (HTML default) or 'true'
  consent: z.literal(true, { message: ERR_CONSENT }),
  redirect_after: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined))
    .refine((v) => !v || v.startsWith('/'), 'redirect_after must be a relative path'),
})

// ---------------------------------------------------------------------------
// Resend client (singleton)
// ---------------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY)

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Phase 23 — /join Waitlist submit.
 *
 * D-10 Interface Contract (stable across Phase 25 swap):
 *   Input:  FormData with fields (email, name, university, study_program?,
 *           marketing_opt_in?, consent, redirect_after?, website [honeypot])
 *   Output: WaitlistResult — { ok: true } | { ok: false, error, fieldErrors? }
 *
 * Phase 25 will swap the Supabase `waitlist` insert + Resend confirmation
 * for a real Supabase signup + Circle-API-Sync, but this function's
 * signature stays identical.
 */
export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult> {
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
    university: formData.get('university')?.toString() ?? '',
    study_program: formData.get('study_program')?.toString() ?? '',
    // checkboxes: 'on' in default HTML, '' or null otherwise; we coerce manually
    marketing_opt_in:
      formData.get('marketing_opt_in') === 'on' || formData.get('marketing_opt_in') === 'true',
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    redirect_after: formData.get('redirect_after')?.toString() ?? '',
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
  const supabase = createAdminClient()
  const payload: WaitlistInsert = {
    email: data.email.toLowerCase(),
    name: data.name,
    university: data.university,
    study_program: data.study_program ?? null,
    marketing_opt_in: data.marketing_opt_in,
    redirect_after: data.redirect_after ?? null,
    source: 'join-page',
  }

  const { error: insertError } = await supabase.from('waitlist').insert(payload)

  if (insertError) {
    // Unique-constraint violation on lower(email) → no-leak: treat as success
    // (do not tell bots or curious users "this email is already on the list")
    // Postgres error code for unique_violation is '23505'
    if (insertError.code === '23505') {
      console.log('[waitlist] duplicate email — returning ok without re-sending mail')
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
    console.error('[waitlist] confirmation mail failed (non-blocking):', mailError)
  }

  return { ok: true }
}
