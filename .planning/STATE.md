---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Website Conversion-Layer & Onboarding-Funnel
status: planning
last_updated: "2026-04-24T00:26:17.809Z"
progress:
  total_phases: 18
  completed_phases: 10
  total_plans: 62
  completed_plans: 59
  percent: 95
---

# Project State — Generation AI Monorepo

> Session-Brücke für Context nach /clear

## Current Status

**Milestone:** v4.0 Website Conversion-Layer & Onboarding-Funnel — 🚧 IN PROGRESS
**Roadmap revidiert 2026-04-23** nach Simons Website-Konzept (April 2026). Scope von 9 auf 11 Phasen erweitert: Phase 22 umgebaut (3-Anker → 4-Tab-System + Initiativen), Phase 22.5 `/events` + Phase 22.7 Tools-Polish + Phase 27 Copy-Pass **neu**, Phase 26 erweitert (`/community` als eigene Seite mit MDX-Artikeln + Blog-SEO). Details siehe ROADMAP.md + CONTEXT-Dokumente pro Phase.

**Phase:** 22.5
**Branch:** `main` (Phase 20 Skeleton + 20.5 Hero gemerged + gepusht 2026-04-22, Vercel auto-deployed) — neue Phasen starten auf frischem Feature-Branch
**Last Updated:** 2026-04-24 (Phase 22 /partner-page abgeschlossen — 8/8 Plans, VERIFICATION passed)
**Site Status:** ✅ Live auf generation-ai.org — Hero mit Signal-Grid ist live, /about + /partner fertig (nicht deployed). Phase 21 + 22 bereit für Feature-Branch + PR.

## 🚀 Next Session Start Here

**Next phase:** 22.5 /events-page (MDX-Pipeline, members-only gated, Anmelde-Flow)
**First command:** `/gsd-discuss-phase 22.5` (oder direkt `/gsd-plan-phase 22.5`)

**Context für neue Session:**

- `.planning/phases/20.6-landing-sections-rebuild/20.6-CONTEXT.md` — aktualisiert mit D-09 (Problem-Block) + D-10 (Kurz-FAQ)
- `.planning/phases/20.6-landing-sections-rebuild/20.6-0{1..9}-PLAN.md` — 9 Skeleton-Plans
- `brand/Generation AI Design System/` — Design-System Nordstern (canonical)
- `apps/website/components/ui/signal-grid.tsx` — der Qualitäts-Maßstab für alle Sections
- `~/Downloads/Generation_AI_Website_Konzept.md` — Simons Konzept (April 2026) — strategische Quelle für alle Scope-Entscheidungen
- Dev-Server: `pnpm --filter @genai/website dev` (auf localhost:3000 oder :3001)

**Revidierte Roadmap-Reihenfolge (Pfad A):**

```
20.6 → 21 /about → 22 /partner (4-Tab) → 23 /join → 22.7 tools-polish → 22.5 /events → 24 /test → 25 circle-sync → 26 /community → 27 copy-pass → LAUNCH
```

**Phase-CONTEXTs (alle 2026-04-23 auf Simons Konzept + Handout-Reality aligned):**

- Phase 20.6 `.planning/phases/20.6-landing-sections-rebuild/20.6-CONTEXT.md` — Landing-Sections-Rebuild (Problem-Block §4.4 + Kurz-FAQ §4.10 + Trust-Marquee + Polish), AudienceSplit removed, Hero LabeledNodes gelocked
- Phase 21 `.planning/phases/21-about-page/21-CONTEXT.md` 🆕 — /about mit Mission/Team/Werte/Verein/10-FAQ/Mitmach (Simon §9)
- Phase 22 `.planning/phases/22-partner-page/22-CONTEXT.md` — 4-Tab-System mit Initiativen + URL-Param + Ansprechpartner-Karten (Simon §8)
- Phase 22.5 `.planning/phases/22.5-events-page/22.5-CONTEXT.md` — MDX-Pipeline, members-only gated, Anmelde-Flow mit Signup-Gate (Simon §5)
- Phase 22.7 `.planning/phases/22.7-tools-subdomain-polish/22.7-CONTEXT.md` — Logo-Link-Fix + Login-Button-Umbau + Hero + Nav-Sync (Simon §6)
- Phase 23 `.planning/phases/23-join-flow/23-CONTEXT.md` 🆕 — /join Signup-Flow mit Waitlist-V1-Pattern, Redirect-URL-Handling (Simon §10)
- Phase 24 `.planning/phases/24-test-assessment/24-CONTEXT.md` 🆕 — /test KI-Kompetenz-Assessment, client-side Score-Logic, SEO-Entry
- Phase 25 `.planning/phases/25-circle-api-sync/25-CONTEXT.md` 🆕 — Kern-UX-Win: Unified Signup via Circle Business-API, Single-Mail-Flow
- Phase 26 `.planning/phases/26-community-page-and-subdomain-integration/26-CONTEXT.md` — eigene `/community`-Seite mit MDX-Artikeln + Block B Featured-Tools-API (Simon §7)
- Phase 27 `.planning/phases/27-copy-pass-and-launch-cleanup/27-CONTEXT.md` — Copy-Pass + Dummy-Cleanup + SEO-Final + Signup-Go

