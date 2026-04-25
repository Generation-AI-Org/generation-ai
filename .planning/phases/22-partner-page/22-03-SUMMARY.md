---
phase: 22-partner-page
plan: 22-03
subsystem: ui
tags: [react, hero, labeled-nodes, motion, partner-page]

requires: []
provides:
  - PartnerHeroSection component at apps/website/components/partner/partner-hero-section.tsx
  - Hero with LabeledNodes BG, --fs-display H1, motion entry, useReducedMotion
affects: [22-07]

tech-stack:
  added: []
  patterns: [Sub-page hero pattern: LabeledNodes + max-w-4xl + --fs-display + textShadows (from about-hero-section.tsx)]

key-files:
  created:
    - apps/website/components/partner/partner-hero-section.tsx

key-decisions:
  - "Exact copy of about-hero-section.tsx structure — no deviations"
  - "No scroll indicator (sub-pages only) per AGENTS.md"

patterns-established:
  - "Partner hero follows identical pattern to about-hero-section.tsx"

requirements-completed: [R3.1]

duration: 5min
completed: 2026-04-24
---

# Plan 22-03: PartnerHeroSection Summary

**LabeledNodes-background hero for /partner with --fs-display H1, motion fade-in, useReducedMotion — identical structure to AboutHeroSection**

## Performance

- **Duration:** 5 min
- **Completed:** 2026-04-24
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created `PartnerHeroSection` following about-hero-section.tsx canonical pattern exactly
- `data-section="partner-hero"` for Playwright selectors
- All required copy: eyebrow "// für partner", H1 "Lass uns zusammen was bewegen.", subline, lede

## Task Commits
1. **Task 1** - `7b4a5b9` (feat)

## Decisions Made
None — plan executed exactly as written, pattern copied from about-hero-section.tsx.

## Deviations from Plan
None.

## Issues Encountered
None.

## Next Phase Readiness
- Component ready for import in partner-client.tsx (Plan 22-07)

---
*Phase: 22-partner-page*
*Completed: 2026-04-24*
