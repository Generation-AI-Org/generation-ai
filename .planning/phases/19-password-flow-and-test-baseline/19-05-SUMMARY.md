---
phase: 19-password-flow-and-test-baseline
plan: 05
subsystem: ci-infra
tags: [github-actions, secrets, playwright, changeset, manual-steps, e2e]

requires:
  - phase: 19-04
    provides: "Playwright-Config Prod-Default + E2E_BASE_URL-Override + turbo passThroughEnv"
  - phase: 7
    provides: "CI-Workflow-Skeleton mit build-and-test + Playwright-Install"
provides:
  - "CI e2e-Job mit TEST_USER_EMAIL/TEST_USER_PASSWORD-Binding aus Repo-Secrets"
  - "Manual-Setup-Doku für Supabase-Test-User + GitHub-Secrets + E2E_BASE_URL + .env.test.local + Rollback"
  - "Changeset für v4.4.0 minor (linked @genai/tools-app + @genai/website)"
affects: []

tech-stack:
  added: []
  patterns:
    - "GitHub Actions secret-injection via env-Block pro Step (nicht job-level) — limitiert scope auf E2E-Step"
    - "Changeset linked-Config nutzt nur einen Package-Eintrag, bumpt beide Apps automatisch"
    - "MANUAL-STEPS.md als Phase-lokale Doku (nicht in docs/) — Phase-Artefakt, lebt mit dem Plan"

key-files:
  created:
    - .planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md
    - .changeset/phase-19-password-flow.md
  modified:
    - .github/workflows/ci.yml

key-decisions:
  - "STAGING_URL-Gate entfernt — E2E läuft jetzt IMMER auf main-push + PR gegen Prod-Default"
  - "E2E_BASE_URL als Repo-Var (nicht Secret) — keine sensitive Info, erlaubt einfaches Setzen/Entfernen via GitHub UI"
  - "BASE_URL-legacy-env aus CI-Workflow entfernt — Plan 04 hat die Fallback-Kette in playwright.config.ts verlagert, CI braucht nur noch die primary var"
  - "MANUAL-STEPS.md mit 5 Sections (Supabase, GitHub-Secrets, E2E_BASE_URL, .env.test.local, Rollback) statt kurzer Check-Liste — Phase 17 MANUAL-STEPS.md als Struktur-Vorbild"
  - "ImprovMX-Warnung in Test-User-Section prominent — Memory-Eintrag `reference_mail_forwarding` sagt admin@generation-ai.org läuft über ImprovMX-Forwarding, Test-Mails würden sonst in Lucas Alltag landen"

patterns-established:
  - "Phase-Manual-Steps liegen unter `.planning/phases/NN-*/MANUAL-STEPS.md` (nicht in docs/)"
  - "E2E-Job liest nur Secrets die der Job wirklich braucht — kein blanket-secrets-Pattern"

requirements-completed: [D-07, D-09]

duration: ~3min
completed: 2026-04-19
---

# Phase 19 Plan 05: CI-Binding + Manual-Steps + Changeset Summary

**Closure-Gate für Phase 19: CI-Workflow bekommt TEST_USER-Secret-Binding + E2E_BASE_URL-Override (STAGING_URL-Gate entfernt, E2E läuft jetzt immer gegen Prod-Default), MANUAL-STEPS.md dokumentiert Luca's einmaliges Setup (Supabase-Test-User, GitHub-Secrets, optional Repo-Var, lokale .env.test.local, Rollback), und ein Changeset für v4.4.0 minor ist angelegt (linked bumpt @genai/tools-app + @genai/website).**

## Performance

- **Duration:** ~3 min (Code-Tasks 1-3)
- **Started:** 2026-04-19T17:08:00Z
- **Code-Tasks completed:** 2026-04-19T17:11:00Z
- **Tasks:** 3 Code + 1 Human-Verify-Checkpoint (pending Luca-Approval)
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

### Task 1 — CI-Workflow

