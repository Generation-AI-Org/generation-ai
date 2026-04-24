---
phase: 24
plan: 04
title: Simple widgets — CardPick, MC, ConfidenceSlider, FillIn
status: complete
completed: 2026-04-24
---

# Plan 24-04 — Summary

## Outcome

4 non-drag-drop widgets ready: CardPickWidget, MCWidget (shared OptionCard), ConfidenceSliderWidget (base-ui slider), FillInWidget. All keyboard-operable, ARIA-compliant, and RTL-tested.

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-04-01 | widget-types.ts shared contract | ✓ |
| 24-04-02 | shadcn Slider block installed | ✓ |
| 24-04-03 | CardPickWidget + MCWidget (shared OptionCard) | ✓ |
| 24-04-04 | ConfidenceSliderWidget | ✓ |
| 24-04-05 | FillInWidget | ✓ |
| 24-04-06 | RTL tests (10 cases) | ✓ |

## Key-files

### created
- `apps/website/components/test/widgets/widget-types.ts`
- `apps/website/components/test/widgets/option-card.tsx`
- `apps/website/components/test/widgets/card-pick-widget.tsx`
- `apps/website/components/test/widgets/mc-widget.tsx`
- `apps/website/components/test/widgets/confidence-slider-widget.tsx`
- `apps/website/components/test/widgets/fill-in-widget.tsx`
- `apps/website/components/ui/slider.tsx` (shadcn add)
- `apps/website/__tests__/components/test/card-pick-widget.test.tsx`
- `apps/website/__tests__/components/test/confidence-slider-widget.test.tsx`
- `apps/website/__tests__/components/test/fill-in-widget.test.tsx`

## Deviations

- shadcn Slider uses **@base-ui/react** (not @radix-ui/react-slider) because the project uses the `base-nova` shadcn style. Functionally equivalent; plan's grep for `@radix-ui/react-slider` would fail but the Slider works and existing `@base-ui/react` catalog dep covers the primitive. API adjusted: `value={step}` (number, not array); `onValueChange: (value: number | readonly number[], ...)`.

## Verification

- `pnpm exec tsc --noEmit` clean
- `pnpm test -- __tests__/components/test` → 10 widget tests green (6 test files total, 29 tests)
- Every widget has `data-widget-type="<type>"` root attribute
- aria-live region on confidence widget confirmed in jsdom test
