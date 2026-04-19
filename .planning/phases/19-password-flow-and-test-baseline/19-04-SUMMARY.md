---
phase: 19-password-flow-and-test-baseline
plan: 04
subsystem: testing
tags: [e2e, playwright, turbo, config, prod-baseline]
dependency_graph:
  requires:
    - packages/e2e-tools/playwright.config.ts (existing)
    - packages/e2e-tools/tests/auth.spec.ts (Phase 13)
    - packages/e2e-tools/tests/chat.spec.ts (Phase 7)
    - packages/e2e-tools/tests/smoke.spec.ts (reference pattern)
    - turbo.json (root)
  provides:
    - Prod-Default-baseURL für E2E-Tests (D-08)
    - E2E_BASE_URL-Override-Semantik (funktioniert via pnpm e2e UND pnpm exec playwright test)
    - Prod-taugliche chat.spec.ts (3 aktive Tests, login-redirect-aware)
  affects:
    - CI-Workflow (nutzt jetzt E2E_BASE_URL statt BASE_URL, siehe Plan 05)
    - Lokale Dev-Runs (override via E2E_BASE_URL=http://localhost:3001)
tech_stack:
  patterns:
    - "E2E_BASE_URL primary / BASE_URL legacy-fallback (smooth transition)"
    - "turbo passThroughEnv explicit list (kein globalPassThroughEnv für Test-Env-Vars)"
    - "flexible Playwright-Locator: loginEmail.or(chatInput) statt state-annahmen"
  added: []
key_files:
  modified:
    - packages/e2e-tools/playwright.config.ts
    - packages/e2e-tools/tests/auth.spec.ts
    - packages/e2e-tools/tests/chat.spec.ts
    - turbo.json
  created: []
decisions:
  - "Default-baseURL ist Prod, nicht localhost (aligned mit smoke.spec.ts Pattern)"
  - "E2E_BASE_URL als primary Env-Var; BASE_URL bleibt legacy-Fallback (kein Hard-Break für evtl. existierende CI-Configs)"
  - "chat.spec.ts Test 3 wurde von 'main-locator-check' zu 'URL-whitelist + status<500' refactored — robuster gegen unauthenticated Prod-Reality"
metrics:
  duration: "~5min"
  tasks_completed: 4
  files_changed: 4
  completed: "2026-04-19T17:01:04Z"
requirements_completed: [D-07, D-08]
---

# Phase 19 Plan 04: E2E-Baseline Reparatur (Prod-Default + Test-Fixes) Summary

E2E-Config auf Prod-Default umgestellt, `chat.spec.ts` auf unauthenticated-redirect-Reality angepasst, `turbo.json` um `E2E_BASE_URL` in `passThroughEnv` erweitert, damit D-08-Override auch via `pnpm e2e` (turbo-Wrapper) funktioniert.

## What Was Built

**4 chirurgische Änderungen in 4 Files** — kein Feature-Change, nur Baseline-Reparatur für Phase 19 E2E-Strategie (D-07, D-08).

### Task 1 — playwright.config.ts (`bf39bdf`)
- Default-baseURL: `https://tools.generation-ai.org` (vorher: `http://localhost:3001`)
- Neue Env-Var `E2E_BASE_URL` als primary Override
- `BASE_URL` bleibt als legacy-fallback (smooth transition, keine CI-Breaks)
- `dotenv.config({ path: '.env.test.local' })`-Loading unverändert
- Alle sonstigen Config-Felder (timeouts, workers, retries, projects) unverändert

### Task 2 — auth.spec.ts (`195b042`)
- `TOOLS_URL`-Konstante (Zeile 10) liest jetzt `E2E_BASE_URL` → `BASE_URL` → Prod-Default
- Aligned mit Config-Pattern
- `WEBSITE_URL` unverändert (hat eigene Env-Var)
- Alle 12 Test-Bodies (Phase-13 Auth-Pfade + Path-5 Password-Reset aus Plan 02) intakt

### Task 3 — chat.spec.ts (`58b0048`)
- Describe umbenannt: `Chat Flow` → `Chat Flow (prod smoke)`
- 3 aktive Tests komplett refactored:
  - `chat page loads`: prüft `response.status() < 400`, body visible
  - `unauthenticated /chat shows login prompt or chat interface`: `page.locator('#email').or(getByRole('textbox'))` — akzeptiert beide Final-States
  - `/chat is not a 5xx page`: status < 500 + URL-Whitelist `['/chat', '/login']`
- 2 skipped Tests (`can send message`, `receives AI response`) unverändert im BACKLOG
- Kommentar ergänzt: Volle Chat-Flows brauchen Mail-Inbox-Scraping für Magic-Link

### Task 4 — turbo.json (`2a09a86`)
- `tasks.e2e.passThroughEnv`: `"E2E_BASE_URL"` direkt nach `"BASE_URL"` eingefügt
- Ohne diesen Fix würde turbo die Env-Var filtern → Override via `pnpm e2e` wäre wirkungslos
- Alle anderen Tasks + `globalPassThroughEnv` unverändert

## Verification

- `pnpm --filter @genai/e2e-tools exec playwright test --list` — **33 tests parsen** (auth 12, chat 5, smoke 2, visual-baseline 14), exit 0
- `node -e "JSON.parse(require('fs').readFileSync('turbo.json','utf8'))"` — **valides JSON**
- `grep -c 'E2E_BASE_URL' packages/e2e-tools/playwright.config.ts` → **3** (BASE_URL-Const + Kommentar + env-check)
- `grep -c 'test.skip' packages/e2e-tools/tests/chat.spec.ts` → **2** (unchanged)
- `grep -q '"E2E_BASE_URL"' turbo.json` → exit 0
- `grep -q 'baseURL: BASE_URL' packages/e2e-tools/playwright.config.ts` → exit 0 (derived constant)
- Alle Acceptance-Criteria-Greps pro Task erfüllt

**Nicht verifiziert (erwartungsgemäß):**
- Live-Run gegen Prod mit Test-User-Secrets (braucht `.env.test.local` oder CI-Secrets aus Plan 05) — D-07-Tests laufen erst nach CI-Binding grün
- Tatsächlicher `pnpm e2e`-Run mit `E2E_BASE_URL=http://localhost:3001` — wird bei Plan 05 (CI-Workflow) validiert

## Deviations from Plan

Keine. Plan wurde exakt wie geschrieben ausgeführt.

**Hinweis zum Localhost-Kommentar:** In `playwright.config.ts` Zeile 8 steht als Kommentar-Beispiel `E2E_BASE_URL=http://localhost:3001 pnpm exec playwright test`. Das ist intentional (Dev-Hinweis), nicht als hardcoded Default. Der Default-Fallback ist eindeutig `https://tools.generation-ai.org`. `grep` findet den String deshalb noch 1x in der Config — als Dokumentation, nicht als Code-Value.

## Commits

| Task | Commit    | Description                                                                 |
| ---- | --------- | --------------------------------------------------------------------------- |
| 1    | `bf39bdf` | fix(19-04): playwright config default to prod baseURL with E2E_BASE_URL override |
| 2    | `195b042` | fix(19-04): auth.spec.ts reads E2E_BASE_URL with BASE_URL legacy-fallback   |
| 3    | `58b0048` | fix(19-04): chat.spec.ts prod-reality — unauthenticated login-redirect check |
| 4    | `2a09a86` | fix(19-04): turbo.json e2e-task passThroughEnv inkl. E2E_BASE_URL            |

## Follow-Ups for Plan 05

Plan 05 (CI-Binding + MANUAL-STEPS.md) erbt von diesem Plan:

1. **CI-Workflow**: `.github/workflows/ci.yml` soll `E2E_BASE_URL` statt `BASE_URL` als Primary-Secret-Referenz nutzen (konsistent mit Config). `BASE_URL`-Legacy darf parallel bestehen bleiben.
2. **`.env.test.local.example`**: dokumentiert `E2E_BASE_URL` (primär) und verweist auf `BASE_URL` als legacy.
3. **MANUAL-STEPS.md**: dokumentiert GitHub-Secrets `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` und optional `E2E_BASE_URL` als Override.
4. **Post-Plan-05 Live-Test**: ein echter `pnpm e2e`-Run gegen Prod mit gesetzten Secrets validiert die Baseline grün.

## Self-Check: PASSED

- Files geschrieben:
  - `packages/e2e-tools/playwright.config.ts` — FOUND
  - `packages/e2e-tools/tests/auth.spec.ts` — FOUND
  - `packages/e2e-tools/tests/chat.spec.ts` — FOUND
  - `turbo.json` — FOUND
- Commits existieren:
  - `bf39bdf` — FOUND
  - `195b042` — FOUND
  - `58b0048` — FOUND
  - `2a09a86` — FOUND
