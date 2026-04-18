---
phase: 15-chat-ueberall-global-context-aware
plan: 03
subsystem: tools-app / detail-route + chat context
tags: [chat, context, layout, analytics, session, detail-route]
dependency-graph:
  requires:
    - 15-01 (GlobalLayout shell, ConditionalGlobalLayout)
    - 15-02 (FloatingChat context prop + Sidebar-Mode render path)
  provides:
    - ChatContextProvider (client context, mutable by Detail pages)
    - DetailPageShell (Client-Wrapper, publishes ContentItem metadata)
    - /api/chat context-payload acceptance + System-Prefix injection
    - trackEvent helper (lib/analytics)
    - chat_opened_from_route analytics event
  affects:
    - apps/tools-app/app/[slug]/page.tsx (strips own header, wraps in DetailPageShell)
    - apps/tools-app/components/layout/GlobalLayout.tsx (reads chatContext from provider)
    - apps/tools-app/components/layout/ConditionalGlobalLayout.tsx (wraps in ChatContextProvider)
    - apps/tools-app/components/chat/FloatingChat.tsx (sends context, dynamic empty-state, analytics)
    - apps/tools-app/components/chat/QuickActions.tsx (detail variant with 3 LOCKED chips)
    - apps/tools-app/app/api/chat/route.ts (validated context field, System-Prefix)
tech-stack:
  added: []
  patterns: [react-context-provider-mutator, fire-and-forget-analytics, system-message-prefix-injection]
key-files:
  created:
    - apps/tools-app/components/layout/ChatContextProvider.tsx
    - apps/tools-app/components/detail/DetailPageShell.tsx
    - apps/tools-app/lib/analytics.ts
    - .changeset/phase-15-chat-ueberall.md
  modified:
    - apps/tools-app/app/[slug]/page.tsx
    - apps/tools-app/components/layout/GlobalLayout.tsx
    - apps/tools-app/components/layout/ConditionalGlobalLayout.tsx
    - apps/tools-app/components/chat/FloatingChat.tsx
    - apps/tools-app/components/chat/QuickActions.tsx
    - apps/tools-app/app/api/chat/route.ts
  deleted: []
decisions:
  - "ChatContextProvider exports a safe fallback (no-op setter, null value) for routes outside the provider tree — protects against /login edge-cases and tests."
  - "DetailPageShell clears context on unmount (setChatContext(null)) — ensures Sidebar-Mode releases cleanly on navigation away from /[slug]."
  - "contextPrefix is LLM-only: User-Message persisted in chat_messages stays without prefix to avoid DB bloat + PII-adjacency surface."
  - "Article-Shrink implemented purely via Main-Area 400px mr shrink from 15-02 — kept article at max-w-2xl (no additional max-w-prose toggle). Sliding effect comes from the shrinking main area, not from an inner width change. Luca can flip to max-w-prose as a 1-line change if the effect feels too subtle."
  - "Top-Offset conditional: isSidebarMode uses md:top-[77px] (no FilterBar on /[slug]) while Home stays on md:top-[148px]. Applied on the Tailwind className so there is no runtime branch."
  - "Analytics helper is intentionally dependency-free — tries window.va (Vercel Analytics) + window.Sentry breadcrumbs, always no-ops server-side and on errors. Adding @vercel/analytics later is a drop-in enhancement, no callsite changes."
metrics:
  duration: ~25m
  completed: 2026-04-18
---

# Phase 15 Plan 03: /[slug] Integration + Agent Context + Analytics Summary

Wave 3 verdrahtet die finalen Bausteine von Phase 15: `/[slug]` läuft komplett über `GlobalLayout`, ein neuer `DetailPageShell` setzt via `ChatContextProvider` den aktuellen Tool-Kontext, `/api/chat` akzeptiert und validiert das neue `context`-Feld und prependet einen System-Message-Prefix, der Chat zeigt einen dynamischen Empty-State mit 3 kontext-spezifischen Chips, und ein Analytics-Event `chat_opened_from_route` feuert bei jedem Chat-Open.

