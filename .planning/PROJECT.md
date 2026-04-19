# Project — Generation AI Monorepo

## Vision

Ein Monorepo das alle Generation AI Web-Projekte vereint: website, tools-app, und zukünftige Services. Shared packages für Code der in mehreren Apps genutzt wird. Turborepo für Build-Orchestrierung, pnpm für Package Management.

## Current Milestone: v4.0 Website Conversion-Layer & Onboarding-Funnel

**Goal:** Website vom One-Pager-Intro zum Conversion-Entry-Point umbauen — klarer Funnel Richtung Mitgliedschaft als Basis für Fördermitglieder-Wachstum und Partner-Ansprache.

**Target Features:**
- Navigation-Redesign + Landing-Umbau (Hero, Diskrepanz-Viz, 4-Card-Angebot, Tool-Showcase, Community-Preview, Zielgruppen-Split, Trust, Final-CTA)
- `/about` — Mission, Team, Sparringspartner, Verein
- `/partner` — 3 Anker-Sections (Unternehmen, Stiftungen, Hochschulen) + Lead-Capture
- `/join` — linearer Fragebogen-Flow (Self-Select Level) mit Backend-Stub (503)
- `/level-test` — optionales Assessment, überschreibt Self-Select
- **Circle-API-Sync (Unified Signup)** — eine Mail statt zwei: unser Backend legt Circle-Member via API an + bettet SSO-Link in Welcome-Flow ein (User ist nach unserem Confirm in Circle schon eingeloggt)
- Subdomain-Integration — Featured-Tools API, Community-Preview via Circle API

**Out-of-Scope (explizit):** Signup-Live-Reaktivierung (503 bleibt bis Luca-Go), Payment, Kurs-CMS, Multi-Modell in tools-app, Brand-Polish, finale Claim-Wording.

Siehe `REQUIREMENTS.md` für Details, `ROADMAP.md` für Phasen.

---

## Completed Milestones

### v3.0: UX Polish & Feature Expansion ✅
*Completed: 2026-04-19*

Auf gehärteter v2.0-Basis UX geschärft und Auth/Test-Baseline fertig gemacht:
- Phase 14 — Mobile Polish (Chat-Input Auto-Resize, Mobile Footer, Micro-Animations-Parity)
- Phase 15 — Chat überall + Context-aware (GlobalLayout, Desktop-Sidebar-Mode, Tool-Kontext)
- Phase 16 — Brand System Foundation (Radix Colors, Geist Mono/Sans, `<Logo />` 11 Varianten)
- Phase 17 — Auth Extensions (6 Supabase-Email-Templates auf React Email)
- Phase 18 — Simplify-Pass tools-app (−1.587 LOC, 9 Files raus, 4 Deps raus, knip etabliert)
- Phase 19 — Password-Flow + Test-Baseline (First-Login-Prompt, Settings-Section, E2E-Prod-Baseline, CI-Secrets)

**Outcomes:** Release v4.3.0 (Brand), v4.3.x Patches (Auth-Templates, Simplify), v4.4.0 (Password-Flow).

---

### v2.0: Production Hardening ✅
*Completed: 2026-04-17 (Release v4.1.0)*

Apps production-ready gemacht:
- Phase 4 — DSGVO & Legal (Impressum, Datenschutz, Account-Delete)
- Phase 5 — Security Headers (CSP A+ via proxy.ts nonce)
- Phase 7 — Testing (Vitest + Playwright, CI)
- Phase 8 — Performance & A11y (Lighthouse > 90, WCAG 2.1 AA)
- Phase 9-11 — Floating Chat + Voice-Prep + Performance-Polish
- Phase 12 — Auth Rewrite (@genai/auth canonical, Session-Drop-Fix)
- Phase 13 — Auth-Flow-Audit + CSP enforced

---

### v1.0: Monorepo Migration ✅
*Completed: 2026-04-14*

Zwei separate Repos in ein Monorepo zusammengeführt:
- Website + tools-app migriert
- Shared packages: @genai/auth, @genai/types, @genai/config
- Vercel umgestellt, alte Repos archiviert

---

## Context

- **Owner:** Luca Schweigmann (Tech Lead)
- **Org:** Generation AI (Student KI Community DACH)
- **Live URLs:**
  - https://generation-ai.org (Website)
  - https://tools.generation-ai.org (tools-app)
- **GitHub:** https://github.com/Generation-AI-Org/generation-ai
- **Shared Supabase:** wbohulnuwqrhystaamjc.supabase.co

## Tech Stack

- Next.js 16, React 19
- Tailwind v4
- Supabase (Auth + DB)
- Turborepo + pnpm
- Vercel (Hosting)

## Structure

```
generation-ai/
├── apps/
│   ├── website/          ← Next.js 16, Landing + Sign-up
│   └── tools-app/        ← Next.js 16, Bibliothek + Chat
├── packages/
│   ├── auth/             ← Supabase Client, Session Helpers
│   ├── types/            ← Shared TypeScript Types
│   └── config/           ← Tailwind, ESLint, TSConfig
├── .planning/            ← GSD Artefakte
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```