**Entschiedene Decisions (2026-04-23 mit Luca):**

- Partner: 4-Tab-System mit Initiativen (Simons Konzept canonical)
- Events: NICHT public — members-only per Strategie (Akquisitionshebel). MDX-Pipeline im Repo, kein Circle-API-Pull. Anmelde-Flow gated durch Signup
- Community-Artikel: MDX-Files im Repo (parallel zu Events-Pipeline). Placeholder-Content bei Launch
- Reihenfolge: Pfad A (B2B-Conversion priorisiert: Partner vor Events)
- 20.6 erweitert (statt 20.7) um Problem-Block + Kurz-FAQ
- Tools-Polish-Wording: „Kostenlos registrieren" bestätigt
- Partner-Mail: erstmal `admin@` (ImprovMX), `partner@` später

**Phase 20 Skeleton — Status 2026-04-21:** formal approved auf Skeleton-Scope. Automated Gates alle grün (Build `ƒ /`, CSP nonce, Playwright 8/8, Lighthouse A11y 1.00 / BP 0.96 / SEO 1.00 / CLS 0.00, Perf 0.88 flaky-tolerated). Hero + Discrepancy Wow-Peaks explicit deferred auf Phase 20.5. Changeset `phase-20-navigation-landing-skeleton.md` liegt committed, Merge + `pnpm version` erst nach 20.5. Branch `feature/phase-20-landing-skeleton` bleibt offen für 20.5. Details: `.planning/phases/20-navigation-landing-skeleton/20-VALIDATION.md` (Skeleton-Scope-Sign-Off-Section).

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
- **Plan 20-03** DONE 2026-04-20 — Wow-Peaks 1+2 (Hero + Discrepancy)
  - Commits: `c52cc4f` (hero), `55b286a` (discrepancy)
  - Hero: AuroraBackground + Claim-Placeholder + CTA → /join, useReducedMotion-Guard
  - Discrepancy: Bento-Split + 6 NumberTicker (7× / 56% / 73% | 83.5% / 75% / 6.4%) + useScroll ±4%-Divergenz (CLS-safe via overflow-hidden) + Closer "Generation AI schließt diese Lücke."
  - Reduced-Motion: useTransform liefert 0%→0%, motion-Entries skippen, CSS-Aurora-Keyframe pausiert
  - Deviations: 0 (Plan 1:1 ausgeführt, keine Rule-Fixes nötig)
  - R1.2 + CSP Playwright grün (2/2 local prod), Build grün, `ƒ /`, 3× `href="/join"` im DOM
  - Requirements completed: R1.2, R1.3
- **Plan 20-04** DONE 2026-04-20 — Ruhige Mitte (Offering + Tool-Showcase + Community-Preview)
  - Commits: `05c0cf4` (offering), `abb8442` (tool-showcase), `cedf3e2` (community-preview)
  - Offering: 4-Card BentoGrid mit Community/Wissensplattform/Events/Expert-Formate + Lucide-Icons (Users/BookOpen/Calendar/Mic2) + Hover-Glow + Deep-Links
  - Tool-Showcase: InfiniteMovingCards mit 5 locked Stub-Tools (ChatPDF Pro / Notion AI / Perplexity / ElevenLabs / Gamma) + Header-BeispielBadge + 'Beispiel'-Suffix im title-Feld pro Card + CTA zu tools.generation-ai.org
  - Community-Preview: statisches 2-Spalten (3 Artikel + 2 Events) mit BeispielBadge pro Item, keine Animation, kein Skeleton (D-24 explicit)
  - BeispielBadge: theme-aware via useTheme (`.light` → brand-red, dark → brand-neon), lokal in tool-showcase exportiert + in community-preview reused
  - Deviations: 0 (Plan 1:1 ausgeführt)
  - R1.5 + R1.6 + CSP Playwright grün (3/3 local prod PORT=3030), Build grün `ƒ /`, 11× "Beispiel" im DOM, alle Stub-Titles sichtbar
  - Requirements completed: R1.4, R1.5, R1.6