## Execution Flow

| Task | Commit | Beschreibung |
| ---- | ------ | ------------ |
| 1    | `969fa14` | DetailPageShell + ChatContextProvider, /[slug] drops own header, FloatingChat Top-Offset fix für Detail |
| 2    | `c1770d5` | /api/chat context-Validation + System-Prefix, FloatingChat sendet context, dynamischer Empty-State + 3 Detail-Chips |
| 3    | `7739de9` | trackEvent-Helper, chat_opened_from_route fire bei Kiwi-Click, Changeset (minor) |

## Data-Flow /[slug] → Agent

```
/[slug]/page.tsx          (server, fetches ContentItem)
      │
      ▼
DetailPageShell           (client, useEffect → setChatContext({slug, title, type, summary}))
      │
      ▼
ChatContextProvider       (context state)
      │
      ▼
GlobalLayout              (useChatContext → passes to FloatingChat + triggers md:mr shrink)
      │
      ▼
FloatingChat              (prop `context`, sends in /api/chat body, renders detail chips)
      │
      ▼
/api/chat route.ts        (validateContext → contextPrefix → LLM only, not DB)
      │
      ▼
runAgent / getRecommendations   (sees "Der User liest gerade: {title} ({type})...")
```

## Context-Payload-Validation (T-15-04, T-15-07)

```ts
const validContext = context &&
  typeof context.slug === 'string' && context.slug.length < 200 &&
  typeof context.title === 'string' && context.title.length < 300 &&
  typeof context.type === 'string' && context.type.length < 100 &&
  typeof context.summary === 'string' && context.summary.length < 2000
  ? context
  : undefined
```

Invalid → silently dropped, request succeeds as if context were absent. Summary-Cap auf 2000 Chars schützt Token-Budget.

## System-Prefix Format (CONTEXT.md D-03)

```
Der User liest gerade: {sanitize(title)} ({sanitize(type)})
Kurzbeschreibung: {sanitize(summary)}
Slug: {sanitize(slug)}

{sanitizedUserMessage}
```

Alle Felder laufen durch `sanitizeUserInput()` (HTML-Entity-Escape) bevor sie im Prefix landen — schützt gegen Prompt-Injection bei später user-generated content (T-15-08).

## Empty-State-Chips (CONTEXT D-04, wortwörtlich)

| Chip-Label                                       | Interpolation |
| ------------------------------------------------ | ------------- |
| Wie unterscheidet sich das von ähnlichen Tools?  | —             |
| Für welche Use-Cases passt {ToolName}?           | `context.title` |
| Wie fange ich an?                                | —             |

One-Tap → sendet den Prompt direkt via `send(action.prompt)` an `/api/chat`.

## Session-Persistence-Verifikation

`genai-chat-session` ist ein globaler sessionStorage-Key (von Phase 10 etabliert). Da GlobalLayout auf allen non-bare Routen den **gleichen** FloatingChat-Mount rendert (Client-Side-Navigation behält Component-Tree), bleibt der State component-lokal intakt. Bei Full-Page-Refresh lädt `useEffect` in Zeile 117–134 den State zurück. **Kein Code-Change in Task 3.1 nötig** — verifiziert via Grep:

```
FloatingChat.tsx:121:      const stored = sessionStorage.getItem(STORAGE_KEY)
FloatingChat.tsx:141:      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, sessionId, draft: message }))
```

Edge-Case: Navigation zu `/login` (bare route → GlobalLayout unmountet → FloatingChat zerstört). Bei Rückkehr zu `/` wird neu gemountet und liest sessionStorage — Messages kommen zurück. ✅ Acceptable, expand/collapse-State bleibt per D-04 explizit nicht persistiert.

## Analytics-Sinks-Status

| Sink                       | Status                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `window.va.track`          | Firing if `@vercel/analytics` injected in prod (no-op sonst) |
| `window.Sentry.addBreadcrumb` | Firing if Sentry SDK initialized (no-op sonst)         |
| Custom backend endpoint    | Nicht verdrahtet — Follow-up falls benötigt                |

