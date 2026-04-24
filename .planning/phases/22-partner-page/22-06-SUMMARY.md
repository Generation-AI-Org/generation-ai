---
phase: 22-partner-page
plan: 22-06
subsystem: ui
tags: [react, person-cards, placeholder-avatar, partner-page, verein]

requires: []
provides:
  - PartnerPersonCard + PartnerPersonCards at partner-person-card.tsx
  - PartnerVereinHint at partner-verein-hint.tsx
affects: [22-07]

tech-stack:
  added: []
  patterns: [PlaceholderAvatar reuse from Phase 21, Server Component for PartnerVereinHint]

key-files:
  created:
    - apps/website/components/partner/partner-person-card.tsx
    - apps/website/components/partner/partner-verein-hint.tsx

key-decisions:
  - "Mail addresses use admin@generation-ai.org as fallback with TODO comments (D-07)"
  - "LinkedIn links: href='#' + data-placeholder='linkedin' (D-07)"
  - "PartnerVereinHint is Server Component — no hooks needed"
  - "PlaceholderAvatar reused from Phase 21, not re-implemented (D-08)"

patterns-established:
  - "data-placeholder='linkedin' marker for post-launch URL injection"

requirements-completed: [R3.1]

duration: 8min
completed: 2026-04-24
---

# Plan 22-06: PartnerPersonCard + PartnerVereinHint Summary

**3 person cards (Alex/Janna/Simon) with PlaceholderAvatar(size=md), LinkedIn placeholders, admin@ mail fallbacks + transparency hint linking to /about#verein**

## Performance

- **Duration:** 8 min
- **Completed:** 2026-04-24
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `PartnerPersonCard` and `PartnerPersonCards` in single file — card + grid + eyebrow + heading
- `PlaceholderAvatar` imported from Phase 21 (`@/components/about/placeholder-avatar`) — no re-implementation
- `data-placeholder="linkedin"` on LinkedIn links per D-07
- `aria-label` on mail + LinkedIn links per A11y requirement
- `grid-cols-1 sm:grid-cols-3` for 3 cards
- `PartnerVereinHint` as Server Component with link to `/about#verein`

## Task Commits
1. **Tasks 1-2** - `8a31d7f` (feat)

## User Setup Required
Mail addresses (alex@, janna@, simon@) are placeholder. All currently show `admin@generation-ai.org` with TODO comments. Confirm real addresses with Luca before go-live.

## Decisions Made
- Single file for PartnerPersonCard + PartnerPersonCards (less fragmentation for small components)
- No `'use client'` on PartnerVereinHint (pure render, Server Component)

## Deviations from Plan
None.

## Issues Encountered
None.

## Next Phase Readiness
- `PartnerPersonCards` and `PartnerVereinHint` ready for import in partner-client.tsx (Plan 22-07)

---
*Phase: 22-partner-page*
*Completed: 2026-04-24*
