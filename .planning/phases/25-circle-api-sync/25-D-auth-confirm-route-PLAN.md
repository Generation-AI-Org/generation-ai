---
phase: 25
plan: D
slug: auth-confirm-route
type: execute
wave: 2
depends_on:
  - 25-A
  - 25-B
files_modified:
  - apps/website/app/auth/confirm/route.ts
  - apps/website/app/(fallback)/welcome/page.tsx
  - apps/website/app/(fallback)/welcome/welcome-client.tsx
  - apps/website/components/welcome/community-banner.tsx
  - apps/website/app/sitemap.ts
autonomous: true
requirements:
  - R6.1
  - R6.2
  - R6.3
must_haves:
  truths:
    - "Route-Handler `apps/website/app/auth/confirm/route.ts` (GET) existiert und verarbeitet Supabase PKCE/OTP-Confirm: liest `?token_hash=...&type=signup` aus URL, ruft `supabase.auth.verifyOtp({ type, token_hash })` via `@genai/auth/server`."
    - "Nach erfolgreichem verifyOtp: Handler liest `user.user_metadata.circle_member_id` + leitet zu Circle-SSO-URL um."
    - "SSO-URL wird via `generateSsoUrl({ memberId, redirectPath: '/' })` aus `@genai/circle` erzeugt. Redirect als `NextResponse.redirect(ssoUrl, 303)`."
    - "Fallback-Logic: wenn `circle_member_id` fehlt ODER `generateSsoUrl` wirft `CircleApiError` → redirect zu `/welcome?circle=pending` (internes Fallback)."
    - "Fallback-Page `/welcome` rendert Banner \"Verbinde dich mit der Community →\" mit Direkt-Link zu `CIRCLE_COMMUNITY_URL` (nicht SSO, User muss sich dort separat einloggen — bewusster Edge-Case per D-03)."
    - "Bei Supabase-verifyOtp-Fehler (z.B. Link abgelaufen) → redirect zu `/auth/error?reason=expired` (dort Banner rendern — oder zu existierendem Error-Handler falls vorhanden)."
    - "Route ist rate-limited (5 verifyOtp-Attempts / 15min per IP) via bestehenden `checkWaitlistRateLimit`-Helper oder neuen `checkConfirmRateLimit`-Helper."
    - "Sentry-Breadcrumb bei jedem Circle-API-Fail mit Tag `circle-api` + `op: generateSsoUrl` + correlationId — **ohne** Token, **ohne** full User-Object."
    - "A11y: Fallback-Page hat `<h1>` mit focus-target, Banner ist `role=\"status\"` + `aria-live=\"polite\"` (matches Phase-24-Pattern)."
    - "Welcome-Page ist nicht in sitemap (private route), `app/sitemap.ts` wird NICHT geändert ausser um `/welcome` explicitly zu excluden falls ein Auto-Glob es catchen würde."
  artifacts:
    - path: "apps/website/app/auth/confirm/route.ts"
      provides: "PKCE Confirm-Route mit Circle-SSO-Redirect + Fallback"
      exports: ["GET"]
    - path: "apps/website/components/welcome/community-banner.tsx"
      provides: "Banner-Component für Fallback-Case"
      exports: ["CommunityBanner"]
    - path: "apps/website/app/(fallback)/welcome/page.tsx"
      provides: "Fallback-Welcome-Screen wenn Circle-SSO nicht ging"
      exports: ["default"]
  key_links:
    - from: "apps/website/app/auth/confirm/route.ts"
      to: "@genai/circle generateSsoUrl"
      via: "generateSsoUrl({ memberId: user.user_metadata.circle_member_id })"
      pattern: "generateSsoUrl\\("
    - from: "apps/website/app/auth/confirm/route.ts"
      to: "@genai/auth/server createClient"
      via: "const supabase = await createClient(); supabase.auth.verifyOtp(...)"
      pattern: "verifyOtp"
---

<objective>
Die PKCE-Confirm-Route bauen, die Supabase-Token einlöst + zur Circle-SSO-URL weiterleitet. Das ist das **letzte Stück des User-Flows**: User klickt Mail-CTA "Loslegen →" → diese Route → User landet in Circle eingeloggt.

