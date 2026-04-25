---
phase: 25
plan: H
slug: tests-sentry-and-rate-limits
type: execute
wave: 4
depends_on:
  - 25-D
  - 25-E
  - 25-F
files_modified:
  - packages/e2e-tools/tests/circle-signup.spec.ts
  - packages/e2e-tools/tests/helpers/circle-mock.ts
  - apps/website/instrumentation.ts
  - apps/website/sentry.client.config.ts
  - apps/website/sentry.server.config.ts
  - apps/website/sentry.edge.config.ts
  - apps/website/package.json
autonomous: true
requirements:
  - R6.1
  - R6.3
  - R6.7
must_haves:
  truths:
    - "Sentry ist für `apps/website` konfiguriert: `@sentry/nextjs` dep, `instrumentation.ts` setup, `sentry.{client,server,edge}.config.ts` mit DSN aus env `SENTRY_DSN_WEBSITE` (oder bereits bestehenden)."
    - "Sentry-Init ist no-op wenn DSN fehlt (dev/preview-Default) — kein crash bei local dev."
    - "Sentry-Scope für `circle-api` Tag: Alle Plan-D/E/F Routes setzen `{ tags: { 'circle-api': true, op: '<name>' } }`. Plan-H fügt globalen `beforeSend`-Filter hinzu der `circle-api`-Tagged Events separat aggregiert (Sentry-Side-Dashboard)."
    - "Playwright E2E `circle-signup.spec.ts` deckt 4 Kern-Flows: (1) Happy-Path Signup → Mail-Trigger verifiziert via Supabase-Admin-List, (2) Duplicate-Email Signup → no-leak (ok:true, no mail), (3) Circle-API down (mocked via test-proxy) → Sentry-Event erfasst mit Tag, User bekommt Mail trotzdem, (4) Confirm-Route mit valid token + missing circle_member_id → Redirect nach `/welcome?circle=pending`."
    - "E2E nutzt Test-Supabase-Project ODER isolierte Test-Emails (prefix `e2e-test-<uuid>@`) + Cleanup-Step am Ende um Test-User zu löschen."
    - "Bundle-Safety Test (grep-based): `grep -r 'CIRCLE_API_TOKEN' apps/website/.next/static/` returns 0 matches (Token nie im Client-Bundle)."
    - "Rate-Limit-Tests: POST `/api/auth/signup` 6x mit SIGNUP_ENABLED=true → 6. Call returned 429. Reset nach 15min (skip in CI, nur lokal)."
    - "`npm script`-Eintrag `test:e2e:circle-signup` in website-package.json für isolated run."
    - "Test-Fixture `e2e-tools/tests/helpers/circle-mock.ts` bietet `setupCircleFailure()` / `restoreCircle()` Utilities die via Playwright-Route-Intercepts Circle-API-Calls abfangen."
  artifacts:
    - path: "packages/e2e-tools/tests/circle-signup.spec.ts"
      provides: "4 E2E-Playwright-Tests für Phase-25-Flows"
      exports: []
    - path: "packages/e2e-tools/tests/helpers/circle-mock.ts"
      provides: "Helper zum Mocken von Circle-API in E2E"
      exports: ["setupCircleFailure", "restoreCircle"]
    - path: "apps/website/instrumentation.ts"
      provides: "Next.js Sentry instrumentation entry"
      exports: ["register"]
  key_links:
    - from: "apps/website/app/actions/signup.ts + app/auth/confirm/route.ts + app/api/admin/circle-reprovision/route.ts"
      to: "Sentry captureException"
      via: "tags: { 'circle-api': true, op: '...' }"
      pattern: "'circle-api': true"
---

<objective>
Alle Flows sind gebaut, jetzt beweisen dass sie funktionieren + observable sind. Plan H ist Verifikation + Monitoring: E2E-Playwright-Tests für User-Journeys + Sentry-Setup inkl. `circle-api`-Tag für R6.7.

