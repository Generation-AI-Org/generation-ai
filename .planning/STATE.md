---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Website Conversion-Layer & Onboarding-Funnel
status: in_progress
last_updated: "2026-04-26T00:00:00.000Z"
progress:
  total_phases: 20
  completed_phases: 17
  total_plans: 113
  completed_plans: 111
  percent: 98
---

# Project State — Generation AI Monorepo

> Session-Brücke für Context nach /clear

## Current Status

**Milestone:** v4.0 Website Conversion-Layer & Onboarding-Funnel — 🚧 IN PROGRESS (Phase 22.6 ✅ done + auf develop, **Phase 22.8 ✅ DONE + auf develop 2026-04-26**, Phase 27 last-before-launch)
**Roadmap revidiert 2026-04-23** nach Simons Website-Konzept (April 2026). Scope von 9 auf 11 Phasen erweitert: Phase 22 umgebaut (3-Anker → 4-Tab-System + Initiativen), Phase 22.5 `/events` + Phase 22.7 Tools-Polish + Phase 27 Copy-Pass **neu**, Phase 26 erweitert (`/community` als eigene Seite mit MDX-Artikeln + Blog-SEO). Details siehe ROADMAP.md + CONTEXT-Dokumente pro Phase.

**Phase:** Phase 27 Copy-Pass & Launch-Cleanup — in progress. 22.8 ist auf `develop`; offene nicht-Circle-UATs wurden von Luca am 2026-04-26 für Phase-27-Readiness akzeptiert. Janna/Sparring-Feedback vom 2026-04-26 wurde als erster Phase-27-Slice umgesetzt (Join-Formular, `/test` Leadmagnet-CTA, Footer/Header, Welcome-Mail, Tools-Hero-Copy). Supabase `early_career`/`birth_year` Migration ist live angewendet. Circle-Sync bleibt separates Preview-/Launch-UAT-Gate; `SIGNUP_ENABLED` bleibt unverändert.
**Branch-Setup:** Seit 2026-04-25 **develop-pattern aktiv** — alle Phasen mergen in `develop`, NICHT direkt in main. Production-merge erst zum Launch. Siehe [.planning/BRANCH-WORKFLOW.md](BRANCH-WORKFLOW.md).

- `main` = Production (Stand: Phase 20+20.5, Vercel auto-deployed seit 2026-04-22)
- `develop` = Staging-Sammelbranch (Stand: + Phase 25 + Phase 26 + Phase 22.6 + **Phase 22.8** ✅ gemerged 2026-04-26). Vercel-Preview: https://website-git-develop-lucas-projects-e78962e9.vercel.app
- `feature/phase-22.6-pre-launch-polish` = ✅ DONE + gemerged in develop (kann gelöscht werden)
- `feature/phase-22.8-join-about-test-polish` = Phase 22.8 complete + in `develop` integriert.
- `feature/phase-26-community` = abgeschlossen + von Luca für Phase-27-Readiness akzeptiert.

**Last Updated:** 2026-04-26 (Phase 22.8 final DONE auf `feature/phase-22.8-join-about-test-polish`. `/test` persistiert anonymen Fortschritt in `sessionStorage` und abgeschlossene Ergebnisse in `localStorage`; `/join` übernimmt gespeicherte Testdaten als Hidden Payload, `submitJoinSignup` schreibt validiertes `user_metadata.test_result` bei aktivem Signup. Website- und tools-app-Theme-Toggle sind visuell synchronisiert. Closeout-Rerun: Website + tools-app Typecheck grün, Website Vitest 110/110, Lint 0 Errors/15 bestehende Warnings, Full Build grün. Wave-4 E2E/Visual-Smoke: `/test` Playwright 9/9, `/join` Playwright 14/14, Theme-Toggle Visual-Smoke grün gegen lokale Production-Server.)
**Site Status:** ✅ Live auf generation-ai.org (alter Stand, Phase 20+20.5). `develop` hat alles bisher Gebaute (Phase 21–26 + 22.6 + 22.8). Luca hat am 2026-04-26 die offenen nicht-Circle-UATs für Phase-27-Readiness akzeptiert (20.6 Landing, 22.6 Logged-in Risk, 23 deferred Checks, 24 `/test`, 26 `/community`). Phase 25 Circle-Sync bleibt External-Setup-/Launch-Gate: Circle Token, Vercel Env, Preview Signup E2E, Circle SSO, Fallback-Test, Sentry, Bundle-Secret-Grep.

