---
phase: 15-chat-ueberall-global-context-aware
plan: 02
subsystem: tools-app / chat layout
tags: [layout, chat, sidebar, context, responsive]
dependency-graph:
  requires:
    - 15-01 (GlobalLayout shell, ConditionalGlobalLayout)
  provides:
    - ChatContext type (lib/types)
    - FloatingChat context prop + Sidebar-Mode render path
    - GlobalLayout chatContext pass-through + conditional main-area shrink
  affects:
    - apps/tools-app/components/chat/FloatingChat.tsx
    - apps/tools-app/components/layout/GlobalLayout.tsx
    - apps/tools-app/lib/types.ts
tech-stack:
  added: []
  patterns: [matchMedia-desktop-gate, tailwind-conditional-width, prop-drilled-context]
key-files:
  created: []
  modified:
    - apps/tools-app/lib/types.ts
    - apps/tools-app/components/chat/FloatingChat.tsx
    - apps/tools-app/components/layout/GlobalLayout.tsx
  deleted: []
decisions:
  - "Breakpoint lg (1024px) gewählt statt md (768px), konsistent mit Sichtbarkeit des Maximize/Minimize-Buttons (`hidden lg:inline-flex`). Tablets < 1024 bleiben im alten Expanded-Popup-Mode statt Sidebar."
  - "Sidebar-Mode wird NICHT als separater Render-Branch implementiert — nur die Breiten-Klassen sind konditional. Das hält den DOM stabil (kein Remount → kein Textarea-Flicker, kein Scroll-Position-Loss)."
  - "Main-Area shrink ist an `chatContext` gekoppelt (nicht an `isSidebarMode` aus FloatingChat), weil GlobalLayout den internen isDesktop-Zustand des Chats nicht kennt. Tailwind `lg:mr-[400px]` macht den Shrink automatisch nur auf Desktop aktiv."
metrics:
  duration: ~10m
  completed: 2026-04-18
---

# Phase 15 Plan 02: Chat Sidebar-Mode + Context-Prop Summary

Wave 2 liefert die Sidebar-Mechanik für den Detail-Route-Chat: `FloatingChat` bekommt einen optionalen `context`-Prop und einen dritten Layout-Mode (400px rechts, fix) auf Desktop wenn expanded. Context-Daten werden in Plan 03 an `/[slug]` verkabelt — hier nur Prop-Flow + CSS-Switch.

## Layout-Mode-Tabelle

| Mode | Trigger                                                       | Breite               | Shrink Main-Area    |
| ---- | ------------------------------------------------------------- | -------------------- | ------------------- |
| A    | `!isOpen` (default)                                           | Floating-Bubble      | —                   |
| B    | `isOpen && !isExpanded` (Popup) oder `isExpanded` ohne context | `md:w-[35%]`         | `md:mr-[35%]`       |
| C    | `context && isExpanded && isOpen && isDesktop`                | `lg:w-[400px]`       | `lg:mr-[400px]`     |
| Mobile | `< lg` (unter 1024px), egal ob context                      | Bottom-Sheet full-width | none             |

## isSidebarMode-Derivation

```typescript
const [isDesktop, setIsDesktop] = useState(false)
useEffect(() => {
  const mq = window.matchMedia('(min-width: 1024px)')
  const update = () => setIsDesktop(mq.matches)
  update()
  mq.addEventListener('change', update)
  return () => mq.removeEventListener('change', update)
}, [])

const isSidebarMode = !!context && isExpanded && isOpen && isDesktop
```

Vier Bedingungen gleichzeitig — jede einzeln stellt sicher, dass Mobile niemals die Sidebar bekommt und Home/Settings niemals schrumpfen.

## CSS-Switch in FloatingChat (Expanded Render Path)

Statt neuen Render-Branch wird nur die Breite conditional:

```tsx
className={`... w-full ${
  isSidebarMode ? 'lg:w-[400px]' : 'md:w-[35%]'
} ...`}
```

Vorteil: DOM bleibt stabil beim Toggle Home ↔ Detail → keine Remounts, keine Textarea-State-Verluste, keine Scroll-Resets.

## GlobalLayout Main-Area-Shrink

```tsx
<main
  className={`... ${
    isChatExpanded
      ? chatContext
        ? 'lg:mr-[400px]'
        : 'md:mr-[35%]'
      : ''
  }`}
>
```

`chatContext`-Branch nutzt `lg:` (1024px), konsistent mit Chat-intern-Gate. Home/Settings behalten `md:mr-[35%]` (Status quo).

## Mobile-Invariante

Mobile (`< 1024px`) ist durch **zwei** unabhängige Gates gesichert:
1. `isDesktop` (JS matchMedia) setzt `isSidebarMode = false` → FloatingChat rendert `md:w-[35%]`.
2. Tailwind `lg:` Prefix auf dem Sidebar-Shrink → unter lg greift der Shrink sowieso nicht.