Purpose: D-04 Single-CTA-Flow + D-06 Welcome-Space-Entry + D-03 Graceful-Degrade in einem einzigen Server-Handler.
Output: Route-Handler + Fallback-Page + Banner-Component.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@packages/auth/src/server.ts
@packages/auth/src/helpers.ts
@packages/auth/src/middleware.ts
@apps/website/lib/rate-limit.ts
@apps/website/proxy.ts
@packages/circle/src/client.ts

<interfaces>
```typescript
// apps/website/app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@genai/auth/server'
import { generateSsoUrl, CircleApiError } from '@genai/circle'

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Parse URL params (token_hash + type)
  // 2. Rate-limit
  // 3. supabase.auth.verifyOtp
  // 4. Read user_metadata.circle_member_id
  // 5. Try generateSsoUrl → redirect
  // 6. Fallback: redirect to /welcome?circle=pending
}
```

**Supabase PKCE-Pattern** (aus `node_modules/@supabase/ssr` + `next/dist/docs/` — checken zu Execute-Zeit):
```typescript
const token_hash = searchParams.get('token_hash')
const type = searchParams.get('type') as EmailOtpType | null
const next = searchParams.get('next') ?? '/'

if (token_hash && type) {
  const supabase = await createClient()
  const { error, data } = await supabase.auth.verifyOtp({ type, token_hash })
  if (!error && data.user) {
    // verifyOtp is success — user session is now set via cookies
    return data.user  // hat user_metadata.circle_member_id via D-07
  }
}
```

**Circle-SSO-URL-Signatur** (aus Plan B):
```typescript
await generateSsoUrl({
  memberId: user.user_metadata.circle_member_id,
  redirectPath: '/',  // Circle root — Circle routed dann zum Welcome-Space
  // ttlSeconds default = 7 days
})
// → { ssoUrl: string, expiresAt: string }
```
</interfaces>

<environment_notes>
- Aktuell existiert **KEIN** `app/auth/confirm/route.ts` — die Route wird neu gebaut. Phase 12/13 hatten Session-Helper + PKCE-Setup, aber der Confirm-Handler fehlt im Website-Repo (CONTEXT.md D-04 irrtümlich referenziert). Executor muss neu erstellen.
- `@genai/auth/server` ist der Import-Pfad für den server-side Supabase-Client (siehe `packages/auth/src/index.ts` Barrel-Kommentar — nicht `@genai/auth` weil `next/headers` server-only ist).
- CSP/force-dynamic gilt auch für Route-Handler, aber Route-Handler laufen ohnehin dynamic. Kein spezielles Setup nötig.
- `NextResponse.redirect(...)` mit `{ status: 303 }` ist der korrekte Code für POST/Form-Result-Redirects, aber GET→Redirect mit 302/307/308 ist Standard; 303 zwingt GET. Für unseren Case nutzen wir **303** explizit damit Browser den SSO-URL-Call mit GET macht (Circle-Endpoint erwartet GET).
- Fallback-Page `/welcome` liegt in `(fallback)` Route-Group damit sie nicht Teil der Haupt-Layout-Navigation wird. Alternative: `app/welcome/page.tsx` ohne Route-Group, dann mit `noindex`-Meta-Tag + kein Nav-Link.
</environment_notes>
</context>

<threat_model>
**Asset:** User-Session (Supabase JWT in Cookie) + Circle-SSO-Token (in Redirect-URL).

**Threats (ASVS L1):**

1. **Open-Redirect via `next` Query-Param.**
   - Mitigation: `next` Query-Param wird **nicht** als Redirect-Ziel akzeptiert in dieser Route — wir redirecten ausschließlich zu Circle-SSO-URL (aus `generateSsoUrl` generiert) oder zu `/welcome?circle=pending` (fester interner Path). Kein `NextResponse.redirect(next)`.
   - Test: `grep -q "NextResponse.redirect(next" apps/website/app/auth/confirm/route.ts` muss 0 Matches liefern.

2. **Session-Fixation / CSRF auf verifyOtp.**
   - Mitigation: Supabase verifyOtp ist idempotent + Token-basiert; kein User-Input außerhalb des Mail-Links fließt in die verifyOtp-Call. Cookie-Set passiert nur bei valid token — kein Fixation möglich.