- `.github/workflows/ci.yml` e2e-Job modernisiert:
  - `if: ${{ vars.STAGING_URL != '' }}`-Gate **entfernt** → E2E läuft jetzt immer auf main-push + PR
  - `BASE_URL: ${{ vars.STAGING_URL }}` **entfernt** → legacy-Referenz weg
  - `TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}` **ergänzt** (D-07)
  - `TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}` **ergänzt** (D-07)
  - `E2E_BASE_URL: ${{ vars.E2E_BASE_URL }}` **ergänzt** (optional override, fallback → Prod-Default aus `playwright.config.ts`)
  - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` **ergänzt** (für Magic-Link/Recovery-Helper, Phase 13)
- `build-and-test`-Job unverändert (kein collateral damage)

### Task 2 — MANUAL-STEPS.md

- Neue Datei `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` (133 Zeilen)
- 5 Sections:
  1. **Supabase Test-User** — Dashboard-URL, Email-Hinweis (kein ImprovMX-Forwarding), `openssl rand -base64 24`-Pattern, Auto-Confirm ON, has_password-metadata-Hinweis
  2. **GitHub Repo Secrets** — Direkt-Link zu Actions-Secrets-UI, beide Secret-Names
  3. **(Optional) E2E_BASE_URL Repo-Variable** — für Preview-URL-Tests
  4. **Local .env.test.local** — Copy-Paste-Block (4-Zeilen-eingerückter Code), gitignore-Verify
  5. **Rollback** — User löschen + Secrets löschen

### Task 3 — Changeset

- `.changeset/phase-19-password-flow.md` angelegt
- Frontmatter: `"@genai/tools-app": minor` (via `linked`-Config in `.changeset/config.json` wird @genai/website automatisch mit-gebumped)
- Body (Deutsch, echte Umlaute):
  - Absatz 1: Password-Flow (First-Login + Settings-Inline)
  - Absatz 2: E2E-Baseline-Reparatur
- Beim nächsten `pnpm version`: beide Apps auf v4.4.0

## Task Commits

1. **Task 1: CI e2e-Job mit TEST_USER-Secrets** — `c82604d` (feat)
2. **Task 2: MANUAL-STEPS.md Phase 19** — `e765b76` (docs)
3. **Task 3: Changeset Phase 19 v4.4.0** — `6ab6ae6` (chore)
4. **Task 4: Human-Verify-Checkpoint** — PENDING (Luca-Setup + Build + E2E-Run)

## Files Created/Modified

- **Modified:** `.github/workflows/ci.yml` — +8 / −3 Zeilen. e2e-Job env-Block erweitert, `if:`-Gate entfernt, legacy `BASE_URL` durch primary `E2E_BASE_URL` + Test-User-Secrets ersetzt.
- **Created:** `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` — 133 Zeilen, 5 Sections, Setup + Rollback-Doku.
- **Created:** `.changeset/phase-19-password-flow.md` — 7 Zeilen, minor-Bump, 2-Absatz-Body.

## Decisions Made

- **STAGING_URL-Gate komplett entfernt statt auf TEST_USER_EMAIL-Gate ausgetauscht:** Der Plan schlug ein unconditional Run vor. Alternative wäre gewesen, `if: ${{ secrets.TEST_USER_EMAIL != '' }}` — aber GitHub Actions evaluiert `secrets.*` nicht in job-level `if`-Expressions zuverlässig (Secrets sind nicht direkt accessible in `if:`). Unconditional-Run + hard-fail bei fehlenden Secrets ist der richtige Enforcement-Mechanismus (siehe Plan-Kommentar zu Task 1: „zwingt Luca zum Setup-Schritt").
- **`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` im e2e-Job-env ergänzt:** Diese sind bereits im `build-and-test`-Job gesetzt, aber im e2e-Job waren sie vorher nicht nötig (es gab nur `BASE_URL`). Jetzt braucht der Magic-Link/Recovery-Helper aus Phase 13 (`packages/e2e-tools/fixtures/admin-helper.ts` via `getAdminClient()`) beide Werte zur Runtime. Ohne diese würden Path-2/3/4-Tests in CI fehlschlagen, auch wenn TEST_USER-Secrets gesetzt sind.
- **Changeset nur für @genai/tools-app:** Linked-Config bumpt @genai/website automatisch mit (siehe `.changeset/config.json` → `"linked": [["@genai/website", "@genai/tools-app"]]`). Doppelter Eintrag wäre redundant und könnte bei Changeset-Reader zu Verwirrung führen (zwei identische minor-Bumps listed).
- **Body mit echten Umlauten (ö/ä/ü/ß), nicht ae/oe/ue/ss:** Memory-Entry `feedback_umlaute` ist explizit: User-facing Content braucht echte Umlaute. Changeset-Bodies landen im CHANGELOG.md → User-facing → echte Umlaute.

## Deviations from Plan

**1. [Rule 2 - Critical functionality] SUPABASE-Env-Vars im e2e-Job ergänzt**
- **Found during:** Task 1 CI-Workflow-Review
- **Issue:** Plan-Text sah nur `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` + `E2E_BASE_URL` vor. Die Phase-13-Admin-Helper (für Magic-Link-Generation in Path 2/3/4) brauchen zusätzlich `NEXT_PUBLIC_SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` zur Runtime, nicht nur zur Build-Zeit. Ohne diese würden die Tests trotz gesetzter TEST_USER-Secrets in CI fehlschlagen.
- **Fix:** env-Block um beide Keys erweitert. Der Plan-Text hatte das in einem Inline-Kommentar erwähnt („Admin-Key weiterhin für Magic-Link/Recovery-Generation nötig"), aber nicht als separate Action aufgeführt. Ich habe den Kommentar-Hinweis als Code umgesetzt.
- **Files modified:** .github/workflows/ci.yml
- **Commit:** c82604d (Teil des Task-1-Commits)

## Issues Encountered

None. Alle Code-Tasks bei erstem Versuch grün.

## Verification Evidence

### Task 1 — CI-Workflow

| Criterion | Expected | Actual |
|---|---|---|
| `TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}` present | ≥ 1 | 1 |
| `TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}` present | ≥ 1 | 1 |
| `E2E_BASE_URL: ${{ vars.E2E_BASE_URL }}` present | ≥ 1 | 1 |
| `STAGING_URL` absent | 0 | 0 |
| `if: ${{ vars.STAGING_URL != '' }}` absent | 0 | 0 |
| `build-and-test` job intact | ≥ 1 | 1 |
| grep -c "TEST_USER_EMAIL" | ≥ 1 | 1 |

### Task 2 — MANUAL-STEPS.md

| Criterion | Expected | Actual |
|---|---|---|
| File exists | yes | FOUND |
| File contains `TEST_USER_EMAIL` | yes | 3 |
| File contains `TEST_USER_PASSWORD` | yes | 5 |
| File contains `Supabase Dashboard` | yes | 4 |
| File contains `Auto Confirm User` | yes | 1 |
| File contains `.env.test.local` | yes | 6 |
| File contains `ImprovMX` | yes | 1 |
| File contains `E2E_BASE_URL` | yes | 3 |
| Line count | ≥ 30 | 133 |

### Task 3 — Changeset

| Criterion | Expected | Actual |
|---|---|---|
| File exists | yes | FOUND |
| File starts with YAML frontmatter | yes | `---` on line 1 |
| Package `@genai/tools-app` | ≥ 1 | 1 |
| Bump-type `minor` | ≥ 1 | 1 |
| Body mentions `Password` | ≥ 1 | 1 |
| Body mentions `E2E` | ≥ 1 | 1 |

## Known Stubs

None — alle Code-Tasks sind reine Config/Docs/Frontmatter-Änderungen, kein UI-Rendering.

## Threat Flags

None — CI-Workflow-Edit erweitert nur Env-Var-Binding, kein neuer Network-Endpoint, keine Auth-Logic-Änderung. MANUAL-STEPS.md + Changeset sind reine Doku-Artefakte.

**Security-Anmerkung (Info, nicht Flag):** Die neuen Secrets (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`) sind per-repo-scoped in GitHub Actions Secrets (nicht in Code, nicht in Changeset, nicht in MANUAL-STEPS.md-Values). Das ist das canonical Pattern. Test-User-Credentials haben in Supabase kein admin-privilege — bei Leak max. Impact ist Login als dieser eine Test-User (no prod-data-access).

