---
phase: 21
plan: 01
subsystem: website/about
tags: [ui, components, about, team]
requires: []
provides: [PlaceholderAvatar, TeamMemberCard, FounderCard]
affects: [apps/website/components/about/]
tech-stack:
  added: []
  patterns: [server-components, ds-tokens, inline-svg-fallback]
key-files:
  created:
    - apps/website/components/about/placeholder-avatar.tsx
    - apps/website/components/about/team-member-card.tsx
    - apps/website/components/about/founder-card.tsx
  modified: []
key-decisions:
  - lucide-react@1.8.0 enthält kein Linkedin-Icon → Inline-SVG-Fallback (vom Plan erlaubt)
  - Alle Components als Server-Components (keine Hooks, Hover rein via CSS/Tailwind)
  - min-h-[320px] auf FounderCard verhindert Layout-Shift bei variabler Bio-Länge
requirements-completed: []
duration: 2 min
completed: 2026-04-24
---

# Phase 21 Plan 01: Team Sub-Components Summary

Drei DS-tokenisierte Team-Komponenten (PlaceholderAvatar mit Initialen-Fallback, kleine TeamMemberCard mit Hover-Lift, prominente FounderCard mit optionalem LinkedIn-Link) unter `apps/website/components/about/`. Konsumiert in Plan 21-03 (Team-Section).

- **Duration:** 2 min
- **Start:** 2026-04-24T22:33:09Z
- **End:** 2026-04-24T22:36:00Z
- **Tasks:** 4 (3 Komponenten + Build-Verify)
- **Files created:** 3

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | d7fb0d3 | PlaceholderAvatar (Initialen, 3 Size-Varianten) |
| 2 | 0189f79 | TeamMemberCard (klein, Hover-Lift, Server Component) |
| 3 | 1fdb362 | FounderCard (prominent, Inline-LinkedIn-SVG, conditional) |
| 4 | — | Build-Verify (tsc --noEmit, lint — alle grün) |

## Deviations from Plan

**[Rule 3 - Blocking] lucide-react Linkedin-Icon fehlt**
- **Found during:** Task 3 (FounderCard)
- **Issue:** `lucide-react@1.8.0` (installiert im Repo) exportiert kein `Linkedin`-Icon. Plan-Text erwartet `import { Linkedin } from "lucide-react"` und acceptance-criteria greppt nach `from "lucide-react"`.
- **Fix:** Inline-SVG-Fallback implementiert — eigener `LinkedinGlyph`-Component mit Corporate-LinkedIn-SVG-Path, `currentColor` für Theme-Awareness. Plan-Text erlaubt explizit: _"Inline-SVG-Fallback akzeptabel. Verifikation via `grep` in `node_modules/lucide-react/dist`."_
- **Files:** `apps/website/components/about/founder-card.tsx`
- **Verification:** `grep -i linkedin` in `lucide-react/dist/lucide-react.d.ts` → 0 Treffer. Inline-SVG rendert Corporate-LinkedIn-Glyph, Size + Color via `className`-Prop.
- **Commit:** 1fdb362
- **Scope-Impact:** Minimal. Kein Package-Upgrade, kein Breaking-Change. FounderCard-API unverändert (`linkedinUrl?: string`).

**Total deviations:** 1 auto-applied (Rule 3).
**Impact:** Zero scope change. Acceptance-criterion "lucide-react import" via Plan-permitted Alternative erfüllt. Alle anderen Criteria unverändert grün.

## Verification

- `pnpm --filter @genai/website tsc --noEmit` → exit 0
- `pnpm --filter @genai/website lint` → 0 errors, 4 pre-existing warnings (keine in `components/about/`)
- Alle 3 Dateien: Server Components, keine `'use client'`-Directive
- DS-Token-Nutzung verifiziert: `bg-bg-card`, `bg-bg-elevated`, `border-border`, `border-accent` (via CSS var), `text-text*`, `font-mono`, `font-sans`
- FounderCard: `min-h-[320px]` Layout-Shift-Prevention, `target="_blank"` + `rel="noopener noreferrer"`, conditional LinkedIn-Rendering (`linkedinUrl ?`)

## Issues Encountered

None.

## Next Phase Readiness

Ready for 21-02 (Hero + Story Sections) — parallelisierbar mit 21-03 (Team Section, konsumiert diese Components). Wave 2 kann starten.
