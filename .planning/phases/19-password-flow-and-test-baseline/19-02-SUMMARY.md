---
phase: 19-password-flow-and-test-baseline
plan: 02
subsystem: auth
tags: [supabase, user-metadata, first-login, password-flow, nextjs-client-component, suspense]

requires:
  - phase: 12-auth-rewrite
    provides: "@genai/auth createBrowserClient (canonical Supabase Client)"
  - phase: 19-01
    provides: "confirm-Route redirect zu /auth/set-password?first=1 bei First-Login"
  - phase: 16-brand-system-foundation
    provides: "Brand-Tokens (var(--accent), var(--text-muted), var(--bg-elevated))"
provides:
  - "Set-Password-Page mit First-Login-Mode (?first=1)"
  - "Skip-Button Später setzen → has_password=false + redirect /"
  - "Submit-Path kombiniert password + has_password=true in einem updateUser-Call"
affects: [19-03-settings-password-block]

tech-stack:
  added: []
  patterns:
    - "useSearchParams() in Client-Component mit Suspense-Wrapper (Next.js 15/16 requirement)"
    - "Kombinierter updateUser({ password, data: { has_password: true } })-Call spart Round-Trip"
    - "Skip-Path schreibt has_password=false explizit + best-effort redirect (error nur geloggt)"

key-files:
  created: []
  modified:
    - apps/tools-app/app/auth/set-password/page.tsx

key-decisions:
  - "Suspense-Wrapper proaktiv ergänzt — Next.js 15/16 erfordert Suspense bei useSearchParams in Client Components, sonst Build-Error beim static-rendering-Attempt"
  - "Kombinierter updateUser-Call (password + metadata zusammen) statt zwei separate Calls — D-05-canonical Pattern, atomar gegenüber Race Conditions"
  - "Skip-Path: Bei metadata-write-error trotzdem redirecten, damit User nicht hängt — error wird nur console.error geloggt"
  - "Back-Link in first-login-mode ausblenden — User soll sich bewusst zwischen Setzen und Skippen entscheiden (Plan-Behavior-Spec)"
  - "Submit-Button deaktiviert auch wenn skipping=true (und umgekehrt) — verhindert Doppel-Writes bei gleichzeitigem Klick"

patterns-established:
  - "Client-Component mit useSearchParams muss in Suspense-Boundary gewrappt sein (innere Function + default export mit Suspense)"
  - "has_password-metadata-Write ist Teil des success-paths der Set-Password-Page, nicht separater Step"

requirements-completed: [D-01, D-02, D-05]

duration: ~1min
completed: 2026-04-19
---

# Phase 19 Plan 02: Set-Password-Page First-Login-Mode Summary

**Set-Password-Page (`/auth/set-password`) erkennt `?first=1`-Query-Param und zeigt im First-Login-Mode einen Skip-Button, der `user_metadata.has_password=false` setzt; Submit schreibt Passwort und `has_password=true` atomar in einem `updateUser`-Call; Recovery-Flow (ohne `?first=1`) bleibt byte-identisch.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-19T16:55:25Z
- **Completed:** 2026-04-19T16:56:42Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- `useSearchParams()` liest `first`-Query-Param; `isFirstLogin = searchParams.get('first') === '1'`
- Submit-Path kombiniert Passwort-Setzen mit `has_password=true`-Metadata-Write in einem Call (D-05, D-01)
- Neuer `handleSkip`-Handler schreibt `has_password=false` (D-02) und redirected zu `/` — auch bei error (nur console.error)
- Skip-Button „Später setzen" nur sichtbar wenn `isFirstLogin=true`, platziert ausserhalb des `<form>`-Tags um form-submit zu vermeiden
- Back-Link „Zurück zur App" wird im First-Login-Mode ausgeblendet (erzwingt bewusste Entscheidung)
- Suspense-Wrapper proaktiv ergänzt (inner `SetPasswordInner()` + default export mit `<Suspense fallback={null}>`)
- Submit-Button disabled-State erweitert um `skipping`-Flag (verhindert Parallel-Writes)

## Task Commits