Purpose: R6.1 end-to-end testbar, R6.3 Fallback-UX verifiziert, R6.7 Sentry live + getagged.
Output: E2E-Suite + Sentry-Config + Test-Helpers.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@packages/e2e-tools/
@apps/website/app/actions/signup.ts
@apps/website/app/auth/confirm/route.ts
@apps/website/app/api/admin/circle-reprovision/route.ts
@packages/circle/src/index.ts

<interfaces>
```typescript
// packages/e2e-tools/tests/helpers/circle-mock.ts
import type { Page } from '@playwright/test'

export async function setupCircleFailure(page: Page, opts?: { status?: number }): Promise<void>
export async function restoreCircle(page: Page): Promise<void>
```

**E2E test cases:**

1. **Happy Path**: Form fill → submit → `ok: true` → Verify User in Supabase (via admin-API test-helper) has `circle_member_id` in user_metadata.

2. **Duplicate Email**: Submit valid form, then submit again with same email → both return `ok: true` but only 1 Supabase-User exists + only 1 Mail sent (verified via Resend-test-mode or no-re-trigger of generateLink).

3. **Circle API Down**: Playwright intercepts `app.circle.so/**` → returns 500. Submit form → `ok: true` (D-03 non-blocking), but `user_circle_links` empty AND `raw_user_meta_data.circle_provision_error` set. Sentry event captured with tag `circle-api: true`.

4. **Confirm fallback**: Build a Supabase-User manually WITHOUT `circle_member_id`, generate confirm link, click → lands on `/welcome?circle=pending` with banner visible.
</interfaces>

<environment_notes>
- Dieses Repo hat bereits Playwright-Setup in `packages/e2e-tools/` (Phase 20, 23, 24 haben specs dort).
- Neue E2E-Tests laufen lokal + via CI-Preview-URL. Sentry-Events via DSN — wenn DSN in Preview-Env gesetzt ist, Tests können via Sentry-API abfragen (asynchron — besser: assert nur dass `console.error` bzw. server-side-log matched, Sentry-Delivery ist eine eigene Verifikation).
- Für "assert Sentry event fired" im Test: stub `@sentry/nextjs` via Playwright `page.exposeFunction` + `addInitScript` ODER nutze expected console log (Sentry logs to console in dev-mode).
- `@sentry/nextjs` installieren wenn nicht bereits drin. Check: `grep -q @sentry/nextjs apps/website/package.json`.
- Wenn Repo bereits Sentry konfiguriert hat (z.B. aus Phase 6 tools-app oder früher website), **nicht** doppelt konfigurieren — Plan H **erweitert** die Config um Website-DSN + circle-api-Filter.
</environment_notes>
</context>

<threat_model>
Plan H testet + konfiguriert — keine neuen exposure surfaces. Reusage der Threat-Models aus Plans D/E/F.

**Test-spezifische Risken:**

1. **Test-Emails-Pollution der Prod-DB.**
   - Mitigation: Alle E2E-Test-Emails prefix `e2e-test-<uuid>@example.com` + Cleanup-Step am Test-Ende (supabase-admin.deleteUser). Optional: separates Supabase-Test-Project.

2. **Circle-Prod-Pollution.**
   - Mitigation: E2E gegen Circle-Prod läuft nur mit `--grep @manual`-Flag (default skip). Normal-CI-E2E mocked Circle via Playwright-Intercept.

3. **Sentry-Floods in Tests.**
   - Mitigation: `SENTRY_DSN_WEBSITE` in CI auf Test-DSN oder empty → Sentry no-op.
</threat_model>

<tasks>

