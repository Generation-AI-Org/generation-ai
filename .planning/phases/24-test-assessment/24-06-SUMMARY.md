---
phase: 24
plan: 06
title: Complex widgets — PromptBestPick (shiki) + SideBySide + Fehlerspot
status: complete
completed: 2026-04-24
---

# Plan 24-06 — Summary

## Outcome

3 complex widgets complete: PromptBestPickWidget (accepts pre-rendered shiki HTML), SideBySideWidget (two-phase reveal with AnimatePresence), FehlerspotWidget (click-span-to-mark). shiki server-side singleton ready for plan 24-07 to pre-render BestPrompt code at page level.

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-06-01 | lib/shiki.ts server-side singleton | ✓ |
| 24-06-02 | PromptBestPickWidget (shiki HTML prop) | ✓ |
| 24-06-03 | SideBySideWidget (two-phase, AnimatePresence) | ✓ |
| 24-06-04 | FehlerspotWidget (click spans) | ✓ |
| 24-06-05 | RTL tests (9 cases) | ✓ |

## Key-files

### created
- `apps/website/lib/shiki.ts`
- `apps/website/components/test/widgets/prompt-best-pick-widget.tsx`
- `apps/website/components/test/widgets/side-by-side-widget.tsx`
- `apps/website/components/test/widgets/fehlerspot-widget.tsx`
- `apps/website/__tests__/components/test/prompt-best-pick-widget.test.tsx`
- `apps/website/__tests__/components/test/side-by-side-widget.test.tsx`
- `apps/website/__tests__/components/test/fehlerspot-widget.test.tsx`

## Deviations

None.

## Verification

- `pnpm exec tsc --noEmit` clean
- `pnpm test -- __tests__/components/test` → 44 tests green across 11 files
- All widgets have `data-widget-type` attribute
- ARIA contract honored: radiogroup/listbox, aria-checked/selected, aria-live
