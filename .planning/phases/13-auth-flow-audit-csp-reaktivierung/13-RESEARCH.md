# Phase 13: Auth-Flow-Audit + CSP Reaktivierung — Research

**Researched:** 2026-04-17
**Domain:** Next.js 16 CSP / Playwright E2E Auth / @supabase/ssr Cookie-Handling
**Confidence:** HIGH (alle kritischen Fragen per Codebase + lokalem Next.js-16-Docs verifiziert)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Audit-Scope (6 Pfade)**
- D-01: Login E+P, Magic Link, Session-Refresh, Signout, Password-Reset, Cross-Domain
- D-02: Zweigleisig — manuelle Playwright-MCP-Runs + reproduzierbare E2E-Tests in `packages/e2e-tools/tests/auth.spec.ts`
- D-03: Playwright dokumentiert Network-Requests, Console-Errors, Set-Cookie-Header
- D-04: Test-User via separatem Testaccount (Credentials in `.env.test.local`)

**Bug-Fix-Policy**
- D-05: Kleine Fixes (< 30 Zeilen, klarer Root-Cause) inline
- D-06: Größere Findings → BACKLOG.md mit Link auf AUTH-FLOW.md
- D-07: Password-Reset-Flow kaputt → inline fixen; "UI neu bauen" → Backlog

**CSP-Strategie**
- D-08: Ziel-Directives (baseline, Research verfeinert Details)
- D-09: Website: Report-Only → Enforced
- D-10: tools-app: CSP neu, Edge-Runtime-Blocker klären via proxy.ts (Research klärt Pattern)
- D-11: Permissions-Policy + Referrer-Policy auf beiden Apps
- D-12: securityheaders.com Ziel A+ (min. A), keine CSP-Violations nach Deploy

**Konsolidierungs-Prüfung**
- D-13: tools-app/lib/auth.ts + website/lib/supabase/ gegen @genai/auth vergleichen
- D-14: Non-triviale Konsolidierung (> 50 Zeilen / Breaking-Risk) → Backlog

**Dokumentation**
- D-15: docs/AUTH-FLOW.md mit Mermaid-Diagrammen pro Pfad
- D-16: docs/ARCHITECTURE.md bekommt Update-Link auf AUTH-FLOW.md
- D-17: Signup bleibt 503, wird nur dokumentiert

### Claude's Discretion
- Exakte Test-Dateistruktur (Split vs. eine große Datei)
- Mermaid-Diagramm-Detaillierungsgrad
- Konkrete CSP-Directives pro Domain (abhängig von Research)
- Reihenfolge der Audit-Pfade

### Deferred Ideas (OUT OF SCOPE)
- OAuth-Login (Google/Apple/GitHub)
- Circle-Member-Detection für Pro-Mode
- Supabase Email-Template-Customization (Dashboard-only)
- Signup-Reaktivierung
- Password-Reset-UI auf Login-Page (nur wenn Audit zeigt Endpoint funktioniert)
- FloatingChat-Refactoring
- Upstash / Supabase Scaling
</user_constraints>

---

## Summary

Phase 13 hat zwei gleichwertige Deliverables: (1) ein vollständiges E2E-Audit aller 6 Auth-Pfade mit Playwright gegen Production, dokumentiert in `docs/AUTH-FLOW.md`, und (2) CSP aktivieren auf beiden Apps. Beide Pfade sind gut verstanden.

**Zur CSP-Frage:** Der "Edge Runtime Issue" aus STATE.md ist jetzt gelöst. Next.js 16 unterstützt CSP via `proxy.ts` nativ — beide Apps nutzen bereits eine `proxy.ts`-Datei. Das ist der korrekte Einstiegspunkt. Die Nonce wird dort pro Request generiert, als `x-nonce`-Header weitergereicht, und Next.js wendet sie automatisch auf alle Framework-Scripts an. Kein Hack, kein Custom-`_document`. **Konkret:** `proxy.ts` in beiden Apps wird erweitert, um (a) `updateSession()` zu rufen und (b) die CSP-Nonce zu setzen — in einer Funktion.

**Zur Auth-Audit-Frage:** Die bestehende `packages/e2e-tools/tests/auth.spec.ts` hat 4 sehr einfache Tests — keine authentifizierten Flows. Sie muss komplett erweitert werden. Der Password-Reset-Flow ist nie gegen Prod getestet worden. Die Konsolidierungs-Prüfung ergibt: `apps/tools-app/lib/auth.ts` ist bereits ein dünner Shim über `@genai/auth` (nur `getUser()` re-exportiert). `apps/website/lib/supabase/` sind ebenfalls dünne Shims. Kein echter Drift mehr.

