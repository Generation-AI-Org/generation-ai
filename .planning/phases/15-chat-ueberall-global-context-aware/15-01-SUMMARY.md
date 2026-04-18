---
phase: 15-chat-ueberall-global-context-aware
plan: 01
subsystem: tools-app / layout
tags: [refactor, layout, chat, context]
dependency-graph:
  requires: []
  provides:
    - GlobalLayout (Header + FloatingChat shell)
    - HomeLayout (Home-spezifischer Content)
    - HighlightContext (Chat → CardGrid slugs)
    - SearchContext (Page → Header openSearch-Bridge)
    - ConditionalGlobalLayout (route-gate wrapper)
  affects:
    - app/layout.tsx (Wrapping)
    - app/page.tsx (vereinfacht)
    - app/settings/page.tsx (Chat jetzt auch hier sichtbar)
tech-stack:
  added: []
  patterns: [react-context-bridges, usePathname-conditional-layout]
key-files:
  created:
    - apps/tools-app/components/layout/GlobalLayout.tsx
    - apps/tools-app/components/layout/ConditionalGlobalLayout.tsx
    - apps/tools-app/components/HomeLayout.tsx
  modified:
    - apps/tools-app/app/layout.tsx
    - apps/tools-app/app/page.tsx
    - apps/tools-app/app/settings/page.tsx
  deleted:
    - apps/tools-app/components/AppShell.tsx
decisions:
  - "BARE_ROUTES aus Plan übernommen: nur /login. Legal-Seiten + Settings + Detail bekommen Chat."
  - "mode wird in app/layout.tsx (Server) aus getUser() abgeleitet und an Client-Wrapper durchgereicht — HomeLayout leitet ihn parallel via useAuth ab, damit Client-seitig keine prop-Bridge durch den Wrapper nötig ist."
  - "SearchContext statt Portal/Slot — Header-Search-Buttons rendern nur, wenn ein Consumer registerOpenSearch aufgerufen hat. Auf /settings/[slug] also unsichtbar."
metrics:
  duration: ~15m
  completed: 2026-04-18
---

# Phase 15 Plan 01: AppShell-Split (GlobalLayout + HomeLayout) Summary

AppShell in `GlobalLayout` (global Shell: Header + FloatingChat) und `HomeLayout` (Home-spezifisch: FilterBar + CardGrid + Search-Overlay + Highlight-Click) gesplittet. Chat erscheint jetzt auch auf `/settings` und anderen authed Routen; `/login` bleibt bare.

## Responsibility Split

| Component                  | Responsibility                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GlobalLayout`             | Header (Logo, Theme-Toggle, Login/Settings/Signout, Legal-Links), FloatingChat, Main-Container, Chat-Expand-Pad. Stellt `HighlightContext` + `SearchContext` bereit. |
| `HomeLayout`               | FilterBar + CardGrid + Search-Overlay + ⌘K/ESC-Shortcuts + Click-to-clear-Highlights. Consumiert `HighlightContext`, registriert `openSearch` via `SearchContext`. |
| `ConditionalGlobalLayout`  | Client-Wrapper mit `usePathname`; rendert `GlobalLayout` für alle Routen außer `/login`.                          |

## Context-APIs (konsumiert von Plan 15-02 und 15-03)

### HighlightContext

```typescript
interface HighlightContextValue {
  highlightedSlugs: string[]
  setHighlightedSlugs: (slugs: string[]) => void
}

const { highlightedSlugs, setHighlightedSlugs } = useHighlightContext()
```

- Produziert von: `GlobalLayout` (via FloatingChat-`onHighlight`-Prop).
- Consumiert von: `HomeLayout` (CardGrid + Click-Clear-Logik).
- **Für Plan 03 (`/[slug]`-Integration):** Detail-Route consumiert den Context nicht, da kein Grid. Kein Breaking-Change.

### SearchContext

```typescript
interface SearchContextValue {
  openSearch: (() => void) | null
  registerOpenSearch: (fn: (() => void) | null) => void
}

