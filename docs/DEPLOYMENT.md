# Deployment — Generation AI

> Deploy-Anleitung und Environment Variables fuer Claude Code.

---

## Vercel Projekte

| App | Project Name | Domain | Root Directory |
|-----|--------------|--------|----------------|
| website | `website` | generation-ai.org | `apps/website` |
| tools-app | `tools-app` | tools.generation-ai.org | `apps/tools-app` |

Beide Projekte sind im selben Vercel Team und connected zum GitHub Repo.

---

## Deploy-Flow

### Automatisch (Git Push)

```
git push origin main
    │
    ├─► Vercel: website Build
    │   └─► generation-ai.org
    │
    └─► Vercel: tools-app Build
        └─► tools.generation-ai.org
```

Beide Apps werden parallel gebaut.

### Manuell (Preview)

```bash
# Aus Monorepo-Root
cd apps/website && vercel
cd apps/tools-app && vercel
```

### Production Deploy

```bash
# NUR nach Absprache mit Luca!
cd apps/website && vercel --prod
cd apps/tools-app && vercel --prod
```

---

## Environment Variables

### Shared (beide Apps)

| Variable | Beschreibung | Wo setzen |
|----------|--------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Vercel + .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin Key | NUR Vercel (secret) |

### tools-app spezifisch

| Variable | Beschreibung | Wo setzen |
|----------|--------------|-----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API Key | Vercel + .env.local |
| `ANTHROPIC_API_KEY` | Claude API (aktuell unused) | Vercel |
| `EXA_API_KEY` | Exa Web Search | Vercel + .env.local |
| `UPSTASH_REDIS_REST_URL` | Redis URL fuer Rate Limiting | Vercel + .env.local |
| `UPSTASH_REDIS_REST_TOKEN` | Redis Token | Vercel + .env.local |
| `SENTRY_DSN` | Sentry Error Tracking | Vercel |
| `SENTRY_AUTH_TOKEN` | Sentry Build Upload | Vercel |

### website spezifisch

| Variable | Beschreibung | Wo setzen |
|----------|--------------|-----------|
| `RESEND_API_KEY` | Email fuer Magic Links | Vercel |
| `CIRCLE_API_TOKEN` | Circle.so API | Vercel |
| `CIRCLE_COMMUNITY_ID` | Circle Community ID | Vercel |
| `CIRCLE_COMMUNITY_URL` | Circle URL | Vercel |

### Circle-API-Sync (Phase 25)

Fünf Env-Vars steuern Circle-Provisioning + Signup-Gate:

