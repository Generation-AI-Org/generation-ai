---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Website Conversion-Layer & Onboarding-Funnel
status: in_progress
last_updated: "2026-04-20T10:00:00.000Z"
progress:
  total_phases: 13
  completed_phases: 5
  total_plans: 32
  completed_plans: 25
  percent: 78
---

# Project State — Generation AI Monorepo

> Session-Brücke für Context nach /clear

## Current Status

**Milestone:** v4.0 Website Conversion-Layer & Onboarding-Funnel — 🚧 IN PROGRESS (Phase 20 Waves 1+2 done, Wave 3 next)
**Phase:** 20 — Plans 01+02/6 DONE
**Last Updated:** 2026-04-20
**Site Status:** ✅ Live — CSP A+, Auth stabil, Chat global, Brand v4.3, Auth-Mails v4.3.x, Simplify-Pass v4.3.x merged, Password-Flow + E2E-Prod-Baseline v4.4.0.

### Phase 20 Progress

- **Plan 20-01** DONE 2026-04-20 — Stack-Setup (motion + shadcn + Aceternity/MagicUI copy-ins), legacy sections deleted, lighthouserc.json + landing.spec.ts skeleton
  - Commits: `27a645d`, `5c9e9ee`, `6a52f21`
  - Branch: `feature/phase-20-landing-skeleton`
  - Build grün, `ƒ /`, CSP OK