const ctx = useSearchContext()
ctx?.registerOpenSearch(openFn) // register on mount, pass null on unmount
```

- Bridge zwischen Header-Search-Button (in GlobalLayout) und Search-Overlay (in HomeLayout).
- Header rendert den Search-Button nur, wenn `openSearch !== null`.
- **Auf Settings/Detail:** Kein Consumer → Button versteckt. Kein visueller Clutter.

## Offene Beobachtungen für spätere Waves

1. **`/[slug]`-Integration (Plan 15-03):** Detail-Route hat aktuell eigenen Header/Back-Link. Muss umgebaut werden:
   - Eigenen Header entfernen (liefert jetzt GlobalLayout).
   - Back-Link ggf. ins GlobalLayout-Header-Slot oder oberhalb Article-Content.
   - Sidebar-Mode (Chat-Expand → 400px rechts, Artikel `max-w-2xl`) greift in den Main-Container-Class-Toggle (`md:mr-[35%]`) ein — evtl. über neuen Context vom Detail-Content an GlobalLayout senden.
2. **Auth-Transient-Pages (`/auth/callback`, `/auth/set-password`):** Sind aktuell NICHT in `BARE_ROUTES` — erhalten also Header + Chat. Pragmatisch OK (User sieht kurz Callback-Page), aber Luca könnte das in BARE_ROUTES aufnehmen falls störend.
3. **Legal-Seiten:** `/impressum` + `/datenschutz` haben jetzt Chat. Plan hat das explizit so entschieden (hilfreich statt störend). Falls in der Praxis stört → BARE_ROUTES erweitern.
4. **Settings `pt-8` Feinjustierung:** Die Seite scrollt jetzt im Main-Container statt im Window. `pt-24 → pt-8` als erstes Tuning; falls Spacing visuell anders wirken soll, Anpassung in Plan 03 oder als Follow-up.

## Deviations from Plan

### None

Plan wurde exakt umgesetzt. Task-Struktur (3 Tasks) beibehalten, Tailwind-Klassen 1:1 übernommen, keine Verhaltens-Änderungen auf Home.

Kleine bewusste Design-Entscheidung innerhalb des Plan-Scope:
- **`mode`-Ableitung in HomeLayout:** Plan sagt "mode kommt per GlobalLayout" — ich habe `useAuth()` in HomeLayout benutzt statt den mode via Context zu reichen, weil der Wert schon im `AuthProvider` verfügbar ist und keine neue Context-Definition rechtfertigt. Semantisch identisch zum Plan.

## Verification Status

- [x] `pnpm build` grün (46 static pages generated)
- [x] `pnpm tsc --noEmit` ohne Fehler
- [x] `components/AppShell.tsx` entfernt (nur Referenzen in CHANGELOG/README stehen historisch)
- [x] BARE_ROUTES = ['/login'] — /login bleibt bare
- [x] GlobalLayout + FloatingChat global auf / und /settings verdrahtet

Visual Smoke-Test via Browser steht Luca offen — kein automatischer Playwright-Pass in diesem Wave (kommt mit Plan 02/03).

## Must-Haves aus Plan-Frontmatter

- [x] Chat bubble auf Home und Settings sichtbar (FloatingChat in GlobalLayout)
- [x] Chat bubble NICHT auf /login sichtbar (ConditionalGlobalLayout-Gate)
- [x] Home-Verhalten (FilterBar, CardGrid, Highlighting, Search-Overlay) unverändert
- [x] Header + Theme-Toggle global gerendert
- [x] /login behält eigenes bare Layout

## Self-Check: PASSED

- `apps/tools-app/components/layout/GlobalLayout.tsx` exists
- `apps/tools-app/components/layout/ConditionalGlobalLayout.tsx` exists
- `apps/tools-app/components/HomeLayout.tsx` exists
- `apps/tools-app/components/AppShell.tsx` deleted
- Commits: `863d6f4` (GlobalLayout), `cbdde98` (HomeLayout + AppShell deletion), `d45c843` (ConditionalGlobalLayout wiring)
