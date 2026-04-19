---
phase: 19-password-flow-and-test-baseline
verified: 2026-04-19T22:30:00Z
status: passed
score: 13/13 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: n/a
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 19: Password-Flow + Test-Baseline — Verification Report

**Phase Goal:** Passwort-Flow nach Magic-Link-Login (First-Login-Prompt mit Skip, Settings-Integration mit Set/Change-Modes) + E2E-Baseline-Reparatur auf Prod-URL.
**Verified:** 2026-04-19T22:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Magic-Link-User ohne has_password landet auf /auth/set-password?first=1 | VERIFIED | confirm/route.ts:37-40 — tri-state check `hasPassword !== true && hasPassword !== false → set-password?first=1`; callback/page.tsx:72-74,89-90 — identischer Check im PKCE-Flow (be25de0) |
| 2 | User mit has_password=true landet auf / (kein Re-Prompt) | VERIFIED | confirm/route.ts:49-50 — redirect zu `${origin}${redirectPath}`; callback/page.tsx:76,93 — `window.location.href = '/'` |
| 3 | User mit has_password=false landet auf / (Skip respektiert) | VERIFIED | confirm/route.ts:38 — Tri-state respektiert explizit `false`-Wert; UX-Smoke PASS für admin@-User |
| 4 | Recovery-Flow bleibt unverändert: type=recovery → /auth/set-password (ohne first-Param) | VERIFIED | confirm/route.ts:29-31 — recovery-Branch vor has_password-Check, redirected zu `/auth/set-password` ohne `?first=1` |
| 5 | Set-Password-Page erkennt ?first=1 und zeigt Skip-Button "Später setzen" | VERIFIED | set-password/page.tsx:9-10 — `useSearchParams().get('first') === '1'`; Zeilen 163-172 — conditional Skip-Button Rendering |
| 6 | Skip setzt has_password=false + redirected auf / | VERIFIED | set-password/page.tsx:54-75 — handleSkip ruft `updateUser({ data: { has_password: false } })`, bei Success `window.location.href = '/'`; WR-01-Fix zeigt Error statt still redirect bei metadata-Fehler |
| 7 | Erfolgreiches Passwort-Setzen setzt has_password=true (atomar) | VERIFIED | set-password/page.tsx:36-39 — kombinierter `updateUser({ password, data: { has_password: true } })`; PasswordSection.tsx:51-54 — gleicher Pattern in Settings |
| 8 | In /settings: User ohne has_password sieht 2-Feld-Form "Passwort setzen" | VERIFIED | PasswordSection.tsx:19 `isChangeMode = hasPasswordState`; Zeilen 74-90 conditional 3. Feld nur in Change-Mode; settings/page.tsx:53-56 — Prop-Übergabe aus Server-Component |
| 9 | In /settings: User mit has_password=true sieht 3-Feld-Form "Passwort ändern" mit Re-Auth | VERIFIED | PasswordSection.tsx:37-48 — Change-Mode ruft `signInWithPassword({ email, password: currentPassword })` vor updateUser |
| 10 | Re-Auth-Check schlägt bei falschem Passwort fehl, zeigt klaren Error | VERIFIED | PasswordSection.tsx:43-47 — `reauthError` → Message "Aktuelles Passwort stimmt nicht." und early-return ohne updateUser-Call |
| 11 | Kein Redirect nach Success in /settings (D-05) | VERIFIED | PasswordSection.tsx:62-69 — Success setzt Inline-Message, clearen Felder, `setHasPasswordState(true)`, kein router.push/window.location |
| 12 | playwright.config.ts Default gegen Prod, überschreibbar via E2E_BASE_URL | VERIFIED | playwright.config.ts:9-12 — `E2E_BASE_URL → BASE_URL → https://tools.generation-ai.org`; turbo.json:44 — passThroughEnv enthält E2E_BASE_URL |
| 13 | CI-Workflow injiziert Test-User-Secrets + E2E_BASE_URL | VERIFIED | .github/workflows/ci.yml:81-89 — E2E_BASE_URL (var), TEST_USER_EMAIL/PASSWORD (secrets), SUPABASE-Keys (secrets) |

