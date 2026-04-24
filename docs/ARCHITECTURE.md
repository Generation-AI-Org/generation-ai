# System-Architektur — Generation AI

> Zentrale Dokumentation fuer Claude Code. Diese Datei am Anfang jeder Session lesen.

---

## Das grosse Bild

```
                          ┌─────────────────────────────────────┐
                          │           CIRCLE.SO                │
                          │    community.generation-ai.org     │
                          │                                    │
                          │  - Community Spaces                │
                          │  - Kurse & Events                  │
                          │  - Diskussionen                    │
                          │                                    │
                          │  >>> DAS ZENTRUM <<<               │
                          └─────────────────────────────────────┘
                                         ▲
                                         │ Soft SSO
                                         │ (gleiche Email)
                                         │
┌─────────────────────────────────────────┼─────────────────────────────────────────┐
│                                         │                                         │
│  ┌─────────────────────────┐           │           ┌─────────────────────────┐   │
│  │       WEBSITE           │           │           │      TOOLS-APP          │   │
│  │  generation-ai.org      │───────────┴───────────│ tools.generation-ai.org │   │
│  │                         │    Shared Supabase    │                         │   │
│  │  - Landing Page         │    Cookie Domain:     │  - KI-Tool-Bibliothek   │   │
│  │  - Sign-up Flow         │   .generation-ai.org  │  - Chat-Assistent       │   │
│  │  - Legal Pages          │                       │  - Account Settings     │   │
│  └─────────────────────────┘                       └─────────────────────────┘   │
│           │                                                   │                   │
│           │                                                   │                   │
│           ▼                                                   ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           SUPABASE                                          │ │
│  │                   wbohulnuwqrhystaamjc.supabase.co                          │ │
│  │                                                                             │ │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │   │  auth.users  │  │   profiles   │  │content_items │  │chat_sessions │   │ │
│  │   │              │  │              │  │              │  │chat_messages │   │ │
│  │   │  Identitaet  │  │  User-Daten  │  │ KB Content   │  │ Chat-History │   │ │
│  │   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│                            MONOREPO (generation-ai/)                              │
└───────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         │
                                         ▼
                          ┌─────────────────────────────────────┐
                          │         EXTERNE SERVICES            │
                          │                                     │
                          │  - Gemini 3 Flash (Chat Agent)      │
                          │  - Exa API (Web-Recherche)          │
                          │  - Upstash Redis (Rate Limiting)    │
                          │  - Resend (Transactional Email)     │
                          │  - Sentry (Error Tracking)          │
                          │  - Better Stack (Uptime Monitoring) │
                          └─────────────────────────────────────┘
```

---

## Kern-Konzept: Circle ist das Zentrum

**Circle.so** ist die Hauptplattform — dort findet die Community statt.

Website und tools-app sind **Satellites**:
- **Website** = Einstiegspunkt (Sign-up, Info)
- **tools-app** = Zusatz-Tool (KI-Bibliothek, Chat)

Beide verweisen User nach Circle fuer Community-Interaktion.

---

## Auth-Architektur: "Soft SSO"

Keine echte Single Sign-On, aber gleiche Email verknuepft Identitaeten.