**Primary recommendation:** CSP via `proxy.ts` nonce-injection implementieren — beide Apps haben diesen Einstiegspunkt bereits. Nonce-Ansatz statt `unsafe-inline` für `script-src`. `style-src 'unsafe-inline'` akzeptabel (Tailwind v4). E2E-Tests mit `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` aus `.env.test.local` gegen `https://tools.generation-ai.org`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Warum Standard |
|---------|---------|---------|----------------|
| `@supabase/ssr` | 0.10.2 (installiert) | Server-side Auth-Helpers | Canonical Supabase Pattern seit Phase 12 |
| `@supabase/supabase-js` | ^2.103.0 | Admin-Client (generateLink) | Admin API für Test-User-Management |
| `@playwright/test` | in packages/e2e-tools | E2E-Testing | Bereits eingerichtet, Prod-URLs testbar |
| Next.js proxy.ts | n/a (built-in) | CSP Nonce-Injection | Next.js 16 offiziell empfohlener Pfad |

**Kein neues Package nötig.** Alles ist bereits installiert.

### Bestehende Infrastruktur

| Asset | Pfad | Zustand |
|-------|------|---------|
| Middleware-Helper | `packages/auth/src/middleware.ts` → `updateSession()` | Stabil, Phase 12 |
| E2E-Config | `packages/e2e-tools/playwright.config.ts` | `baseURL = process.env.BASE_URL \|\| localhost:3001` |
| E2E-Tests | `packages/e2e-tools/tests/auth.spec.ts` | 4 einfache Tests, kein authenticated flow |
| proxy.ts (tools-app) | `apps/tools-app/proxy.ts` | Ruft `updateSession()`, hat `config.matcher` |
| proxy.ts (website) | `apps/website/proxy.ts` | Identisch |
| CSP Report-Only | `apps/website/next.config.ts` L7-19 | `'unsafe-inline'` für scripts — muss weg |
| Kein CSP | `apps/tools-app/next.config.ts` | Keine CSP-Header |
| Admin-Client | `packages/auth/src/admin.ts` | `createAdminClient()` mit SERVICE_ROLE_KEY |

---

## Architecture Patterns

### Pattern 1: CSP via proxy.ts (Next.js 16 offizielles Pattern)

**Was:** Proxy generiert pro Request eine Nonce, setzt sie als `Content-Security-Policy`-Header und als `x-nonce`-Request-Header. Next.js extrahiert die Nonce automatisch und wendet sie auf alle Framework-Scripts an.

**Warum:** `proxy.ts` läuft auf der Edge Runtime (stateless, kein Node.js-Core). Das war der "Edge Runtime Issue" — statische Header in `next.config.ts` konnten keine dynamische Nonce generieren. `proxy.ts` kann das.

**Wichtig:** Nonce-basiertes CSP zwingt alle Seiten zu dynamischem Rendering. Kein statisches Caching möglich. Bei diesen Apps kein Problem (Auth-Status ist sowieso dynamisch).

**Quelle:** `apps/tools-app/node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` [VERIFIED: lokale Next.js 16 Docs]

