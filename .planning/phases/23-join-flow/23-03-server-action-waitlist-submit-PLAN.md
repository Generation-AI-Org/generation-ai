---
phase: 23
plan: 03
slug: server-action-waitlist-submit
type: execute
wave: 2
depends_on:
  - 23-01
  - 23-02
files_modified:
  - apps/website/lib/rate-limit.ts
  - apps/website/app/actions/waitlist.ts
autonomous: true
requirements:
  - R4.6
  - R4.7
  - R4.8
must_haves:
  truths:
    - "Server-Action `submitJoinWaitlist(formData)` existiert in `apps/website/app/actions/waitlist.ts` mit 'use server' directive"
    - "Action validiert Input mit Zod-Schema (email format, name/university required, DSGVO checkbox required)"
    - "Action rate-limited 5 Requests / 15 Minuten pro IP via Upstash Redis (graceful degrade wenn Redis down)"
    - "Action honeypot-protected (Field `website` muss leer sein)"
    - "Action inserted Row in `public.waitlist` via @genai/auth createAdminClient"
    - "Action sendet WaitlistConfirmationEmail via Resend an submitter-Email"
    - "Action returned strukturiert: { ok: true } | { ok: false, error: string, fieldErrors?: Record<string, string> }"
    - "Doppel-Signups (gleiche E-Mail) werden als Success behandelt (no-leak Privacy) — Mail wird nicht erneut versandt"
    - "Submit-Handler ist atomar austauschbar (D-10) — Interface stabil bleibt für Phase 25"
  artifacts:
    - path: "apps/website/lib/rate-limit.ts"
      provides: "Upstash-Redis Rate-Limit Helper für Website-App (waitlist + future actions)"
      exports: ["checkWaitlistRateLimit", "getClientIp"]
    - path: "apps/website/app/actions/waitlist.ts"
      provides: "'use server' Action submitJoinWaitlist + Zod-Schema + Result-Type"
      exports: ["submitJoinWaitlist", "WaitlistResult", "WaitlistFieldErrors"]
  key_links:
    - from: "apps/website/app/actions/waitlist.ts"
      to: "public.waitlist (Supabase)"
      via: "createAdminClient().from('waitlist').insert(...)"
      pattern: "from\\('waitlist'\\).insert"
    - from: "apps/website/app/actions/waitlist.ts"
      to: "packages/emails WaitlistConfirmationEmail"
      via: "render(WaitlistConfirmationEmail({ name })) + resend.emails.send"
      pattern: "WaitlistConfirmationEmail"
    - from: "apps/website/app/actions/waitlist.ts"
      to: "apps/website/lib/rate-limit.ts"
      via: "await checkWaitlistRateLimit(ip)"
      pattern: "checkWaitlistRateLimit"
---

<objective>
Server-Action `submitJoinWaitlist` bauen: Zod-Validation + Upstash-Rate-Limit + Supabase-Insert + Resend-Mail. Atomar, austauschbar (D-10), rate-limited (D-06), DSGVO-konform (D-14).

Purpose: Das Herzstück des V1-Flows. Alle Client-seitige Validation (Plan 23-05) ist Convenience — die Wahrheit liegt hier. Interface bleibt stabil, so dass Phase 25 nur den Insert-+-Mail-Teil durch Circle-Sync ersetzt.
Output: Server-Action + Rate-Limit-Helper.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/23-join-flow/23-CONTEXT.md
@.planning/phases/23-join-flow/23-UI-SPEC.md
@apps/website/app/actions/partner-inquiry.ts
@apps/tools-app/lib/ratelimit.ts
@packages/auth/src/admin.ts
@packages/auth/src/waitlist.ts

<interfaces>
<!-- From Plan 23-01 — available after that plan runs -->
```typescript
// packages/auth/src/index.ts
export { createAdminClient } from './admin'
export type { WaitlistRow, WaitlistInsert } from './waitlist'

// WaitlistInsert shape (Plan 23-01):
interface WaitlistInsert {
  email: string
  name: string
  university: string
  study_program?: string | null
  marketing_opt_in?: boolean
  redirect_after?: string | null
  source?: string
}
```

<!-- From Plan 23-02 — available after that plan runs -->
```typescript
// packages/emails/src/index.ts
export { default as WaitlistConfirmationEmail } from './templates/waitlist-confirmation'
export type { WaitlistConfirmationEmailProps } from './templates/waitlist-confirmation'
// WaitlistConfirmationEmailProps = { name: string }
```

