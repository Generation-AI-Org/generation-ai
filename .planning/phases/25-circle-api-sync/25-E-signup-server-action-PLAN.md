---
phase: 25
plan: E
slug: signup-server-action
type: execute
wave: 2
depends_on:
  - 25-A
  - 25-B
files_modified:
  - apps/website/app/actions/signup.ts
  - apps/website/app/actions/waitlist.ts
  - apps/website/app/api/auth/signup/route.ts
  - apps/website/components/join/join-form.tsx
  - apps/website/lib/rate-limit.ts
autonomous: true
requirements:
  - R6.1
  - R6.3
  - R6.4
  - R6.5
  - R6.6
  - R6.7
must_haves:
  truths:
    - "Neue Server-Action `submitJoinSignup(formData)` existiert in `apps/website/app/actions/signup.ts` mit 'use server'."
    - "Interface-Contract ist 1:1 kompatibel mit bisheriger `submitJoinWaitlist` (Plan 23-D-10): Input `FormData`, Output `{ ok: true } | { ok: false, error, fieldErrors? }` — Form-Client-Code auf `/join` bleibt unverändert."
    - "`submitJoinWaitlist` in `app/actions/waitlist.ts` delegiert jetzt zu `submitJoinSignup` wenn `SIGNUP_ENABLED === 'true'`, sonst fällt zurück auf Waitlist-Insert (Alte Logik). Umschalten per Env-Var, kein Code-Deploy (Q11)."
    - "`submitJoinSignup` flow: (1) honeypot, (2) rate-limit, (3) zod-validate, (4) supabase.auth.admin.createUser mit raw_user_meta_data (status/uni/motivation/level/full_name), (5) Circle createMember → addMemberToSpace (non-blocking), (6) upsert user_circle_links + update raw_user_meta_data.circle_member_id, (7) Supabase trigger confirmation email via admin.inviteUserByEmail ODER via signUp-Flow (Executor entscheidet basierend auf Supabase-Doc-Check)."
    - "Circle-API-Fehler sind **non-blocking** (D-03): Signup returnt trotzdem `{ ok: true }`, User kriegt Mail. In `user_circle_links` wird `last_error` + `last_error_at` gesetzt für Re-Provision."
    - "Alle Circle-API-Fehler werden via Sentry mit Tag `circle-api` geloggt (R6.7), inkl. `op` (createMember / addMemberToSpace) + correlationId, **ohne** Token + **ohne** full user object."
    - "Duplicate-Email in Supabase → return `{ ok: true }` no-leak (matches Phase-23-Pattern)."
    - "Duplicate-Email in Circle → `createMember` ist idempotent (Plan B), re-uses existing circleMemberId — kein Fehler für User."
    - "`/api/auth/signup/route.ts` 503-Block wird entfernt + zu einer Proxy-Route refactored, die POST-Requests an `submitJoinSignup` delegiert (für alte API-Clients / E2E-Tests). Wenn `SIGNUP_ENABLED !== 'true'` → 503 response behalten (Feature-Flag)."
    - "Rate-Limit: 5 Signup-Attempts / 15min per IP (matches Plan-23-Pattern, Plan D Confirm-Rate-Limit + Plan-E-Signup-Rate-Limit sind **separate prefixes** um Confirm-Attempts nicht zu verbrauchen)."
    - "`full_name` wird aus `name` Form-Field in `raw_user_meta_data.full_name` geschrieben (damit `{{ .Data.full_name }}` im Email-Template greift, Plan C)."
  artifacts:
    - path: "apps/website/app/actions/signup.ts"
      provides: "Unified Signup Server-Action mit Supabase + Circle + Email-Trigger"
      exports: ["submitJoinSignup", "SignupResult", "SignupFieldErrors"]
    - path: "apps/website/app/actions/waitlist.ts"
      provides: "Router zwischen Waitlist-V1 (Phase 23) und Signup-V2 (Phase 25) via SIGNUP_ENABLED"
      exports: ["submitJoinWaitlist", "WaitlistResult", "WaitlistFieldErrors"]
    - path: "apps/website/app/api/auth/signup/route.ts"
      provides: "POST-Endpoint für externe Clients / E2E-Tests; delegiert zu submitJoinSignup"
      exports: ["POST"]
  key_links:
    - from: "apps/website/app/actions/signup.ts"
      to: "packages/circle createMember + generateSsoUrl"
      via: "await createMember({ email, name })"
      pattern: "createMember|addMemberToSpace"
    - from: "apps/website/app/actions/signup.ts"
      to: "public.user_circle_links"
      via: "supabase.from('user_circle_links').upsert(...)"
      pattern: "from\\('user_circle_links'\\)"
    - from: "apps/website/app/actions/signup.ts"
      to: "auth.users"
      via: "supabase.auth.admin.createUser + admin.updateUserById"
      pattern: "admin\\.(create|update)User"