3. **Token-Leak via Logs.**
   - Mitigation: `token_hash` niemals in `console.log` / Sentry-Breadcrumb. Sentry-Breadcrumbs loggen nur `{ op: 'confirm', status: 'ok' | 'error', reason?: string }` — kein Token, keine SSO-URL (enthält Circle-Token in Query).

4. **Rate-Limit-Bypass via parallele Requests.**
   - Mitigation: Rate-Limit per IP (5 Attempts / 15 min), matches Plan E Signup-Limits. Abusive Pattern: geklonte E-Mails mit stolen Token → schaffen User nicht, weil verifyOtp server-side rejected + Limit greift.

5. **Circle-SSO-URL in Browser-History.**
   - Mitigation: SSO-URL enthält one-time-use Token (Circle-side invalidiert nach Click). Wenn User die URL kopiert + teilt, funktioniert sie beim zweiten Klick nicht mehr. Zusätzlich: HTTP-Referer wird beim Cross-Site-Redirect zu Circle nicht geleakt (wir redirecten via `Location` Header; Referer-Policy `strict-origin-when-cross-origin` ist Next-Default).

**Block on:** BLOCKER (Open-Redirect, Token-im-Log, kein Rate-Limit).
**Residual:** Attacker mit Access zu User-Mail hat vollen Account-Zugang — das ist das fundamentale Email-Link-Auth-Risk und nicht phase-spezifisch.
</threat_model>

<tasks>

<task type="auto">
  <name>Task D1: Confirm-Route-Handler</name>
  <files>apps/website/app/auth/confirm/route.ts</files>
  <read_first>
    - `packages/auth/src/server.ts` (createClient Signatur + Cookie-Handling)
    - `packages/auth/src/helpers.ts` (getUser)
    - `packages/auth/src/middleware.ts` (updateSession — check ob verifyOtp Cookie-Set automatisch macht)
    - `node_modules/@supabase/ssr/dist/module/types.d.ts` (verifyOtp types)
    - `apps/website/lib/rate-limit.ts` (bestehender Helper — evtl. `checkConfirmRateLimit` hinzufügen)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` D-03 + D-04 + Q4
  </read_first>
  <action>
Erstelle `apps/website/app/auth/confirm/route.ts`:

```typescript
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@genai/auth/server'
import { CircleApiError, generateSsoUrl } from '@genai/circle'
import { checkConfirmRateLimit, getClientIp } from '@/lib/rate-limit'

// Supabase allowed confirm types per @supabase/supabase-js EmailOtpType
type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'

