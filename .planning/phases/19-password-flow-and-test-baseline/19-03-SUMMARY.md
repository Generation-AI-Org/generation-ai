---
phase: 19-password-flow-and-test-baseline
plan: 03
subsystem: auth
tags: [supabase, user-metadata, password-flow, settings, nextjs-client-component, re-auth]

requires:
  - phase: 12-auth-rewrite
    provides: "@genai/auth createBrowserClient (canonical Supabase Client)"
  - phase: 19-01
    provides: "user_metadata.has_password tri-state Semantik"
  - phase: 19-02
    provides: "has_password=true wird bei First-Login-Set-Success geschrieben"
  - phase: 16-brand-system-foundation
    provides: "Brand-Tokens (var(--accent), var(--surface), var(--bg-elevated))"
provides:
  - "PasswordSection Client-Component mit 2 Modi (Set/Change) in /settings"
  - "Re-Auth-Check via signInWithPassword vor updateUser({password}) im Change-Mode"
  - "Inline-Feedback (Success/Error), kein Redirect, kein Toast"
affects: []

tech-stack:
  added: []
  patterns:
    - "Lokale Client-Component (PasswordSection.tsx) im settings/-Ordner — gleiches Muster wie DeleteAccountButton"
    - "Re-Auth-Pattern: signInWithPassword vor updateUser({ password }) für Change-Mode-Sicherheit"
    - "Kombinierter updateUser({ password, data: { has_password: true } })-Call — atomar und idempotent"
    - "State-driven Mode-Switch (hasPasswordState), initialisiert aus Prop, nach Success auf true"

key-files:
  created:
    - apps/tools-app/app/settings/PasswordSection.tsx
  modified:
    - apps/tools-app/app/settings/page.tsx

key-decisions:
  - "Re-Auth via signInWithPassword statt separater Password-Verify-Endpoint — D-04 canonical Supabase-Pattern, kein Custom-Endpoint nötig"
  - "Input-IDs bewusst andere als in set-password-page (currentPassword/newPassword/confirmNewPassword vs. password/confirmPassword) — verhindert E2E-Selektor-Konflikte mit Phase-13-Auth-Tests"
  - "Section-Position zwischen Account und Rechtliches — natürliche User-Lesereihenfolge (Identity → Credentials → Legal → Danger-Zone), Claude's Discretion aus CONTEXT"
  - "Kein Redirect nach Success — User bleibt auf /settings, sieht Inline-Success-Message, Mode wechselt auf Change (via hasPasswordState=true)"
  - "Form-Felder nach Success clearen — verhindert Doppel-Submit und gibt visuellen Reset-Indikator"

patterns-established:
  - "PasswordSection-Pattern: Client-Component mit Mode-Switch via State, initialisiert aus Server-Prop"
  - "Brand-Token-Consistency: Form-Inputs nutzen exakt dieselben Klassen wie set-password-page (bg-[var(--bg-elevated)], rounded-xl, focus-ring mit accent/50)"

requirements-completed: [D-03, D-04, D-05]

duration: ~2min
completed: 2026-04-19
---

# Phase 19 Plan 03: Settings Password-Block Summary

**Neue `PasswordSection`-Client-Component in `/settings` rendert 2-Modi-Form (Setzen oder Ändern) basierend auf `user_metadata.has_password`; Change-Mode verlangt Aktuelles-Passwort-Re-Auth via `signInWithPassword` bevor `updateUser({ password, data: { has_password: true } })` aufgerufen wird; Success clearen alle Felder und schalten lokal in Change-Mode ohne Redirect.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-19T17:04:00Z
- **Completed:** 2026-04-19T17:06:07Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 1

## Accomplishments

- `PasswordSection.tsx` (151 Zeilen) erstellt mit vollem 2-Modi-Behavior:
  - **Set-Mode** (`hasPassword=false`): 2-Feld-Form (Neues Passwort + Bestätigen), Button „Passwort setzen"
  - **Change-Mode** (`hasPassword=true`): 3-Feld-Form (Aktuelles + Neues + Bestätigen), Button „Passwort ändern"