## 🚀 Next Session Start Here

**Next phase:** Phase 27 Copy-Pass & Launch-Cleanup fortsetzen.
**First command:** Phase-27-Diff prüfen und offene Launch-Gates abarbeiten.
**Erst tun (Phase 27 Fortsetzung):**

- `27-SUMMARY.md` + `27-LAUNCH-CHECKLIST.md` nutzen: Janna-Feedback-Slice ist lokal grün; Supabase/Vercel/Sentry/Bundlegrep-Basics sind erledigt; übrig sind optionales Motivationsfeld-Entscheid, Circle-Invitation-Template-Check im Dashboard, Marketing-Mail-Screenshots und Phase-25 Preview-Signup-UAT durch Luca.
- Circle-Sync nicht blind live schalten: Phase 25 ist kein normaler UAT, sondern Secret-/External-Service-Gate. Signup-Reactivation bleibt Luca-Approval-Gate.

**Phase 22.6 Status (final):**

- 9/9 Plans done (Track A 5 + Track B 4)
- Verifier passed (16/16 must_haves)
- Code-Review: 0 Critical · 4 Warnings (V1-akzeptabel) · 6 Info
- UAT: 6 passed/accepted · 1 partial accepted (tools-app perf pre-existing tech-debt)
- Lighthouse /events: **99/100/100/100** ✅
- Lighthouse tools-app: 78/94/100/92 (perf pre-existing — eigene Performance-Phase post-launch, Pre-22.6 Baseline war 53)
- Drive-by Footer-Polish: a28821b (/events in Footer Entdecken-section, Header bleibt D-18-locked)

**22.6-01 DONE:** Test scaffold (Playwright + Vitest stubs) — commit 5510c26
**22.6-02 DONE:** events.ts MDX adapter + 5 placeholder MDX files + 7 Vitest tests passing — commits f44f45a, 910ab78, 457f45d
**22.6-03 DONE:** /events page shell (Server Component + Hero + Grid + Formats + Members-Only + Final-CTA) — commits 98242ed, fc03be6, 8a2027b — build shows ƒ /events, Playwright 3/3 passing
**22.6-04 DONE:** EventModal + Anmelde-Flow (open-redirect guard, auth-aware CTA, mobile sheet, 5/7 Playwright green) — commits a2c754f, b2e08c2, 756146c
**22.6-05 DONE (Track A COMPLETE):** /events/[slug] standalone page + EventsArchive (A-06) + sitemap events + 2 final Playwright tests — all 7 Track A tests green — commits 6f2669a, 61f4323
**22.6-06 DONE (Track B Wave 0):** Playwright stub `packages/e2e-tools/tests/tools-app.spec.ts` mit 5 `test.fixme` für B-req-1..B-req-5 (login/utm/hero/nav/eingeloggt). TOOLS_URL constant mit `process.env.TOOLS_URL` Fallback auf `http://localhost:3001`. Suite green (5 skipped). Plans 07-09 swap fixme → active assertions — commit 700c8fc
**22.6-07 DONE (Track B Login-Button-Umbau):** GlobalLayout.tsx Header right-side Cluster ersetzt — Primary `<a href="https://generation-ai.org/join?utm_source=tools">Kostenlos registrieren</a>` + Secondary `<Link href="/login">Bereits Mitglied? Einloggen</Link>`. data-cta="primary-register" + data-cta="secondary-login" als stable Playwright-Selektoren. MIRROR sync-anchor Comment am File-Top zeigt auf website header (B-08). 2/5 Track B Playwright Tests gefüllt + grün (B-req-1 login, B-req-2 utm). Logo + Settings + Signout + Theme Toggle + Search + Legal alle untouched. Logged-in Branch unverändert (Phase 12/19 auth no regression). Build grün, 46/46 routes ƒ — commits 2d136b1, 3ce1cb2
**22.6-08 DONE (Track B Hero):** Neue `apps/tools-app/components/tools-hero.tsx` (57 LOC, text-only V1 per B-09) — 3-Zeilen Hero (Eyebrow `// deine ki-tool-bibliothek` + Geist Mono H1 `KI-Tools, kuratiert für dich.` mit `var(--fs-h1)` token + Sans-Body `Über 100 Tools…`). HomeLayout.tsx restructured: FilterBar in den `overflow-y-auto` Wrapper verschoben (Pitfall 2 mitigation — Hero+FilterBar+CardGrid scrollen zusammen, scroll-with-content per CONTEXT.md §B.2). useReducedMotion guard, Umlaute korrekt (für/Über). 3/5 Track B Playwright Tests grün (B-req-3 hero ergänzt). Build grün 46/46 ƒ. Plan 09 next: nav-mirror + eingeloggt regression — commits 252136d, 45ece78, 51ac6d0
**22.6-09 DONE (Track B Closer + Phase Done):** GlobalLayout.tsx Header-Block um 5-Items Desktop-Nav (Events · Tools active · Community · Für Partner · Über uns) + Mobile Burger Menu erweitert per Decision B-08 nav-mirror. Cross-domain hrefs als `<a>` (B-05 full page-load), aria-current="page" auf Tools (desktop + mobile). Mobile Burger nutzt simple useState + absolute panel anchored to header (`relative`), kein Dialog Primitive — schlanker und Zero new dependencies. CTAs in mobile panel guarded by `mode==='public'` (no CTAs für logged-in users, no Phase 12/19 regression). Plan 07 elements (sync-anchor MIRROR comment, data-cta selectors, utm_source=tools) alle preserved. Final 2 Playwright tests gefüllt (nav B-req-4 + eingeloggt B-req-5 mit graceful skip ohne TEST_USER_*-Env). 5/5 Track B tests grün lokal. Build grün 46/46 ƒ. Auto-approved checkpoint (--auto orchestrator flag): technische Verifikation Sticky-Nav (kein Drift, RESEARCH §9 bestätigt) + nav-mirror item-by-item grep dokumentiert in 22.6-09-SUMMARY.md. ⚠️ Threat flag: Website header.tsx fehlt noch der Events Item — Empfehlung kleiner Commit in Phase 27. Phase 22.6 = 9/9 DONE — commits 369b032, 88b96ad