```typescript
// Source: Next.js 16 Docs — content-security-policy.md (lokal verifiziert)
// apps/tools-app/proxy.ts — ERWEITERT (nicht ersetzt!)
import { updateSession } from '@genai/auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. Auth-Session refresh (Phase-12-Pattern beibehalten)
  const authResponse = await updateSession(request)

  // 2. Nonce generieren
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",  // Tailwind v4 braucht unsafe-inline
    "img-src 'self' data: https://logo.clearbit.com",  // ToolLogo uses clearbit
    "font-src 'self'",
    "connect-src 'self' https://wbohulnuwqrhystaamjc.supabase.co wss://wbohulnuwqrhystaamjc.supabase.co https://o4511218002362368.ingest.de.sentry.io https://api.deepgram.com wss://api.deepgram.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  // CSP auf beide Response-Headers setzen
  authResponse.headers.set('Content-Security-Policy', cspHeader)
  authResponse.headers.set('x-nonce', nonce)

  return authResponse
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

**Kritisch:** `updateSession()` gibt eine `NextResponse` zurück (nicht eine neue erstellen). Die CSP wird auf diese Response gesetzt. Neue `NextResponse.next()` würde die Auth-Cookies verlieren.

### Pattern 2: Website — Report-Only CSP → Enforced

**Was:** In `apps/website/next.config.ts` den Header-Key von `Content-Security-Policy-Report-Only` auf `Content-Security-Policy` ändern, und `'unsafe-inline'` aus `script-src` entfernen (durch Nonce-Injection via proxy.ts ersetzen).

**Reihenfolge:** (1) proxy.ts erweitern, (2) next.config.ts statischen Report-Only Header entfernen (proxy macht das jetzt dynamisch), (3) Deploy + Browser-Console prüfen.

### Pattern 3: Playwright Cross-Domain Cookie-Test

**Was:** Zwei `baseURL`-Kontexte in Playwright — Login auf Website, Cookie verifizieren auf tools-app.

```typescript
// Source: [ASSUMED] Standard Playwright Multi-Domain Pattern
test('cross-domain cookie persistence', async ({ browser }) => {
  // Context 1: Website
  const websitePage = await browser.newPage({
    baseURL: 'https://generation-ai.org'
  })
  // Login auf Website... aber: Website hat kein Login-Formular
  // Cross-Domain-Test tatsächlich: Login auf tools-app, dann tools-app Subdomain-Cookie
  // prüfen, dass Cookie Domain=.generation-ai.org gesetzt ist
  
  const toolsPage = await browser.newPage({
    baseURL: 'https://tools.generation-ai.org'
  })
  await toolsPage.goto('/login')
  // ... Login-Flow
  
  // Cookie-Domain verifizieren via devTools CDP
  const cookies = await toolsPage.context().cookies('https://tools.generation-ai.org')
  const sessionCookie = cookies.find(c => c.name.startsWith('sb-'))
  expect(sessionCookie?.domain).toBe('.generation-ai.org')
})
```

### Pattern 4: Password-Reset E2E Flow

Der `/auth/confirm` Route Handler in tools-app ist der Callback-Endpunkt für Supabase Magic Links und Password-Reset-Tokens. Er ruft `supabase.auth.verifyOtp({ token_hash, type })` auf. Bei `type === 'recovery'` leitet er zu `/auth/set-password` weiter.

**Befund:** Die `set-password`-Page (`apps/tools-app/app/auth/set-password/page.tsx`) ist vollständig implementiert — sie ruft `supabase.auth.updateUser({ password })` auf. Das Problem: Es gibt keinen "Forgot Password?"-Link auf der Login-Page. User kann den Reset-Flow nicht selbst starten. Audit muss prüfen ob der Supabase-Dashboard-Trigger (Admin → Send Password Reset) + confirm-Route + set-password funktionieren.

**Supabase Admin generateLink für Tests:**

```typescript
// Source: [ASSUMED] Supabase Auth Admin API — @supabase/supabase-js
// packages/auth/src/admin.ts: createAdminClient() ist bereits vorhanden
import { createAdminClient } from '@genai/auth/admin'

// In E2E global setup oder beforeAll:
const admin = createAdminClient()
const { data } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email: process.env.TEST_USER_EMAIL!,
})
// data.properties.hashed_token → für direkten Link-Aufruf in Playwright
// data.action_link → direkt als URL in page.goto() verwendbar
```

**Wichtig:** `generateLink` benötigt `SUPABASE_SERVICE_ROLE_KEY` — dieser ist in tools-app `lib/env.ts` bereits als Required deklariert und in Vercel gesetzt.

### Anti-Patterns

- **Anti-Pattern: Statische CSP in next.config.ts für Nonce.** Nonces können nur per-Request in `proxy.ts` generiert werden. `next.config.ts` wird einmal beim Server-Start ausgeführt.
- **Anti-Pattern: Neue NextResponse.next() nach updateSession().** `updateSession()` gibt die Response zurück die Cookies setzt — darauf aufbauen, nicht ersetzen.
- **Anti-Pattern: CSP ohne `'strict-dynamic'` in script-src.** `'strict-dynamic'` erlaubt Skripten die per Nonce geladen werden, weitere Skripte zu laden (React-Hydration, dynamische Imports). Ohne dies bricht die App.
- **Anti-Pattern: `unsafe-inline` für script-src.** securityheaders.com wertet das als kritisches Defizit. Nonce + strict-dynamic stattdessen.

---

## Konsolidierungs-Audit Ergebnis

**Befund via direktes Code-Lesen:** [VERIFIED: Codebase]

| Datei | Status | Aktion |
|-------|--------|--------|
| `apps/tools-app/lib/auth.ts` | Dünner Shim — `getUser()` delegiert 1:1 an `@genai/auth/server` | Kann bleiben (7 Zeilen, kein Drift) |
| `apps/website/lib/supabase/client.ts` | Re-exportiert `createBrowserClient` aus `@genai/auth` | Kein Drift |
| `apps/website/lib/supabase/server.ts` | Re-exportiert `createAdminClient` aus `@genai/auth` | Kein Drift — aber Naming ist irreführend (re-exportiert Admin-Client, nicht Server-Client) |

**Fazit:** Konsolidierung aus Phase 12 ist vollständig. Kein nennenswerter Drift. D-14 greift nicht — kein Non-trivial-Risk. Die website/lib/supabase/server.ts exportiert allerdings `createAdminClient` (nicht `createServerClient`) — das klingt merkwürdig, ist aber nicht kaputt. Kleine Klarstellung möglich, aber D-05/D-14 würden das als Backlog einstufen.

**Grep-Kommandos für den Planer zur Verifikation:**

```bash
# Direkte @supabase/ssr Imports außerhalb von packages/auth (sollte 0 Treffer in apps/ geben)
grep -r "from '@supabase/ssr'" apps/ --include="*.ts" --include="*.tsx"

