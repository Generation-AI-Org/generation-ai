---
phase: 13
plan: "01"
subsystem: e2e-tools
tags: [testing, playwright, e2e, auth, infrastructure]
dependency_graph:
  requires: []
  provides: [test-user-fixture, supabase-admin-helper, csp-assertion-helper, auth-spec-skeleton]
  affects: [packages/e2e-tools]
tech_stack:
  added: [dotenv@^16.4.5, "@supabase/supabase-js@^2.103.0"]
  patterns: [playwright-fixtures, admin-api-test-helpers, csp-console-listener]
key_files:
  created:
    - packages/e2e-tools/fixtures/test-user.ts
    - packages/e2e-tools/helpers/supabase-admin.ts
    - packages/e2e-tools/helpers/csp-assertions.ts
    - packages/e2e-tools/.env.test.local.example
    - packages/e2e-tools/.gitignore
  modified:
    - packages/e2e-tools/playwright.config.ts
    - packages/e2e-tools/package.json
    - packages/e2e-tools/tests/auth.spec.ts
    - .gitignore
decisions:
  - "Use #email id selector instead of getByLabel(/email/i) — login label is German 'E-Mail' (hyphenated)"
  - "supabase-admin.ts creates its own adminClient() inline rather than importing from @genai/auth/admin — e2e package needs NODE env vars, not NEXT_ prefixed secrets"
metrics:
  duration_minutes: 30
  completed_date: "2026-04-17"
  tasks_completed: 3
  tasks_total: 3
  files_created: 5
  files_modified: 4
---

# Phase 13 Plan 01: Test-Infrastructure Scaffold — Summary

Wave 0 E2E-Infrastruktur für Phase-13-Auth-Audit aufgebaut. Playwright-Test-Paket hat jetzt: Test-User-Credential-Loader, Supabase-Admin-Helper (generateMagicLink, generateRecoveryLink, ensureTestUser), CSP-Assertion-Helpers, und ein vollständiges auth.spec.ts-Skeleton mit allen 6 Audit-Pfaden als describe-Blöcke.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | playwright.config + package.json + .env templates + .gitignore | 1d8688b | playwright.config.ts, package.json, .env.test.local.example, .gitignore (2x) |
| 2 | Fixtures + Helpers (test-user, supabase-admin, csp-assertions) | 0e8054d | fixtures/test-user.ts, helpers/supabase-admin.ts, helpers/csp-assertions.ts |
| 3 | auth.spec.ts skeleton mit 6 describe-Blöcken | 65bfd65 | tests/auth.spec.ts |

## Artifacts Created

### `packages/e2e-tools/fixtures/test-user.ts`
Exports: `getTestUser(): TestUser | null`, `requireTestUser(): TestUser`
Lädt Credentials aus `.env.test.local` (via dotenv in playwright.config). Wirft explizit wenn fehlend.

### `packages/e2e-tools/helpers/supabase-admin.ts`
Exports: `generateMagicLink(email, redirectTo?)`, `generateRecoveryLink(email, redirectTo?)`, `ensureTestUser(email, password)`
Nutzt `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` aus `.env.test.local`. Läuft nur in Node.js-Kontext (nie im Browser).

### `packages/e2e-tools/helpers/csp-assertions.ts`
Exports: `collectCspViolations(page): CspViolation[]`, `assertCspHeader(response, opts)`
Console-listener sammelt CSP-bezogene Errors; Header-Inspector prüft CSP-Direktiven in Response-Headers.

### `packages/e2e-tools/.env.test.local.example`
Template für: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL` (vorgefüllt), `SUPABASE_SERVICE_ROLE_KEY`, `BASE_URL`, `WEBSITE_URL`.

### `packages/e2e-tools/tests/auth.spec.ts`
8 describe-Blöcke (6 Auth-Pfade + CSP Baseline + General). 4 aktive Tests grün gegen Production, 8 als `.skip` markiert für Wave 1.

Aktive Tests:
- `Auth Path 1: login page renders form` — verifiziert `#email` input sichtbar auf /login
- `Auth Path 4: GET /auth/signout returns 405` — Regression-Anker für Session-Drop-Bug f5f9cb7
- `CSP Baseline: no CSP-violations on /login load` — Console-Listener, derzeit 0 Violations
- `General: homepage loads` — Sanity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed login form selector — "E-Mail" Label**
- **Found during:** Task 3 Playwright test run
- **Issue:** Plan-Skeleton nutzte `page.getByLabel(/email/i)`. Produktions-Login-Page hat Label-Text "E-Mail" (Deutsch, mit Bindestrich) — `/email/i` matcht nicht `e-mail`.
- **Fix:** Selector auf `page.locator("#email")` geändert (das `<input id="email">` ist stabil in login/page.tsx).
- **Files modified:** packages/e2e-tools/tests/auth.spec.ts
- **Commit:** 65bfd65

## Nächste Schritte für Luca (vor Wave 1 / Plan 13-02)

**Manuelle Aktion erforderlich:**

1. Supabase Dashboard öffnen: https://wbohulnuwqrhystaamjc.supabase.co → Authentication → Users
2. Neuen Test-User anlegen (NICHT dein eigener Account!):
   - Email: z.B. `test+e2e@generation-ai.org` oder eine dedizierte Test-Email
   - Passwort: starkes Passwort
   - Email Confirm: direkt bestätigen (kein Email-Flow nötig)
3. Credentials in `packages/e2e-tools/.env.test.local` eintragen:
   ```
   TEST_USER_EMAIL=test+e2e@...
   TEST_USER_PASSWORD=...
   SUPABASE_SERVICE_ROLE_KEY=<aus Supabase Dashboard → Settings → API → service_role>
   ```
4. Verifikation: `cd packages/e2e-tools && BASE_URL=https://tools.generation-ai.org pnpm exec playwright test auth.spec.ts --reporter=line`

Hinweis: `movo.fitness@gmail.com` (Luca's Account) ist als Test-User in Supabase bereits vorhanden laut Execution-Context. Falls das der dedizierte Test-User ist, reicht nur der Service-Role-Key in `.env.test.local`.

## Signal an Orchestrator

**Wave 0: COMPLETE.** Wave 1 (Plan 13-02) kann starten sobald `.env.test.local` befüllt ist.

Die `.skip`-Marker in `tests/auth.spec.ts` sind bewusst — Wave 1 entfernt sie und füllt die Test-Bodies aus ohne Struktur-Änderung.

## Known Stubs

Keine Stubs in den erstellten Dateien. Alle Helper-Funktionen sind vollständig implementiert. Test-Bodies der `.skip`-Tests sind intentional leer (Wave-1-Scope, kein unintentionaler Stub).

## Self-Check: PASSED

All files present. All commits verified: 1d8688b, 0e8054d, 65bfd65.