## User Setup Required — Task 4 CHECKPOINT

**Blocking für Phase-Closure:** Luca muss die folgenden Schritte durchführen, BEVOR Plan 19-05 als „done" markiert werden kann:

### 1. Supabase Test-User anlegen

- Dashboard → https://supabase.com/dashboard/project/wbohulnuwqrhystaamjc/auth/users
- Add user → Create new user
- Email: z.B. `e2e-tester@generation-ai.test` (NICHT eine ImprovMX-geforwardete Adresse)
- Password: `openssl rand -base64 24`
- Auto Confirm User: ON
- Siehe: `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` §1

### 2. GitHub Repo Secrets setzen

- https://github.com/Generation-AI-Org/generation-ai/settings/secrets/actions
- `TEST_USER_EMAIL` = Email aus Schritt 1
- `TEST_USER_PASSWORD` = Passwort aus Schritt 1
- Siehe: MANUAL-STEPS.md §2

### 3. Lokal Build + E2E-Smoke verifizieren

    pnpm install
    pnpm build
    # Beide Apps müssen grün sein

    cd packages/e2e-tools
    # .env.test.local erstellen (siehe MANUAL-STEPS.md §4)
    pnpm exec playwright test smoke.spec.ts chat.spec.ts --reporter=list
    # Erwartet: alle Smoke + Chat grün