**Score:** 13/13 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/tools-app/app/auth/confirm/route.ts` | has_password-Check + First-Login-Redirect + open-redirect hardening | VERIFIED | 51 Zeilen, enthält `has_password` (4x), `set-password?first=1`, `user_metadata?.has_password`, Tri-state-Check, CR-01-Fix (isSafePath guard gegen `//evil.com`) |
| `apps/tools-app/app/auth/callback/page.tsx` | PKCE-Flow mit has_password-Check | VERIFIED | 121 Zeilen, 4x `has_password`, WR-02-Fix (`!user` → `/login?error=session_failed`), dupliziert Check in Hash- und PKCE-Pfad |
| `apps/tools-app/app/auth/set-password/page.tsx` | First-Login-Mode mit Skip + metadata-Writes | VERIFIED | 193 Zeilen, `useSearchParams`, `isFirstLogin`, `data: { has_password: true }` (Submit), `data: { has_password: false }` (Skip), "Später setzen" Button, WR-01-Fix (Error statt stille Redirect), Suspense-Wrapper |
| `apps/tools-app/app/settings/page.tsx` | PasswordSection-Mount mit hasPassword + email Props | VERIFIED | 86 Zeilen, Import + Mount (2x `PasswordSection`), `user.user_metadata?.has_password === true` als Prop, `force-dynamic`, redirect-Guard intakt |
| `apps/tools-app/app/settings/PasswordSection.tsx` | Client-Component mit 2 Modi + Re-Auth | VERIFIED | 151 Zeilen, `'use client'`, `signInWithPassword`, `isChangeMode`, "Passwort setzen"/"Passwort ändern", `autoComplete="current-password"/"new-password"`, Inline-Message statt Redirect |
| `apps/tools-app/app/login/page.tsx` | signInWithOtp mit shouldCreateUser:false (ac1e374) | VERIFIED | Zeile 32 `shouldCreateUser: false` — unblockt Dashboard-User |
| `packages/e2e-tools/playwright.config.ts` | Prod-Default-baseURL + E2E_BASE_URL-Override | VERIFIED | 36 Zeilen, `E2E_BASE_URL → BASE_URL → https://tools.generation-ai.org`, `baseURL: BASE_URL` derived, `.env.test.local` dotenv-Loading, keine hardcoded localhost-Default |
| `packages/e2e-tools/tests/auth.spec.ts` | Test-Suite liest E2E_BASE_URL aus Env-Kette | VERIFIED | Zeilen 10-14 — E2E_BASE_URL primary, BASE_URL legacy, Phase-13-Describe-Blocks (Path 1-6) + CSP Baseline intakt |
| `packages/e2e-tools/tests/chat.spec.ts` | Prod-tauglich mit Login-Redirect-Aware Tests | VERIFIED (mit Note) | 52 Zeilen, `Auth Gate (prod smoke)` describe, 3 aktive Tests gegen `/settings`, 2 skipped — **Filename-Drift dokumentiert in WR-03 (below)**, aber funktional korrekt |
| `turbo.json` | e2e-Task passThroughEnv enthält E2E_BASE_URL | VERIFIED | Zeile 44 — Liste enthält E2E_BASE_URL neben BASE_URL, TEST_USER_EMAIL/PASSWORD |
| `.github/workflows/ci.yml` | E2E-Job mit Test-User-Secret-Binding | VERIFIED | Zeilen 81-89 — alle 5 Env-Vars (E2E_BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY); STAGING_URL-Gate entfernt; E2E läuft jetzt immer |
| `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` | Dokumentation Manual-Setup für Luca | VERIFIED | 133 Zeilen, 5 Sections (Supabase-User, GH-Secrets, optional E2E_BASE_URL, .env.test.local, Rollback), ImprovMX-Warning enthalten |
| `.changeset/phase-19-password-flow.md` | Changeset für v4.4.0 minor | VERIFIED | 7 Zeilen, `@genai/tools-app: minor`, Body deutsch mit echten Umlauten, erwähnt Password + E2E |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| confirm/route.ts | set-password/page.tsx | `NextResponse.redirect` mit `?first=1` bei has_password !== true/false | WIRED | confirm/route.ts:39 — `${origin}/auth/set-password?first=1` |
| callback/page.tsx | set-password/page.tsx | `window.location.href = '/auth/set-password?first=1'` für PKCE-Flow | WIRED | callback/page.tsx:73, 90 — identischer Check in Hash- und PKCE-Pfad |
| set-password/page.tsx | supabase.auth.updateUser | `updateUser({ password, data: { has_password: true } })` bei Submit; `updateUser({ data: { has_password: false } })` bei Skip | WIRED | Zeilen 36-39, 58-60 |
| settings/page.tsx | PasswordSection.tsx | `<PasswordSection hasPassword={...} email={...} />` | WIRED | settings/page.tsx:53-56 |
| PasswordSection.tsx | supabase.auth.signInWithPassword | Re-Auth-Check vor updateUser bei Change-Mode | WIRED | PasswordSection.tsx:39-48 |
| PasswordSection.tsx | supabase.auth.updateUser | `updateUser({ password, data: { has_password: true } })` idempotent | WIRED | PasswordSection.tsx:51-54 |
| playwright.config.ts | process.env.E2E_BASE_URL | `baseURL: process.env.E2E_BASE_URL || process.env.BASE_URL || Prod` | WIRED | playwright.config.ts:9-12 |
| turbo.json e2e.passThroughEnv | playwright.config.ts | turbo reicht E2E_BASE_URL unverändert durch an `pnpm e2e` | WIRED | turbo.json:44 |
| .github/workflows/ci.yml e2e-Job env | packages/e2e-tools/fixtures/test-user.ts | `env.TEST_USER_EMAIL/PASSWORD` → `requireTestUser()` | WIRED | ci.yml:85-86, fixtures/test-user.ts:11-15 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| PasswordSection.tsx | `hasPasswordState` | Server-Component-Prop aus `user.user_metadata?.has_password` (settings/page.tsx:54) | Ja — echter Supabase-User via `getUser()` | FLOWING |
| settings/page.tsx | `user` | `await getUser()` aus @/lib/auth (Supabase server-client) | Ja — force-dynamic, frisch pro Request | FLOWING |
| confirm/route.ts | `data.user` | `supabase.auth.verifyOtp({ token_hash, type })` Response | Ja — echte OTP-Verifikation | FLOWING |
| callback/page.tsx | `user` | `supabase.auth.getUser()` nach setSession (Hash-Flow) oder aus Cookie (PKCE) | Ja — mit null-guard (WR-02) | FLOWING |
| set-password/page.tsx | `isFirstLogin` | `useSearchParams().get('first')` aus URL | Ja — aus echtem Query-String | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| confirm/route.ts enthält has_password + set-password?first=1 | grep | 4x `has_password`, 1x `set-password?first=1` | PASS |
| callback/page.tsx enthält has_password (PKCE-Fix) | grep | 4x Matches | PASS |
| PasswordSection.tsx signInWithPassword Re-Auth | grep | Gefunden Zeile 39 | PASS |
| turbo.json JSON-valid | `node -e JSON.parse(...)` | Valid | PASS |
| login/page.tsx shouldCreateUser:false Fix | grep | Gefunden Zeile 32 | PASS |
| Build beider Apps (aus Plan-Summaries dokumentiert) | `pnpm --filter tools-app build` | Laut Summaries mehrfach grün (7.2s / 5.4s / 6.0s) | PASS (reported) |
| E2E-Run gegen Prod (aus Checkpoint-Resolution) | smoke.spec + chat.spec + auth.spec | 5p/2s + 10p/2s | PASS (reported) |

