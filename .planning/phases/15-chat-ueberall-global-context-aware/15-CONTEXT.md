---
phase: 15
name: Chat überall — global + Context-aware
status: ready-for-planning
gathered: 2026-04-18
mode: interactive-discuss
---

# Phase 15: Chat überall — global + Context-aware

<domain>
## Phase Boundary

FloatingChat aus `AppShell`-Lock lösen — der Chat ist auf allen authed Routen (Home, Detail, Settings) verfügbar. Auf Desktop-Detail-Seiten `/[slug]` wird der Chat bei Expand zu einer 400px-Sidebar rechts (Notion-AI-Style), der Artikel schrumpft auf `max-w-2xl`. Mobile bleibt Floating/Bottom-Sheet überall. Der Agent bekommt den Kontext des aktuell gelesenen Tools als System-Message mit. `/login` bleibt ausgenommen.

**Scope-Umfang:**
1. AppShell-Split: `GlobalLayout` (Header + FloatingChat) vs. `HomeLayout` (Filter + CardGrid).
2. GlobalLayout auf allen authed Routen (Home, /[slug], /settings). /login bleibt bare.
3. Desktop /[slug] Sidebar-Mode bei expanded + Context-Payload an Agent.
4. Session-ID via SessionStorage → Chat überlebt Navigation.
5. Analytics-Event `chat_opened_from_route`.
6. **Zusätzlich:** Desktop Chat-Input auto-resize bei Transkription (aus BACKLOG mitgenommen, damit der Bug nicht in neue Layouts mitschwebt).

</domain>

<decisions>
## Implementation Decisions

### 1. Layout-Split-Architektur (Claude's Discretion)
Claude wählt beim Planen zwischen Route-Groups (`(app)/layout.tsx`) und Wrapper-Component in `app/layout.tsx` basierend auf Codebase-Konventionen. Hard requirement: `/login` erhält **kein** GlobalLayout (kein Header, kein Chat), alle anderen authed Routen schon. `getUser()` läuft bereits in `app/layout.tsx` — Pathname-basiertes Conditional-Rendering ist akzeptabel, wenn Route-Groups zu viel File-Moving bedeuten.

### 2. Sidebar-Switch-Logik — LOCKED
Prop-driven via `context` + Breakpoint-Check + expanded-State.

- `FloatingChat` bekommt neuen Prop: `context?: { slug: string; title: string; type: string; summary: string }`
- **Mobile** (< Desktop-Breakpoint): **immer Floating/Bottom-Sheet**, `context` wird nur für Agent-Payload verwendet, nicht fürs Layout.
- **Desktop** + kein `context` (Home, Settings): **Floating** (wie heute).
- **Desktop** + `context` + expanded: **Sidebar 400px rechts**, Artikel-Column schrumpft `max-w-3xl → max-w-2xl`.
- **Desktop** + `context` + collapsed: **Floating-Bubble** (wie heute), Artikel volle Breite.
- Breakpoint-Wahl (md vs lg) liegt im Planner — Tailwind-breakpoint konsistent mit bestehender Mobile-Logik in FloatingChat.

### 3. Agent-Context-Payload — LOCKED
Auf `/[slug]` wird ein System-Message-Prefix mit `{ slug, title, type, summary }` an `/api/chat` durchgereicht. Format-Vorschlag:

```
Der User liest gerade: {title} ({type})
Kurzbeschreibung: {summary}
Slug: {slug}
```

- Kein Full-Markdown-Body (Token-Budget, Noise).
- Payload wird clientseitig vor dem Request gebaut, nicht als separater API-Call.
- Auf Home/Settings: kein Context-Prefix (Agent verhält sich wie heute).

### 4. Empty-State Detail-Chat — LOCKED
Dynamischer Title + **3 generische Prompt-Chips** (nicht type-spezifisch in V1):

- Title: `Fragen zu {ToolName}?`
- Chips (one-tap → sendet den Prompt direkt):
  1. "Wie unterscheidet sich das von ähnlichen Tools?"
  2. "Für welche Use-Cases passt {ToolName}?"
  3. "Wie fange ich an?"

Chip-Interpolation mit `{ToolName}` aus `context.title`. Type-spezifische Chips sind explizit ein Follow-up (nicht in V1).

### 5. Session-Persistenz (Claude's Discretion)
SessionStorage-Key-Schema (global vs. per-route) liegt im Planner. Hard requirement: Chat-Thread überlebt Navigation Home ↔ Detail ↔ Settings ohne Reset. Expanded/Collapsed-UI-State muss **nicht** persistiert werden (Reset auf collapsed beim Page-Load ist akzeptabel).

### 6. Analytics-Event (Claude's Discretion Payload-Details)
Event-Name `chat_opened_from_route` ist fix. Payload-Schema (route path? context-slug? mode?) wählt Planner basierend auf bestehenden Analytics-Patterns im Repo.