<!-- Blueprint: apps/website/app/actions/partner-inquiry.ts structure -->
```typescript
'use server'
import { Resend } from 'resend'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitPartnerInquiry(formData: FormData): Promise<PartnerInquiryResult> {
  // 1. Honeypot
  // 2. Extract + validate fields
  // 3. Send admin mail
  // 4. Send confirmation mail
  // return { success: true } | { success: false, error: string }
}
```

<!-- Blueprint: apps/tools-app/lib/ratelimit.ts Upstash pattern -->
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()
const ipRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:chat:ip',
  analytics: true,
})
// graceful degrade: try/catch, return { success: true } if Redis fails
```
</interfaces>

<environment_notes>
- `RESEND_API_KEY` ist bereits in Vercel Env-Vars (Phase 17)
- `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` bereits gesetzt
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` sollten verfügbar sein (Phase 6/ratelimit in tools-app) — falls für `website`-App nicht gesetzt: in `.env.local` + Vercel erwähnen, aber Action muss grace-degrade wenn unset
- `from: noreply@generation-ai.org` ist verifizierter Sender (Phase 17)
</environment_notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rate-Limit-Helper für Website-App bauen</name>
  <files>apps/website/lib/rate-limit.ts</files>
  <read_first>
    - `apps/tools-app/lib/ratelimit.ts` (1:1 Pattern — kopieren + anpassen, NICHT umbauen)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-06 (5 Requests / 15 Minuten pro IP)
  </read_first>
  <action>
Erstelle `apps/website/lib/rate-limit.ts` analog zu `apps/tools-app/lib/ratelimit.ts`, aber mit D-06-Limits (5/15min per IP, nicht 10/min). Keine Session-Limits — Waitlist-Form hat keine Session.

```typescript
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
```

Wichtig:
- Prefix `ratelimit:waitlist:ip` (eigener Namespace, kollidiert nicht mit tools-app chat)
- `getLimiter()` lazy + null-safe — wenn Upstash nicht configured: rate-limit ist no-op, Action läuft durch
- `getClientIp(Headers)` Signature ist bewusst anders als tools-app (nimmt Headers statt Request, weil Server Actions kein Request-Objekt bekommen — wir lesen Headers via `next/headers`)
  </action>
  <verify>
    <automated>test -f apps/website/lib/rate-limit.ts && grep -q "export async function checkWaitlistRateLimit" apps/website/lib/rate-limit.ts && grep -q "ratelimit:waitlist:ip" apps/website/lib/rate-limit.ts && grep -q "slidingWindow(5, '15 m')" apps/website/lib/rate-limit.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - File existiert
    - `checkWaitlistRateLimit(ip: string)` exported
    - `getClientIp(headers: Headers)` exported
    - Upstash `slidingWindow(5, '15 m')` — genau D-06-Limit
    - Prefix `ratelimit:waitlist:ip`
    - Graceful degrade: wenn env vars fehlen, return success
    - try/catch um `limit()` calls
    - tsc clean
  </acceptance_criteria>
  <done>Rate-Limit-Helper ready für Action-Import.</done>
</task>