# Manuelle document.cookie Schreibzugriffe (sollten weg sein nach Phase 12)
grep -r "document\.cookie\s*=" apps/ --include="*.ts" --include="*.tsx"

# btoa/atob Cookie-Hacks (Phase-12-Ursprungsfehler)
grep -r "btoa\|saveSessionToCookie" apps/ --include="*.ts" --include="*.tsx"
```

---

## CSP-Directives — Vollständige Host-Liste

### tools-app

| Directive | Hosts | Begründung |
|-----------|-------|-----------|
| `default-src` | `'self'` | Fallback |
| `script-src` | `'self' 'nonce-{n}' 'strict-dynamic'` + `'unsafe-eval'` nur dev | React, Next.js, Sentry Client (via nonce), Speed Insights (via nonce) |
| `style-src` | `'self' 'unsafe-inline'` | Tailwind v4 generiert inline styles — keine Nonce für styles möglich [ASSUMED: Tailwind v4-Verhalten] |
| `img-src` | `'self' data: https://logo.clearbit.com` | ToolLogo-Komponente lädt Logos von clearbit [VERIFIED: ToolLogo.tsx] |
| `font-src` | `'self'` | CascadiaCode ist local, Inter via next/font lokal [VERIFIED: layout.tsx] |
| `connect-src` | `'self' https://wbohulnuwqrhystaamjc.supabase.co wss://wbohulnuwqrhystaamjc.supabase.co https://o4511218002362368.ingest.de.sentry.io https://api.deepgram.com wss://api.deepgram.com` | Supabase Auth, Sentry Reporting (DE-Region), Deepgram WebSocket [VERIFIED: sentry.config + DSN] |
| `object-src` | `'none'` | Flash/Plugin-Angriffe blockieren |
| `base-uri` | `'self'` | Base-Tag-Hijacking verhindern |
| `form-action` | `'self'` | Signout POST + Login POST |
| `frame-ancestors` | `'none'` | Clickjacking (X-Frame-Options redundant aber gut als Fallback) |
| `upgrade-insecure-requests` | — | HTTP → HTTPS automatisch |

**Speed Insights:** Lädt von `https://va.vercel-scripts.com/v1/speed-insights/script.js` [VERIFIED: @vercel/speed-insights Source]. `'strict-dynamic'` erlaubt dieses Script wenn es per `<Script nonce>` eingebunden wird — **oder** `va.vercel-scripts.com` explizit in `script-src` eintragen für Sicherheit.

**Ergänzung empfohlen:**
```
script-src 'self' 'nonce-{n}' 'strict-dynamic' https://va.vercel-scripts.com
connect-src ... https://vitals.vercel-insights.com
```

### website-app

Simpler als tools-app — kein Deepgram, kein Clearbit, kein Speed Insights Script (oh doch: auch website hat SpeedInsights [VERIFIED: website layout.tsx]).

| Directive | Hosts | Ergänzungen gegenüber tools-app |
|-----------|-------|--------------------------------|
| `connect-src` | `'self' https://wbohulnuwqrhystaamjc.supabase.co` | Kein Deepgram, kein Sentry (website hat kein Sentry installiert laut package.json [VERIFIED]) |
| `img-src` | `'self' blob: data:` | Kein Clearbit |

**Sentry für website:** `apps/website/package.json` hat kein `@sentry/nextjs` [VERIFIED: grep]. Also kein Sentry-connect-src nötig.

---

## Don't Hand-Roll