### 4. Optional — Full Auth-Suite

    pnpm exec playwright test auth.spec.ts --reporter=list
    # Erwartet: 9 passed, 2 skipped

### 5. Manual UX-Verifikation gegen Prod (mit Test-User)

- `https://tools.generation-ai.org/login` → Magic-Link → Link klicken
- Erwartet: Redirect zu `/auth/set-password?first=1` mit „Später setzen"-Button
- Skip klicken → Redirect auf `/`, `user_metadata.has_password === false`
- `/settings` → Passwort-Section mit 2-Feld-Form
- Passwort setzen → Success + Mode-Switch zu Change (3 Felder)
- Zweiter Magic-Link → kein Re-Prompt

### 6. CI-Run checken

- Nach Push auf main → GitHub Actions → `e2e`-Job muss grün sein

## Next Phase Readiness

- **Plan 19-05 Code-Tasks:** DONE (3/3 Code-Tasks, 3 Commits)
- **Plan 19-05 Human-Verify:** PENDING Lucas Approval — alle Artefakte bereit
- **Phase 19 Gesamtstatus:** 4/5 Plans vollständig done (01+02+03+04), Plan 05 Code-komplett aber Closure hängt am Human-Verify-Checkpoint
- **Nach Luca-Approval:**
  - Phase 19 ist offiziell abgeschlossen
  - `pnpm version` kann v4.4.0 Release triggern (wenn Luca das will)
  - Nächste Phase aus ROADMAP.md aussuchen — aktuell keine weitere Phase geplant, Milestone v3.0 ist mit Phase 19 der letzte Baustein
- **Risiken:**
  - Wenn Test-User's `has_password=true` via Dashboard versehentlich gesetzt würde, greift First-Login-Prompt nicht (E2E Path 1 würde falschen Flow testen). MANUAL-STEPS.md §1 warnt davor.
  - `pnpm e2e` gegen Prod ist abhängig von Prod-Verfügbarkeit — akzeptiertes Tradeoff (CONTEXT-Decision).

## Self-Check: PASSED

- File `.github/workflows/ci.yml` exists: FOUND
- File `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` exists: FOUND
- File `.changeset/phase-19-password-flow.md` exists: FOUND
- Commit `c82604d` exists in git log: FOUND
- Commit `e765b76` exists in git log: FOUND
- Commit `6ab6ae6` exists in git log: FOUND
- All 3 code-task acceptance-criteria greps passed
- Task 4 (Human-Verify) documented as PENDING in User Setup Required section

---
*Phase: 19-password-flow-and-test-baseline*
*Code-Tasks completed: 2026-04-19*
*Human-Verify Checkpoint: PENDING Luca-Approval*