<task type="auto">
  <name>Task 2: Server-Action submitJoinWaitlist bauen</name>
  <files>apps/website/app/actions/waitlist.ts</files>
  <read_first>
    - `apps/website/app/actions/partner-inquiry.ts` (Blueprint: 'use server' + honeypot + validation + Resend pattern)
    - `apps/website/lib/rate-limit.ts` (aus Task 1)
    - `packages/auth/src/admin.ts` (createAdminClient Signatur)
    - `packages/emails/src/templates/waitlist-confirmation.tsx` (Props-Interface)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-07, D-08, D-10, D-14
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` "Copywriting Contract" (Error-Messages verbatim)
  </read_first>
  <behavior>
    <!-- Behavioral contract for this action — this block is DOCUMENTATION of the
         expected input→output mapping derived from D-07/D-08/D-10/D-14 + UI-SPEC
         Copywriting Contract. It is not a TDD red/green cycle (task type remains
         `auto`); the `<automated>` verify below runs structural grep + tsc, and
         Plan 23-06 Playwright suite validates the behavior end-to-end. -->
    - Honeypot-Field `website` befüllt → silent reject mit `{ ok: false, error: 'Ungültige Anfrage.' }`
    - Email fehlt oder invalid → `{ ok: false, fieldErrors: { email: 'Hmm, die Mail-Adresse passt noch nicht ganz.' } }`
    - Name leer → `{ ok: false, fieldErrors: { name: 'Das Feld darf nicht leer sein.' } }`
    - University leer → `{ ok: false, fieldErrors: { university: 'Das Feld darf nicht leer sein.' } }`
    - DSGVO-Checkbox nicht gesetzt → `{ ok: false, fieldErrors: { consent: 'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.' } }`
    - Rate-Limit exceeded → `{ ok: false, error: 'Zu viele Versuche. Bitte warte einen Moment.' }`
    - Valid Insert + Mail success → `{ ok: true }`
    - Duplicate Email (unique index conflict) → `{ ok: true }` (no-leak: kein Hint dass Mail bereits registriert ist; Mail wird nicht re-sent)
    - Supabase Error (nicht unique-conflict) → `{ ok: false, error: "Ups, da ist was schiefgelaufen..." }`
    - Resend Error (nach erfolgreichem DB-Insert) → trotzdem `{ ok: true }` (DB ist source-of-truth; Resend-Fail wird geloggt, User nicht blockiert)
  </behavior>
  <action>
Erstelle `apps/website/app/actions/waitlist.ts`:

```typescript
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
  study_program: z.string().trim().max(200).optional().or(z.literal('').transform(() => undefined)),
  marketing_opt_in: z.boolean().default(false),
  // consent must be literal true — checkbox either 'on' (HTML default) or 'true'
  consent: z.literal(true, { errorMap: () => ({ message: ERR_CONSENT }) }),
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
```

Kritische Punkte:
- `'use server'` ganz oben (Server-Action Pflicht)
- `import type { WaitlistInsert } from '@genai/auth'` — nur Type, kein Runtime
- Zod-Schema mit deutschen Fehlermeldungen verbatim aus UI-SPEC
- Checkbox-Coercion explizit (`formData.get('consent') === 'on' || ...`) — HTML-Checkboxen liefern 'on' als Default-Wert, nicht 'true'
- `redirect_after` refine verhindert Open-Redirect (muss mit `/` starten — absolute Paths only, kein `//evil.com`)
- `23505` unique-violation → Silent-Success (D-05 + Privacy-Best-Practice)
- Mail-Fail nach DB-Insert ist non-blocking (gleicher Pattern wie partner-inquiry.ts)
- Email wird ge-lowercased vor Insert (konsistent mit `lower(email)` unique index)
  </action>
  <verify>
    <automated>test -f apps/website/app/actions/waitlist.ts && head -1 apps/website/app/actions/waitlist.ts | grep -q "'use server'" && grep -q "export async function submitJoinWaitlist" apps/website/app/actions/waitlist.ts && grep -q "export type WaitlistResult" apps/website/app/actions/waitlist.ts && grep -q "export type WaitlistFieldErrors" apps/website/app/actions/waitlist.ts && grep -q "checkWaitlistRateLimit" apps/website/app/actions/waitlist.ts && grep -q "WaitlistConfirmationEmail" apps/website/app/actions/waitlist.ts && grep -q "createAdminClient" apps/website/app/actions/waitlist.ts && grep -q "z.literal(true" apps/website/app/actions/waitlist.ts && grep -q "23505" apps/website/app/actions/waitlist.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - File existiert mit `'use server'` als erste Zeile
    - Exports `submitJoinWaitlist`, `WaitlistResult`, `WaitlistFieldErrors`
    - Honeypot check als erstes
    - Rate-Limit per IP via Task 1 helper
    - Zod-Schema mit allen Feldern (email, name, university, study_program, marketing_opt_in, consent, redirect_after)
    - `consent` ist `z.literal(true)` mit ERR_CONSENT message
    - `redirect_after` refine `startsWith('/')` für Open-Redirect-Prevention
    - Supabase insert via `createAdminClient().from('waitlist').insert(...)`
    - `insertError.code === '23505'` → Silent-Success
    - Resend mail non-blocking (try/catch ohne Blocker)
    - Subject: `"Du stehst auf der Warteliste — Generation AI"`
    - From: `"noreply@generation-ai.org"`
    - tsc clean
  </acceptance_criteria>
  <done>Server-Action ist aufrufbar via `submitJoinWaitlist(formData)` aus Plan 23-05 Form-Component.</done>
</task>

