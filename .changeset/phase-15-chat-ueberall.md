---
'@genai/tools-app': minor
---

feat(chat): Chat überall — global + Context-aware (Phase 15).

AppShell gesplittet in GlobalLayout (Header + FloatingChat) und HomeLayout (FilterBar + CardGrid). GlobalLayout läuft jetzt auf allen authed Routen inkl. `/settings`, `/[slug]` und Legal-Seiten; `/login` bleibt bare.

FloatingChat kennt einen neuen `context`-Prop. Auf Desktop-Detail-Seiten (`/[slug]`, ≥1024px) wird der Chat bei Expand zu einer 400px-Sidebar rechts, der Artikel schrumpft sichtbar. Mobile bleibt Floating/Bottom-Sheet.

Der Agent bekommt via `/api/chat`-Body (`context`-Feld) den aktuellen Tool-Kontext (slug/title/type/summary) als System-Prefix — die Antwort referenziert das gelesene Tool. User-Message wird weiterhin ohne Prefix persistiert.

Empty-State auf `/[slug]`: "Fragen zu {ToolName}?" + 3 One-Tap-Chips ("Wie unterscheidet sich das von ähnlichen Tools?", "Für welche Use-Cases passt {ToolName}?", "Wie fange ich an?").

Session-Persistenz: `genai-chat-session` Key überlebt Navigation (Home → Detail → Settings). Analytics-Event `chat_opened_from_route` wird bei jedem Chat-Open mit `{ route, context_slug?, mode }` gefeuert (Vercel Analytics + Sentry-Breadcrumb fallback).