- **Plan 20-05** DONE 2026-04-20 — Wow-Peak 3 (AudienceSplit + Trust + FinalCTA)
  - Commits: `c7575c6` (audience-split), `e8a8860` (trust), `333c977` (final-cta)
  - Audience-Split: dominante Studi-Section (H2 text-5xl + Primary-CTA → /join + secondary → tools) + dezenter B2B-Streifen (text-xs/sm + bg-bg-elevated + /partner link)
  - Trust: MagicUI Marquee mit 6 Stub-Partner-Tiles ("Sparringspartner 1..6" Text-Pills, Logo-Assets deferred) + Microproof "N=109 · März 2026" + doppelter reduced-motion-Guard (CSS @media in globals.css + JS useReducedMotion → Tailwind-arbitrary `[&_.animate-marquee]:![animation-play-state:paused]`)
  - Final-CTA: LampContainer (min-h-[70vh] override) + motion.div Content-Layer mit useReducedMotion-Gate + substantive Claim-Placeholder "Bereit, KI ernst zu nehmen?" + Primary-CTA → /join + Sekundär-Link → tools.generation-ai.org
  - Deviations: 0 (Plan 1:1 ausgeführt, first-try grün auf allen Tasks)
  - Playwright **8/8 grün** (R1.1×3 + R1.2 + R1.5 + R1.6 + R1.8 + CSP) gegen lokalen Prod PORT=3031
  - DOM-Smoke: 8 unique data-sections, 5× href="/join", 2× href="/partner", 4× animate-marquee, 24× Sparringspartner-Pills
  - Build grün `ƒ /`, CSP intakt
  - Requirements completed: R1.7, R1.8, R1.9
- **Plan 20-06** DONE 2026-04-21 — Phase-Gate + Skeleton-Sign-Off
  - Automated Gates grün: Build `ƒ /`, CSP nonce, Playwright 8/8, Lighthouse A11y 1.00 / BP 0.96 / SEO 1.00 / CLS 0.00 (Perf 0.88 flaky-tolerated)
  - Terminal-Splash A11y-Fix: `1717c24` (A11y 1.00 perfect)
  - Code-Review BL+HI fixes: `36c771a` (BL-01 nested main), `58cb695` (HI-04 @custom-variant dark), `b4988e2` (HI-03 smooth-scroll), `4c50119` (HI-01 hydration), `0c93c95` (HI-02 marquee cleanup)
  - UAT-Iterationen Hero+Discrepancy (stehen bleiben als Gesprächsgrundlage für 20.5): `858012e`, `6e24e7d`, `893b3a8`, `d8f4d53`, `8d577f6`, `25afcf6`
  - Manual UAT approved by Luca 2026-04-21 — **Skeleton-Scope only, Hero + Discrepancy Wow-Pass explicit deferred auf Phase 20.5**
  - Changeset `@genai/website: minor` (v4.5.0) committed, liegt zurückgehalten bis 20.5 durch ist
  - Requirements completed: R1.1–R1.10 (alle 10)
  - Artifacts: `.planning/phases/20-navigation-landing-skeleton/20-06-SUMMARY.md`, VALIDATION.md mit Skeleton-Scope-Sign-Off

### Phase 20.5 Progress

**Status:** Ready to plan

- CONTEXT.md committed — Design-System-Nordstern dokumentiert, 6 Decisions (D-01 bis D-06), Scope/Out-of-Scope, iterative Co-Build-Mode.
- 5 PLAN.md angelegt, 3 delivered + 2 deferred:
  - 20.5-01 Design-System Alignment (Wave 1, autonomous) — ✅ COMPLETE
  - 20.5-02 Signal-Grid Canvas Component (Wave 2, autonomous) — ✅ COMPLETE (+ ~20 UAT-Tuning-Commits)
  - 20.5-03 Hero Rewrite with Signal-Grid (Wave 3, autonomous) — ✅ COMPLETE (Luca signed-off 2026-04-22)
  - 20.5-04 Discrepancy Polish — ⚠️ DEFERRED. Code shipped (`26a5b76`), visual direction rejected by Luca 2026-04-21 UAT. Redesign from scratch in Plan 20.6-01.
  - 20.5-05 Hero → Discrepancy Transition — ⚠️ DEFERRED. Exploration-Doc (`20.5-05-EXPLORATION.md`) vorhanden, nicht gebaut. Continues in Plan 20.6-08 (Inter-section transitions).
