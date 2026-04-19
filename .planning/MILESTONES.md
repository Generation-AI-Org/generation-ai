# Milestones — Generation AI Monorepo

## Completed Milestones

### v1.0: Monorepo Migration ✅
*Completed: 2026-04-14*

**Goal:** Zwei separate Repos in ein Monorepo zusammenführen.

**Delivered:**
- Phase 1: App Migration — Website + tools-app ins Monorepo kopiert
- Phase 2: Shared Packages — @genai/auth, @genai/types, @genai/config
- Phase 3: Deploy & Archive — Vercel umgestellt, alte Repos archiviert

**Outcomes:**
- Beide Apps laufen vom Monorepo
- Shared code eliminiert Duplikation
- pnpm catalog für Dependency Consistency
- https://generation-ai.org ✅
- https://tools.generation-ai.org ✅

---

### v2.0: Production Hardening ✅
*Completed: 2026-04-17 (Release v4.1.0)*

**Goal:** Apps production-ready und professional-grade machen.

**Delivered:**
- Phase 4: DSGVO & Legal (Impressum, Datenschutz, Account-Delete)
- Phase 5: Security Headers (CSP A+ via proxy.ts nonce, beide Apps)
- Phase 7: Testing (Vitest + Playwright E2E, 24/24 tests grün, GitHub Actions CI)
- Phase 8: Performance & A11y (Lighthouse > 90, WCAG 2.1 AA)
- Phase 9-11: Floating Chat Bubble + Voice-Prep + Performance Polish
- Phase 12: Auth Rewrite (@genai/auth, Session-Drop-Fix)
- Phase 13: Auth-Flow-Audit + CSP Enforced (Mermaid docs, E2E-Audit)

**Carried-over to backlog (brauchen externe Accounts):**
- Sentry Error Tracking (Account + DSN)
- Better Stack Uptime (Account)
- Resend/Vercel DPA-Docs

---

### v3.0: UX Polish & Feature Expansion ✅
*Completed: 2026-04-19 (Releases v4.2.0, v4.3.0, v4.3.x, v4.4.0)*

**Goal:** Auf gehärteter v2.0-Basis die UX schärfen — Mobile-Polish, globaler Chat mit Kontext, Brand System, Auth-Polish.

**Delivered:**
- Phase 14 — Mobile Polish (Chat-Input Auto-Resize, Mobile Footer, Micro-Animations-Parity)
- Phase 15 — Chat überall + Context-aware (GlobalLayout, Desktop-Sidebar-Mode, Tool-Kontext)
- Phase 16 — Brand System Foundation (Radix Colors, Geist Mono/Sans, `<Logo />` 11 Varianten, visual-regression verifiziert)
- Phase 17 — Auth Extensions (6 Supabase-Email-Templates auf React Email, Brand-Tokens inline, Gravatar-Avatar)
- Phase 18 — Simplify-Pass tools-app (−1.587 LOC, 9 Files raus, 4 Deps raus, knip als Monorepo-Orphan-Tool etabliert)
- Phase 19 — Password-Flow + Test-Baseline (First-Login-Prompt mit Skip, Settings-Section mit Re-Auth, E2E-Prod-Baseline + CI-Secrets)

**Outcomes:**
- Minor Release v4.2.0 (Chat überall), v4.3.0 (Brand), v4.4.0 (Password-Flow)
- Patches v4.3.x (Auth-Templates, Simplify)
- E2E-Tests laufen gegen Prod mit real Test-User via GH-Secrets
- Design-System als Code (brand/tokens.json + packages/config + packages/ui)

**Carried-over:** OAuth Google + Apple → BACKLOG (v4.1+ oder später).

---

## Current Milestone

### v4.0: Website Conversion-Layer & Onboarding-Funnel (In Progress)
*Started: 2026-04-19*

**Goal:** Website (generation-ai.org) vom One-Pager-Intro zum Conversion-Entry-Point umbauen — klarer Funnel Richtung Mitgliedschaft. Basis für Fördermitglieder-Wachstum und Partner-Ansprache.

**Target Features:**
- Navigation-Redesign + Landing-Umbau (Hero, Diskrepanz-Viz, 4-Card-Angebot, Tool-Showcase, Community-Preview, Zielgruppen-Split, Trust, Final-CTA)
- `/about` — Mission, Team, Sparringspartner, Verein
- `/partner` — 3 Anker-Sections (Unternehmen, Stiftungen, Hochschulen) + Lead-Capture
- `/join` — linearer Fragebogen-Flow mit Self-Select Level (Backend-Stub 503 bis Luca-Go)
- `/level-test` — optionales Assessment, überschreibt Self-Select
- **Circle-API-Sync (Unified Signup)** — Circle-Member via API + SSO-Link in Welcome-Flow → eine Mail statt zwei, kein Circle-Doppel-Signup
- Subdomain-Integration — Featured-Tools API + Community-Preview via Circle API

**Out-of-Scope:** Signup-Live-Reaktivierung, Payment, Kurs-CMS, 2FA, finale Claim-Wording.

**Scope-Dokument:** `.planning/research/v4-scoping/SCOPE.md` (Sparring-Session 2026-04-19).

**Phases:** 20-26 (siehe ROADMAP.md).

---

## Future Milestones (Ideas)

- **v4.1:** OAuth Google + Apple (Circle-Member-Auto-Detection)
- **v4.5:** Content System (Tool-Card-Previews, volle Detail-Artikel)
- **v5.0:** 2FA + Security-Hardening (httpOnly cookies, Account-Delete-Verification)