Helper ist robust: never throws, never blocks. Neue Sinks sind ein one-line-add in `lib/analytics.ts`.

## Layout-Shift /[slug] (CONTEXT D-02)

- Artikel bleibt bei `max-w-2xl` (wie vor 15-03)
- Main-Area bekommt `lg:mr-[400px]` wenn `chatContext && isChatExpanded` (aus 15-02)
- Netto-Effekt: bei ≥1024px und expanded Chat shrinkt die verfügbare Breite um 400px, der Artikel-Container schiebt visuell nach links, weil er innerhalb dieser kleineren Area weiter `mx-auto`-zentriert bleibt.
- Kein zusätzlicher `max-w-prose`-Toggle eingebaut — siehe Decision-Log.

## Must-Haves aus Plan-Frontmatter

- [x] Auf /[slug] wird Chat via GlobalLayout gerendert (Header + FloatingChat)
- [x] Artikel-Column auf Desktop schrumpft wenn Chat expanded (via Main-Shrink)
- [x] Agent-Antwort auf /[slug] referenziert Tool-Kontext (System-Prefix)
- [x] Empty-State auf /[slug]: 'Fragen zu {ToolName}?' + 3 Chips
- [x] Chat-Session überlebt Navigation (verifiziert, bestehender sessionStorage-Key)
- [x] Analytics-Event `chat_opened_from_route` gefeuert

## Success Criteria Phase-15 (ROADMAP)

- [x] Chat auf Home, Detail, Settings sichtbar; /login ausgenommen
- [x] Desktop /[slug] Layout-Shift bei Chat-Expand (lg:mr-[400px]), Collapse → 100%
- [x] Agent-Antwort auf Detail referenziert Tool-Kontext (System-Prefix im LLM-Input)
- [x] Session überlebt Page-Navigation (global sessionStorage-Key)
- [x] Analytics-Event `chat_opened_from_route` gefeuert (trackEvent helper)

## Deviations from Plan

### None

Plan 1:1 umgesetzt. Bewusste Design-Entscheidung im Plan-Scope:
- Artikel-`max-w-prose` Toggle **nicht** gebaut — Plan-Action hatte das explizit als "pragmatic alternative" offen gelassen. `max-w-2xl` + Main-Shrink reicht visuell. In SUMMARY dokumentiert für Luca, falls enger gewünscht.

## Follow-ups

1. **Type-spezifische Chips** (deferred per CONTEXT.md) — nach 2 Wochen Nutzungsdaten re-evaluieren.
2. **`max-w-prose` auf Detail bei Sidebar-Mode** — falls der aktuelle Shrink visuell zu subtil wirkt, einzelner CSS-Change.
3. **Dedizierter Analytics-Backend** — wenn Sentry-Breadcrumbs nicht reichen, Vercel Analytics eintüten (`@vercel/analytics` Package) oder eigenes Event-Endpoint.
4. **Release v4.2.0** — changeset liegt, `pnpm version` + Tag bei Milestone-Abschluss.

## Verification Status

- [x] `pnpm --filter tools-app build` grün (46 static pages, 3 Runs über die 3 Tasks)
- [x] TypeScript strict, keine neuen `any` außer dem window-Stub im Analytics-Helper (erwartet, doc'ed)
- [x] Grep-Verifikation: sessionStorage-Key beibehalten, contextPrefix im Route-File vorhanden
- [x] Umlaute: "für", "ähnlichen", "fange" — alle neuen Strings mit ö/ä/ü/ß

## Self-Check: PASSED

- `apps/tools-app/components/layout/ChatContextProvider.tsx` exists
- `apps/tools-app/components/detail/DetailPageShell.tsx` exists
- `apps/tools-app/lib/analytics.ts` exists
- `.changeset/phase-15-chat-ueberall.md` exists
- Commits: `969fa14` (Task 1), `c1770d5` (Task 2), `7739de9` (Task 3)
