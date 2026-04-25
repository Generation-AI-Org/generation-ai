---
phase: 24
plan: 07
title: /test landing + /test/aufgabe/[n] routes + AufgabeLayout + transitions
status: complete
completed: 2026-04-24
---

# Plan 24-07 — Summary

## Outcome

Full /test flow is routable: landing with LabeledNodes hero + Start CTA, parameterized /test/aufgabe/[n] with progress header, widget router, Framer Motion transitions, mid-test Checkpoint celebration, auto-route to /test/ergebnis on last question, deep-link guard.

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-07-01 | AssessmentProvider + useAssessment hook | ✓ |
| 24-07-02 | /test layout + page + client + hero | ✓ |
| 24-07-03 | WidgetRouter + isAnswerReady | ✓ |
| 24-07-04 | CheckpointCelebration + confetti keyframes | ✓ |
| 24-07-05 | AufgabeLayout + shadcn Progress | ✓ |
| 24-07-06 | /test/aufgabe/[n] route + AufgabeClient | ✓ |
| 24-07-07 | AufgabeLayout RTL tests (4 cases) | ✓ |

## Key-files

### created
- `apps/website/lib/assessment/use-assessment.tsx`
- `apps/website/app/test/layout.tsx`
- `apps/website/app/test/page.tsx`
- `apps/website/app/test/aufgabe/[n]/page.tsx`
- `apps/website/components/test/test-client.tsx`
- `apps/website/components/test/test-hero-section.tsx`
- `apps/website/components/test/test-layout-provider.tsx`
- `apps/website/components/test/widget-router.tsx`
- `apps/website/components/test/checkpoint-celebration.tsx`
- `apps/website/components/test/aufgabe-layout.tsx`
- `apps/website/components/test/aufgabe-client.tsx`
- `apps/website/components/ui/progress.tsx` (shadcn add)
- `apps/website/__tests__/components/test/aufgabe-layout.test.tsx`

### modified
- `apps/website/app/globals.css` (confetti-burst-0..7 keyframes + reduced-motion guard)

## Deviations

- Header strip uses inline GenAI chip instead of re-using `<Header>` — `<Header>` is the full nav, which UI-SPEC explicitly omits on aufgabe routes.
- Removed local `<AssessmentProvider>` from `AufgabeClient`; it lives in the layout via `TestLayoutProvider`.

## Verification

- `pnpm build` → `/test` and `/test/aufgabe/[n]` in route list, both `ƒ` (dynamic, CSP-safe)
- `pnpm test` → 48 tests pass across 12 files
- Typecheck clean