| Problem | Nicht selbst bauen | Verwende stattdessen | Warum |
|---------|-------------------|----------------------|-------|
| CSP Nonce | Kein eigenes Crypto | `crypto.randomUUID()` (Web Crypto API, Edge-kompatibel) | In Edge Runtime verfügbar, kryptographisch sicher |
| Session Refresh | Kein manuelles Cookie-Lesen | `updateSession()` aus `@genai/auth/middleware` | Phase-12-Canonical-Pattern |
| Magic Link für Tests | Keine Email-Inbox | `admin.auth.admin.generateLink({ type: 'magiclink', email })` | Supabase Admin API liefert direkten Link |
| Cookie-Domain-Test | Kein manuelles HTTP-Parse | `page.context().cookies(url)` in Playwright | Gibt Domain-Attribut direkt zurück |

---

## Common Pitfalls

### Pitfall 1: proxy.ts — Auth-Response verlieren

**Was schiefgeht:** `updateSession()` gibt eine `NextResponse` zurück, die die neuen Session-Cookies enthält. Wenn stattdessen eine neue `NextResponse` erstellt wird für die CSP, gehen die Auth-Cookies verloren.

**Root Cause:** `updateSession()` ruft intern `supabaseResponse = NextResponse.next({ request })` auf und schreibt Cookies darauf. Eine zweite Response hat diese Cookies nicht.

**Vermeiden:** CSP-Header auf die Response aus `updateSession()` setzen, nicht auf eine neue Response.

**Warnsignal:** Session nach Login wird nicht persistent → Cookie fehlt in Response-Headers.

### Pitfall 2: Nonce zwingt Dynamic Rendering

**Was schiefgeht:** Seiten die vorher statisch gecacht wurden (ISR, PPR) brechen mit CSP-Nonce, weil der Nonce sich per Request ändert aber die gecachte HTML die alte Nonce hat.

**Root Cause:** Nonce muss per-Request generiert werden. Statisch generierte HTML hat keinen Request-Kontext.

**Vermeiden:** `await connection()` in Page-Komponenten die Nonce brauchen (erzwingt dynamic rendering). In diesem Projekt sind die wichtigsten Seiten ohnehin dynamisch (Auth-Status).

**Warnsignal:** `script-src` CSP-Violation für Next.js-eigene Scripts im Browser.

### Pitfall 3: Signout GET-Regression

**Was schiefgeht:** Playwright-Prefetch-Test wird vergessen. Jemand ändert die signout-Route und fügt versehentlich wieder einen GET-Handler hinzu.

**Root Cause:** Der Session-Drop-Bug (f5f9cb7) war exakt das. POST-only muss als Regression-Test verankert werden.

**Vermeiden:** E2E-Test `GET /auth/signout → 405` als expliziten Test in auth.spec.ts.

**Warnsignal:** Session-Drop nach Login ohne expliziten Logout.

### Pitfall 4: Speed Insights Script und `'strict-dynamic'`

**Was schiefgeht:** `<SpeedInsights />` injiziert ein `<script src="https://va.vercel-scripts.com/...">` dynamisch via JavaScript. Mit purem `'strict-dynamic'` (ohne Host-Whitelist) blockiert CSP dieses Script, wenn es nicht per Nonce geladen wird.

**Root Cause:** `injectSpeedInsights()` erstellt ein `<script>` Tag ohne nonce-Attribut.

**Vermeiden:** `https://va.vercel-scripts.com` explizit in `script-src` eintragen. Oder Speed Insights auf `strategy="beforeInteractive"` mit `nonce={nonce}` umstellen.

**Empfehlung:** Explizite Host-Whitelist ist einfacher und sicherer.

### Pitfall 5: Sentry DSN-Host muss exakt stimmen

**Was schiefgeht:** Sentry nutzt die EU-Region (`.ingest.de.sentry.io`), nicht die US-Standard-Region (`.ingest.sentry.io`). Wildcard `*.sentry.io` würde nicht matchen.

**Root Cause:** DSN enthält `o4511218002362368.ingest.de.sentry.io` — spezifischer Org-Subdomain auf DE-Region [VERIFIED: sentry.edge.config.ts, instrumentation-client.ts].

**Vermeiden:** Exakten Host `https://o4511218002362368.ingest.de.sentry.io` in `connect-src`.

---

## Code Examples

### E2E — Login + Session-Persist Test Skeleton

