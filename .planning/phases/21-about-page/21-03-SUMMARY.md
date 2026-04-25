---
phase: 21
plan: 03
subsystem: website/about
tags: [ui, components, about, team, data]
requires: [21-01]
provides: [AboutTeamSection, founders, members]
affects: [apps/website/components/about/]
tech-stack:
  added: []
  patterns: [data-module, responsive-grid, server-client-split]
key-files:
  created:
    - apps/website/components/about/team-data.ts
    - apps/website/components/about/about-team-section.tsx
  modified: []
key-decisions:
  - Team-Daten in separatem `team-data.ts` für Phase-27-Foto-Swap-Vorbereitung
  - Container max-w-5xl statt Standard-3xl (UI-SPEC-Exception für Team-Grid-Breite)
  - 4-col Members-Grid mit natural 4+4+2 Fill (keine Placeholder-Slot-Filler)
requirements-completed: []
duration: 2 min
completed: 2026-04-24
---

# Phase 21 Plan 03: Team Section Summary

Team-Section mit 2 prominenten Gründer-Karten (Janna + Simon) und 10 Placeholder-Mitgliedern. Daten isoliert in team-data.ts für Phase-27-Copy-Pass-Vorbereitung.

- **Tasks:** 3 (team-data + AboutTeamSection + Build)
- **Files created:** 2

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 9400c14 | team-data.ts (Founder/Member types + 2+10 entries) |
| 2 | 32b8cee | AboutTeamSection (Eyebrow + H2 + Sub-Zeile + 2 Grids) |
| 3 | — | Build-Verify (tsc exit 0) |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `pnpm --filter @genai/website tsc --noEmit` → exit 0
- 3 imports aus './founder-card', './team-member-card', './team-data'
- id="team" Anker gesetzt
- Responsive-Grids: 2-col (sm) Founders, 4-col (lg) Members
- `motion.h2` (1+close tag=2 Treffer), kein `motion.h3`
- Copy verbatim: Eyebrow, H2, Sub-Zeile mit echtem · Unicode
- 10 Member-Einträge, 2 Founder mit linkedinUrl=undefined

## Issues Encountered

None.

## Next Phase Readiness

Ready for 21-04 (Values + Verein Sections).