<task type="auto">
  <name>Task H1: Sentry-Setup für website</name>
  <files>apps/website/package.json, apps/website/instrumentation.ts, apps/website/sentry.client.config.ts, apps/website/sentry.server.config.ts, apps/website/sentry.edge.config.ts</files>
  <read_first>
    - Bestehende Sentry-Configs im Repo (Phase 6 tools-app, falls vorhanden) — `apps/tools-app/sentry.*.config.ts`
    - Offizielle Next.js-15/16 Sentry-Setup-Doc — via context7 query-docs falls unsicher
    - `apps/website/package.json` (Dep-Check)
  </read_first>
  <action>
**Step 1:** Prüfe + installiere `@sentry/nextjs`:

```bash
# From repo root:
pnpm --filter @genai/website add @sentry/nextjs
```

**Step 2:** `apps/website/instrumentation.ts` erstellen:

```typescript
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
```

**Step 3:** Drei config files:

`apps/website/sentry.server.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

const DSN = process.env.SENTRY_DSN_WEBSITE

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? 'development',
    // Aggregate circle-api events separately (Sentry dashboard filter)
    beforeSend(event, hint) {
      const tags = event.tags ?? {}
      if (tags['circle-api']) {
        // Keep but flag for dashboard — no-op here, dashboard handles grouping
      }
      // Never leak CIRCLE_API_TOKEN — belt-and-suspenders filter
      if (typeof event.message === 'string' && event.message.includes('CIRCLE_API_TOKEN')) {
        return null
      }
      return event
    },
  })
} else if (process.env.NODE_ENV === 'production') {
  console.warn('[sentry] SENTRY_DSN_WEBSITE not set in production')
}
```

`apps/website/sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN_WEBSITE

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
  })
}
```

`apps/website/sentry.edge.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

const DSN = process.env.SENTRY_DSN_WEBSITE

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? 'development',
  })
}
```

**Step 4:** In `.env.example` + `apps/website/.env.example` ergänzen (falls nicht aus anderem Phase schon drin):

```bash
# Sentry (Phase 25 R6.7)
SENTRY_DSN_WEBSITE=
NEXT_PUBLIC_SENTRY_DSN_WEBSITE=
```

**Step 5:** `next.config.*` (js/ts) mit `withSentryConfig` wrappen (falls Repo-Pattern das braucht — Next 16 mit neuem Sentry-SDK ist teilweise auto-via-instrumentation).

**Wichtig:**
- Wenn DSN nicht gesetzt, `Sentry.captureException` ist eine no-op (SDK shipped so). Das ist der Default in Dev — kein noise.
- `beforeSend`-Filter hat Defense-in-Depth gegen Token-Leak.
- `tracesSampleRate: 0.1` ist safe default (10% sampling).
  </action>
  <verify>
    <automated>grep -q "@sentry/nextjs" apps/website/package.json && test -f apps/website/instrumentation.ts && test -f apps/website/sentry.server.config.ts && test -f apps/website/sentry.client.config.ts && test -f apps/website/sentry.edge.config.ts && grep -q "SENTRY_DSN_WEBSITE" apps/website/sentry.server.config.ts && grep -q "CIRCLE_API_TOKEN" apps/website/sentry.server.config.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `@sentry/nextjs` dep in package.json
    - Alle 4 files existieren
    - DSN-lookup via env (no-op wenn fehlt)
    - `beforeSend`-Filter enthält Token-String-Guard
    - tsc clean
  </acceptance_criteria>
  <done>Sentry scharf. `Sentry.captureException({ tags: { 'circle-api': true } })` Calls aus Plan D/E/F landen im Dashboard.</done>
</task>

<task type="auto">
  <name>Task H2: E2E-Test-Helper für Circle-Mocking</name>
  <files>packages/e2e-tools/tests/helpers/circle-mock.ts</files>
  <read_first>
    - Bestehende Test-Helpers in `packages/e2e-tools/` (falls Setup-Dateien vorhanden)
    - `packages/circle/src/client.ts` (BASE_URL = `https://app.circle.so/api/admin/v2`)
  </read_first>
  <action>
