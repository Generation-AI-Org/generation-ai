# Auth-Architektur — Generation AI

> Zentrale Dokumentation für Authentication.

**Status:** Implementiert
**Betrifft:** Website, tools-app, Circle Community

---

## Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH                              │
│                 (Zentrale Identity-Quelle)                      │
└─────────────────────────────────────────────────────────────────┘
          │                    │                      │
          │ ERSTELLT           │ LIEST                │ SYNC
          │ Accounts           │ Sessions             │ (via API)
          ↓                    ↓                      ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│     WEBSITE      │  │    TOOLS-APP     │  │      CIRCLE      │
│ generation-ai.org│  │ tools.generation-│  │ community.genera-│
│                  │  │     ai.org       │  │   tion-ai.org    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Architektur: "Soft SSO"

Gleiche Email verknüpft die Identitäten, aber separate Sessions.

- Website erstellt Supabase User + Circle Member
- tools-app liest Supabase Session (Cookie auf `.generation-ai.org`)
- Circle hat eigene Session

---

## Sign-up Flow

1. User auf generation-ai.org
2. Füllt Fragebogen aus
3. Gibt Email ein
4. Backend: Supabase User + Profil + Circle Member
5. Resend sendet branded Magic Link
6. User klickt → ist eingeloggt

---

## Session-Sharing

- Cookie-Domain: `.generation-ai.org`
- Alle Subdomains können Session lesen
- Middleware prüft Session in jeder App

---

## Supabase Schema

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  university TEXT,
  study_field TEXT,
  experience_level TEXT,
  interests TEXT[],
  circle_member_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

*Übernommen aus GenerationAI/Decisions/Auth-Architecture.md (2026-04-12)*