---

<objective>
Das Herzstück der Phase: die Server-Action, die Supabase-Signup + Circle-Provisioning + Email-Trigger atomar orchestriert. Der Client-Form auf `/join` (Phase 23) bleibt unverändert — er weiss nur dass er `submitJoinWaitlist(formData)` callt. Unter der Haube swapped diese Action zwischen Waitlist-V1 und Signup-V2 per Env-Flag (Q11 Signup-Reactivation-Gate).

Purpose: R6.1 (End-to-End-Server-Action) + R6.3 (Graceful-Degrade) + R6.5 (circle_member_id füllen) + R6.6 (Feature-Flag) + R6.7 (Sentry).
Output: 3 Files angefasst (signup.ts neu, waitlist.ts router-ized, api/auth/signup/route.ts refactored).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@apps/website/app/actions/waitlist.ts
@apps/website/app/api/auth/signup/route.ts
@packages/auth/src/admin.ts
@packages/auth/src/index.ts
@packages/auth/src/circle.ts
@packages/circle/src/index.ts
@apps/website/lib/rate-limit.ts

<interfaces>
```typescript
// apps/website/app/actions/signup.ts
'use server'

export type SignupFieldErrors = Partial<{
  email: string
  name: string
  university: string
  study_program: string
  consent: string
}>

export type SignupResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: SignupFieldErrors }

export async function submitJoinSignup(formData: FormData): Promise<SignupResult>

// apps/website/app/actions/waitlist.ts (updated router)
export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult> {
  if (process.env.SIGNUP_ENABLED === 'true') {
    return submitJoinSignup(formData)  // Phase 25 path
  }
  return legacySubmitWaitlist(formData)  // Phase 23 V1 path (existing logic, extracted)
}
```

**Supabase-Call-Pattern** (verify against `node_modules/@supabase/supabase-js` at execute time):

```typescript
// Option A: admin.createUser (full control, no auto-mail)
const { data, error } = await supabase.auth.admin.createUser({
  email,
  email_confirm: false,  // require confirmation
  user_metadata: { full_name, status, uni, motivation, level },
})
// Then manually trigger confirmation mail:
await supabase.auth.resend({ type: 'signup', email })
// — or —
await supabase.auth.admin.generateLink({
  type: 'signup',
  email,
  options: { redirectTo: `${origin}/auth/confirm` },
})

// Option B: signUp (sends mail automatically, but uses public API — rate-limited by Supabase)
// We prefer Option A for explicit control + retry + metadata-injection-before-mail.
```

**user_metadata shape** (written by createUser, read by Plan C email template + Plan D confirm route):
```typescript
{
  full_name: string,
  status: 'student' | 'pre-studium' | 'early-career',
  uni?: string,
  motivation?: string,
  level?: number,
  circle_member_id?: string,     // set AFTER Circle provisioning succeeds
  circle_provisioned_at?: string,
}
```
</interfaces>