| Variable | Wert | Scope | Wo setzen |
|----------|------|-------|-----------|
| `CIRCLE_API_TOKEN` | Circle Admin-API-Bearer-Token | prod + preview + dev | Circle → Settings → Developer → Generate Token |
| `CIRCLE_COMMUNITY_ID` | `511295` (GenerationAI) | prod + preview + dev | Circle-MCP `get_community` oder Admin-UI |
| `CIRCLE_DEFAULT_SPACE_ID` | `2574363` (How to — Circle's `default_new_member_space_id`) | prod + preview + dev | Circle-MCP `list_spaces` |
| `CIRCLE_COMMUNITY_URL` | `https://community.generation-ai.org` | prod + preview + dev | Bekannt |
| `SIGNUP_ENABLED` | `true` oder `false` (Default `false`) | **prod nur** (preview + dev = `true` für Tests) | Vercel-Dashboard, Phase 27 flip |

**Setup-Kommandos** (via Vercel-CLI oder `mcp__vercel__*`):

```bash
# Prod (alle 4 ausser SIGNUP_ENABLED kriegen echte Werte)
vercel env add CIRCLE_API_TOKEN production
vercel env add CIRCLE_COMMUNITY_ID production       # 511295
vercel env add CIRCLE_DEFAULT_SPACE_ID production   # 2574363
vercel env add CIRCLE_COMMUNITY_URL production      # https://community.generation-ai.org
# SIGNUP_ENABLED bleibt bei false bis Phase 27

# Preview + Development mit SIGNUP_ENABLED=true für E2E-Tests
vercel env add SIGNUP_ENABLED preview       # true
vercel env add SIGNUP_ENABLED development   # true
```

**Rotation:**
- `CIRCLE_API_TOKEN`: Circle-Admin → alten Token revoken → neuen generieren → in Vercel + lokal `.env.local` updaten → Deploy triggern.
- `CIRCLE_DEFAULT_SPACE_ID`: Wenn Welcome-Space umgezogen wird, Var updaten + Redeploy. Nicht breaking — nur neue Members landen anderswo.

**Signup-Reactivation-Gate (Q11):**
Die `SIGNUP_ENABLED=false`-Default stellt sicher, dass `/api/auth/signup` nach Phase 25 weiterhin 503 returnt. In Phase 27 wird die Var in Prod auf `true` gesetzt — dann läuft der unified signup live. Keine Code-Änderung nötig zum Live-Schalten.

---

## Lokale Entwicklung

### Setup

```bash
# 1. Repo klonen
git clone git@github.com:Generation-AI-Org/generation-ai.git
cd generation-ai

# 2. Dependencies installieren
pnpm install

# 3. Env-Files erstellen
cp apps/tools-app/.env.example apps/tools-app/.env.local
cp apps/website/.env.example apps/website/.env.local
# → Werte eintragen (siehe Supabase Dashboard, Vercel Dashboard)

# 4. Dev-Server starten
pnpm dev           # Beide Apps
pnpm dev:website   # Nur Website
pnpm dev:tools     # Nur tools-app
```

### Ports

- Website: http://localhost:3000
- tools-app: http://localhost:3001

---

## Build & Test

```bash
# Alle Apps bauen
pnpm build

# Type-Check
pnpm lint

# Unit Tests
pnpm test

# E2E Tests (braucht laufende App)
pnpm e2e
```

---

## Turborepo

turbo.json definiert Task-Dependencies:

```
build → dependsOn: ^build (packages first)
test → dependsOn: ^build
e2e → dependsOn: ^build
dev → no cache, persistent
```

Environment Variables werden via `globalPassThroughEnv` durchgereicht.

---

## Supabase

### Dashboard

https://supabase.com/dashboard/project/wbohulnuwqrhystaamjc

### Schema Updates

```bash
# SQL im Supabase SQL Editor ausfuehren
# Dateien liegen in:
apps/tools-app/supabase/schema.sql      # Haupt-Schema
apps/tools-app/supabase/seed.sql        # Content Seed
apps/website/supabase/profiles.sql      # Profiles Table
```

### RLS Policies

Alle Policies sind in `schema.sql` definiert. Wichtig:
- `content_items`: Nur published lesbar
- `chat_sessions/messages`: Hybrid (NULL = public, user_id = private)

---

## Monitoring

### Sentry (Error Tracking)

- Dashboard: https://sentry.io
- Projekt: generation-ai-tools-app
- Config: `apps/tools-app/sentry.*.config.ts`

### Better Stack (Uptime)

- Dashboard: https://uptime.betterstack.com
- Monitore:
  - https://generation-ai.org
  - https://tools.generation-ai.org
  - https://tools.generation-ai.org/api/health

---

## Domains

Alle Domains sind bei Vercel konfiguriert:

| Domain | App | SSL |
|--------|-----|-----|
| generation-ai.org | website | Auto |
| www.generation-ai.org | → generation-ai.org | Redirect |
| tools.generation-ai.org | tools-app | Auto |
| community.generation-ai.org | Circle.so | Circle |

Cookie-Domain fuer Auth: `.generation-ai.org`

---

## Checkliste vor Production Deploy

1. [ ] Alle Tests gruen (`pnpm test`)
2. [ ] Build erfolgreich (`pnpm build`)
3. [ ] Preview Deploy getestet
4. [ ] Env-Vars in Vercel aktuell
5. [ ] Luca informiert

---

## Rollback

```bash
# Vercel Dashboard → Deployments → "..." → Promote to Production

# Oder via CLI
vercel rollback
```

---

## Troubleshooting

### Build Failed: ESM/CJS Conflict

```bash
# Node Modules neu installieren
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Supabase Auth funktioniert nicht lokal

- Cookie-Domain check: Lokal ist es `localhost`, nicht `.generation-ai.org`
- CORS: Supabase erlaubt localhost:3000/3001

### Rate Limit lokal testen

Upstash funktioniert auch lokal wenn `.env.local` korrekt ist.

---

*Letzte Aktualisierung: 2026-04-14*