- Re-Auth-Check vor `updateUser` im Change-Mode — falsches aktuelles Passwort zeigt „Aktuelles Passwort stimmt nicht." und macht keinen Server-State-Change (D-04)
- Kombinierter `updateUser({ password, data: { has_password: true } })`-Call (D-05) — atomar und idempotent
- Success-Path: Inline-Success-Message (grün), Felder clearen, `hasPasswordState → true` → UI wechselt in Change-Mode — kein Redirect
- Error-Path: Inline-Error-Message (rot), Form bleibt ausgefüllt, Loading-State released
- Validation vor Supabase-Call: `newPassword.length >= 8` + `newPassword === confirmPassword` — spart Round-Trips bei offensichtlichen Eingabefehlern
- `autoComplete`-Attribute (current-password / new-password) für Browser-Password-Manager-Integration
- Settings-Page rendert neuen Passwort-Block zwischen Account und Rechtliches mit context-dependent Intro-Text

## Task Commits

1. **Task 1: Neue PasswordSection Client-Component** — `24512e9` (feat)
2. **Task 2: PasswordSection in /settings mounten** — `072195e` (feat)

## Files Created/Modified

- **Created:** `apps/tools-app/app/settings/PasswordSection.tsx` — 151 Zeilen. Client-Component mit `'use client'`-Direktive, useState-basierter Mode/Loading/Message/Form-State, `createBrowserClient()` aus `@genai/auth`, `handleSubmit` mit Two-Phase-Flow (Re-Auth → Update), Inline-Feedback, Brand-Tokens.
- **Modified:** `apps/tools-app/app/settings/page.tsx` — +16 / −0 Zeilen. Import ergänzt, neue `<section>` mit Heading „Passwort", context-dependent Intro-Paragraph (Setzen vs. Ändern), PasswordSection-Mount mit `hasPassword={user.user_metadata?.has_password === true}` und `email={user.email ?? ''}`.

## Decisions Made

- **Re-Auth via signInWithPassword statt Custom-Endpoint:** Supabase bietet `signInWithPassword` als kanonischen Password-Verify-Call. Bei Erfolg ersetzt er die aktive Session durch eine frische — der User bleibt im selben Auth-Context, und `updateUser({ password })` läuft unmittelbar danach mit der frischen Session. Kein separater Verify-Endpoint nötig, kein Server-Code zusätzlich.
- **Input-IDs anders als set-password-page:** Die Settings-Form nutzt `currentPassword`, `newPassword`, `confirmNewPassword` — set-password-page nutzt `password`, `confirmPassword`. Damit greifen Phase-13-E2E-Tests (`auth.spec.ts` Path 5, Password-Reset-Flow) auf `#password`/`#confirmPassword` nie versehentlich die Settings-Form ab, wenn beide Routes im selben Test-Run besucht werden.
- **Section-Position zwischen Account und Rechtliches:** Die natürliche User-Lesereihenfolge ist Identity (Account) → Credentials (Passwort) → Legal (Rechtliches) → Danger (Gefahrenzone). Plan-Text hatte Position als Claude's Discretion markiert — diese Reihenfolge matcht GitHub-Settings-Konvention.
- **Kein Redirect nach Success:** D-05 verlangt explizit „kein Redirect". User soll sehen, dass die Aktion erfolgreich war, ohne Seitenwechsel. Success-Feedback + Felder-Clear + Mode-Switch auf Change ist die maximal informative Nicht-Redirect-UX.
- **Mode-Switch nach Success via lokalem State (`hasPasswordState`):** Alternativ hätte man `router.refresh()` rufen können, um die Server-Component neu zu rendern und das frische `has_password=true` aus Supabase zu lesen. Lokaler State ist einfacher, kostet keinen zusätzlichen Server-Roundtrip, und der State-Drift ist irrelevant, weil `updateUser({ data: { has_password: true } })` ohnehin idempotent ist.

## Deviations from Plan

None — plan executed exactly as written. Alle Acceptance-Criteria-Strings bei erstem Versuch erfüllt, Build bei erstem Versuch grün.

## Issues Encountered

None.

## Verification Evidence

Acceptance-Criteria-Greps Task 1 (alle ≥ erwarteter Count):