```typescript
// Source: packages/e2e-tools/tests/auth.spec.ts — zu erweitern
import { test, expect } from '@playwright/test'

const TOOLS_URL = process.env.TOOLS_URL || 'https://tools.generation-ai.org'

test.describe('Auth: Password Login', () => {
  test('Login setzt Cookie, Reload persistiert Session', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL!
    const password = process.env.TEST_USER_PASSWORD!

    await page.goto(`${TOOLS_URL}/login`)
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/passwort|password/i).fill(password)
    await page.getByRole('button', { name: /anmelden|login/i }).click()

    // Warten bis eingeloggt
    await expect(page).toHaveURL(/(?!.*login)/, { timeout: 10000 })

    // Cookie mit korrekter Domain prüfen
    const cookies = await page.context().cookies(TOOLS_URL)
    const sessionCookie = cookies.find(c => c.name.startsWith('sb-'))
    expect(sessionCookie).toBeTruthy()
    expect(sessionCookie?.domain).toBe('.generation-ai.org')

    // Session überlebt Reload
    await page.reload()
    const afterReloadCookies = await page.context().cookies(TOOLS_URL)
    expect(afterReloadCookies.find(c => c.name.startsWith('sb-'))).toBeTruthy()
  })
})
```

### E2E — Signout POST-only Regression Test

```typescript
// Source: [ASSUMED] Standard Playwright API-Call Pattern
test('GET /auth/signout gibt 405 zurück', async ({ request }) => {
  const response = await request.get(`${TOOLS_URL}/auth/signout`)
  expect(response.status()).toBe(405)
})
```

### E2E — CSP No-Violation Check

```typescript
// Source: [ASSUMED] Standard Playwright Console-Listener Pattern
test('Keine CSP-Violations nach Login', async ({ page }) => {
  const cspViolations: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      cspViolations.push(msg.text())
    }
  })

  await page.goto(`${TOOLS_URL}/login`)
  await page.waitForLoadState('networkidle')
  expect(cspViolations).toHaveLength(0)
})
```

### proxy.ts — Vollständige Integration (auth + CSP)

```typescript
// Source: Next.js 16 Docs content-security-policy.md (lokal) + Phase-12 Pattern
// apps/tools-app/proxy.ts
import { updateSession } from '@genai/auth/middleware'
import { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Phase-12 Pattern: Session refresh ZUERST
  const response = await updateSession(request)

  // Phase-13 Erweiterung: Nonce + CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://logo.clearbit.com",
    "font-src 'self'",
    [
      "connect-src 'self'",
      "https://wbohulnuwqrhystaamjc.supabase.co",
      "wss://wbohulnuwqrhystaamjc.supabase.co",
      "https://o4511218002362368.ingest.de.sentry.io",
      "https://api.deepgram.com",
      "wss://api.deepgram.com",
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
    ].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

---

## Runtime State Inventory

Diese Phase ändert Code, keine Umbenennung/Migration. Kurze Prüfung:

| Kategorie | Befund | Aktion |
|-----------|--------|--------|
| Gespeicherte Daten | Keine Rename-Aktion → keine Daten-Migration nötig | Keine |
| Live Service Config | CSP-Header-Änderung betrifft Browser-Verhalten, nicht DB-Daten | Kein Patch nötig |
| OS-registrierter State | Keiner betroffen | Keine |
| Secrets/Env Vars | `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` müssen angelegt werden in `.env.test.local` | Task: Test-User in Supabase anlegen + Credentials eintragen |
| Build Artifacts | Keine Rename → kein stale Artifact | Keine |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Tests, Build | ✓ | via pnpm/turbo | — |
| pnpm | Monorepo | ✓ | — | — |
| Playwright | E2E-Tests | ✓ | in packages/e2e-tools | — |
| Supabase Prod | Auth-Tests | ✓ | Live | — |
| `TEST_USER_EMAIL` | E2E Auth-Tests | ✗ (nicht gesetzt) | — | Task: Testaccount anlegen |
| `SUPABASE_SERVICE_ROLE_KEY` | generateLink in Tests | ✓ (in Vercel + env.ts) | — | Nur serverseitig verfügbar |
| securityheaders.com | CSP-Verifikation | ✓ | Web-Service | Browser DevTools als Fallback |

**Fehlende Dependencies ohne Fallback:**
- `TEST_USER_EMAIL` + `TEST_USER_PASSWORD`: Muss Luca manuell in Supabase Dashboard anlegen und in `packages/e2e-tools/.env.test.local` eintragen (diese Datei nicht committen). Das ist ein Wave-0-Task im Plan.

---

## Validation Architecture

> `workflow.nyquist_validation` ist nicht in config.json gesetzt → als aktiviert behandeln.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (packages/e2e-tools) |
| Config file | `packages/e2e-tools/playwright.config.ts` |
| Quick run command | `cd packages/e2e-tools && BASE_URL=https://tools.generation-ai.org npx playwright test auth.spec.ts` |
| Full suite command | `pnpm e2e` (via turbo, mit `BASE_URL=https://tools.generation-ai.org`) |