<task type="auto">
  <name>Task 3: Smoke-Test via echtes submit gegen Prod-Supabase</name>
  <files>(keine Datei-Änderung — Manual-Test)</files>
  <read_first>
    - `apps/website/app/actions/waitlist.ts` (Task 2)
  </read_first>
  <action>
Optional Smoke-Test (kann übersprungen werden wenn lokaler Dev-Server / env-vars nicht verfügbar). Ziel: verifizieren dass die Action end-to-end läuft.

Option A — via bestehende Vitest-Infra:
1. Schauen ob `apps/website/` Vitest hat (`ls apps/website/vitest.config.*` oder `package.json` scripts). Falls ja: schreibe einen Inline-Test der `submitJoinWaitlist` mit einem Fake FormData aufruft und mockt `createAdminClient` + `resend.emails.send`.
2. Falls kein Vitest in website-app: Test überspringen — der Smoke-Test in Plan 23-06 (Playwright) verifiziert die Action indirekt via UI-Submit.

Option B — via Supabase MCP direkten Test:
```sql
-- Nach einem erfolgreichen Submit via UI (Plan 23-05), prüfen:
select email, name, university, source, created_at
from public.waitlist
order by created_at desc
limit 1;
```
Erwartung: submitted Row erscheint.

Falls weder Option A noch B umsetzbar: diesen Task skippen, in SUMMARY.md vermerken "smoke-test deferred to Plan 23-06 playwright".
  </action>
  <verify>
    <automated>pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Optional: manueller DB-Query zeigt neue Row nach Test-Submit
    - Fallback: tsc clean (Plan 23-06 verifiziert End-to-End)
  </acceptance_criteria>
  <done>Server-Action kompiliert, Insert-+-Mail-Pfad ist klar definiert.</done>
</task>

</tasks>

<verification>
- Action `submitJoinWaitlist` kompiliert
- Zod-Schema matched UI-SPEC Error-Copy verbatim
- Rate-Limit via Upstash (graceful-degrade wenn offline)
- Honeypot aktiv
- Open-Redirect-Prevention via `redirect_after.startsWith('/')` refine
- No-Leak bei Duplicate-Email (23505 → silent success)
- D-10-Interface stabil (WaitlistResult unverändert für Phase 25)
</verification>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| anon browser → Server Action | untrusted form data (email, name, university, free-text) |
| Server Action → Supabase | server-side admin client, trusted |
| Server Action → Resend API | server-side, outbound only |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-23-01 | Spoofing | Email field | mitigate | Zod email() validation + server-side check (client-side is convenience only) |
| T-23-02 | Tampering | consent field | mitigate | z.literal(true) — form cannot submit without explicit checkbox tick |
| T-23-03 | Repudiation | Waitlist insert | accept | Low-value data; audit via created_at + source columns is sufficient |
| T-23-04 | Information Disclosure | Duplicate-email hint | mitigate | 23505 unique-violation → silent success; no "email already exists" leak |
| T-23-05 | Information Disclosure | RLS bypass via anon key | mitigate | Plan 23-01 RLS policies restrict to service_role; server-action uses createAdminClient which has service_role |
| T-23-06 | Denial of Service | Mass form submission | mitigate | Upstash rate-limit 5 req / 15 min per IP (D-06) |
| T-23-07 | Denial of Service | Honeypot bypass by bots | mitigate | Field "website" must be empty; non-empty → silent reject |
| T-23-08 | Elevation of Privilege | Open-redirect via redirect_after | mitigate | Zod refine: redirect_after must start with '/' — absolute URLs rejected |
| T-23-09 | Information Disclosure | Resend API key leak | accept | Server-only via process.env, never exposed to client (Next.js App Router enforces) |
| T-23-10 | Tampering | FormData field injection (e.g. source, notified_at) | mitigate | Explicit payload construction in action — only whitelisted fields from Zod output are inserted |
</threat_model>

<success_criteria>
- `submitJoinWaitlist` ist importierbar in Plan 23-05
- Bei Test-Submit erscheint Row in `public.waitlist` + Confirmation-Mail im Postfach
- Invalid inputs geben strukturierte fieldErrors zurück
- Rate-Limit greift nach 6 Submits in 15 Minuten
</success_criteria>

<output>
Create `.planning/phases/23-join-flow/23-03-SUMMARY.md` with:
- Action signature + Result types
- Zod-Schema-Overview
- Threat-Model-Coverage
- Smoke-test-evidence (falls durchgeführt)
</output>