1. **Task 1: useSearchParams + Skip-Button + has_password-metadata bei Success/Skip** — `ad38601` (feat)

## Files Created/Modified

- `apps/tools-app/app/auth/set-password/page.tsx` — +54 / −10 Zeilen. Neue Logik: Suspense-Wrapper, `useSearchParams()`, `isFirstLogin`-Flag, `skipping`-State, `handleSkip`-Handler, kombinierter `updateUser({ password, data: { has_password: true } })`, Skip-Button nur im First-Login-Mode, conditional Back-Link.

## Decisions Made

- **Suspense-Wrapper proaktiv statt reaktiv:** Plan-Text hat Suspense als Fallback-Option („falls Build-Error") vorgesehen. Ich habe es direkt ergänzt — Next.js 15/16 erfordert Suspense bei `useSearchParams` sonst bricht der Build, und ein zweiter Build-Versuch wäre reiner Zeitverlust gewesen. Kostet 3 zusätzliche Zeilen, spart einen Build-Zyklus (~15s).
- **Kombinierter updateUser-Call:** Supabase-API unterstützt `updateUser({ password, data })` in einem Request. Zwei separate Calls (erst password, dann metadata) wären race-anfällig (z.B. wenn Session zwischen den Calls abläuft landet man in inkonsistentem State: Passwort gesetzt aber `has_password=undefined`). D-05 sagt explizit „Nach Erfolg" — atomar ist sicherer.
- **Skip bei error trotzdem redirecten:** User soll nicht hängen wenn das metadata-write aus irgendeinem Grund failed (z.B. transient network error). Der schlimmste Fall ist: User bekommt beim nächsten Magic-Link nochmal den First-Login-Prompt — das ist deutlich weniger schlimm als ein hängender Skip-Button. Error wird `console.error` geloggt, Sentry würde bei Bedarf greifen.
- **Submit-Button disabled-State erweitert:** Der Plan-Text sah `disabled={loading || skipping}` nur für den Skip-Button vor, aber die Parallel-Absicherung sollte symmetrisch sein. Sonst könnte User Skip klicken, dann Submit → beide laufen parallel, beide schreiben metadata → Race-State. Kleine Ergänzung, grosser Robustheitsgewinn (Rule 2).

## Deviations from Plan

**1. [Rule 2 - Critical functionality] Submit-Button disabled bei `skipping=true`**
- **Found during:** Task 1 JSX-Review
- **Issue:** Plan-Text sah nur `disabled={loading || !password || !confirmPassword}` für Submit-Button vor. Wenn User Skip klickt und dann während `skipping=true` nochmal Submit klickt, laufen beide Writes parallel — `has_password` landet in undefinierter Reihenfolge (true oder false, je nachdem welcher Call später ankommt).
- **Fix:** `disabled={loading || skipping || !password || !confirmPassword}` — symmetrisch zur Skip-Button-Disabled-Logic.
- **Files modified:** apps/tools-app/app/auth/set-password/page.tsx
- **Commit:** ad38601 (Teil des Task-1-Commits)

**2. [Rule 3 - Blocking] Suspense-Wrapper proaktiv ergänzt**
- **Found during:** Task 1 Implementation
- **Issue:** Plan-Text erlaubte Suspense-Wrapper als Fallback bei Build-Error, aber Next.js 15/16 verlangt Suspense für `useSearchParams` in Client-Components immer (siehe Next-Docs „missing-suspense-with-csr-bailout"). Ohne Wrapper: Build-Error mit CSR-Bailout-Warnung.
- **Fix:** Inner-Function-Pattern: `SetPasswordInner()` enthält Component-Body, default export wrapped in `<Suspense fallback={null}>`.
- **Files modified:** apps/tools-app/app/auth/set-password/page.tsx
- **Commit:** ad38601 (Teil des Task-1-Commits)

## Issues Encountered

None. Build bei erstem Versuch grün, alle Acceptance-Criteria-Greps passten.

## Verification Evidence

Acceptance-Criteria-Greps:

| Criterion | Expected | Actual |
|---|---|---|
| `useSearchParams` present | ≥ 1 | 2 (import + call) |
| `searchParams.get('first')` present | ≥ 1 | 1 |
| `isFirstLogin` present | ≥ 1 | 3 |
| `data: { has_password: true }` present | ≥ 1 | 1 |
| `data: { has_password: false }` present | ≥ 1 | 1 |
| `Später setzen` (echte Umlaute) | ≥ 1 | 1 |
| `id="password"` + `id="confirmPassword"` intact | 2 | 2 |
| `Passwort erfolgreich gesetzt` intact | ≥ 1 | 1 |
| `Passwort speichern` (button aria) intact | ≥ 1 | 1 |
| `has_password` total | ≥ 2 | 3 |

Build:

```
pnpm --filter tools-app build
✓ Compiled successfully in 5.4s
✓ TypeScript OK
✓ 46/46 static pages generated
```

Alle Routes in `next build`-Output als `ƒ` (dynamic) — CSP-Nonce-Constraint aus LEARNINGS.md weiterhin erfüllt.

E2E-Regression-Guard: Bestehende Playwright-Tests in `packages/e2e-tools/tests/auth.spec.ts` (Z. 143, 146, 166, 167) nutzen `#password`, `#confirmPassword`, `/passwort speichern/i` und `"Passwort erfolgreich gesetzt"` — alle Strings unverändert in der neuen Page-Version. Recovery-Flow (Phase 13 Path 5) bleibt funktional, weil kein `?first=1` bedeutet: kein Skip-Button, Back-Link sichtbar, Submit schreibt zusätzlich `has_password=true` (harmlose Ergänzung — Recovery-User bekommen damit ihr Flag gesetzt, was für zukünftige Settings-Inline-Form 19-03 korrekt ist).

## Known Stubs

None — alle Paths wired to Supabase `updateUser`-API, kein Placeholder-State.

## Threat Flags

None — keine neue Security-relevante Surface. `has_password`-Metadata ist user-controlled (User kann im Settings-Flow toggeln), keine Privilege-Escalation. Skip-Path schreibt bewusst einen „negativen" Wert, der nur als UX-Hinweis für confirm-Route dient und keine Auth-Entscheidungen trifft.

## User Setup Required

None — keine Env-Vars, keine Dashboard-Configs.

## Next Phase Readiness

- **Ready:** Plan 19-03 (Settings-Inline-Form) kann auf stabilem First-Login-Flow aufbauen. Die Settings-Page kann `user_metadata.has_password` lesen und zwischen Setzen-Modus (2 Felder) und Ändern-Modus (3 Felder mit Re-Auth) entscheiden.
- **Wave 1 Abschluss:** 19-01 + 19-02 sind jetzt gemeinsam deploybar. Der komplette First-Login-Flow funktioniert:
  1. User klickt Magic-Link → `/auth/confirm` → hat `has_password=undefined` → redirect `/auth/set-password?first=1`
  2. User setzt Passwort → `has_password=true` → beim nächsten Magic-Link direkt zur App
  3. ODER: User klickt „Später setzen" → `has_password=false` → beim nächsten Magic-Link direkt zur App (kein Re-Prompt)
- **Risiko:** Wave 1 sollte atomar deployed werden (beide Plans zusammen pushen). Plan 19-01 alleine in Prod würde alle bestehenden User beim nächsten Magic-Link auf eine Page routen, die noch keinen Skip-Button hat — sie würden hängen oder gezwungenermaßen ein Passwort setzen. Das 19-02-Deploy schließt diese Lücke.
- **Verbleibende Wave 1 Tasks:** Keine — 19-01 und 19-02 sind beide done.
- **Wave 2 Start:** Plan 19-03 (Settings-Inline-Form) kann jetzt geplant und ausgeführt werden.

## Self-Check: PASSED

- File `apps/tools-app/app/auth/set-password/page.tsx` exists: FOUND
- Commit `ad38601` exists in git log: FOUND
- Build grün: confirmed (5.4s compile, all 46 pages generated)
- Alle 10 Acceptance-Criteria-Greps bestanden

---
*Phase: 19-password-flow-and-test-baseline*
*Completed: 2026-04-19*
