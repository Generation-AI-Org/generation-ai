---
phase: 19-password-flow-and-test-baseline
plan: 01
subsystem: auth
tags: [supabase, magic-link, user-metadata, password-flow, nextjs-route-handler]

requires:
  - phase: 12-auth-rewrite
    provides: "@genai/auth canonical server client (createClient)"
  - phase: 13-auth-flow-audit
    provides: "verifyOtp-Pattern in confirm-Route (canonical Magic-Link-Handling)"
provides:
  - "has_password-Check nach verifyOtp für Magic-Link/Signup/Email-Types"
  - "First-Login-Redirect zu /auth/set-password?first=1 bei undefined has_password"
  - "Skip-Respect: has_password=false → kein Re-Prompt"
affects: [19-02-set-password-page, 19-03-settings-password-block]

tech-stack:
  added: []
  patterns:
    - "data-Destructuring aus verifyOtp() statt zweitem getUser()-Call"
    - "Tri-state Check auf user_metadata.has_password (true | false | undefined)"

key-files:
  created: []
  modified:
    - apps/tools-app/app/auth/confirm/route.ts

key-decisions:
  - "verifyOtp-Response direkt destrukturieren (data + error) — spart Round-Trip gegenüber separatem getUser()-Call"
  - "Tri-state Check (hasPassword !== true && hasPassword !== false) statt !hasPassword, weil false als Skip-Respect behandelt werden muss"
  - "Recovery-Branch bleibt exakt unverändert — D-06 Guard"

patterns-established:
  - "First-Login-Flag via user_metadata: undefined = erstmalig, false = skipped, true = gesetzt"
  - "Non-Recovery EmailOtpTypes werden alle gleich behandelt (magiclink/signup/invite/email/email_change)"

requirements-completed: [D-01, D-02, D-06]

duration: 2min
completed: 2026-04-19
---

# Phase 19 Plan 01: confirm-Route First-Login-Check Summary

**Magic-Link-Handler liest `user_metadata.has_password` aus verifyOtp-Response und leitet First-Login-User auf `/auth/set-password?first=1`, während Alt-User mit `has_password=true` oder explizitem Skip (`false`) direkt zur App durchkommen.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-19T16:52:00Z
- **Completed:** 2026-04-19T16:53:07Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- confirm-Route liest User aus verifyOtp-Response (vorher nur `error` destrukturiert)
- Tri-state Check auf `user_metadata.has_password` implementiert
- First-Login-Redirect auf `/auth/set-password?first=1` für undefined-Case
- Skip-Entscheidung (`false`) wird respektiert — kein Re-Prompt
- Recovery-Flow exakt unverändert (D-06 Guard bestätigt)
- `packages/emails/src/templates/recovery.tsx` nicht angefasst (D-06)

## Task Commits

1. **Task 1: confirm-Route mit has_password-Check + First-Login-Redirect** — `865d87e` (feat)

## Files Created/Modified

- `apps/tools-app/app/auth/confirm/route.ts` — +11 / −1 Zeilen. Neue Logik: destrukturiert `data` + `error` aus `verifyOtp`, prüft `data?.user?.user_metadata?.has_password`, redirected bei undefined zu `/auth/set-password?first=1`, sonst zu `next`/`/`. Recovery-Branch bleibt byte-identisch.

## Decisions Made

- **Tri-state Check statt Truthy-Check:** `hasPassword !== true && hasPassword !== false` ist explizit wichtig, weil `!hasPassword` auch bei `false` feuern würde — das würde die Skip-Entscheidung (D-02) ignorieren und den Prompt erneut zeigen.
- **data aus verifyOtp destrukturieren statt separater getUser()-Call:** Supabase liefert `{ data: { user, session }, error }` bei verifyOtp zurück. Direktzugriff spart einen Round-Trip und ist der Supabase-canonical Pattern.
- **Recovery-Branch zuerst prüfen:** Die `type === 'recovery'`-Bedingung kommt vor dem has_password-Check, damit Password-Reset-Flows nie versehentlich den First-Login-Screen triggern (D-06).

## Deviations from Plan

None — plan executed exactly as written. Alle Acceptance-Criteria-Strings bei erstem Versuch erfüllt, Build bei erstem Versuch grün.

## Issues Encountered

None.

## Verification Evidence

Acceptance-Criteria-Greps (alle ≥ erwarteter Count):

| Criterion | Expected | Actual |
|---|---|---|
| `has_password` present | ≥ 1 | 5 |
| `set-password?first=1` present | ≥ 1 | 1 |
| `user_metadata?.has_password` present | ≥ 1 | 1 |
| `hasPassword` count | ≥ 2 | 2 |
| `type === 'recovery'` present | ≥ 1 | 1 |
| `verifyOtp({ token_hash, type })` present | ≥ 1 | 1 |
| `@genai/auth/server` import present | ≥ 1 | 1 |
| `@genai/emails`/`packages/emails` import count | 0 | 0 |
| `git diff HEAD -- packages/emails/src/templates/recovery.tsx` line count | 0 | 0 |

Build:

```
pnpm --filter tools-app build
✓ Compiled successfully in 7.2s
✓ TypeScript OK
✓ 46/46 static pages generated
```

Alle Routes in `next build`-Output als `ƒ` (dynamic) ausgewiesen — CSP-Nonce-Konstellation aus LEARNINGS.md nicht betroffen, weil Route Handler (kein Layout-Change).

## User Setup Required

None — keine Env-Vars, keine Dashboard-Configs. Aktivierung erfolgt erst mit Plan 19-02 (Set-Password-Page mit Skip-Button + metadata-Write).

## Next Phase Readiness

- **Ready:** Plan 19-02 (set-password-page.tsx) kann jetzt den `?first=1`-Query-Param lesen, Skip-Button zeigen und via `updateUser({ data: { has_password: false } })` die D-02-Semantik schließen.
- **Ready:** Plan 19-03 (Settings-Inline-Form) kann den Inline-Flow unabhängig von der confirm-Route bauen.
- **Risiko minimiert:** confirm-Route ist der einzige Entry-Point für Magic-Link-Verifikation — weiterer Pfad über `/auth/callback` ist OAuth-only und betrifft diese Logik nicht.
- **Verhalten vor Plan 19-02 Deploy:** Wenn dieser Plan isoliert deployed würde, würden alle bestehenden User (alle haben `has_password = undefined`) beim nächsten Magic-Link-Login auf `/auth/set-password?first=1` landen. Die Set-Password-Page existiert bereits (139 Zeilen, funktional), hat aber noch keinen Skip-Button und kein metadata-Write — User könnten Passwort setzen, aber würden beim nächsten Login wieder geprompted, weil `has_password=true` nie geschrieben wird. Deswegen Wave-Reihenfolge: 19-01 → 19-02 als Wave 1 gemeinsam deployen.

## Self-Check: PASSED

- File `apps/tools-app/app/auth/confirm/route.ts` exists: FOUND
- Commit `865d87e` exists in git log: FOUND
- Recovery-Template unverändert: 0-line diff confirmed
- Build grün: confirmed (7.2s compile, all 46 pages generated)

---
*Phase: 19-password-flow-and-test-baseline*
*Completed: 2026-04-19*