| Criterion | Expected | Actual |
|---|---|---|
| `'use client'` present | ≥ 1 | 1 |
| `signInWithPassword` present | ≥ 1 | 1 |
| `data: { has_password: true }` present | ≥ 1 | 1 |
| `isChangeMode` present | ≥ 1 | 7 |
| `Aktuelles Passwort stimmt nicht` | ≥ 1 | 1 |
| `Passwort setzen` | ≥ 1 | 1 (button-label branch) |
| `Passwort ändern` | ≥ 1 | 1 (button-label branch) |
| `autoComplete="current-password"` | ≥ 1 | 1 |
| `autoComplete="new-password"` | ≥ 1 | 2 (new + confirm) |
| File line count | ≥ 80 | 151 |
| `export function PasswordSection` | ≥ 1 | 1 |

Acceptance-Criteria-Greps Task 2:

| Criterion | Expected | Actual |
|---|---|---|
| `import { PasswordSection } from './PasswordSection'` | ≥ 1 | 1 |
| `<PasswordSection` | ≥ 1 | 1 |
| `user.user_metadata?.has_password === true` | ≥ 1 | 2 (intro + prop) |
| `email={user.email ?? ''}` | ≥ 1 | 1 |
| `redirect('/login')` intact | ≥ 1 | 1 |
| `DeleteAccountButton` intact | ≥ 1 | 1 |
| `force-dynamic` intact | ≥ 1 | 1 |
| `PasswordSection` total count | ≥ 2 | 2 (import + mount) |

Build:

```
pnpm --filter tools-app build
✓ Compiled successfully in 6.0s
✓ TypeScript OK
✓ 46/46 static pages generated
```

`/settings` in `next build`-Output als `ƒ` (dynamic) — CSP-Nonce-Constraint aus LEARNINGS.md weiterhin erfüllt (force-dynamic-Directive intakt).

## Known Stubs

None — alle Paths wired to Supabase `signInWithPassword`/`updateUser`-APIs, kein Placeholder-State, kein Mock-Data.

## Threat Flags

None — keine neue Security-relevante Surface. Re-Auth-Check ist additive Defense-in-Depth: falsches aktuelles Passwort → Early-Return, keine `updateUser`-Call → kein Server-State-Change. Die Session-Invariante bleibt erhalten, weil `signInWithPassword` bei Erfolg nur die Tokens rotiert (gleicher User, gleicher Context), und bei Fehlschlag gar nichts ändert.

## User Setup Required

None — keine Env-Vars, keine Dashboard-Configs. Aktivierung erfolgt automatisch mit Deploy.

## Next Phase Readiness

- **Wave 2 Complete:** Plan 19-03 und Plan 19-04 (E2E-Baseline) sind beide done. Der komplette User-Facing Password-Flow ist jetzt implementiert:
  1. First-Login via Magic-Link → Set-Password-Screen mit Skip-Option (Phase 19-01 + 19-02)
  2. Nachträglich in /settings setzen oder ändern (dieser Plan 19-03)
  3. E2E-Baseline grün gegen Prod (Plan 19-04)
- **Ready:** Plan 19-05 (CI-Binding + MANUAL-STEPS.md) kann jetzt starten — ist der letzte Plan der Phase.
- **Deploy-Reihenfolge:** Dieser Plan kann zusammen mit Wave 1 (19-01 + 19-02) atomar oder unabhängig deployed werden. Die Settings-Form funktioniert auch für Alt-User ohne `has_password`-Flag (Set-Mode), also ist Deploy vor Wave 1 rückwärtskompatibel.
- **E2E-Kompatibilität:** Phase-13-Tests (`auth.spec.ts` Path 5, Password-Reset via `#password`/`#confirmPassword`) sind NICHT betroffen — Settings-Form nutzt andere Input-IDs. Smoke-Test gegen Prod sollte nach Deploy laufen.

## Self-Check: PASSED

- File `apps/tools-app/app/settings/PasswordSection.tsx` exists: FOUND
- File `apps/tools-app/app/settings/page.tsx` modified: FOUND
- Commit `24512e9` exists in git log: FOUND
- Commit `072195e` exists in git log: FOUND
- Build grün: confirmed (6.0s compile, all 46 pages generated, /settings is dynamic `ƒ`)
- Alle Acceptance-Criteria-Greps Task 1 und Task 2 bestanden

---
*Phase: 19-password-flow-and-test-baseline*
*Completed: 2026-04-19*