### Requirements Coverage

Phase 19 deklariert keine v4.0-Requirements (R1-R7) — REQUIREMENTS.md wurde 2026-04-19 für v4.0 Milestone neu gefasst (Phases 20-26). Phase 19 nutzt Phase-interne Decision-IDs D-01 bis D-09 aus CONTEXT.md.

| Decision | Source Plan | Description | Status | Evidence |
|----------|-------------|-------------|--------|----------|
| D-01 | 19-01, 19-02 | has_password in user_metadata (nicht profiles) | SATISFIED | Alle updateUser-Calls schreiben `data: { has_password: ... }` via Supabase Auth, kein DB-Schema-Change |
| D-02 | 19-01, 19-02 | Skip setzt has_password=false explizit, kein Re-Prompt | SATISFIED | set-password/page.tsx:58-60; confirm/route.ts:38 respektiert `false` |
| D-03 | 19-03 | Passwort-Setzen Inline in /settings, kein Mail-Loop | SATISFIED | PasswordSection.tsx ist direkt in settings/page.tsx gemountet |
| D-04 | 19-03 | Inline-Form mit 2 Modi entschieden über has_password | SATISFIED | PasswordSection.tsx:19 `isChangeMode`; Re-Auth via signInWithPassword in Change-Mode |
| D-05 | 19-02, 19-03 | Nach Erfolg: has_password=true, Success-Message, kein Redirect | SATISFIED | set-password setzt has_password=true atomar; PasswordSection zeigt Inline-Message ohne Redirect |
| D-06 | 19-01 | Recovery-Mail-Template unverändert | SATISFIED | Recovery-Branch byte-identisch, confirm-route importiert nicht aus packages/emails |
| D-07 | 19-04, 19-05 | Password-Login-E2E mit realem Test-Account | SATISFIED | CI hat TEST_USER_EMAIL/PASSWORD gebunden, auth.spec.ts Path 1 nutzt `requireTestUser()`; E2E ran green laut Checkpoint-Resolution |
| D-08 | 19-04 | Tests gegen Prod mit E2E_BASE_URL-Override | SATISFIED | playwright.config.ts, turbo.json passThroughEnv, auth.spec.ts Env-Kette |
| D-09 | 19-05 | Test-Account-Setup als Manual-Step dokumentiert | SATISFIED | MANUAL-STEPS.md 133 Zeilen, 5 Sections inkl. Rollback |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| packages/e2e-tools/tests/chat.spec.ts | filename | Dateiname `chat.spec.ts` testet jedoch `/settings` (Auth-Gate). Dokumentiert in 19-REVIEW.md als WR-03 | Info | Keine funktionale Regression — Tests laufen grün, aber künftige Engineers suchen in chat.spec.ts Chat-Tests und finden Auth-Gate-Tests. Empfehlung: umbenennen zu `auth-gate.spec.ts` in Folge-Phase |
| packages/e2e-tools/tests/chat.spec.ts | 37-51 | 2x `test.skip` mit `/chat`-Page-Navigation, aber `/chat` existiert nicht als Route | Info | Skipped Tests — keine Runtime-Impact. Empfehlung in WR-03: löschen oder zu Chat-Widget-Tests umschreiben |
| apps/tools-app/app/auth/confirm/route.ts | 1-5 | Kein explicit `export const dynamic = 'force-dynamic'` (IN-04 aus 19-REVIEW.md) | Info | Route Handler ist default dynamic, aber fehlende explizite Deklaration ist Belt-and-Suspenders-Gap laut LEARNINGS.md |
| apps/tools-app/app/auth/confirm/route.ts, callback/page.tsx (Hash+PKCE) | 3x Duplikation | Tri-state has_password-Logik 3x dupliziert (IN-05) | Info | Bei Schema-Änderung müssten 3 Stellen gefunden werden — Helper-Extraktion empfohlen, aber kein Blocker |
| apps/tools-app/app/settings/PasswordSection.tsx | 40 | `email=''` falls `user.email` undefined (IN-02) | Info | Theoretischer Edge-Case (OAuth ohne email-scope), aktuell kein OAuth aktiv → keine Impact |