<environment_notes>
- `apps/website/app/actions/waitlist.ts` ist aus Phase 23 und wird aktuell vom Join-Form gecalled. Wir **ersetzen die Implementierung nicht** — wir wrappen sie: alte Logic als `legacySubmitWaitlist` in gleicher Datei, neuer Export `submitJoinWaitlist` ist Router.
- `apps/website/components/join/join-form.tsx` existiert (Phase 23) und nutzt `submitJoinWaitlist` — bleibt unverändert. **Kein UI-Change in diesem Plan.**
- `apps/website/app/api/auth/signup/route.ts` returnt aktuell 503. Wir refactoren das zu: wenn `SIGNUP_ENABLED !== 'true'` → 503 (gleich wie vorher), sonst delegiert zu `submitJoinSignup(formData)`. E2E-Tests können dann via POST die Action triggern.
- Supabase-Admin-Client aus `@genai/auth` `createAdminClient()` — hat service_role-Perms für `admin.createUser` + `admin.updateUserById`.
- `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` sind bereits in Vercel-Env.
- `@sentry/nextjs` sollte existieren; Plan H verifiziert + installiert falls fehlend.
- `CIRCLE_DEFAULT_SPACE_ID` aus Env → Welcome-Space für Auto-Join (D-06).
</environment_notes>
</context>

<threat_model>
**Asset:** Signup-Endpoint (erzeugt Supabase-User + Circle-Member; missbrauchbar für Massen-Account-Creation / DoS).

**Threats (ASVS L1):**

1. **Abuse: Mass Account Creation (spam bots).**
   - Mitigation: Upstash Rate-Limit (5 / 15min per IP). Honeypot-Field (Phase-23-Pattern). Zod-Validation (required fields). Supabase-Signup-Rate-Limits kicken zusätzlich in bei massivem Traffic.
   - Residual: Distributed-IPs können Limit umgehen — nicht in Scope (Captcha ist Phase-26+).

2. **SSRF via Supabase-Admin-Call.**
   - Mitigation: `createAdminClient()` pointing to hardcoded `NEXT_PUBLIC_SUPABASE_URL`. Kein User-Input in URL.

3. **Injection in raw_user_meta_data.**
   - Mitigation: Zod-validierte Strings (max-length-Limits wie Phase-23). JSONB ist safe against SQL-Injection. Downstream-Consumers (Email-Template, Confirm-Route) dürfen keine HTML-Interpolation ohne Escape machen — Plan C nutzt React-Email (auto-escape), Plan D caste + String-Prüfung.

4. **Circle-API-Fehler-Maskierung.**
   - Mitigation: `CircleApiError` wird **immer** in Sentry captured. User sieht "ok" (D-03 Non-Blocking), aber Luca bekommt Alert (R6.7). In `user_circle_links.last_error` + `last_error_at` ist history erhalten für Re-Provision (Plan F).

5. **Feature-Flag Race: SIGNUP_ENABLED flippt während Request.**
   - Mitigation: Env-Var wird einmal am Funktions-Start gelesen, Entscheidung für diesen Request konsistent. Deploy + Env-Var-Update schießen nie parallele Requests ab (Vercel atomar).

6. **Circle-Member-Auto-Join-Space-Missconfig.**
   - Mitigation: Wenn `CIRCLE_DEFAULT_SPACE_ID` nicht gesetzt, `addMemberToSpace` skip (config check), aber Log-Warning. Member ist in Community, nur nicht im Welcome-Space. Nicht breaking.

**Block on:** BLOCKER (kein Rate-Limit, Token-im-Log, createUser-Race-Condition ohne Idempotenz).
**Residual:** Email-Ownership-Check wird über Supabase-Mail-Confirm-Flow erzwungen, nicht durch uns — Attacker-mit-Email-Zugang-Scenario ist Standard-Email-Auth-Risk.
</threat_model>

<tasks>

