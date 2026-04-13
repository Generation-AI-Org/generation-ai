# Roadmap — Generation AI Monorepo

## Overview

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 1 | App Migration | Beide Apps im Monorepo lauffähig | R-01, R-02, R-03, N-01 |
| 2 | Shared Packages | Code-Sharing über packages/ | R-04, R-05, R-06, N-02, N-03 |
| 3 | Deploy & Archive | Live auf neuem Repo, alte archiviert | R-07, R-08, N-04 |

---

## Phase 1: App Migration

**Goal:** Website und tools-app Code ins Monorepo kopieren, beide Apps laufen lokal.

**Scope:**
- Website-Code nach `apps/website/` kopieren
- tools-app-Code nach `apps/tools-app/` kopieren
- package.json für beide Apps anpassen (name, scripts)
- pnpm install, lokale .env files
- `pnpm dev` startet beide Apps

**Success Criteria:**
- [ ] `pnpm dev:website` → localhost:3000 zeigt Website
- [ ] `pnpm dev:tools` → localhost:3001 zeigt tools-app
- [ ] Alle existierenden Features funktionieren

**Deliverables:**
- `apps/website/` mit vollständigem Code
- `apps/tools-app/` mit vollständigem Code
- Funktionierende lokale Dev-Umgebung

---

## Phase 2: Shared Packages

**Goal:** Gemeinsamen Code in packages/ extrahieren, Apps importieren von `@genai/*`.

**Scope:**
- `packages/auth/` — Supabase createClient, Session Helpers
- `packages/types/` — User, Profile, Content Types
- `packages/config/` — Tailwind preset, ESLint config, TSConfig base
- Apps auf package-imports umstellen
- Package-übergreifende Builds mit Turborepo

**Success Criteria:**
- [ ] `@genai/auth` exportiert createClient, createAdminClient
- [ ] `@genai/types` exportiert User, Profile Types
- [ ] Beide Apps importieren erfolgreich von packages
- [ ] `pnpm build` baut alles in richtiger Reihenfolge

**Deliverables:**
- `packages/auth/`
- `packages/types/`
- `packages/config/`
- Aktualisierte app imports

---

## Phase 3: Deploy & Archive

**Goal:** Neues GitHub Repo live, Vercel umkonfiguriert, alte Repos archiviert.

**Scope:**
- GitHub Repo `Generation-AI-Org/generation-ai` erstellen
- Code pushen
- Vercel Website Project → Root Directory `apps/website`
- Vercel tools-app Project → Root Directory `apps/tools-app`
- Environment Variables übertragen
- Production testen
- Alte Repos archivieren (read-only)

**Success Criteria:**
- [ ] https://generation-ai.org deployt vom neuen Repo
- [ ] https://tools.generation-ai.org deployt vom neuen Repo
- [ ] Alle Features funktionieren auf Production
- [ ] Alte Repos sind archived auf GitHub

**Deliverables:**
- Live Monorepo Deployment
- Archivierte Legacy Repos
- Aktualisierte MIGRATION.md

---

## Timeline

Geschätzt 1-2 Tage für alle Phasen bei fokussierter Arbeit.

---

*Erstellt: 2026-04-13*