**Keine Blocker oder Warnings** — alle Review-Findings aus 19-REVIEW.md sind entweder gefixt (CR-01, WR-01, WR-02 in Commit 2c4f3f0) oder als Info akzeptiert (IN-01 bis IN-05 und WR-03).

### Human Verification

UX-Smoke wurde bereits durchgeführt und dokumentiert (19-05-SUMMARY.md "Checkpoint Resolution"):

| Test | Plan | Result | User |
|------|------|--------|------|
| First-Login-Redirect (has_password=null → `/auth/set-password?first=1`) | 19-01 | PASS | admin@, lucvii@gmx.de |
| Skip-Button → `has_password=false` | 19-02 | PASS | admin@ |
| Passwort setzen → `has_password=true` | 19-02 | PASS | lucvii@gmx.de |
| Settings Change-Mode (3 Felder + Re-Auth) | 19-03 | PASS | lucvii@gmx.de |
| Settings Set-Mode (2 Felder, no Re-Auth wenn has_password=false) | 19-03 | PASS | admin@ |
| Zweiter Magic-Link ohne Re-Prompt | 19-01 + callback | PASS | lucvii@gmx.de |

Plus: Data-Migration für 8 Alt-User (encrypted_password vorhanden, has_password=null) erfolgreich durchgeführt. E2E lief grün: smoke.spec + chat.spec 5p/2s, auth.spec 10p/2s gegen Prod.