```
┌───────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH                            │
│                 (Zentrale Identity-Quelle)                    │
└───────────────────────────────────────────────────────────────┘
         │                    │                      │
         │ ERSTELLT           │ LIEST                │ SYNC
         │ Accounts           │ Sessions             │ (via API)
         ▼                    ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     WEBSITE      │  │    TOOLS-APP     │  │      CIRCLE      │
│                  │  │                  │  │                  │
│ Supabase Auth    │  │ Supabase Auth    │  │ Circle Auth      │
│ (erstellt User)  │  │ (liest Session)  │  │ (eigene Session) │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Sign-up Flow (Phase 25 — Feature-flagged via `SIGNUP_ENABLED`)

Default `SIGNUP_ENABLED=false` → `/api/auth/signup` returnt 503 und der Join-Router delegiert an die V1-Waitlist. Bei `SIGNUP_ENABLED=true` (Phase 27 Go-Live):

1. User auf `/join`, Form ausfüllen (Email, Name, Uni, Consent)
2. Server-Action `submitJoinSignup`:
   a. Honeypot + Rate-Limit
   b. `admin.createUser({ email_confirm:false, user_metadata:{...flow-data, has_password:false} })` mit random placeholder password
   c. `createMember` + `addMemberToSpace` via `@genai/circle` (non-blocking, D-03)
   d. Upsert `user_circle_links` + Stamp `circle_member_id` in user_metadata
   e. `admin.generateLink({ type:'magiclink' })` triggert die Confirm-Mail via Supabase-SMTP
3. User öffnet Mail, klickt "Loslegen →"
4. Route `/auth/confirm`: verifyOtp → liest `circle_member_id` → `generateSsoUrl` → 303-Redirect zur Circle-Community
5. Circle-SSO aktiv, User ist eingeloggt

**Fallback** wenn Circle zur Signup-Zeit down war: User landet nach Confirm auf `/welcome?circle=pending` mit manuellem Community-Link. Admin kann via `POST /api/admin/circle-reprovision` nachträglich provisionieren.

### Session-Sharing

- Cookie-Domain: `.generation-ai.org`
- Alle Subdomains koennen Session lesen
- Middleware prueft Session in jeder App

> Detaillierte Auth-Flows, Mermaid-Sequenzdiagramme aller 6 Pfade und Findings aus dem Phase-13-Audit: siehe [docs/AUTH-FLOW.md](./AUTH-FLOW.md).

---

## Datenbank-Schema

### Supabase Tables

```
┌─────────────────────────────────────────────────────────────────────┐
│  auth.users (Supabase Built-in)                                    │
│  - id (uuid)                                                        │
│  - email                                                            │
│  - created_at                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  profiles                                                           │
│  - id (uuid, FK → auth.users)                                       │
│  - email, full_name                                                 │
│  - university, study_field                                          │
│  - ki_level (1-5)                                                   │
│  - interests (text[])                                               │
│  - questionnaire_answers (jsonb)                                    │
│  - circle_member_id (integer)                                       │
│  - created_at, updated_at                                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  content_items (Knowledge Base)                                     │
│  - id (uuid)                                                        │
│  - type: 'tool' | 'guide' | 'faq'                                   │
│  - status: 'draft' | 'published' | 'archived'                       │
│  - title, slug (unique), summary, content                           │
│  - category, tags (text[]), use_cases (text[])                      │
│  - pricing_model: 'free' | 'freemium' | 'paid' | 'open_source'      │
│  - external_url, logo_domain, quick_win                             │
│  - created_at, updated_at                                           │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N (via user_id, optional)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  chat_sessions                                                      │
│  - id (uuid)                                                        │
│  - user_id (uuid, FK → auth.users, NULL = anonym/public)            │
│  - metadata (jsonb)                                                 │
│  - created_at, updated_at                                           │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  chat_messages                                                      │
│  - id (uuid)                                                        │
│  - session_id (uuid, FK → chat_sessions, CASCADE)                   │
│  - user_id (uuid, FK → auth.users, denormalized for RLS)            │
│  - role: 'user' | 'assistant'                                       │
│  - content (text)                                                   │
│  - recommended_slugs (text[])                                       │
│  - created_at                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase 25 Additions: user_circle_links

```
┌─────────────────────────────────────────────────────────────────────┐
│  user_circle_links                                                 │
│  - user_id (uuid, PK, FK → auth.users ON DELETE CASCADE)           │
│  - circle_member_id (text, unique)                                 │
│  - circle_provisioned_at (timestamptz, null)                       │
│  - last_error, last_error_at                                       │
│  - created_at                                                       │
│  RLS: service_role only. anon/authenticated grants revoked.        │
└─────────────────────────────────────────────────────────────────────┘
```

`raw_user_meta_data.circle_member_id` on `auth.users` mirrors the
provisioned ID for fast session-read paths. Full error history + retry
state lives in `user_circle_links`.

### RLS Policies (Hybrid V1/V2)

- **V1 (Public):** user_id = NULL → jeder kann lesen
- **V2 (Member):** user_id gesetzt → nur Owner kann lesen/schreiben

```sql
-- Beispiel: chat_sessions SELECT
USING (
  user_id IS NULL                     -- V1: public
  OR auth.uid() = user_id             -- V2: owner only
)
```

---

## Chat-System: Zwei Modi

### V1: Public Chat (Full-Context)

```
User Message
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   /api/chat │ ──► │ getFullContent│ ──► │   Gemini    │
│   mode=public│     │ (alle Items) │     │ Flash-Lite  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        Antwort + Slugs
```

- Alle KB-Items als Context injiziert
- Skaliert bis ~500 Items
- Guenstiges Modell (Gemini 2.5 Flash-Lite)

### V2: Member Chat (Agent mit Tool-Calling)