**Key decision (22.6-09):** Mobile burger uses simple useState toggle + absolute-positioned panel anchored to `header className="relative …"` instead of @base-ui Dialog — keeps tools-app bundle lean (zero new deps), trades focus-trap + portal for simplicity. Header chrome uses brand-blue/brand-pink bg-bg-header → nav text-colors swapped to white/70 default + white hover (vs website's text-text-muted/text-text token-swap). Plan-Frontmatter's class strings were template suggestions; tools-app header background mandates inverted contrast.
**Working dir:** `/Users/lucaschweigmann/projects/generation-ai` (Hauptrepo, branch ist hier ausgecheckt)

**Key decision (22.6-05):** FrontmatterEntry has no `body` field — V1 slug page uses `frontmatter.description` as lede. MDX body rendering via @next/mdx deferred to Phase 28+.

**Key decision (22.6-06):** Separate `TOOLS_URL` env-var (not `E2E_BASE_URL`) entkoppelt tools-app spec von default Playwright baseURL — Plans 07-09 können tools-app gegen `localhost:3001` (Dev) oder `https://...preview.vercel.app` (CI) laufen lassen ohne andere Specs zu beeinflussen.

**Key decision (22.6-07):** Branching im GlobalLayout.tsx via existing `mode === 'public'` prop, NICHT via neuem `useAuth()` Import. Plan-Frontmatter hatte useAuth empfohlen, aber GlobalLayout nutzt bereits den `mode: ChatMode` prop (public = logged-out). Mode = single source-of-truth, kein Hydration-Risiko, kein Refactor. Sync-anchor MIRROR comment als V1-Alternative zu packages/ui Extraktion (B-08). data-cta-Attribute geben stable Selektoren für Plans 08+09.

**Key decision (22.6-08):** ToolsHero nutzt `--fs-h1` token (clamp 32→48px) NICHT `--fs-display` (clamp 40→76px) — UI-SPEC §Typography "tools-app hero specifics" sagt explizit `--fs-h1` für Inline-Heros (nicht full-viewport). Tools-app hero sitzt zwischen Header + FilterBar/Grid, nicht als full-viewport Subpage. `--fs-display` reserved für Subpage-Heros mit LabeledNodes-BG. FilterBar wurde in den `overflow-y-auto` Container verschoben (Pitfall 2 mitigation) → Trade-off dokumentiert: filterbar nicht mehr viewport-sticky, scroll-with-content per CONTEXT.md §B.2 V1-contract. Sticky kann später als 1-line className-change ergänzt werden falls gewünscht.

**Context für neue Session:**

- `.planning/phases/20.6-landing-sections-rebuild/20.6-CONTEXT.md` — aktualisiert mit D-09 (Problem-Block) + D-10 (Kurz-FAQ)
- `.planning/phases/20.6-landing-sections-rebuild/20.6-0{1..9}-PLAN.md` — 9 Skeleton-Plans
- `brand/Generation AI Design System/` — Design-System Nordstern (canonical)
- `apps/website/components/ui/signal-grid.tsx` — der Qualitäts-Maßstab für alle Sections
- `~/Downloads/Generation_AI_Website_Konzept.md` — Simons Konzept (April 2026) — strategische Quelle für alle Scope-Entscheidungen
- Dev-Server: `pnpm --filter @genai/website dev` (auf localhost:3000 oder :3001)

**Revidierte Roadmap-Reihenfolge (ab 2026-04-25, Call mit Simon/Janna):**

```
✅ 20.6 → ✅ 21 → ✅ 22 → ✅ 23 → ✅ 24 → ✅ 25 → ✅ 26 → ✅ 22.6 → ⏳ 20.6-01 (Lücken-Hero, separater Cycle) → ✅ 22.8 (UI-Konsistenz + Section-Refinement) → ⏳ 27 (Copy-Pass) → LAUNCH ~15.05
```

**Phase 22.8 ready für autonomous run (2026-04-25)** — CONTEXT + DISCUSSION-LOG mit allen Decisions vorab gemacht + Foundation-Plan-Skeletons (01+02) + Brand-Favicon-Assets liegen in `.planning/phases/22.8-ui-konsistenz-section-refinement/` + `brand/logos/favicons/`.

**22.8-01 DONE (2026-04-25):** DS-Compliance-Audit produced — `22.8-01-AUDIT.md` mit 24 findings (6 must / 11 should / 7 nice) clustered into 7 fix-types. Read-only audit, kein Code-Change. Cluster-Empfehlungen für Plan 22.8-02: Status-Pill primitive (5 hardcoded red/green in tools-app), Danger-Zone-Button, Logo-Hover spec (Logo.tsx hat keine), Card-Hover unification (3 competing scale/translate languages — Empfehlung: scale-[1.015] canonical), Form-Submit JS-Hover removal (JoinForm + PartnerContact), --color-destructive Token-Source-Fix, rounded-md/lg → rounded-full Standardisierung. Total estimated effort für Plan 02 (must+should): ~3.5-4h. Commit `945371e` auf `feature/phase-22.8-ui-konsistenz-section-refinement`.

**22.8-02 STOP-GATE (awaiting Luca):** Plan 02 ist `autonomous: false` + `status: depends-on-audit` — wurde korrekt nicht ausgeführt. Luca-Review von `22.8-01-AUDIT.md` (~10 min) entscheidet must/should/nice + offene Spec-Fragen (A-M05 Logo-Hover, A-S06/S07 Feature-Card, A-N06 Button-Scale-Variant), dann gsd-planner befüllt 02-PLAN konkrete Tasks → Execute Plan 02.

**22.8-02 DONE (2026-04-25):** Token-Source + Component-Compliance-Fix — 22 of 24 audit findings resolved at component-source / token level. 27 files modified, 1 NEW (`apps/tools-app/components/ui/StatusPill.tsx`). 5 atomic commits per cluster (fb88afd, 8fa30c9, 11539bb, 16982a8, c808061). Full `pnpm build` green. Foundation-First wins: Logo gets opt-in `interactive` prop · `--color-destructive` aliased to `var(--status-error)` (single source of truth) · canonical card-hover language unified across 8 cards (`scale(1.015)` + accent-glow + border-accent) · 8 onMouse* handlers replaced with Tailwind `hover:`/`active:` classes in form submits · 4 primary CTAs aligned to `rounded-full` · 2 button-hover-scale outliers 1.02 → 1.03. Deferred to BACKLOG: A-N04 (ChatInput stop-button glow needs new token), A-N07 (email template token-import refactor), 3 out-of-scope tools-app red-* spots discovered during execution (settings/page wrapper, auth/callback, GlobalLayout logout). Visual-smoke checkpoint auto-approved per orchestrator direction (auto-mode + Luca pre-approved scope) — Luca spot-check post-hoc on light-mode tools-app auth/settings flows.

**22.8-03 DONE (2026-04-25):** Favicon-Konsolidierung — Cross-domain Favicon-Parität via Next.js App Router File Convention. Beide Apps haben byte-identische Icons (`app/icon.svg` + `app/favicon.ico` + `app/apple-icon.png`) aus `brand/logos/favicons/`. Tools-app migriert auf Convention (expliziter `metadata.icons`-Block aus `apps/tools-app/app/layout.tsx` gestrippt). Tools-app OG-Image-Wechsel `/og-image-v2.png` → `/og-image-default.png` (kopiert aus `brand/logos/og-image-default.png`). 10 legacy `public/`-Files gelöscht (5 pro App). Schema.ts deviation-fix: JSON-LD `Organization.logo` + `Article.publisher.logo` URLs umgestellt von `/og-image.jpg` (gelöscht) → `/opengraph-image` (Phase 22.6 Track B canonical dynamic OG endpoint). Build green beide Apps, alle Page-Routes weiterhin `ƒ` (dynamic — CSP-Force-Dynamic-Regel unverletzt). Cross-app `diff -q` byte-identical confirmed. Visual cross-domain check (browser tab + iOS home screen + Slack/WhatsApp link preview) deferred to Luca post-Vercel-Promotion per D-14 (no Stop-Gate). Commits: b0116d1 (Task 1 website), ef7055d (Task 2 tools-app). **Phase 22.8 Foundation-Layer COMPLETE (3/3 Plans).**

**22.8-08 DONE (2026-04-26):** About Verein-Formular — `/about#verein` behält den bestehenden Verein-Textblock und ergänzt eine DS-konforme Form-Card. Neue Server-Action `submitVereinInquiry` validiert Name/E-Mail/Bereich, nutzt Honeypot und sendet Admin-Mail an `info@generation-ai.org`; Confirmation-Mail an Submitter ist best-effort analog Partner-Pattern. Neue React-Email-Templates in `@genai/emails`. Mitmach-CTA springt zu `#verein-form`, kein primärer `mailto:`-Flow mehr. `scroll-mt-28` verhindert fixed-header overlap bei direktem Anchor.

**22.8-09 DONE (2026-04-26):** About Timeline / Story-Scroll — `/about#story` rendert eine Timeline Februar/März/April/Mai 2026 mit Desktop-Progress-Line via `useScroll`/`useTransform`, Milestone-Reveals und statischem Reduced-Motion-Fallback. About-E2E erweitert um Timeline, Reduced-Motion, Formularvalidierung, CTA-Anchor und optionalen Resend-Submit-Smoke. Typecheck + build grün, About Playwright 15/15 grün gegen lokalen Production-Server.

**22.8-10 DONE (2026-04-26):** Test Fragetypen-Ausbau — bestehender Phase-24-Assessment-Code als Delta weitergebaut. Aktiver Fragenkatalog ersetzt durch 10 solide Launch-Defaults mit den 4 Widgettypen MC, Drag-Rank, Confidence-Slider und Matching. Test-Fragen-Re-Konzeption bleibt bewusst deferred. Rank kann initiale Reihenfolge bestätigen, Slider ist per Fokus/Number-Key bedienbar, Playwright-Smoke erzwingt alle 4 Widgettypen.

**22.8-11 DONE (2026-04-26):** Test Spider-Chart / Ergebnisseite — Assessment-Dimensionen auf 4 Achsen umgestellt (Tools / Prompting / Agents / Anwendung), `SkillRadarChart` nutzt `--accent-hover`, Result-Page erklärt das Vier-Achsen-Profil, Join-CTA serialisiert Skills in vierachsiger canonical order. Sitemap-Test auf bestehende Events-Einträge aktualisiert, React-Compiler-Lint-Blocker in `LabeledNodes` und `useAssessment` gefixt. Website Vitest 110/110, Typecheck, Lint, Build und `/test` Playwright 7/7 grün.

**Start-Kommando (sobald 22.6 + 26-UAT + 20.6-01 durch):**

```bash
git checkout develop && git pull
git checkout -b feature/phase-22.8-ui-konsistenz-section-refinement
/gsd-autonomous --only 22.8 --interactive
```

**Stop-Gates während Execute (nur 2):** 22.8-02 post-Audit-Review (~5 min) + 22.8-06 DB-Migration-Approval (~1 min). Sonst autonom durchlaufend. 09 (Timeline) und 12 (Auth-Refactor) sind autonomous mit Pre-Approval-Specs in DISCUSSION-LOG. Test-Fragen-Re-Konzeption (Lucas Kritik aus Call) ist DEFERRED — separater Pass nach 22.8-10 Tech-Build.

**22.6 Konsolidierung:** Phasen 22.5 (Events) + 22.7 (Tools-Polish) am 2026-04-25 zusammengelegt — verschiedene Apps, kein Konflikt-Risiko, ein Discuss/Plan/Execute-Cycle. Logo-Link-Fix war Drive-by im Phase-26-Merge bereits done.

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

### Phase 23 Progress

**Status:** DONE 2026-04-24. Waitlist V1 live-fähig (Backend bleibt 503 bis Phase 25, Waitlist-Insert + Confirmation-Mail laufen).

- Plan 23-01 DONE — Supabase `waitlist`-Table + RLS (service_role only) + TypeScript types in @genai/auth. Migration `supabase/migrations/20260424000001_waitlist.sql` via MCP applied.
- Plan 23-02 DONE — React-Email-Template `WaitlistConfirmationEmail` in @genai/emails (Blueprint: partner-inquiry-confirmation).
- Plan 23-03 DONE — Server-Action `submitJoinWaitlist` mit Zod-Validation + Upstash-Rate-Limit (5/15min/IP) + Supabase-Insert + Resend-Mail. Interface stabil für Phase 25 Swap (D-10).
- Plan 23-04 DONE — UniCombobox-Komponente + Universities-Liste (40 DE-Hochschulen + 4 Fallback-Options). ARIA-combobox-Pattern, Keyboard-Nav, Freitext-Accept.
- Plan 23-05 DONE — /join Route komplett: Server-Component + Client-Wrapper + Hero (`min-h-[60vh]`) + Form-Card + Success-Card mit Inline-Swap. Unterseiten-Blueprint-konform. CSP/Nonce intakt.
- Plan 23-06 DONE — Sitemap-Eintrag `/join` (priority 0.8, changeFrequency monthly), Playwright-Smoke `join.spec.ts` mit 10 Testcases (loads, hero, form fields, email error, consent error, uni free-text, uni keyboard nav, redirect_after, valid submit swap, sessionStorage reload R4.7, CSP). Lighthouse /join: Perf 87⚠️ / A11y 95 / BP 100 / SEO 100. STATE.md updated.

**Requirements completed:** R4.1, R4.2, R4.3, R4.4, R4.5, R4.6, R4.7, R4.8 (alle R4.*) — R4.1–R4.4 als-revidiert umgesetzt (Single-Page Waitlist statt Multi-Step-Wizard, per D-17/D-18/D-15/D-01).

**Offen (bewusst, Phase 25):**

- Live-Signup bleibt 503 (D-01, Luca-Go abhängig)
- Assessment-CTA verlinkt auf `/test` (404 bis Phase 24 die Seite baut)
- Phase 25 swapped Waitlist-Insert gegen echten Supabase-Signup + Circle-API-Sync
- Lighthouse Performance 87 (LCP 3.6s lokal) — erwartet höher auf Vercel CDN; kein Blocking-Issue

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