Selbst wenn ein Gate versagt, hält der andere. Mobile-Always-Floating-Invariant explizit verifiziert.

## Auto-Resize-Verifikation

Phase-14-Fix (commit `d22b452`) nutzt `resizeTextarea` callback als single source of truth, invoked vom `useEffect([message, isExpanded, resizeTextarea])`. Da in 15-02 kein separater Render-Branch gebaut wurde (nur conditional classes), bleibt das textarea-DOM-Element dasselbe — der Auto-Resize läuft unverändert weiter, auch wenn Sidebar-Mode aktiv wird. Keine Regression möglich.

Smoke-Check: Build grün, keine neuen Deps auf `isSidebarMode` im resize-Path nötig (alles was relevant ist ist bereits über `isExpanded` gedeckt).

## Must-Haves aus Plan-Frontmatter

- [x] FloatingChat akzeptiert neuen optionalen `context`-Prop
- [x] Desktop + context + expanded → Sidebar-Mode 400px rechts (Artikel-Shrink: Plan 03)
- [x] Desktop + context + collapsed → Floating-Bubble wie bisher
- [x] Desktop ohne context (Home/Settings) → Floating/Popup wie bisher
- [x] Mobile immer Floating/Bottom-Sheet, egal ob context gesetzt (`isDesktop`-Gate)
- [x] Chat-Input auto-resize fix hält (kein Render-Branch → kein Remount)

## Hinweise für Plan 03

1. **Context-Provider:** GlobalLayout bekommt aktuell `chatContext` nur via Prop. `/[slug]` muss einen Mechanismus haben, um den Context von der Detail-Page an GlobalLayout zu reichen. Optionen:
   - (a) Neuer Client-Context `ChatContextProvider`, geöffnet in `ConditionalGlobalLayout`, gefüllt von einer Client-Component auf `/[slug]`.
   - (b) GlobalLayout liest `usePathname()` + fetcht Metadata — unelegant, doppelter DB-Hit.
   - Empfehlung: (a) — kleiner Context, `set(context)` beim Mount der Detail-Page, `set(null)` beim Unmount.

2. **Artikel-max-width-Shrink:** Auf `/[slug]` muss der Artikel bei aktivem Sidebar-Mode von `max-w-3xl` → `max-w-2xl` (oder `max-w-prose`) schrumpfen. Da FloatingChat den Sidebar-State lokal hält, braucht die Detail-Page entweder:
   - `isChatExpanded` aus GlobalLayout (bereits State dort) + eigenen `chatContext`-Check, oder
   - CSS-Variable die GlobalLayout setzt (`--chat-sidebar-width`), die die Detail-Page in ihrer max-width berücksichtigt.

3. **Top-Offset auf Detail-Route:** Aktuell `md:top-[148px]` (Header 77 + FilterBar 69). Auf `/[slug]` gibt es keine FilterBar → Sidebar sitzt 69px zu weit unten. Plan 03 sollte das via CSS-Variable oder zweiter Conditional auf `isSidebarMode` (`md:top-[77px]` statt `md:top-[148px]`) lösen.

4. **Analytics-Event `chat_opened_from_route`:** Noch nicht implementiert — kommt in Plan 03 mit zusammen mit Context-Payload an `/api/chat`.

## Deviations from Plan

### None

Plan-Struktur (2 Tasks) 1:1 umgesetzt. Kleine bewusste Design-Entscheidung innerhalb des Plan-Scope:

- **Kein separater Render-Branch für Sidebar-Mode:** Plan-Formulierung "**Neuer Mode C**" hätte einen dritten Render-Block nahegelegt. Stattdessen habe ich nur die Breiten-Klassen conditional gemacht, weil der Rest des Layouts identisch zu Mode B ist. Das reduziert Code-Duplikation (kein Kopieren der gesamten ~290-Zeilen Expanded-Block) und vermeidet Remount-Flicker beim Toggle. Semantisch identisch, DRY-freundlicher.

## Verification Status

- [x] `pnpm --filter tools-app build` grün (46 static pages)
- [x] `pnpm tsc --noEmit` ohne Fehler (Task 1 Verify)
- [x] Mobile-Invariant doppelt gesichert (isDesktop + Tailwind `lg:`)
- [x] Auto-Resize-Fix unverändert (kein Render-Branch)
- [x] Home/Settings-Verhalten regression-free (chatContext = undefined → Status quo)

Visual Smoke-Test steht Luca offen — Sidebar-Mode-Trigger kommt erst mit Plan 03, da context dort erstmalig gesetzt wird.

## Self-Check: PASSED

- `apps/tools-app/lib/types.ts` contains `ChatContext` export
- `apps/tools-app/components/chat/FloatingChat.tsx` contains `isSidebarMode` derivation
- `apps/tools-app/components/layout/GlobalLayout.tsx` forwards `chatContext` prop
- Commits: `e825f63` (Task 1 — types + prop plumbing), `6a361e9` (Task 2 — Sidebar-Mode render path)