- Close-Out-Artefacts (commit `b8bae5b`):
  - `20.5-SUMMARY.md` — phase-level summary, plans breakdown, hand-off zu 20.6
  - `20.5-VALIDATION.md` — sign-off, gates, scope-reduction rationale
  - `20.5-04-SUMMARY.md` + `20.5-05-EXPLORATION.md` frontmatter auf `status: deferred` gesetzt
- Branch bleibt `feature/phase-20-landing-skeleton` (baut on-top in 20.6).
- Working-Mode: Luca co-builds live auf localhost:3000, tight Feedback-Loops, kleine Commits, kein Push, kein Deploy.

### Phase 20.6 Progress

**Status:** PLANNED 2026-04-22. Scaffold erstellt (commit `ed454f2`), Execution pending.

- `20.6-CONTEXT.md` committed — 8 Decisions (D-01 Discrepancy from scratch, D-02 DS-compliance, D-03 section-order locked, D-04 Hero locked, D-05 transitions last, D-06 copy deferred, D-07 Playwright baseline, D-08 Lighthouse targets)
- 8 skeleton PLAN.md Files angelegt (alle `status: skeleton`, werden bei Execution gefüllt):
  - 20.6-01 New Discrepancy section (Wave 1) — Topic bleibt, Form TBD mit Luca
  - 20.6-02 Offering polish (Wave 2)
  - 20.6-03 Tool-Showcase polish (Wave 2)
  - 20.6-04 Community-Preview polish (Wave 2)
  - 20.6-05 Audience-Split polish (Wave 2)
  - 20.6-06 Trust polish (Wave 2)
  - 20.6-07 Final-CTA polish (Wave 2)
  - 20.6-08 Inter-section transitions (Wave 3, depends on 01-07)
- Requirements:
  - R1.3 re-flagged ⚠️ (Topic bleibt, beide bisherigen Varianten verworfen)
  - R1.4-R1.9 als skeleton done + polish pending markiert
  - R1.11 neu hinzugefügt (inter-section transitions)
- Next: Plan 20.6-01 New Discrepancy section — Planning-Session mit Luca (Form TBD).

---

---

## Milestone v4.0 — Revidiert 2026-04-23 nach Simons Website-Konzept

**Scope-Dokument:** `.planning/research/v4-scoping/SCOPE.md` + `~/Downloads/Generation_AI_Website_Konzept.md` (Simon, April 2026)
**Requirements:** R1-R7 in `.planning/REQUIREMENTS.md`
**Roadmap:** Phasen 20-27 in `.planning/ROADMAP.md`

**Phasen (revidierte Reihenfolge, Pfad A — B2B-Conversion priorisiert):**

1. **Phase 20** — Navigation + Landing-Skeleton ✅ (2026-04-21)
2. **Phase 20.5** — Landing Wow-Pass (Signal-Grid / Hero) ✅ (2026-04-22)
3. **Phase 20.6** — Landing Sections Rebuild (9 Plans: Problem-Block + 6 Polish + Kurz-FAQ + Transitions) ← **NEXT**
4. **Phase 21** — `/about`-Seite (Mission, Team, Werte, Verein, FAQ 10)
5. **Phase 22** — `/partner`-Seite **REVIDIERT** (4-Tab-System statt 3-Anker, + Initiativen als 4. Segment, URL-Param Deep-Linking, Ansprechpartner-Karten)
6. **Phase 23** — `/join` Fragebogen-Flow (Backend-Stub 503)
7. **Phase 22.7** — Tools-Subdomain Polish 🆕 (Logo-Fix + Login-Button-Umbau + Hero + Nav-Sync)
8. **Phase 22.5** — `/events`-Seite 🆕 (MDX-Pipeline, members-only gated, Anmelde-Flow mit Signup-Gate)
9. **Phase 24** — `/test` Assessment
10. **Phase 25** — Circle-API-Sync (Unified Signup)
11. **Phase 26** — `/community` + Subdomain-Integration **ERWEITERT** (eigene /community-Seite mit MDX-Artikeln + Blog-SEO, plus Featured-Tools-API)
12. **Phase 27** — Copy-Pass & Launch-Cleanup 🆕 (finales Wording + Dummy-Cleanup + SEO + Signup-Go)

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