```
User Message
    │
    ▼
┌─────────────┐     ┌─────────────────────────────────────┐
│   /api/chat │ ──► │           runAgent()                │
│  mode=member│     │                                     │
└─────────────┘     │  ┌───────────┐   ┌───────────────┐  │
                    │  │  Gemini   │   │   KB Tools    │  │
                    │  │  3 Flash  │◄─►│  kb_search    │  │
                    │  │           │   │  kb_list      │  │
                    │  └───────────┘   │  kb_read      │  │
                    │        │         │  web_search   │  │
                    │        │         └───────────────┘  │
                    └────────┼────────────────────────────┘
                             │
                             ▼
                       Antwort + Sources
```

- Agent navigiert KB selbst
- Max 5 Tool-Calls pro Request
- Kann auch Web-Recherche (Exa API)

---

## Monorepo-Struktur

```
generation-ai/
├── apps/
│   ├── website/              ← Next.js 16, generation-ai.org
│   │   ├── app/
│   │   │   ├── page.tsx      ← Landing
│   │   │   ├── impressum/    ← Legal
│   │   │   ├── datenschutz/  ← Legal
│   │   │   └── api/auth/     ← Sign-up (deaktiviert)
│   │   └── components/
│   │
│   └── tools-app/            ← Next.js 16, tools.generation-ai.org
│       ├── app/
│       │   ├── page.tsx      ← Chat + Tool-Liste
│       │   ├── [slug]/       ← Tool-Detail
│       │   ├── login/        ← Auth
│       │   ├── settings/     ← Account
│       │   ├── impressum/    ← Legal
│       │   ├── datenschutz/  ← Legal
│       │   └── api/
│       │       ├── chat/     ← Chat-Endpoint
│       │       ├── health/   ← Health-Check
│       │       └── account/  ← Account-Delete
│       └── lib/
│           ├── agent.ts      ← V2 Agent Logic
│           ├── llm.ts        ← V1 Full-Context
│           ├── kb-tools.ts   ← KB Navigation Tools
│           ├── content.ts    ← Content Loading
│           ├── supabase.ts   ← DB Client
│           ├── ratelimit.ts  ← Upstash Rate Limiting
│           └── sanitize.ts   ← Input Sanitization
│
├── packages/
│   ├── auth/                 ← Shared Supabase Auth Helpers
│   ├── config/               ← Shared Tailwind, ESLint, TSConfig
│   ├── types/                ← Shared TypeScript Types
│   ├── ui/                   ← (leer, fuer spaetere Shared Components)
│   └── e2e-tools/            ← Playwright E2E Tests
│
├── docs/
│   ├── ARCHITECTURE.md       ← Diese Datei
│   ├── API.md                ← API-Dokumentation
│   ├── DEPLOYMENT.md         ← Deploy-Anleitung
│   └── decisions/            ← Architektur-Entscheidungen
│
├── .planning/                ← GSD Artefakte
│   ├── STATE.md              ← Aktueller Projekt-Status
│   ├── PROJECT.md            ← Vision & Scope
│   ├── ROADMAP.md            ← Milestone-Planung
│   └── phases/               ← Phase-Dokumentation
│
├── turbo.json                ← Turborepo Task Config
├── pnpm-workspace.yaml       ← Workspace Definition
└── CLAUDE.md                 ← Claude Code Instruktionen
```

---

## Vercel Projekte

| App | Vercel Project | Domain | Project ID |
|-----|----------------|--------|------------|
| website | `website` | generation-ai.org | prj_GEpAR6sqha5x9Cw0kGYghkz2Y3Ve |
| tools-app | `tools-app` | tools.generation-ai.org | prj_a0EebtGGJq1nd63lLJzOXIeymSwR |

Beide im Team: `team_qPopHuVmiRhwX9LyRYk13tBq`

---

## Externe Services

| Service | Zweck | Dashboard |
|---------|-------|-----------|
| Supabase | Auth + DB | supabase.com/dashboard |
| Circle.so | Community | community.generation-ai.org |
| Vercel | Hosting | vercel.com/dashboard |
| Resend | Transactional Email | resend.com/emails |
| Sentry | Error Tracking | sentry.io |
| Better Stack | Uptime Monitoring | betterstack.com |
| Upstash | Redis (Rate Limiting) | console.upstash.com |
| Exa | Web Search API | exa.ai |
| Google AI | Gemini API | aistudio.google.com |

---

## Aktueller Status

**Sign-up:** DEAKTIVIERT (503 Response)
- Grund: DPAs noch nicht vollstaendig
- Reaktivieren: `apps/website/app/api/auth/signup/route.ts` aus Git-History wiederherstellen

**Chat:** ONLINE
- V1 (public): Gemini 2.5 Flash-Lite
- V2 (member): Gemini 3 Flash mit Tool-Calling

---

*Letzte Aktualisierung: 2026-04-14*