<task type="auto">
  <name>Task E1: Rate-Limit-Helper für Signup + Confirm erweitern</name>
  <files>apps/website/lib/rate-limit.ts</files>
  <read_first>
    - `apps/website/lib/rate-limit.ts` (vollständig — bestehende `checkWaitlistRateLimit` Struktur beibehalten)
  </read_first>
  <action>
Zwei neue Exports in `apps/website/lib/rate-limit.ts` ergänzen (ganz nach `checkWaitlistRateLimit`, gleiche Pattern-Struktur):

```typescript
let signupLimiter: Ratelimit | null = null

function getSignupLimiter(): Ratelimit | null {
  if (signupLimiter) return signupLimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  try {
    const redis = Redis.fromEnv()
    signupLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'ratelimit:signup:ip',
      analytics: true,
    })
    return signupLimiter
  } catch (err) {
    console.error('[rate-limit] signup init failed:', err)
    return null
  }
}

export async function checkSignupRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getSignupLimiter()
  if (!limiter) return { success: true }
  try {
    const { success, reset, remaining } = await limiter.limit(ip)
    if (success) return { success: true, remaining }
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { success: false, retryAfter, reset }
  } catch (err) {
    console.error('[rate-limit] signup limit() failed:', err)
    return { success: true }
  }
}
```

Dasselbe mit prefix `ratelimit:confirm:ip` für `checkConfirmRateLimit` (Plan D nutzt es — wenn D1 bereits den Helper dort angelegt hat, hier skip). Falls beide Plans parallel Wave-2 executen: Plan E legt BEIDE Helper an (`checkSignupRateLimit` + `checkConfirmRateLimit`), Plan D kann dann einfach importieren.

**Pattern-Treue:**
- Gleiches `Ratelimit.slidingWindow(5, '15 m')`
- Gleiche graceful-degrade-Logic wie `checkWaitlistRateLimit`
- Gleiche `console.error` statt `console.warn` für Failures (matches Phase-23 WR-05)
  </action>
  <verify>
    <automated>grep -q "export async function checkSignupRateLimit" apps/website/lib/rate-limit.ts && grep -q "ratelimit:signup:ip" apps/website/lib/rate-limit.ts && grep -q "export async function checkConfirmRateLimit" apps/website/lib/rate-limit.ts && grep -q "ratelimit:confirm:ip" apps/website/lib/rate-limit.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `checkSignupRateLimit` exported
    - `checkConfirmRateLimit` exported (für Plan D)
    - Prefixes sind disjoint (`signup:ip` und `confirm:ip` und bestehender `waitlist:ip`)
    - Graceful degrade wenn Upstash down
    - tsc clean
  </acceptance_criteria>
  <done>Rate-Limit-Infra für alle 3 Routes steht.</done>
</task>

<task type="auto">
  <name>Task E2: signup.ts Server-Action bauen</name>
  <files>apps/website/app/actions/signup.ts</files>
  <read_first>
    - `apps/website/app/actions/waitlist.ts` (Blueprint für Struktur: Honeypot + Rate-Limit + Zod + try/catch)
    - `packages/circle/src/client.ts` (Helper-Signaturen)
    - `packages/auth/src/admin.ts` (createAdminClient)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` D-01, D-03, D-06, D-07, D-09
    - `node_modules/@supabase/supabase-js/dist/module/lib/AuthAdminApi.d.ts` (admin.createUser / admin.updateUserById Signaturen)
  </read_first>
  <action>
Erstelle `apps/website/app/actions/signup.ts`:

```typescript
'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@genai/auth'
import {
  addMemberToSpace,
  CircleApiError,
  createMember,
} from '@genai/circle'
import { checkSignupRateLimit, getClientIp } from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// Result types (identical shape to Phase 23 WaitlistResult for drop-in swap)
// ---------------------------------------------------------------------------