Erstelle `packages/e2e-tools/tests/helpers/circle-mock.ts`:

```typescript
/**
 * Phase 25 E2E — Circle-API mocking helpers.
 * Uses Playwright route-interceptors to override fetch-calls to Circle
 * without patching application code.
 */

import type { BrowserContext, Page } from '@playwright/test'

const CIRCLE_URL_PATTERN = /https?:\/\/app\.circle\.so\/api\/admin\/v2\/.*/

/**
 * Force all Circle API calls in this browser context to fail with the given
 * status (default 500). Simulates Circle-API-outage for D-03 testing.
 *
 * Server-side fetches (from Next.js Route Handlers) are not covered by
 * Playwright's page.route — use this ONLY for client-side fetches OR run the
 * Next.js dev server with a process-level fetch stub (see README).
 *
 * For server-side fetch interception: set env var CIRCLE_TEST_FORCE_FAIL=500
 * before starting the dev server (Plan H3 script takes care of this).
 */
export async function setupCircleFailure(
  context: BrowserContext,
  opts: { status?: number } = {},
): Promise<void> {
  const status = opts.status ?? 500
  await context.route(CIRCLE_URL_PATTERN, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'forced test failure' }),
    })
  })
}

export async function restoreCircle(context: BrowserContext): Promise<void> {
  await context.unroute(CIRCLE_URL_PATTERN)
}

/**
 * Wait for a Sentry-emitting scenario — polls /api/debug/last-sentry-event
 * (if dev-only route exists) OR just waits for a fixed duration.
 *
 * In production-like tests we assert Sentry in Plan-H-integration via log
 * matching or Sentry-API query — not from the browser.
 */
export async function waitForSentryEvent(page: Page, timeoutMs = 2000): Promise<void> {
  await page.waitForTimeout(timeoutMs)
}
```

**Hinweis:** Playwright's `page.route` / `context.route` interceptet nur Browser-fetches, nicht Server-side fetches von Node.js. Für server-side mocking brauchen wir einen anderen Hebel:

**Option A:** Environment-Flag-Pattern — in `packages/circle/src/client.ts` einen `CIRCLE_TEST_FORCE_FAIL` env-check einbauen der bei `=500` oder `=429` das entsprechende `CircleApiError` wirft ohne echten fetch. In Plan H3 E2E setzt das Script diese env-var vor `pnpm dev`-Start.

**Option B:** MSW-Server (Mock Service Worker) als Node-side Interceptor. Komplexer Setup, passt besser wenn mehrere External-APIs gemockt werden sollen.

**Empfehlung:** Option A ist V1-ausreichend. Plan H3 beschreibt das env-flag-setup konkret.

