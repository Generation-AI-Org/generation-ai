# Tech Stack — Generation AI

> Konsolidierte Tech-Entscheidungen.

---

## Stack

| Layer | Technologie | Begründung |
|-------|-------------|------------|
| Framework | Next.js 16 (App Router) | Full-Stack, ein Repo, Vercel-optimiert |
| UI | React 19 + Tailwind v4 | Modern, performant, keine Runtime |
| Auth | Supabase | Postgres + Auth + Realtime, Free Tier |
| Email | Resend | Bessere Deliverability als Supabase built-in |
| Community | Circle.so | Spaces, Kurse, Events, API |
| LLM | Claude API (Anthropic) | Qualität, serverseitig |
| Hosting | Vercel | Free Tier, Edge, Preview Deploys |
| Monorepo | Turborepo + pnpm | Shared packages, caching |

---

## Key Decisions

### Circle.so statt Discord
- Vollständige Community-Plattform
- Spaces, Kurse, Events an einem Ort
- API für Automationen

### Tool-Directory als eigene App
- Circle Topics sind Single-Select
- Keine Multi-Filter möglich
- Eigene App (tools.generation-ai.org) mit Supabase

### Full-Context statt RAG
- Alle Items als Context injizieren
- Skaliert bis ~500 Items
- Kein Vektor-DB-Overhead

### Supabase Dashboard als CMS
- Kein eigenes Admin-Panel in V1
- Später optional Bulk-Import

---

## Domains

| Domain | App |
|--------|-----|
| generation-ai.org | Website (Landing, Sign-up) |
| tools.generation-ai.org | tools-app (Bibliothek, Chat) |
| community.generation-ai.org | Circle Community |

---

*Konsolidiert aus GenerationAI/Decisions/Tech-Decisions-Log.md*
