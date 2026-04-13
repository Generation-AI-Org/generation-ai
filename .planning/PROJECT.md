# Project — Generation AI Monorepo

## Vision

Ein Monorepo das alle Generation AI Web-Projekte vereint: website, tools-app, und zukünftige Services. Shared packages für Code der in mehreren Apps genutzt wird. Turborepo für Build-Orchestrierung, pnpm für Package Management.

## Current Milestone: v2.0 Production Hardening

**Goal:** Apps production-ready und professional-grade machen.

**Scope:**
- Security Headers (HSTS, CSP)
- DSGVO/Legal Compliance (DPAs, Account Delete)
- Error Tracking & Monitoring (Sentry, Better Stack)
- Testing Infrastructure (Vitest, Playwright, CI)
- Performance & Accessibility

Siehe `REQUIREMENTS.md` für Details, `ROADMAP.md` für Phasen.

---

## Completed Milestones

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