const FALLBACK_PATH = '/welcome?circle=pending'
const ERROR_PATH_BASE = '/auth/error'

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
  const circleMemberId = (user.user_metadata as Record<string, unknown> | null)?.circle_member_id

  // -- 4. No Circle link → Fallback -----------------------------------------
  if (!circleMemberId || typeof circleMemberId !== 'string') {
    Sentry.addBreadcrumb({
      category: 'circle-api',
      message: 'confirm.no_circle_link',
      level: 'info',
      data: { hasMetadata: !!user.user_metadata },
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
      Sentry.captureException(err, {
        tags: { 'circle-api': true, op: 'generateSsoUrl' },
        extra: {
          code: err.code,
          statusCode: err.statusCode,
          correlationId: err.correlationId,
        },
      })
    } else {
      Sentry.captureException(err, { tags: { 'circle-api': true, op: 'generateSsoUrl' } })
    }
    return NextResponse.redirect(new URL(FALLBACK_PATH, origin), { status: 303 })
  }
}
```

Dann in `apps/website/lib/rate-limit.ts` eine neue Funktion `checkConfirmRateLimit` ergänzen (copy-paste aus `checkWaitlistRateLimit` mit anderem Prefix):

```typescript
export async function checkConfirmRateLimit(ip: string): Promise<RateLimitResult> {
  // Copy of checkWaitlistRateLimit with prefix 'ratelimit:confirm:ip'.
  // Same 5/15min budget.
  // ...
}
```

**Wichtig:**
- Route läuft zwingend server-side (Route-Handler, kein Client-Code).
- Sentry-Import ist `@sentry/nextjs` — falls noch nicht eingerichtet (Plan H checkt): `pnpm add @sentry/nextjs` im Root oder website-App.
- `user.user_metadata` Typ ist `{ [key: string]: any }` in supabase-js — wir narrow-casten manuell.
- `NextResponse.redirect(ssoUrl, { status: 303 })` — 303 See Other erzwingt GET beim Browser (SSO-Endpoint bei Circle ist GET).
- Kein `next` Query-Param-Support — SSRF/Open-Redirect-Risk vermieden (siehe Threat-Model #1).
  </action>
  <verify>
    <automated>test -f apps/website/app/auth/confirm/route.ts && grep -q "export async function GET" apps/website/app/auth/confirm/route.ts && grep -q "verifyOtp" apps/website/app/auth/confirm/route.ts && grep -q "generateSsoUrl" apps/website/app/auth/confirm/route.ts && grep -q "circle_member_id" apps/website/app/auth/confirm/route.ts && grep -q "FALLBACK_PATH" apps/website/app/auth/confirm/route.ts && grep -q "checkConfirmRateLimit" apps/website/app/auth/confirm/route.ts && grep -q "checkConfirmRateLimit" apps/website/lib/rate-limit.ts && ! grep -q "NextResponse.redirect(next" apps/website/app/auth/confirm/route.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Route-Handler exportiert GET
    - verifyOtp wird aus request searchParams gefüttert
    - Fallback-Redirect auf `/welcome?circle=pending` wenn Circle scheitert
    - Error-Redirect auf `/auth/error?reason=...` bei verifyOtp-Fehler
    - Rate-Limit-Helper `checkConfirmRateLimit` existiert + wird aufgerufen
    - Sentry `captureException` mit Tag `'circle-api'` bei generateSsoUrl-Fehler
    - **KEIN** `NextResponse.redirect(next` (Open-Redirect-Guard)
    - `tsc --noEmit` clean
  </acceptance_criteria>
  <done>Route ist funktional, leitet happy-path zu Circle weiter.</done>
</task>

<task type="auto">
  <name>Task D2: Fallback-Welcome-Page + Banner-Component</name>
  <files>apps/website/app/(fallback)/welcome/page.tsx, apps/website/app/(fallback)/welcome/welcome-client.tsx, apps/website/components/welcome/community-banner.tsx</files>
  <read_first>
    - `apps/website/components/about-client.tsx` (Client-Wrapper-Pattern aus `AGENTS.md`)
    - `apps/website/app/about/page.tsx` (Server-Page mit Nonce-Injection)
    - `apps/website/AGENTS.md` Hero-Pattern-Sektion (LabeledNodes + max-w-4xl + DS-Tokens)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` D-03 (Fallback-UX)
  </read_first>
  <action>
**Step 1:** Banner-Component erstellen `apps/website/components/welcome/community-banner.tsx`:

```tsx
'use client'

import Link from 'next/link'

interface CommunityBannerProps {
  communityUrl: string  // from env via Server Component, passed as prop
  name?: string | null
}

export function CommunityBanner({ communityUrl, name }: CommunityBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 text-center"
    >
      <p className="text-lg font-semibold mb-2">
        {name ? `Willkommen, ${name}! 👋` : 'Willkommen! 👋'}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Dein Account ist aktiv. Die automatische Community-Anmeldung hat kurz nicht geklappt — kein Drama, du kommst manuell rein:
      </p>
      <Link
        href={communityUrl}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Zur Community →
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        Falls das nicht geht: schreib uns an admin@generation-ai.org.
      </p>
    </div>
  )
}
```

**Step 2:** Server-Page `apps/website/app/(fallback)/welcome/page.tsx`:

```tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUser } from '@genai/auth/helpers'
import WelcomeClient from './welcome-client'

export const dynamic = 'force-dynamic'

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ circle?: string }>
}) {
  const hdrs = await headers()
  const nonce = hdrs.get('x-nonce') ?? ''
  const params = await searchParams

  const user = await getUser()
  if (!user) {
    redirect('/')
  }

  const communityUrl = process.env.CIRCLE_COMMUNITY_URL ?? 'https://community.generation-ai.org'
  const fullName = (user.user_metadata?.full_name as string) ?? null
  const showFallback = params.circle === 'pending'

  return (
    <WelcomeClient
      nonce={nonce}
      name={fullName}
      communityUrl={communityUrl}
      showFallback={showFallback}
    />
  )
}
```

**Step 3:** Client-Wrapper `apps/website/app/(fallback)/welcome/welcome-client.tsx`:

```tsx
'use client'

import { MotionConfig } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LabeledNodes } from '@/components/ui/labeled-nodes'
import { CommunityBanner } from '@/components/welcome/community-banner'

interface Props {
  nonce: string
  name: string | null
  communityUrl: string
  showFallback: boolean
}

export default function WelcomeClient({ nonce, name, communityUrl, showFallback }: Props) {
  const h1Ref = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    h1Ref.current?.focus()
  }, [])

  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <section className="relative isolate">
          <LabeledNodes />
          <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
            <h1
              ref={h1Ref}
              tabIndex={-1}
              className="outline-none"
              style={{
                fontSize: 'var(--fs-display)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                textShadow:
                  '0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)',
              }}
            >
              Du bist drin.
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto"
              style={{
                lineHeight: 1.5,
                textShadow: '0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)',
              }}
            >
              {showFallback
                ? 'Dein Account ist aktiv. Jetzt noch ein Klick zur Community.'
                : 'Dein Account ist aktiv.'}
            </p>

            {showFallback && (
              <div className="mt-10 mx-auto max-w-xl">
                <CommunityBanner communityUrl={communityUrl} name={name} />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </MotionConfig>
  )
}
```

**Step 4:** `app/sitemap.ts` **nicht** `/welcome` aufnehmen (ist private). Wenn der aktuelle Sitemap-Generator alle `app/**/page.tsx` automatisch crawled, `/welcome/page.tsx` explicit excluden. Falls Sitemap manuell gepflegt wird (Standard bei diesem Repo): keine Änderung nötig, nur docs-Note.

Ausserdem in `app/(fallback)/welcome/page.tsx` das Metadata-Export für `noindex`:

```tsx
export const metadata = {
  robots: { index: false, follow: false },
}
```
  </action>
  <verify>
    <automated>test -f apps/website/app/\(fallback\)/welcome/page.tsx && test -f apps/website/app/\(fallback\)/welcome/welcome-client.tsx && test -f apps/website/components/welcome/community-banner.tsx && grep -q "CommunityBanner" apps/website/components/welcome/community-banner.tsx && grep -q "export const dynamic" apps/website/app/\(fallback\)/welcome/page.tsx && grep -q "robots: { index: false" apps/website/app/\(fallback\)/welcome/page.tsx && grep -q "role=\"status\"" apps/website/components/welcome/community-banner.tsx && grep -q "aria-live=\"polite\"" apps/website/components/welcome/community-banner.tsx && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Alle 3 Files existieren
    - Banner hat `role="status"` + `aria-live="polite"` (a11y)
    - Page hat `export const dynamic = 'force-dynamic'`
    - Page hat `robots: { index: false }` Metadata (noindex)
    - H1 ist fokussierbar (`tabIndex={-1}` + useEffect focus — matches Phase 24 a11y-Pattern)
    - `communityUrl` via Server-Component-Env-Read (kein client-side process.env)
    - `CIRCLE_COMMUNITY_URL` wird NICHT direkt im Client-Component gelesen (client hat keinen Zugriff auf non-NEXT_PUBLIC_ Vars)
    - `tsc --noEmit` clean
  </acceptance_criteria>
  <done>Fallback-UX funktioniert wenn Circle-SSO scheitert.</done>
</task>

</tasks>

<verification>
**Automated:**
- Typecheck clean
- Grep-Gates in Tasks (kein `NextResponse.redirect(next`, role/aria vorhanden, rate-limit gecalled)
- Build: `pnpm --filter @genai/website build` clean

**Manual (Plan H E2E):**
- Happy-Path: Valid Token + valid Circle-Link → Landing in Circle
- Fallback: Valid Token + Circle-API down → `/welcome?circle=pending` zeigt Banner
- Error: Invalid Token → `/auth/error?reason=invalid_or_expired`
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