### Phase Requirements → Test Map

| Req (aus D-01..D-12) | Behavior | Test Type | Automated Command | Test-Datei |
|---------------------|----------|-----------|-------------------|------------|
| D-01 Pfad 1: Login E+P | Login setzt Cookie, Session persistiert nach Reload | E2E | `playwright test --grep "Password Login"` | ❌ Wave 0 |
| D-01 Pfad 2: Magic Link | Auth-Confirm-Route verarbeitet OTP korrekt | E2E (Admin generateLink) | `playwright test --grep "Magic Link"` | ❌ Wave 0 |
| D-01 Pfad 3: Session-Refresh | Token-Rotation via proxy.ts funktioniert | E2E (Warte > Token-TTL nicht möglich in kurzen Tests) | Manual + Cookie-Expiry-Check | ❌ Manual-only |
| D-01 Pfad 4: Signout POST-only | GET /auth/signout → 405, POST → 302+Session weg | E2E | `playwright test --grep "signout"` | ❌ Wave 0 |
| D-01 Pfad 5: Password-Reset | Confirm-Route redirect zu set-password, updateUser funktioniert | E2E | `playwright test --grep "Password Reset"` | ❌ Wave 0 |
| D-01 Pfad 6: Cross-Domain | Cookie domain=.generation-ai.org gesetzt | E2E | `playwright test --grep "cross-domain"` | ❌ Wave 0 |
| D-09/D-10 CSP enforced | Keine CSP-Violations in Console | E2E (console-listener) | `playwright test --grep "CSP"` | ❌ Wave 0 |
| D-12 securityheaders.com | A/A+ Score | Manual | securityheaders.com für beide Domains | Manual-only |

### Sampling Rate