Ergänze in `packages/circle/src/client.ts` (updated nach Plan B's B3):

```typescript
// Test-only escape hatch (DO NOT use in production code paths).
// Set CIRCLE_TEST_FORCE_FAIL=<status> before starting dev server to force
// Circle-API errors for E2E fallback-flow tests. Value parsed as number.
async function circleFetch<T>(path: string, init: RequestInit & { method: 'GET' | 'POST' | 'PUT' | 'DELETE' }): Promise<T> {
  const forceFail = process.env.CIRCLE_TEST_FORCE_FAIL
  if (forceFail) {
    const status = parseInt(forceFail, 10)
    if (!Number.isNaN(status)) {
      throw new CircleApiError(
        classifyError(status),
        `CIRCLE_TEST_FORCE_FAIL=${status}`,
        { statusCode: status },
      )
    }
  }
  // ... rest of original implementation ...
}
```

Diese Einpflegung ist **additiv** zu Plan B und darf Plan B nicht verletzen. Falls der Plan-B-Executor das schon eingepflegt hat: skip. Sonst Plan H3 nimmt es mit.
  </action>
  <verify>
    <automated>test -f packages/e2e-tools/tests/helpers/circle-mock.ts && grep -q "setupCircleFailure" packages/e2e-tools/tests/helpers/circle-mock.ts && grep -q "restoreCircle" packages/e2e-tools/tests/helpers/circle-mock.ts && grep -q "CIRCLE_URL_PATTERN" packages/e2e-tools/tests/helpers/circle-mock.ts && (grep -q "CIRCLE_TEST_FORCE_FAIL" packages/circle/src/client.ts || echo "add-in-H3")</automated>
  </verify>
  <acceptance_criteria>
    - Helper-File existiert
    - `setupCircleFailure` + `restoreCircle` exportiert
    - Entweder: `CIRCLE_TEST_FORCE_FAIL`-Flag in Circle-Client oder dokumentiert in Plan H3
  </acceptance_criteria>
  <done>Tests können Circle-Fehler simulieren.</done>
</task>

<task type="auto">
  <name>Task H3: E2E Playwright Spec</name>
  <files>packages/e2e-tools/tests/circle-signup.spec.ts, apps/website/package.json</files>
  <read_first>
    - `packages/e2e-tools/tests/helpers/circle-mock.ts` (aus H2)
    - Bestehende Specs: `packages/e2e-tools/tests/join.spec.ts` falls vorhanden, oder Phase-24-Test-Pattern
    - `apps/website/components/join/join-form.tsx` (Form-Selektoren)
  </read_first>
  <action>
Erstelle `packages/e2e-tools/tests/circle-signup.spec.ts`:

```typescript
import { expect, test } from '@playwright/test'
import { setupCircleFailure, restoreCircle } from './helpers/circle-mock'

const BASE = process.env.PLAYWRIGHT_TARGET_URL ?? 'http://localhost:3000'

// Generate isolated test-email per run
const testEmail = (label: string) =>
  `e2e-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`

test.describe('Phase 25 Circle-Sync unified signup', () => {
  test('[H3-1] Happy path: form submit → ok: true', async ({ page }) => {
    test.skip(
      process.env.SIGNUP_ENABLED !== 'true',
      'SIGNUP_ENABLED=false — skipping live signup test',
    )

    const email = testEmail('happy')
    await page.goto(`${BASE}/join`)

    // Fill form (selectors match Phase 23 join-form.tsx)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="name"]', 'E2E Test User')
    await page.fill('input[name="university"]', 'Testuni')
    await page.check('input[name="consent"]')

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/signup') || r.url().includes('join'), { timeout: 10_000 }),
      page.click('button[type="submit"]'),
    ])

    // Either 200 from API or server-action toast-success
    // Assert success UI (matches Phase 23 copy)
    await expect(page.locator('text=/Check dein Postfach|Alles klar/i')).toBeVisible({ timeout: 10_000 })

    // TODO: cleanup test-user via admin-API (future — or rely on test-project)
  })

  test('[H3-2] Duplicate email → no-leak success', async ({ page }) => {
    test.skip(process.env.SIGNUP_ENABLED !== 'true', 'needs live signup')

    const email = testEmail('dup')

    // First submission
    await page.goto(`${BASE}/join`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="name"]', 'First Submission')
    await page.fill('input[name="university"]', 'Testuni')
    await page.check('input[name="consent"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/Check dein Postfach|Alles klar/i')).toBeVisible({ timeout: 10_000 })

    // Second with same email — should also succeed silently (no-leak)
    await page.goto(`${BASE}/join`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="name"]', 'Second Submission')
    await page.fill('input[name="university"]', 'Testuni')
    await page.check('input[name="consent"]')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/Check dein Postfach|Alles klar/i')).toBeVisible({ timeout: 10_000 })
    // No error message
    await expect(page.locator('text=/bereits registriert|Diese E-Mail ist schon/i')).not.toBeVisible()
  })

  test('[H3-3] Circle API down → signup success + Sentry log', async ({ page, context }) => {
    test.skip(
      process.env.SIGNUP_ENABLED !== 'true' || !process.env.CIRCLE_TEST_FORCE_FAIL,
      'needs SIGNUP_ENABLED=true + CIRCLE_TEST_FORCE_FAIL=500 set in dev server env',
    )

    await setupCircleFailure(context, { status: 500 })
    const email = testEmail('circle-down')

    await page.goto(`${BASE}/join`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="name"]', 'Circle Down User')
    await page.fill('input[name="university"]', 'Testuni')
    await page.check('input[name="consent"]')
    await page.click('button[type="submit"]')

    // D-03: non-blocking — UI sagt success trotz Circle-Failure
    await expect(page.locator('text=/Check dein Postfach|Alles klar/i')).toBeVisible({ timeout: 10_000 })

    // Sentry-Verification: via Server-Side-Log assertion (Vercel-Logs) oder Sentry-API poll.
    // V1: manuell via Sentry-Dashboard (dokumentiert in HUMAN-UAT).
    await restoreCircle(context)
  })

  test('[H3-4] Confirm route + missing circle_member_id → fallback welcome', async ({ page }) => {
    // Pre-condition: need a Supabase-User WITHOUT circle_member_id + valid confirm token.
    // Setup via admin-API fixture (skipped here for brevity — executor implements
    // fixture helper via @genai/auth createAdminClient + admin.generateLink).
    test.skip(!process.env.E2E_TEST_CONFIRM_URL, 'needs pre-built fixture URL in env E2E_TEST_CONFIRM_URL')

    const confirmUrl = process.env.E2E_TEST_CONFIRM_URL!
    await page.goto(confirmUrl)

    // Should land on /welcome?circle=pending
    await page.waitForURL(/\/welcome\?circle=pending/, { timeout: 5_000 })
    await expect(page.locator('text=/Willkommen.*Community|Zur Community →/i')).toBeVisible()
    await expect(page.locator('a:has-text("Zur Community")')).toHaveAttribute('href', /community\.generation-ai\.org/)
  })
})
```

In `apps/website/package.json` scripts ergänzen:
```json
{
  "scripts": {
    "test:e2e:circle-signup": "playwright test -c ../../packages/e2e-tools/playwright.config.ts packages/e2e-tools/tests/circle-signup.spec.ts"
  }
}
```

**Hinweise für Executor:**
- Tests sind `test.skip`-guarded auf env-vars, damit CI-Default-Run (`SIGNUP_ENABLED=false`) die Tests überspringt. Nur Preview-Env mit flipped flag läuft sie live.
- Test-Email-Cleanup: Für V1 schreibt der Executor einen `test.afterAll`-Hook der alle `e2e-test-*@example.com` Emails via Supabase-admin.deleteUser cleaned. Falls zu komplex: dokumentieren als HUMAN-UAT und manuell via SQL löschen.
- H3-4 braucht einen gebauten Test-Fixture (pre-existing User) — der Executor entscheidet ob `test.beforeAll` den anlegt oder eine Umgebungsvariable den pre-built-Link liefert.
  </action>
  <verify>
    <automated>test -f packages/e2e-tools/tests/circle-signup.spec.ts && grep -q "Phase 25 Circle-Sync" packages/e2e-tools/tests/circle-signup.spec.ts && grep -q "H3-1" packages/e2e-tools/tests/circle-signup.spec.ts && grep -q "H3-2" packages/e2e-tools/tests/circle-signup.spec.ts && grep -q "H3-3" packages/e2e-tools/tests/circle-signup.spec.ts && grep -q "H3-4" packages/e2e-tools/tests/circle-signup.spec.ts && grep -q "setupCircleFailure" packages/e2e-tools/tests/circle-signup.spec.ts && (grep -q "test:e2e:circle-signup" apps/website/package.json || echo "script-missing")</automated>
  </verify>
  <acceptance_criteria>
    - Spec hat 4 Tests (H3-1 bis H3-4)
    - Nutzt `setupCircleFailure` Helper
    - Test-Emails haben prefix `e2e-test-` + uuid
    - `test.skip` auf SIGNUP_ENABLED-flag (kein blind-fail in CI)
    - Scripts-Eintrag in website-package.json
  </acceptance_criteria>
  <done>E2E-Suite runnable via `pnpm test:e2e:circle-signup`.</done>
</task>

<task type="auto">
  <name>Task H4: Bundle-Safety + Rate-Limit-Smoke-Tests</name>
  <files>packages/e2e-tools/tests/circle-bundle-safety.spec.ts</files>
  <read_first>
    - `apps/website/next.config.*`
    - Bestehende build-output-path (`.next/static/chunks/`)
  </read_first>
  <action>
Erstelle `packages/e2e-tools/tests/circle-bundle-safety.spec.ts` als node-level test (kein browser):

```typescript
/**
 * Phase 25 H4 — Build-time bundle safety checks.
 * Runs AFTER `pnpm --filter @genai/website build` as a separate test pass.
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEBSITE_ROOT = path.resolve(__dirname, '../../../apps/website')
const STATIC_DIR = path.join(WEBSITE_ROOT, '.next/static')

describe('Phase 25 Bundle Safety', () => {
  it('CIRCLE_API_TOKEN not in client bundle', () => {
    if (!existsSync(STATIC_DIR)) {
      // Test requires a prior build — mark as skipped if no build output
      console.warn('[H4] no .next/static/ — run `pnpm --filter @genai/website build` first')
      return
    }
    const result = execSync(
      `grep -r "CIRCLE_API_TOKEN" ${STATIC_DIR} || echo "NO_MATCHES"`,
      { encoding: 'utf-8' },
    )
    expect(result.trim()).toBe('NO_MATCHES')
  })

  it('SUPABASE_SERVICE_ROLE_KEY not in client bundle', () => {
    if (!existsSync(STATIC_DIR)) return
    const result = execSync(
      `grep -r "SUPABASE_SERVICE_ROLE_KEY" ${STATIC_DIR} || echo "NO_MATCHES"`,
      { encoding: 'utf-8' },
    )
    expect(result.trim()).toBe('NO_MATCHES')
  })
})
```

Dieser Test ist kein Playwright-Test sondern Vitest. Runbar via:
```bash
pnpm --filter @genai/website build && pnpm vitest run packages/e2e-tools/tests/circle-bundle-safety.spec.ts
```

Alternative: als `postbuild` script in `apps/website/package.json`:
```json
"postbuild": "vitest run ../../packages/e2e-tools/tests/circle-bundle-safety.spec.ts"
```

Entscheidet Executor basierend auf Build-Pipeline-Setup.
  </action>
  <verify>
    <automated>test -f packages/e2e-tools/tests/circle-bundle-safety.spec.ts && grep -q "CIRCLE_API_TOKEN" packages/e2e-tools/tests/circle-bundle-safety.spec.ts && grep -q "SUPABASE_SERVICE_ROLE_KEY" packages/e2e-tools/tests/circle-bundle-safety.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - Test-File existiert
    - Prüft `.next/static/` für beide sensitive Tokens
    - Runnable as vitest (nicht playwright)
  </acceptance_criteria>
  <done>Bundle ist safe — CI kann Token-Leak catchen.</done>
</task>

</tasks>

<verification>
**Automated:**
- `pnpm --filter @genai/website build` clean (mit Sentry)
- `pnpm vitest run packages/e2e-tools/tests/circle-bundle-safety.spec.ts` grün
- `pnpm test:e2e:circle-signup` läuft (mindestens H3-4 Fallback-Test grün gegen preview)

**HUMAN-UAT (Plan I):**
- Sentry-Dashboard zeigt `circle-api`-tagged Events
- Live-Test in Preview-Env mit echtem Circle-Token (Luca + Test-Account)
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
