# Project — Generation AI Monorepo

## Vision

Ein Monorepo das alle Generation AI Web-Projekte vereint: website, tools-app, und zukünftige Services. Shared packages für Code der in mehreren Apps genutzt wird. Turborepo für Build-Orchestrierung, pnpm für Package Management.

## Problem

Aktuell existieren zwei separate GitHub Repos:
- `Generation-AI-Org/generation-ai-website` — Landing Page, Sign-up
- `Generation-AI-Org/generation-ai-tools-app` — KI-Tool-Bibliothek, Chat

**Probleme mit separaten Repos:**
- Doppelter Code (Supabase Client, Auth-Logic, Types)
- Dependency-Drift (unterschiedliche Versionen)
- Kein atomares Deployment bei cross-cutting changes
- Mehr Overhead bei neuen Services

## Solution

Monorepo mit Turborepo + pnpm:

```
generation-ai/
├── apps/
│   ├── website/          ← Next.js 16
│   └── tools-app/        ← Next.js 16
├── packages/
│   ├── auth/             ← Supabase Client, Session Helpers
│   ├── ui/               ← Shared Components (optional)
│   ├── types/            ← Shared TypeScript Types
│   └── config/           ← Tailwind, ESLint, TSConfig
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Success Criteria

1. **Beide Apps laufen lokal** — `pnpm dev` startet beide
2. **Beide Apps deployen** — Vercel Projects zeigen aufs Monorepo
3. **Shared packages funktionieren** — Apps importieren von `@genai/*`
4. **Nichts ist kaputt** — Alle existierenden Features funktionieren
5. **Alte Repos archiviert** — Sauberer Übergang

## Constraints

- **Kein Downtime** — Apps müssen während Migration erreichbar bleiben
- **Parallel aufbauen** — Neues Repo neben alten, erst umschalten wenn alles funktioniert
- **Git History** — Geht verloren (akzeptiert, Apps sind jung)

## Context

- **Owner:** Luca Schweigmann (Tech Lead)
- **Org:** Generation AI (Student KI Community DACH)
- **Live URLs:**
  - https://generation-ai.org (Website)
  - https://tools.generation-ai.org (tools-app)
- **Shared Supabase:** wbohulnuwqrhystaamjc.supabase.co

## Tech Stack

- Next.js 16, React 19
- Tailwind v4
- Supabase (Auth + DB)
- Turborepo + pnpm
- Vercel (Hosting)

## Out of Scope (für diese Migration)

- Neue Features (Assessment, Blog, etc.) — kommt nach Migration
- Circle-Integration
- Content-System