export type SignupFieldErrors = Partial<{
  email: string
  name: string
  university: string
  study_program: string
  consent: string
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

// ---------------------------------------------------------------------------
// Validation schema (extends Phase 23 schema with optional status/motivation/level)
// ---------------------------------------------------------------------------

const schema = z.object({
  email: z.string().trim().min(1, ERR_REQUIRED).email(ERR_EMAIL).max(320),
  name: z.string().trim().min(1, ERR_REQUIRED).max(200),
  university: z.string().trim().min(1, ERR_REQUIRED).max(200),
  study_program: z.string().trim().max(200).optional().or(z.literal('').transform(() => undefined)),
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
  // Optional R4/R5 fields (from /join flow)
  status: z.enum(['student', 'pre-studium', 'early-career']).optional(),
  motivation: z.string().trim().max(2000).optional().or(z.literal('').transform(() => undefined)),
  level: z.coerce.number().int().min(1).max(5).optional(),
})

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

export async function submitJoinSignup(formData: FormData): Promise<SignupResult> {
  // -- 1. Honeypot ----------------------------------------------------------
  if (formData.get('website')) {
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
      formData.get('marketing_opt_in') === 'on' || formData.get('marketing_opt_in') === 'true',
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    redirect_after: formData.get('redirect_after')?.toString() ?? '',
    status: formData.get('status')?.toString() ?? undefined,
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

  // -- 4. Create Supabase user (with metadata) ------------------------------
  const supabase = createAdminClient()
  const email = data.email.toLowerCase()
  const userMetadata: Record<string, unknown> = {
    full_name: data.name,
    university: data.university,
    ...(data.study_program ? { study_program: data.study_program } : {}),
    marketing_opt_in: data.marketing_opt_in,
    ...(data.redirect_after ? { redirect_after: data.redirect_after } : {}),
    ...(data.status ? { status: data.status } : {}),
    ...(data.motivation ? { motivation: data.motivation } : {}),
    ...(data.level !== undefined ? { level: data.level } : {}),
  }

  const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: userMetadata,
  })

  if (createErr) {
    // Supabase-specific: duplicate email returns a 422 with `email_exists` code
    // or similar. Treat as success (no-leak, matches Phase-23 pattern) — do NOT
    // re-send confirmation mail (prevents account-takeover spamming).
    if ((createErr as unknown as { code?: string }).code === 'email_exists' || createErr.message?.toLowerCase().includes('already been registered')) {
      console.log('[signup] duplicate email — returning ok without action')
      return { ok: true }
    }
    Sentry.captureException(createErr, {
      tags: { 'circle-api': false, op: 'supabase.admin.createUser' },
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
        await addMemberToSpace(circleMemberId, spaceId)
      } catch (spaceErr) {
        // Sub-non-blocking: member exists, just not in welcome space
        if (spaceErr instanceof CircleApiError) {
          Sentry.captureException(spaceErr, {
            tags: { 'circle-api': true, op: 'addMemberToSpace' },
            extra: { code: spaceErr.code, correlationId: spaceErr.correlationId },
          })
        }
      }
    } else {
      console.warn('[signup] CIRCLE_DEFAULT_SPACE_ID not set — skipping welcome space join')
    }
  } catch (err) {
    if (err instanceof CircleApiError) {
      circleError = `${err.code}: ${err.message}`
      Sentry.captureException(err, {
        tags: { 'circle-api': true, op: 'createMember' },
        extra: { code: err.code, correlationId: err.correlationId, statusCode: err.statusCode },
      })
    } else {
      circleError = String(err)
      Sentry.captureException(err, { tags: { 'circle-api': true, op: 'createMember' } })
    }
  }

  // -- 6. Upsert user_circle_links + update user_metadata.circle_member_id --
  try {
    if (circleMemberId) {
      // Successful provision
      await supabase.from('user_circle_links').upsert({
        user_id: user.id,
        circle_member_id: circleMemberId,
        circle_provisioned_at: new Date().toISOString(),
        last_error: null,
        last_error_at: null,
      })
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...userMetadata,
          circle_member_id: circleMemberId,
          circle_provisioned_at: new Date().toISOString(),
        },
      })
    } else if (circleError) {
      // Failed — record for retry
      // Note: we still need a row so reprovision knows which user to target.
      // Use a placeholder circle_member_id OR skip the row entirely and let
      // reprovision iterate over auth.users without circle_member_id.
      // Decision: skip row, reprovision iterates over auth.users + raw_user_meta_data.
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...userMetadata,
          circle_provision_error: circleError,
          circle_provision_failed_at: new Date().toISOString(),
        },
      })
    }
  } catch (persistErr) {
    // Persistence failure is non-fatal for the flow — user is created, mail
    // will send — but log it so reprovision can still find the user.
    Sentry.captureException(persistErr, {
      tags: { 'circle-api': false, op: 'persistCircleLink' },
    })
  }

  // -- 7. Trigger confirmation mail -----------------------------------------
  // admin.generateLink returns the action_link + sends the mail via Supabase
  // if the project has SMTP configured. Verify against @supabase/supabase-js
  // docs at execute time.
  try {
    const origin = hdrs.get('origin') ?? 'https://generation-ai.org'
    await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${origin}/auth/confirm`,
      },
    })
  } catch (mailErr) {
    // Mail send is non-fatal — DB is source of truth. User can retry via
    // "Mail erneut senden"-Flow (future plan).
    console.error('[signup] generateLink/mail failed (non-blocking):', mailErr)
    Sentry.captureException(mailErr, {
      tags: { 'circle-api': false, op: 'generateLink' },
    })
  }

  return { ok: true }
}
```

**Executor-Hinweise:**
- Prüfe zum Execute-Zeit die exakte Supabase-Admin-API-Signatur in `node_modules/@supabase/supabase-js/dist/module/lib/AuthAdminApi.d.ts` — `generateLink` vs `inviteUserByEmail` vs `resend` sind drei verschiedene Pfade mit unterschiedlichen Semantiken. Für "Confirm-Signup-Mail senden nach Metadata-Set" ist `generateLink` + Supabase-SMTP der Weg, aber falls API anders heisst, adjust.
- `supabase.auth.admin.updateUserById` verschmilzt `user_metadata` nicht automatisch — wir geben das komplette Objekt (inkl. existing keys) neu rein. Das ist fine für First-Signup, aber bei Reprovision (Plan F) müssen wir first read existing, then merge.
- `email_confirm: false` = User ist nicht bestätigt, muss Mail klicken. `true` wäre Auto-Confirm (nicht was wir wollen).
  </action>
  <verify>
    <automated>test -f apps/website/app/actions/signup.ts && grep -q "'use server'" apps/website/app/actions/signup.ts && grep -q "export async function submitJoinSignup" apps/website/app/actions/signup.ts && grep -q "createMember" apps/website/app/actions/signup.ts && grep -q "addMemberToSpace" apps/website/app/actions/signup.ts && grep -q "user_circle_links" apps/website/app/actions/signup.ts && grep -q "admin.createUser" apps/website/app/actions/signup.ts && grep -q "Sentry.captureException" apps/website/app/actions/signup.ts && grep -q "'circle-api': true" apps/website/app/actions/signup.ts && grep -q "checkSignupRateLimit" apps/website/app/actions/signup.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - Action existiert + `'use server'`
    - `submitJoinSignup(FormData)` → `Promise<SignupResult>` exportiert
    - Honeypot + Rate-Limit + Zod in genau dieser Reihenfolge
    - `createAdminClient` → `admin.createUser` mit `user_metadata` + `email_confirm: false`
    - `createMember` aus `@genai/circle` aufgerufen, wrapped in try/catch
    - `CircleApiError` → Sentry mit Tag `'circle-api': true` + `op: createMember`
    - Duplicate-Email no-leak (return `{ ok: true }`)
    - `user_circle_links.upsert` bei Circle-Success
    - `admin.updateUserById` mit `circle_member_id` im user_metadata
    - Confirmation-Link via `admin.generateLink` triggered
    - tsc clean
  </acceptance_criteria>
  <done>Signup-Server-Action funktional + Circle-non-blocking + Sentry-tagged.</done>
</task>

<task type="auto">
  <name>Task E3: Waitlist-Action zum Router umbauen (Feature-Flag-Switch)</name>
  <files>apps/website/app/actions/waitlist.ts</files>
  <read_first>
    - `apps/website/app/actions/waitlist.ts` (vollständig lesen — alte Logic behalten als `legacySubmitWaitlist`, neuer Export ist Router)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` Q11 (SIGNUP_ENABLED Flag)
  </read_first>
  <action>
Strukturiere `apps/website/app/actions/waitlist.ts` so um:

1. **Alte Export-Funktion `submitJoinWaitlist` wird umbenannt zu `legacySubmitWaitlist`** (interne Funktion, NICHT mehr exportiert). Signatur + Implementation bleiben 1:1.

2. **Neuer Export `submitJoinWaitlist`** ist Thin-Router:

```typescript
import { submitJoinSignup, type SignupResult } from './signup'

/**
 * Router between V1 waitlist (Phase 23) and V2 unified signup (Phase 25).
 * Feature-Flag: SIGNUP_ENABLED=true toggles Phase 25 path.
 * Client-Side code (join-form.tsx) calls this function unchanged.
 */
export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult> {
  if (process.env.SIGNUP_ENABLED === 'true') {
    // Delegate to Phase 25 signup. SignupResult shape is compatible (ok: true | ok: false + error + fieldErrors).
    const result: SignupResult = await submitJoinSignup(formData)
    return result as WaitlistResult  // identical shape
  }
  return legacySubmitWaitlist(formData)
}
```

3. **Bestehende `WaitlistResult` + `WaitlistFieldErrors` bleiben exportiert** (Client importiert sie als Type). Wichtig: `SignupResult` in `signup.ts` hat denselben structural shape → Cast ist safe (nicht lie).

4. **Alle bisherigen Imports in `waitlist.ts` bleiben** — Zod, Resend, `WaitlistConfirmationEmail`, `createAdminClient` — `legacySubmitWaitlist` nutzt sie weiter.

5. **TypeScript-Drift-Prüfung:** Wenn `SignupResult.fieldErrors` eine zusätzliche Property hat die `WaitlistFieldErrors` nicht hat, erweitere `WaitlistFieldErrors` um die Optional-Keys, nicht umgekehrt. Das garantiert Cast-Safety.

Konkretes Template-Diff (nur die Rahmen-Änderungen, Body von `legacySubmitWaitlist` bleibt identisch):

```typescript
// OLD:
export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult> {
  // ... 150 lines of impl ...
}

// NEW:
async function legacySubmitWaitlist(formData: FormData): Promise<WaitlistResult> {
  // ... unchanged 150 lines ...
}

import { submitJoinSignup, type SignupResult } from './signup'

export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult> {
  if (process.env.SIGNUP_ENABLED === 'true') {
    const result = await submitJoinSignup(formData)
    return result as WaitlistResult  // Shape-compatible per Plan E contract
  }
  return legacySubmitWaitlist(formData)
}
```

**Warum nicht einfach `submitJoinWaitlist` komplett ersetzen:** Sicherheits-Guardrail. Solange `SIGNUP_ENABLED=false` (Default) läuft die alte, verifizierte Waitlist-Logic. Luca kann in Phase 27 flippen + rollback in 10 Sekunden falls was schiefgeht (Env-Var zurück auf `false`).
  </action>
  <verify>
    <automated>grep -q "async function legacySubmitWaitlist" apps/website/app/actions/waitlist.ts && grep -q "process.env.SIGNUP_ENABLED === 'true'" apps/website/app/actions/waitlist.ts && grep -q "submitJoinSignup" apps/website/app/actions/waitlist.ts && grep -q "export async function submitJoinWaitlist" apps/website/app/actions/waitlist.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `submitJoinWaitlist` ist Router (check: enthält `process.env.SIGNUP_ENABLED`)
    - `legacySubmitWaitlist` ist eigene interne Funktion (nicht exportiert)
    - `submitJoinSignup` wird importiert aus `./signup`
    - `WaitlistResult` + `WaitlistFieldErrors` bleiben exportiert
    - Bestehende `join-form.tsx` bleibt unverändert (Contract-Treue)
    - tsc clean
  </acceptance_criteria>
  <done>Waitlist-Action ist jetzt Feature-flagged Router zwischen V1 und V2.</done>
</task>

<task type="auto">
  <name>Task E4: /api/auth/signup Route-Handler refactor (503 → Delegate)</name>
  <files>apps/website/app/api/auth/signup/route.ts</files>
  <read_first>
    - `apps/website/app/api/auth/signup/route.ts` (aktuell 503-Block)
    - `apps/website/app/actions/signup.ts` (aus E2)
  </read_first>
  <action>
Ersetze den Inhalt von `apps/website/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { submitJoinSignup } from '@/app/actions/signup'

/**
 * Phase 25 — Unified Signup POST endpoint.
 *
 * Accepts the same multipart/form-data shape as the /join form. Delegates
 * to the server action `submitJoinSignup` for identical behavior. Provided
 * as a REST surface for:
 *   - E2E tests that want to POST directly
 *   - Future native clients / admin tools
 *
 * Feature-flagged via SIGNUP_ENABLED (Q11). Default: 503.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.SIGNUP_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Anmeldung ist momentan geschlossen. Wir öffnen bald wieder!' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = await submitJoinSignup(formData)
  if (result.ok) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json(result, { status: 400 })
}
```

**Hinweise:**
- `GET` wird weiterhin nicht exportiert (Method-not-allowed wenn jemand GETted).
- Der Status-Code bei Error ist **400**, nicht 500 — die Errors sind user-input-related (validation / duplicate).
- Der Route-Handler respektiert dasselbe `SIGNUP_ENABLED`-Gate wie die Server-Action, damit beide Pfade konsistent verhalten.
  </action>
  <verify>
    <automated>grep -q "export async function POST" apps/website/app/api/auth/signup/route.ts && grep -q "SIGNUP_ENABLED" apps/website/app/api/auth/signup/route.ts && grep -q "submitJoinSignup" apps/website/app/api/auth/signup/route.ts && grep -q "status: 503" apps/website/app/api/auth/signup/route.ts && ! grep -q "DISABLED BY DESIGN" apps/website/app/api/auth/signup/route.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Route exportiert `POST`
    - `SIGNUP_ENABLED !== 'true'` → 503 response (Feature-Flag respektiert)
    - `SIGNUP_ENABLED === 'true'` → delegiert zu `submitJoinSignup(formData)`
    - Invalid body → 400
    - Validation-Error → 400 mit `{ ok: false, error, fieldErrors }`
    - Success → 200 mit `{ ok: true }`
    - Altes `DISABLED BY DESIGN`-Kommentar entfernt
  </acceptance_criteria>
  <done>POST-Endpoint ready für E2E-Tests (Plan H) + extern callable.</done>
</task>

</tasks>

<verification>
**Automated:**
- `pnpm --filter @genai/website exec tsc --noEmit` clean
- Grep-Gates in allen Tasks
- Build: `pnpm --filter @genai/website build` clean, keine neue `○` Routes ohne Absicht

**Manual (Plan H E2E):**
- POST `/api/auth/signup` mit `SIGNUP_ENABLED=false` → 503
- POST mit `SIGNUP_ENABLED=true` + valid payload → 200 + Supabase-User erstellt + Circle-Member erstellt + Mail versendet
- POST mit Circle-API down (simuliert via env missconfig `CIRCLE_API_TOKEN=bad`) → 200 + Sentry-Event mit Tag `circle-api`
- Duplicate-Email → 200 (no-leak, no mail)
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
