---
phase: 24
plan: 05
title: Drag-drop widgets — DragRank + Matching
status: complete
completed: 2026-04-24
---

# Plan 24-05 — Summary

## Outcome

Both drag-drop widgets complete with desktop (@dnd-kit) + touch-mode (tap/select fallback) branches. Keyboard-accessible via sortable coordinate getter. Screen-reader announcements in German.

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-05-01 | useIsTouch hook | ✓ |
| 24-05-02 | DragRankWidget | ✓ |
| 24-05-03 | MatchingWidget | ✓ |
| 24-05-04 | RTL tests (6 cases) | ✓ |

## Key-files

### created
- `apps/website/hooks/use-is-touch.ts`
- `apps/website/components/test/widgets/drag-rank-widget.tsx`
- `apps/website/components/test/widgets/matching-widget.tsx`
- `apps/website/__tests__/components/test/drag-rank-widget.test.tsx`
- `apps/website/__tests__/components/test/matching-widget.test.tsx`

### modified
- `apps/website/package.json` (added `@dnd-kit/utilities` explicit)

## Deviations

- Added `@dnd-kit/utilities` as an explicit dep (needed for `CSS.Transform.toString` with strict pnpm).
- MatchingWidget: moved `useSensors` hook call above the touch-branch early-return to respect Rules of Hooks.

## Verification

- `pnpm exec tsc --noEmit` clean
- `pnpm test -- __tests__/components/test` → 35 tests green across 8 files
- Both widgets have `data-widget-type` attribute for Playwright hooks
- Announcements + aria-live on both widgets for a11y