### Gaps Summary

Keine Gaps. Phase 19 hat alle Observable Truths verifiziert, alle Artefakte existieren substantiv, alle Key Links sind wired, Daten fließen, und UX-Smoke + E2E-Baseline sind gegen Prod grün abgenommen.

Die in 19-REVIEW.md identifizierte kritische Vulnerability (CR-01 Open-Redirect) wurde in Commit 2c4f3f0 gefixt — `confirm/route.ts:45-48` blockt `//evil.com` und `/\evil.com` zusätzlich zum bestehenden `startsWith('/')`-Check.

Die beiden Warnings WR-01 (Skip-Metadata-Write-Fehler) und WR-02 (callback getUser()=null) sind im selben Commit adressiert. WR-03 (Filename-Drift chat.spec.ts → Auth-Gate-Tests) ist als Info klassifiziert — keine Runtime-Impact, nur Naming-Verwirrung für zukünftige Engineers.

Die 3 In-Flight-Fixes (c78a094 chat.spec Filename-Drift entstanden, be25de0 callback has_password-Check für PKCE, ac1e374 shouldCreateUser:false) schließen Lücken zwischen Plan-Scope und echter Supabase-Routing-Realität.

### Notable Strengths

1. **Tri-state-Logik konsistent 3x implementiert** (confirm-route, callback Hash-Flow, callback PKCE-Flow) — keine Diskrepanz zwischen Entry-Points für Magic-Link-Verifikation.
2. **Atomare updateUser-Calls** (password + has_password zusammen) vermeiden Race-Condition-Windows in denen Passwort gesetzt aber Flag nicht geschrieben wäre.
3. **Defense-in-Depth bei Settings Change-Mode** — signInWithPassword als Re-Auth plus updateUser, auch wenn `updateUser({ password })` alleine bereits eine aktive Session voraussetzt.
4. **Unterschiedliche Input-IDs** zwischen set-password-page (`#password`, `#confirmPassword`) und PasswordSection (`#currentPassword`, `#newPassword`, `#confirmNewPassword`) — verhindert E2E-Selektor-Kollision.
5. **CI-Binding hat NEXT_PUBLIC_SUPABASE_URL + SERVICE_ROLE_KEY** im E2E-env ergänzt (über Plan-Scope hinaus) — macht Phase-13-Admin-Helper in CI funktionsfähig.

---

_Verified: 2026-04-19T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