- **Plan 20-02** DONE 2026-04-20 — Navigation + Layout-Shell (Header-Umbau mit Dropdown + Mobile-Sheet, Footer 4-Spalten mit Sitemap+Legal+Kontakt+LinkedIn, 8 Section-Stubs in home-client gemountet, MotionConfig mit Request-Nonce via `await headers()` in page.tsx)
  - Commits: `96d690c` (header), `c945a88` (footer), `81d6ca4` (sections + MotionConfig)
  - Deviations: 5 auto-fixed (3 Rule-1 Bugs: lucide Linkedin fehlt → Inline-SVG; base-ui Menu Error #31 → DropdownMenuGroup wrapper; 2 Close-Buttons → showCloseButton=false + custom; 2 Rule-3 Test-Infra: splash-skip beforeEach, CSP waitUntil=domcontentloaded)
  - R1.1 Playwright (Dropdown click+keyboard, Mobile-Nav) + CSP-Test grün (4/4)
  - Build grün, `ƒ /`, CSP-Header mit Nonce intakt, 8 unique data-sections im DOM
  - Requirements completed: R1.1, R1.10
- **Plans 20-03..05** Wave 3 next up (Sections parallel-fähig — Wave-2-Boundary gelockt)
- **Plan 20-06** Wave 4 (Polish + Lighthouse-Gate + Changeset)

---

## Milestone v4.0 — Setup abgeschlossen 2026-04-19

**Scope-Dokument:** `.planning/research/v4-scoping/SCOPE.md` (Sparring-Session)
**Requirements:** R1-R7 in `.planning/REQUIREMENTS.md`
**Roadmap:** Phasen 20-26 in `.planning/ROADMAP.md`

**Phasen (empfohlene Reihenfolge):**

1. **Phase 20** — Navigation + Landing-Skeleton (Stub-Daten)
2. **Phase 21** — `/about`-Seite
3. **Phase 22** — `/partner`-Seite (3 Anker-Sections + Kontakt-Formular)
4. **Phase 23** — `/join` Fragebogen-Flow (Backend-Stub 503)
5. **Phase 24** — `/level-test` Assessment (optional, DSGVO-konform)
6. **Phase 25** — Circle-API-Sync (Unified Signup: eine Mail via SSO-Link)
7. **Phase 26** — Subdomain-Integration (Featured-Tools + Community-Preview)

**Kern-UX-Win:** Phase 25 Circle-API-Sync — User bekommt **eine** Mail statt zwei, landet nach Confirm via embedded SSO-Link direkt eingeloggt in Circle (Circle-Business-Plan API).

**Tech-Entscheidungen:**

- Circle-Sync via Server-Action in Next.js (kein Supabase Webhook/Edge Function — expliziter Code-Pfad)
- Tool-Showcase via public API aus tools-app (ISR-cached)
- Community-Preview via Circle API v2 (Rate-Limit-bewusst cachen)
- Live-Signup bleibt 503 bis Luca-Go nach Phase 25

---

## v3.0 Milestone — COMPLETE 2026-04-19 (6/6 Phasen)

**Phase 19 (trailing): Password-Flow + Test-Baseline** — ✅ DONE 2026-04-20
Verifier 13/13 passed, Code-Review 1 Crit + 2 Warn gefixt, alle 4 Follow-ups (WR-03/IN-04/IN-05/CI-env) erledigt.

- Plan 19-01 DONE — confirm-Route `has_password`-Check, Commit `865d87e`
- Plan 19-02 DONE — Set-Password First-Login-Mode, Commit `ad38601`
- Plan 19-03 DONE — Settings PasswordSection, Commits `24512e9` + `072195e`
- Plan 19-04 DONE — E2E-Prod-Baseline, Commits `bf39bdf` + `195b042` + `58b0048` + `2a09a86`
- Plan 19-05 DONE (code) — CI-Secrets + MANUAL-STEPS + Changeset, Commit `88cf644`

**Phasen-Übersicht:**

- Phase 14 — Mobile Polish ✅
- Phase 15 — Chat überall + Context-aware ✅ (v4.2.0)
- Phase 16 — Brand System Foundation ✅ (v4.3.0)
- Phase 17 — Auth Extensions ✅ (v4.3.x)
- Phase 18 — Simplify-Pass tools-app ✅ (−1.587 LOC)
- Phase 19 — Password-Flow + Test-Baseline ✅ (v4.4.0, closed 2026-04-20)

**Phase 19 — DONE 2026-04-20 (Code + UX-Smoke + Code-Review + Follow-ups):**

- **5/5 Plans** done, **3 Waves** sequentiell (worktrees disabled)
- **UX-Smoke gegen Prod:** alle 5 Flows grün (admin@, lucvii@gmx.de) — First-Login-Redirect, Skip, Password setzen, Change-Mode Re-Auth, Set-Mode ohne Re-Auth, Zweiter Magic-Link ohne Re-Prompt
- **E2E:** smoke+auth-gate 5p/2s · auth.spec 10p/2s gegen Prod
- **In-Flight-Fixes während UX-Smoke:**
  - `c78a094` auth-gate tests `/chat` → `/settings` (falsche Plan-19-04-Annahme)
  - `be25de0` `has_password`-Check auch in `/auth/callback` (PKCE-Flow, Plan 19-01 hatte nur `/auth/confirm` abgedeckt)
  - `ac1e374` `signInWithOtp({shouldCreateUser:false})` (Dashboard-User-Login-Blocker)
- **Code-Review (9 findings, REVIEW.md):**
  - `2c4f3f0` CR-01 Open-Redirect in confirm-route (`next=//evil.com`), WR-01 Skip-Error-Handling, WR-02 Callback-null-user → alle gefixt
  - 5 Info + 1 Cosmetic zunächst getrackt, dann alle erledigt (siehe Follow-ups)
- **Data-Migration:** 8 Alt-User mit `encrypted_password` + `has_password=null` auf `has_password=true` gesetzt — kein false-positive Prompt mehr
- **Follow-ups (alle done 2026-04-20):**
  - `f68358f` WR-03 chat.spec.ts → auth-gate.spec.ts
  - `20ac816` IN-04 explicit `force-dynamic` in confirm-route
  - `8ded103` IN-05 `needsFirstLoginPrompt()` Helper in @genai/auth
  - `89f9163` CI-env `NEXT_PUBLIC_SUPABASE_ANON_KEY` im e2e-Job
- **Artifacts:** `.planning/phases/19-password-flow-and-test-baseline/` — CONTEXT, 5× PLAN, 5× SUMMARY, MANUAL-STEPS, REVIEW, VERIFICATION (13/13 passed)
- **Test-User-Residuals:** `e2e-tester@generation-ai.test` (CI), `admin@generation-ai.org` (Ops/flag=false), `lucvii@gmx.de` (Lucas manueller Test, flag=true)

<details>
<summary>Plan-Level-Details (ausklappen)</summary>

- Plan 19-01 DONE — confirm-Route um `has_password`-Check erweitert, Commit `865d87e`
  - verifyOtp → `data.user.user_metadata.has_password` tri-state Check (undefined → First-Login-Redirect, true/false → normaler Flow)
  - Recovery-Branch unverändert (D-06 Guard: 0-line diff auf `packages/emails/src/templates/recovery.tsx`)
  - Build grün, alle 9 Acceptance-Criteria-Greps erfüllt
  - Requirements completed: D-01, D-02, D-06
- Plan 19-02 DONE — Set-Password-Page First-Login-Mode, Commit `ad38601`
  - `useSearchParams()` liest `?first=1` → `isFirstLogin`-Flag → Skip-Button „Später setzen"
  - Submit: kombinierter `updateUser({ password, data: { has_password: true } })` (atomar, D-05)
  - Skip: `updateUser({ data: { has_password: false } })` + redirect / (D-02)
  - Recovery-Flow unverändert (kein `?first=1` → kein Skip-Button, Back-Link sichtbar)
  - Suspense-Wrapper proaktiv ergänzt (Next.js 15/16 Requirement)
  - Submit-Button disabled auch bei `skipping=true` (Rule-2-Deviation: Race-Prevention)
  - Build grün, alle 10 Acceptance-Criteria-Greps erfüllt
  - Requirements completed: D-01, D-02, D-05
- **Wave 1 bereit zum atomaren Deploy** (Plans 01+02 müssen gemeinsam gepusht werden — 19-01 alleine würde User auf Page ohne Skip-Button routen)
- Plan 19-04 DONE — E2E-Baseline Reparatur, Commits `bf39bdf` (playwright.config), `195b042` (auth.spec), `58b0048` (chat.spec), `2a09a86` (turbo.json)
  - Default-baseURL jetzt Prod (`https://tools.generation-ai.org`), Override via `E2E_BASE_URL` (primary) oder `BASE_URL` (legacy-fallback)
  - `chat.spec.ts` refactored auf Prod-Reality: unauthenticated `/chat` → `/login`-redirect, flexible Locator (`loginEmail.or(chatInput)`), URL-Whitelist `['/chat', '/login']`, status < 500
  - `auth.spec.ts` `TOOLS_URL`-Konstante aligned mit Config-Pattern — Phase-13 + Plan-02 Test-Bodies unverändert
  - `turbo.json` `tasks.e2e.passThroughEnv` um `E2E_BASE_URL` erweitert — D-08-Override funktioniert jetzt auch via `pnpm e2e` (turbo-Wrapper), nicht nur via `pnpm exec playwright test`
  - 33 Tests parsen (auth 12, chat 5, smoke 2, visual-baseline 14), turbo.json valides JSON, alle Acceptance-Criteria-Greps erfüllt
  - Requirements completed: D-07, D-08
- Plan 19-03 DONE — Settings Password-Block, Commits `24512e9` (PasswordSection.tsx), `072195e` (page.tsx mount)
  - Neue `PasswordSection` Client-Component (151 Zeilen) im `apps/tools-app/app/settings/`-Ordner
  - 2-Modi-Logic: Set-Mode (2-Feld-Form) für User ohne `has_password`, Change-Mode (3-Feld-Form mit Re-Auth) für User mit `has_password=true`
  - Change-Mode: `signInWithPassword` als Re-Auth-Check vor `updateUser({ password })` (D-04) — falsches aktuelles Passwort → Early-Return mit Error-Message, kein Server-State-Change
  - Kombinierter `updateUser({ password, data: { has_password: true } })`-Call (D-05)
  - Success: Inline-Message (grün), Felder clearen, lokaler State wechselt auf Change-Mode — KEIN Redirect
  - Error: Inline-Message (rot), Form bleibt ausgefüllt
  - Input-IDs bewusst anders als set-password-page (`currentPassword`/`newPassword`/`confirmNewPassword` vs. `password`/`confirmPassword`) — kein E2E-Selektor-Konflikt mit Phase-13-Auth-Tests
  - Settings-Page rendert neuen Block zwischen Account und Rechtliches (natürliche User-Lesereihenfolge)
  - Build grün (6.0s, 46/46 Pages, /settings als `ƒ` dynamic), alle Acceptance-Criteria-Greps erfüllt
  - Requirements completed: D-03, D-04, D-05
- Plan 19-05 CODE-DONE — CI-Binding + MANUAL-STEPS + Changeset, Commits `c82604d` (CI), `e765b76` (MANUAL-STEPS), `6ab6ae6` (changeset)
  - `.github/workflows/ci.yml` e2e-Job: STAGING_URL-Gate entfernt, TEST_USER_EMAIL/TEST_USER_PASSWORD aus Repo-Secrets, E2E_BASE_URL als optional Repo-Var, NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY für Magic-Link/Recovery-Helper (Rule-2-Deviation: war nur als Inline-Kommentar im Plan, jetzt als Code)
  - `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` (133 Zeilen) — 5 Sections: Supabase-User, GitHub-Secrets, E2E_BASE_URL, .env.test.local, Rollback
  - `.changeset/phase-19-password-flow.md` — @genai/tools-app:minor (linked bumpt @genai/website auto), v4.4.0
  - Requirements completed: D-07, D-09
  - Task 4 CHECKPOINT (Human-Verify): PENDING Lucas Setup + Build + `pnpm e2e` gegen Prod
- Artifacts: `.planning/phases/19-password-flow-and-test-baseline/19-01-SUMMARY.md` … `19-05-SUMMARY.md`, `MANUAL-STEPS.md`

</details>

**Phase 18 — DONE 2026-04-19:**

- 4 Plans / 3 Waves / alle grün (lint/build/unit)
- Delta: −1.587 LOC, 9 Files raus, 4 Deps raus, 13 Exports lokalisiert
- knip als Monorepo-weites Orphan-Tool etabliert (`knip.json` + `pnpm knip`)
- KiwiMascot + alle Supabase-Shims bewusst behalten (DEFER, auth-audit-Scope)
- E2E-Failures verifiziert pre-existing (failen identisch auf main vor Phase 18) → getrackt in BACKLOG
- PR #4 squash-merged als commit `f6928db`, feature-branch gelöscht
- Artifacts: `.planning/phases/18-simplify-pass-tools-app/` (CONTEXT, 4× PLAN, 4× SUMMARY, VERIFICATION, knip-report)

**Phase 16 — DONE 2026-04-18:**

- 6/6 Plans / Brand System Foundation vollständig
- Radix Colors Tokens + Geist Mono/Sans + `<Logo />` 11 Varianten + Website + tools-app migriert
- Visual-Regression-Gate geschlossen: 12 intentional diffs (font swap), 0 unintentional
- Builds grün, Smoke + Unit Tests grün
- Changeset für v4.3.0 minor release erstellt
- Artifacts: `.planning/phases/16-brand-system-foundation/` (CONTEXT, 6× PLAN, 6× SUMMARY, VERIFICATION, UI-SPEC, VOICE, VISUAL-DIFF-REPORT)

**Phase 15 — DONE 2026-04-18:**

- 3 Waves / 3 Plans / 8/8 Must-haves verifiziert / 0 Gaps / REVIEW clean (2 medium + 3 low gefixt)
- Build grün, Verifier grün, Code-Review grün
- Dev-Server smoke-getestet (Home, Detail, Settings, Legal, Login) — alle Routes korrekt
- Artifacts: `.planning/phases/15-chat-ueberall-global-context-aware/` (CONTEXT, 3× PLAN, 3× SUMMARY, VERIFICATION, REVIEW)
- Zusätzlicher Post-Fix: Legal-Seiten (`/impressum`, `/datenschutz`) aus GlobalLayout entfernt (Commit `42916e0`)

**Phase 17 — DONE 2026-04-19:**

- 5 Plans / 6 Supabase-Email-Templates auf React Email vereinheitlicht (Confirm, Magic Link, Recovery, Email-Change, Reauth, Invite)
- React Email Setup + Shared Layout + Brand-Tokens inline
- HTMLs in `apps/website/emails/dist/*.html` exportiert und in Supabase Dashboard eingespielt
- Sender auf `noreply@generation-ai.org` via Resend SMTP
- Gravatar für `noreply@generation-ai.org` registriert (Neon-AI-Icon auf Blau) — verifiziert via gravatar.com/site/check
- Rate-Limits auf Supabase-Defaults (30/h Email, 150/5min Token-Refresh)
- Artifacts: `.planning/phases/17-auth-extensions/` (CONTEXT, 5× PLAN, 5× SUMMARY, VERIFICATION, REVIEW, REVIEW-FIX, MANUAL-STEPS)

**Brand-Asset-Zugaben (outside phase):**

- `brand/logos/favicon-blue-neon-padded.svg` — Favicon-SVG mit Padding für Gravatar-Use
- `brand/avatars/gravatar-admin-512.png` — 512×512 Gravatar-Avatar

**OAuth** (Google/Apple) bleibt im `BACKLOG.md`.

---

**Phase 18 — Simplify-Pass tools-app (nach Phase 17)**

Code-Housekeeping. **CONTEXT.md angelegt** (`.planning/phases/18-simplify-pass-tools-app/CONTEXT.md`).

**Pre-Req vor Planning:** `/gsd-map-codebase` ausführen — erzeugt `.planning/codebase/CONCERNS.md` als Input.

**Scope:** Orphan-Files löschen, Naming-Harmonisierung, Duplicate-Helpers konsolidieren, Dev-Artefakte raus, auskommentierten Code entfernen. Kein Feature-Change.

**Pre-Approved für Autonomous-Run:**

- Rein Code, keine Manual-Steps
- Push + Changeset patch (v4.3.x): OK
- Stop-Gate: ambivalente Renames pausieren für Luca-Input
- Hard Stop: Test-Break nach Rename → keine Blindfixes

**Kommando:** `/gsd-autonomous --only 18` (empfohlen `--interactive` wegen Rename-Ambiguitäten)

**Reihenfolge:** 14 ✅ → 15 ✅ (2026-04-18, v4.2.0 candidate) → **16 Brand** → 17 Auth Emails → 18 Simplify

**Next Sessions (autonom fahrbar, 5 Phasen in v3.0 Milestone — Brand-Phase 16 neu eingefügt am 2026-04-18):**

Phasen 14-18 stehen in `ROADMAP.md` unter Milestone v3.0. Empfohlene Reihenfolge:

1. **Phase 14 — Mobile Polish** ✅ COMPLETE
2. **Phase 15 — Chat überall + Context-aware** ✅ COMPLETE (minor v4.2.0)
3. **Phase 16 — Brand System Foundation** (neu, minor v4.3.0) — Radix Colors + Geist + Design Tokens + Migration Website/tools-app. Source of Truth: `brand/DESIGN.md` + `brand/VOICE.md` + `brand/tokens.json`.
4. **Phase 17 — Auth Extensions** (teil-autonom, patch v4.3.x) — 6 Supabase-Templates auf React Email mit neuen Brand-Tokens + Rate-Limits. OAuth bleibt im BACKLOG.
5. **Phase 18 — Simplify-Pass** (patch v4.3.x) — nach `/gsd-map-codebase`

**Konsolidierungs-Rationale (2026-04-17):**

- Alt 14 + alt 16 → neu 14 (beide Mobile-UX, zusammen 3h, zu klein für 2 GSD-Phasen)
- Alt 17 + alt 19 → neu 16 (Auth-Block, gleiche Dashboard-/Cloud-Setups, gleiche E2E-Pfade)
- Alt 15 unverändert (echte Architektur-Phase) → neu 15
- Alt 18 → neu 17 (Simplify bleibt eigenständig, depends on map-codebase)

**Session-Start-Commands (aus BACKLOG.md + ROADMAP.md ableiten):**

- Vor Phase 15/17: einmalig `/gsd-map-codebase` (erzeugt `.planning/codebase/`, Basis für Researcher)
- Pro Phase: `/gsd-autonomous --only N --interactive` (pausiert bei Architektur-Fragen, läuft dann durch)
- Zwei Sessions parallel: gehen wenn die Phasen keine gleichen Files anfassen (14 + 17 ✅, 14 + 15 ❌)

## Chat-Agent-Bug — Root Cause + Fix (PR #3, 2026-04-17)

**Root Cause:** Gemini 3 Flash hat **nicht-abschaltbares Thinking**. Ohne `reasoning_effort`-Parameter läuft Default-Effort → das Modell überplant und fordert immer weitere Tool-Calls statt zu synthesisieren → `finish_reason: stop` feuert nie → Loop bis maxIterations. Zusätzlich war `/api/chat` recommendedSlugs für member-Mode hartverdrahtet auf `[]`, daher kein Tool-Highlighting in der UI.

**Fix (3 Schichten):**

1. `reasoning_effort: 'low'` + `max_completion_tokens: 8000` (inkl. Reasoning-Tokens) statt `max_tokens: 2000`.
2. System-Prompt: Tool-Budget auf 3 Calls gekappt, "keine Re-Queries mit Mini-Varianten".
3. Safety-Net: Nach maxIter ein Synthesis-Call mit expliziter User-Instruktion "antworte jetzt basierend auf bisher Recherchiertem".
4. `recommendedSlugs` in `/api/chat` wird jetzt aus `sources.map(s => s.slug)` abgeleitet.

**Verifiziert auf Preview `tools-7tax1ypz9`:**

- "Was ist ChatGPT?" → KB-Treffer `was-ist-chatgpt`, Source korrekt angezeigt.
- "Tools zum Zusammenfassen von Vorlesungen" → web_search, strukturierte Antwort mit URL-Quellen.

## Session-Drop-Bug (f5f9cb7, 2026-04-17)

**Root Cause:** `apps/tools-app/app/auth/signout/route.ts` hatte GET-Handler → Next.js `<Link href="/auth/signout">` in AppShell + FilterBar wurde automatisch prefetched → Server rief `signOut()` bei jedem Page-Render auf → Session wurde ~1s nach Login zerstört.

**Fix:** Signout-Route auf POST-only, Links durch `<form method="POST">` ersetzt. Canonical Supabase-Pattern.

**Verifiziert via Playwright gegen Prod:** Login setzt Cookie, Reload persistiert, Navigation zu /settings hält Session.

## Phase 13 — COMPLETE & MERGED (2026-04-17)

**Branch:** `feat/auth-flow-audit` — gemergt in main via `--merge` (granulare Commits erhalten für ggf. Revert via `git revert -m 1`).
**Verifier:** PASS, 4 Post-Merge-Human-Verifications: Prod-curl CSP, securityheaders.com, tools-app Feature-Smoke, Session-Refresh Path 3.

**Was Phase 13 lieferte:**

- 10 Playwright-E2E-Tests gegen Prod grün (6 Auth-Pfade, 2 skips dokumentiert)
- `docs/AUTH-FLOW.md` — 457 Zeilen, 7 Mermaid sequenceDiagrams, Findings, Consolidation Audit, CSP-Rollout
- CSP enforced via `proxy.ts` + Nonce auf website + tools-app (Next.js 16 native Pattern)
- Konsolidierungs-Audit: 0 direkte `@supabase/ssr`-Imports in apps/, thin shims ≤8 Zeilen
- Signout GET → 405 Regression-Guard als automatisierter Test
- 1 Bug gefixt (F2 Admin generateLink), 1 Backlog-Item (F1 sb-cookie httpOnly)

## Next Up — Stufe 3 Simplify-Pass

**Stufe 3 — Simplify-Pass tools-app (nach Merge):**

- Tote Files löschen, inkonsistente Patterns vereinheitlichen, Naming fixen
- Basiert auf Findings aus Stufe 1+2

**Feature-Ideen für später (Luca hat Interesse):**

- Google OAuth-Login (UX-Win, ~1 Tag)
- Circle-Member-Status → Pro-Modus automatisch
- Smart-Links "Weiter im Circle"
- Password-Reset end-to-end testen (Code da, nie verifiziert)

**Wichtig für Claude bei Start:**

- Luca ist No-Code, braucht Erklärungen
- Bei Tech-Entscheidungen: Option zeigen, Tradeoff nennen, Empfehlung — nicht einfach machen
- Signup ist auf 503 disabled — nicht wieder aktivieren ohne expliziten Auftrag

## Auth Rewrite — DEPLOYED

**Root Cause (fixed):**

- Manueller `btoa(JSON.stringify(...))` Cookie-Write im tools-app inkompatibel mit `@supabase/ssr` native Base64-URL/Chunked-Encoding
- Doppel-Write Race zwischen custom `setAll` und `saveSessionToCookie`
- 3 parallele Auth-Implementierungen im Monorepo (packages/auth ungenutzt, zwei kaputte lokale Versionen)

**Fix (Phase 12, DEPLOYED):**

- `@genai/auth` als canonical implementation konsolidiert
- `updateSession()` middleware helper (Supabase canonical pattern)
- Alle manuellen `document.cookie`-Hacks entfernt (−360 Zeilen broken code)
- Cross-domain cookies via `NEXT_PUBLIC_COOKIE_DOMAIN=.generation-ai.org`
- Beide Apps: build ✓, tests 24/24 ✓, lint (nur pre-existing warnings)

**Commits (gepusht 2026-04-16):**

- `728386d` feat(auth): canonical @supabase/ssr helpers + cross-domain cookies
- `902f389` refactor(tools-app): migrate auth to @genai/auth, remove cookie hacks
- `4d3977d` refactor(website): migrate auth to @genai/auth + add session-refresh proxy
- `8cdc931` fix(auth): client-safe barrel, server code imports from subpath
- `6a7fca1` docs(auth): update flow docs for canonical pattern + add settings-todo

**Pending:**

1. ✓ `git push` → Production Deploy triggered
2. ⏳ Supabase Dashboard settings (siehe `.planning/phases/12-auth-rewrite/SETTINGS-TODO.md`)
3. ⏳ Login testen auf Production

## Progress

```
Phase 4: [████████░░] DSGVO & Legal (Code ✓, DPAs pending)
Phase 5: [████████░░] Security Headers (HSTS ✓, CSP geparkt)
Phase 6: [██████████] Monitoring COMPLETE
Phase 7: [██████████] Testing COMPLETE (CI Pipeline live)
Phase 8: [██████████] Performance & A11y COMPLETE
Phase 9: [██████████] Floating Chat Bubble COMPLETE
Phase 10: [████████░░] Voice Input (Code ✓, Testing pending)
Phase 11: [██████████] Performance Polish COMPLETE
Phase 12: [██████████] Auth Rewrite DEPLOYING
```

## v2.0 Production Hardening — COMPLETE ✓

Alle Code-Tasks erledigt. Nur noch Admin-Aufgaben offen:

- ⏳ DPA Supabase (angefragt)
- ⏳ DPA Vercel (braucht Pro-Plan)

## Erledigt (2026-04-14)

- ✓ Agent auf Gemini 3 Flash (71s → ~10s)
- ✓ SpeedInsights re-enabled
- ✓ Sentry Error-Tracking eingerichtet
- ✓ Better Stack Uptime-Monitoring eingerichtet
- ✓ ZHIPU_API_KEY von Vercel gelöscht
- ✓ **Dokumentation erstellt:**
  - `docs/ARCHITECTURE.md` — System-Uebersicht, Datenfluss, Schema
  - `docs/API.md` — Alle API-Endpoints dokumentiert
  - `docs/DEPLOYMENT.md` — Deploy-Flow, Env-Vars, Setup
  - `CLAUDE.md` erweitert mit Session-Start-Checkliste
  - `packages/ui/README.md` — Erklaerung warum leer
  - Memory-Datei aktualisiert

## Backlog (nice-to-have)

1. **CSP Header** — Edge Runtime Issue, geparkt

## Completed Code Tasks

### Phase 4 ✓

- Impressum aktualisiert (DDG, Telefon-Placeholder)
- Datenschutzerklärung aktualisiert (TDDDG, Claude API)
- tools-app Legal Pages erstellt
- Account-Delete-Funktion implementiert

### Phase 5 (partial)

- HSTS + Standard Headers ✓
- CSP ✗ (disabled wegen Edge Runtime)

### Phase 6 (partial)

- /api/health ✓
- SpeedInsights ✗ (disabled wegen pnpm)

## Live URLs

- **Website:** https://generation-ai.org
- **tools-app:** https://tools.generation-ai.org ✓ ONLINE
- **GitHub:** https://github.com/Generation-AI-Org/generation-ai

### Phase 7 COMPLETE

- Vitest + RTL setup in packages/auth (4 tests)
- Vitest + RTL setup in apps/tools-app (11 tests)
- Vitest + RTL setup in apps/website (5 tests)
- Playwright E2E package created (packages/e2e-tools)
- API Route Tests: /api/health (1 test), /api/chat (4 tests)
- E2E Specs: auth.spec.ts (4 tests), chat.spec.ts (3 tests)
- turbo.json: test, test:watch, e2e Tasks mit Caching
- GitHub Actions CI Workflow (.github/workflows/ci.yml)
- Total: 20 unit tests passing, FULL TURBO caching

### Phase 8 COMPLETE

- Lighthouse + A11y Audit complete (LIGHTHOUSE-AUDIT.md)
- Google Fonts self-hosting verified (no third-party requests)
- WCAG 2.1 AA violations identified and FIXED (6 issues in tools-app)
- Skip-Link, aria-labels, aria-pressed, focus-visible styles implemented
- All Critical/Serious axe violations resolved

### Phase 9 COMPLETE

- Floating Chat Bubble mit Kiwi-Gesicht (Augen folgen Maus)
- Glassmorphism Popup mit Glow-Effekten
- Tool-Bibliothek hat jetzt volle Breite
- Lite/Pro Badge je nach Login-Status
- Mobile Tabs entfernt
- Voice/Link Buttons vorbereitet (disabled)

## Phase 10: Voice Input — IN TESTING

**Code complete, needs manual browser testing.**

Built:

- ✓ `/api/voice/token` — Token endpoint für Deepgram
- ✓ `useDeepgramVoice` — Hook mit WebSocket streaming
- ✓ Real audio visualization via Web Audio API
- ✓ Live interim transcript während Aufnahme
- ✓ VoiceInputButton mit echten Frequenz-Bars
- ✓ Integration in FloatingChat

**Testing Checklist:**

- [ ] Chrome Desktop: Voice startet, Bars animieren, Text erscheint
- [ ] Safari Desktop: Kein AudioContext-Fehler
- [ ] Firefox Desktop: audio/webm funktioniert
- [ ] iOS Safari: AudioContext nicht suspended
- [ ] Android Chrome: Alles funktioniert

**Setup Required:**

- `DEEPGRAM_API_KEY` in `.env.local` ✓
- `DEEPGRAM_API_KEY` in Vercel Env-Vars (für Production)

## Next Step

Manuelles Testing auf verschiedenen Browsern.

### Phase 11 COMPLETE — Performance Polish

- Console.logs entfernt (nur Client-side dev noise, API error logs bleiben)
- MarkdownContent memoized mit React.memo + useMemo
- Audio-Bars: Framer Motion → CSS scaleY (GPU-beschleunigt)
- ContentCard memoized
- Inline animation styles → CSS Utility-Klassen
- will-change Hints für Animationen
- Neue CSS Klassen: animate-dropdown, animate-slide-in, dropdown-glow

## Roadmap Evolution

- Phase 9 added: Floating Chat Bubble (2026-04-15)
- Phase 9 COMPLETE: Floating Chat implemented (2026-04-15)
- Phase 11 added: Performance Polish (2026-04-15)
- Phase 11 COMPLETE: All optimizations applied (2026-04-15)
- Phase 12 added: Auth Rewrite (2026-04-16)
- Phase 12 COMPLETE: @genai/auth canonical + Session-Drop-Fix (2026-04-17)
- Phase 13 added: Auth-Flow-Audit + CSP Reaktivierung (2026-04-17)
- Roadmap retroaktiv aktualisiert: Phase 11+12 als COMPLETE nachgetragen (2026-04-17)
- Phase 13 Plan 01 COMPLETE: Test-Infrastructure Scaffold (Wave 0) — fixtures, helpers, auth.spec.ts skeleton, 4 tests grün gegen Prod (2026-04-17)
- Phase 13 Plan 02 COMPLETE: E2E Auth Audit — 10 active tests, all 6 auth paths verified against production, 2 findings (F1 backlogged, F2 fixed in 582cd63), docs/AUTH-FLOW.md audit section created (2026-04-17)