- **Per Task-Commit:** Smoke: `playwright test --grep "Login|signout" --headed` manuell
- **Per Wave-Merge:** Volle Auth-Suite: `playwright test auth.spec.ts`
- **Phase Gate:** Volle Suite grün + securityheaders.com A/A+ verifiziert vor `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `packages/e2e-tools/tests/auth.spec.ts` — alle 6 Pfade implementieren (aktuell nur 4 einfache Tests)
- [ ] `packages/e2e-tools/.env.test.local` — `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` befüllen (manuelle Aktion Luca)
- [ ] Test-User in Supabase Dashboard anlegen (manuelle Aktion Luca) — separater Benutzer, nicht Luca's Account
- [ ] `playwright.config.ts` — `BASE_URL` für Prod-Tests konfigurieren (default ist localhost)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Betrifft Phase | Standard Control |
|---------------|---------------|-----------------|
| V2 Authentication | ja — Audit aller Auth-Pfade | @supabase/ssr canonical pattern |
| V3 Session Management | ja — Cookie-Domain, Token-Rotation | updateSession() middleware |
| V4 Access Control | ja (indirekt) — geschützte Routes | Middleware-Guard |
| V5 Input Validation | nein — keine neuen Inputs | bestehend |
| V6 Cryptography | ja — CSP Nonce | `crypto.randomUUID()` Web Crypto API |
| V14 Config / Security Headers | ja — CSP, HSTS, etc. | Next.js proxy.ts Pattern |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|-----------|
| XSS via Inline-Script | Spoofing/Tampering | CSP `script-src 'nonce'` ohne `'unsafe-inline'` |
| Prefetch-triggered signout | Tampering | POST-only route (f5f9cb7 fix), Regression-Test |
| Cookie-Theft Cross-Subdomain | Information Disclosure | `Domain=.generation-ai.org` mit HttpOnly + SameSite |
| Clickjacking | Tampering | `frame-ancestors 'none'` (bereits in Headers) |
| CSP-Bypass via data: URI | Tampering | `script-src` blockt data: per default |

---

## Assumptions Log

| # | Claim | Section | Risk wenn falsch |
|---|-------|---------|-----------------|
| A1 | Tailwind v4 benötigt `'unsafe-inline'` für style-src | CSP Directives | Nonce für styles würde die App nicht brechen, aber unnötig komplex |
| A2 | Speed Insights mit `'strict-dynamic'` braucht expliziten Host in script-src | CSP Pitfall 4 | Script würde blockiert werden → kein Tracking (kein Security-Problem, nur Funktionalität) |
| A3 | `supabase.auth.admin.generateLink({ type: 'magiclink' })` gibt `action_link` zurück | Code Examples | Admin API Signatur ggf. leicht anders → Playwright-Test würde im Wave 0 scheitern, einfach anpassbar |
| A4 | Cross-Domain-Test: Login nur auf tools-app möglich (website hat kein Login) | Pattern 3 | Wenn website doch ein Login-Formular hat, Teststruktur anpassen |

**Keine ASVS/Compliance-Claims sind assumed** — alle Security-Header-Anforderungen sind aus offizieller Dokumentation oder verifiziertem Code abgeleitet.

---

## Open Questions

1. **Session-Refresh-Pfad (D-01 Pfad 3): Wie testen?**
   - Was bekannt: `updateSession()` rotiert Tokens via Middleware. Supabase-Tokens haben eine Expiry.
   - Was unklar: Gibt es eine `apps/website/app/api/auth/refresh-session/`-Route? Die Datei existiert nicht (nur `/signup` unter `app/api/auth/`). STATE.md erwähnt sie als "Cross-domain session refresh proxy" in Commit `4d3977d`. Möglicherweise wurde das in proxy.ts integriert, nicht als Route.
   - Empfehlung: Planer soll "Session-Refresh" in Audit als "Manual-only" einstufen — kurzen Token-Expiry simulieren ist in E2E schwierig.

2. **Supabase Magic-Link-URL für E2E-Test**
   - Was bekannt: `admin.auth.admin.generateLink()` gibt einen Link zurück, Playwright kann direkt zu diesem navigieren.
   - Was unklar: `SUPABASE_SERVICE_ROLE_KEY` ist nur serverseitig verfügbar. E2E-Tests laufen clientseitig. → Global-Setup Script braucht Server-Zugriff.
   - Empfehlung: E2E global-setup als Node.js-Script (nicht Playwright Browser-Kontext) der den Link generiert und als `storageState` oder URL-Variable weitergibt.

3. **website-App CSP: Hat website Sentry?**
   - Was bekannt: `apps/website/package.json` hat kein `@sentry/nextjs` [VERIFIED].
   - Was unklar: Vielleicht wird Sentry Browser SDK manuell geladen? Audit sollte Browser-Console auf Sentry-Requests prüfen.
   - Empfehlung: Als "kein Sentry" planen, im Audit verifizieren.

---

## Sources

### Primary (HIGH confidence)
- `apps/tools-app/node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` — Next.js 16 CSP Nonce Pattern, proxy.ts, strict-dynamic, dynamic rendering requirement
- `packages/auth/src/` (alle Dateien) — Canonical @genai/auth API surface
- `apps/tools-app/proxy.ts`, `apps/website/proxy.ts` — Bestehende middleware-Struktur
- `apps/tools-app/sentry.edge.config.ts`, `instrumentation-client.ts` — Sentry DSN-Host
- `apps/tools-app/next.config.ts`, `apps/website/next.config.ts` — Aktueller Header-Status
- `node_modules/@vercel/speed-insights/dist/next/index.js` — Script-Host `va.vercel-scripts.com`

### Secondary (MEDIUM confidence)
- `apps/tools-app/lib/auth.ts`, `apps/website/lib/supabase/` — Konsolidierungs-Status verifiziert via Code-Lesen
- `packages/e2e-tools/playwright.config.ts` + `tests/auth.spec.ts` — E2E-Infrastruktur-Status

### Tertiary (LOW confidence, ASSUMED)
- Supabase `admin.auth.admin.generateLink()` API-Signatur — training knowledge, nicht via Context7 oder Docs verifiziert (A3)
- Tailwind v4 `unsafe-inline`-Anforderung — training knowledge (A1)
- Speed Insights `strict-dynamic` Kompatibilität — aus Source-Code-Analyse abgeleitet, nicht offiziell dokumentiert (A2)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — alle Packages/Versionen via package.json verifiziert
- Architecture (CSP Pattern): HIGH — aus lokal installierten Next.js 16 Docs verifiziert
- Host-Liste (CSP Directives): HIGH (Sentry, Clearbit, Speed Insights) / MEDIUM (Supabase WSS)
- Konsolidierungs-Audit: HIGH — Code direkt gelesen
- E2E-Test-Patterns: MEDIUM — Standard Playwright, aber Admin-API-Signaturen ASSUMED
- Pitfalls: HIGH — aus Codebase-History und offiziellen Docs abgeleitet

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stabil — Next.js 16 CSP API ist ausgereift)