### 7. Chat-Input Auto-resize — IN SCOPE
Desktop Chat-Input soll bei Transkription (längerer Text via Voice) automatisch height-adjustieren statt overflow. Wird mit in Phase 15 aufgenommen, damit der Bug nicht in den neuen Sidebar-Layouts sichtbar wird. Implementation-Detail (CSS `field-sizing: content` vs JS-Resize-Observer) im Planner.

</decisions>

<code_context>
## Existing Code Insights

**Relevante Files:**
- [components/AppShell.tsx](apps/tools-app/components/AppShell.tsx) — 342 Zeilen, enthält Home-spezifisches (FilterBar, CardGrid, highlightedSlugs, searchQuery, isChatExpanded-State) + GlobalLayout-Teile (Header, Theme-Toggle, FloatingChat). Split-Kandidat.
- [components/chat/FloatingChat.tsx](apps/tools-app/components/chat/FloatingChat.tsx) — 1133 Zeilen, bereits lazy-loaded via `next/dynamic`. Hat `onHighlight(slugs)`-Prop, muss bei Abwesenheit von CardGrid no-op werden. Hat eigenen expand/collapse-State und attachments-Logik.
- [app/layout.tsx](apps/tools-app/app/layout.tsx) — Root-Layout, lädt `getUser()` bereits, enthält `AuthProvider`, `ThemeProvider`, `VersionBadge`. Guter Platz für `GlobalLayout`-Wrapping falls Wrapper-Variante gewählt wird.
- [app/page.tsx](apps/tools-app/app/page.tsx) — Home, instantiiert `<AppShell items={items} mode={mode} />`. Nach Split wird hier nur noch `<HomeLayout>` gerendert, GlobalLayout kommt von weiter oben.
- [app/[slug]/page.tsx](apps/tools-app/app/[slug]/page.tsx) — Detail-Route, aktuell ohne Chat. Hat eigenen Header und Back-Link, muss integriert/ersetzt werden wenn GlobalLayout den Header stellt.
- [app/login/page.tsx](apps/tools-app/app/login/page.tsx) — MUSS weiterhin ohne GlobalLayout rendern.

**Patterns:**
- Lazy-Load via `next/dynamic({ ssr: false })` ist etabliert (FloatingChat).
- Server-Components pattern: `page.tsx` holt Daten via `getPublishedTools`/`getItemBySlug`, reicht an Client-Shell durch.
- Theme via CSS-Custom-Properties + `useTheme()` hook.

**Integration Points:**
- `/api/chat` Endpoint existiert (Gemini 3 Flash für Agent-Mode). System-Message-Payload muss dort akzeptiert werden — prüfen ob Signatur-Change nötig.
- `ChatMode` Typ (`'public' | 'member'`) wird an AppShell durchgereicht, muss weiter verfügbar sein.

</code_context>

<specifics>
## Specific Ideas / References

- **Vorbild Sidebar-Mode:** Notion AI, ChatGPT Canvas (siehe BACKLOG-Zitat).
- **Sidebar-Breite:** 400px (aus BACKLOG), Artikel `max-w-2xl` während Sidebar aktiv.
- **Mobile-Guideline:** Bottom-Sheet-Verhalten wie aktuell, **keine** neuen Layouts für Mobile.
- **`/login` Exclusion:** Explizit. Kein Chat im Login-Screen.
- **Prompt-Chips-Copy:** Wortwörtlich wie oben in Decision 4 — nicht umformulieren.

</specifics>

<deferred>
## Deferred Ideas

- **Type-spezifische Prompt-Chips** (Tool / Workflow / Use-Case eigene Defaults) → Follow-up-Backlog nach 2 Wochen Nutzungsdaten.
- **Cross-Session-Chat-History UI** (Past-Sessions-List) → nicht in Phase 15 (BACKLOG-Nichtziel).
- **Pro-Only vs. Public-Chat-Logik auf Detail-Seiten** → nutzt gleiche Mode-Detection wie Home, kein separates Feature-Gate in V1.
- **Smart-Links zu Circle** pro Tool → eigenes Backlog-Item.
- **Expanded/Collapsed State-Persistenz** → nicht persistieren, Reset auf collapsed bei Page-Load.

</deferred>

<canonical_refs>
## Canonical References

- [.planning/ROADMAP.md](.planning/ROADMAP.md) — Phase 15 Scope + Success Criteria.
- [.planning/BACKLOG.md](.planning/BACKLOG.md) § 💬 Chat überall — vollständiger Architektur-Plan (Zeilen 90-118).
- [apps/tools-app/components/AppShell.tsx](apps/tools-app/components/AppShell.tsx) — Aktuelle AppShell, Split-Quelle.
- [apps/tools-app/components/chat/FloatingChat.tsx](apps/tools-app/components/chat/FloatingChat.tsx) — Chat-Component, bekommt neuen `context`-Prop.
- [apps/tools-app/app/[slug]/page.tsx](apps/tools-app/app/[slug]/page.tsx) — Detail-Route, empfängt GlobalLayout.
- [apps/tools-app/app/api/chat/route.ts](apps/tools-app/app/api/chat/route.ts) — Akzeptiert System-Message-Context-Prefix.

</canonical_refs>
