---
phase: 24
type: review-fix
status: complete
fixed: 9
skipped: 0
failed: 0
date: 2026-04-24
fixed_at: 2026-04-24T12:33:00Z
review_path: .planning/phases/24-test-assessment/24-REVIEW.md
iteration: 1
findings_in_scope: 9
---

# Phase 24: Code Review Fix Report

**Fixed at:** 2026-04-24T12:33:00Z
**Source review:** .planning/phases/24-test-assessment/24-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 9 (2 Critical + 7 Warning)
- Fixed: 9
- Skipped: 0
- Failed: 0

## Fixed Issues

### CR-01: Confidence slider renders two thumbs for single-value input

**Files modified:** `apps/website/components/ui/slider.tsx`, `apps/website/__tests__/components/test/confidence-slider-widget.test.tsx`
**Commit:** 6e5a0c5
**Applied fix:** Extended the `_values` array-derivation in `Slider` to handle scalar `value` and `defaultValue` cases — now returns `[value]` (or `[defaultValue]`, else `[min]`) for non-array inputs. Added a vitest assertion `toHaveLength(1)` on `[data-slot="slider-thumb"]` as a regression guard.

### CR-02: JSON content leaks literal backslash in rendered recommendations

**Files modified:** `apps/website/content/assessment/community-index.json`, `apps/website/content/assessment/profiles/expert.mdx`
**Commit:** afa5105
**Applied fix:** Replaced `Kommiliton\\:innen` (line 30) and `Expert\\:innen` (line 118) in the JSON with plain `Kommiliton:innen` / `Expert:innen`. Replaced `Mentor\:innen` (line 5) in `expert.mdx` with `Mentor:innen`. JSON validity verified via `JSON.parse`.

### WR-01: Checkpoint setTimeout races with component lifecycle + double-dismiss

**Files modified:** `apps/website/components/test/aufgabe-client.tsx`, `apps/website/components/test/checkpoint-celebration.tsx`
**Commit:** 3feafe1
**Applied fix:** Stored the checkpoint timer in `useRef<ReturnType<typeof setTimeout> | null>` and cleared it in a `useEffect` cleanup on unmount. Halved the delay (1500ms -> 300ms) when `reducedMotion` is true. Removed the duplicate `setTimeout(onDismiss, duration)` from `CheckpointCelebration` — the parent (`aufgabe-client`) now owns lifecycle exclusively.

### WR-02: `useIsTouch` causes hydration mismatch

**Files modified:** `apps/website/hooks/use-is-touch.ts`, `apps/website/components/test/widgets/drag-rank-widget.tsx`, `apps/website/components/test/widgets/matching-widget.tsx`
**Commit:** c96986e
**Applied fix:** Changed `useIsTouch` return type to `boolean | null`, initial state to `null`. Callers now render a neutral skeleton (dimmed, read-only) while `isTouch === null`, and only branch into desktop vs. touch UI once the media query resolves on the client. Prevents hydration mismatch + flash-of-desktop-UI on touch devices.

### WR-03: Radio-groups lack WAI-ARIA arrow-key navigation

**Files modified:** `apps/website/hooks/use-radio-group-keyboard.ts` (new), `apps/website/components/test/widgets/option-card.tsx`, `apps/website/components/test/widgets/card-pick-widget.tsx`, `apps/website/components/test/widgets/mc-widget.tsx`, `apps/website/components/test/widgets/prompt-best-pick-widget.tsx`, `apps/website/components/test/widgets/side-by-side-widget.tsx`, `apps/website/__tests__/components/test/card-pick-widget.test.tsx`
**Commit:** 5bda31c
**Applied fix:** Created a shared `useRadioGroupKeyboard(count, checkedIndex)` hook that implements the WAI-ARIA radio-group pattern: roving tabindex (only one tabbable option), ArrowUp/ArrowDown/ArrowLeft/ArrowRight wrap-around focus movement, Home/End jumps. Applied to all four radio-group widgets: `CardPickWidget`, `MCWidget`, `PromptBestPickWidget`, `SideBySideWidget`. Extended `OptionCard` with `tabIndex` + `onFocus` props. Added three keydown regression tests to `card-pick-widget.test.tsx` (roving tabindex, ArrowDown next, ArrowUp wraps to last).

### WR-04: Under-48px touch targets on reason chips and secondary CTAs

**Files modified:** `apps/website/components/test/widgets/side-by-side-widget.tsx`, `apps/website/components/test/results-cta-cluster.tsx`, `apps/website/components/test/no-result-fallback.tsx`
**Commit:** c40cf0f
**Applied fix:** Side-by-side reason chips: `min-h-[40px]` -> `min-h-[48px]`. "Test nochmal machen" button: added `min-h-[48px]`. "Test starten" link: converted to `inline-flex` with `min-h-[48px] items-center justify-center` so the Next.js `Link` (anchor) reliably enforces the 48px touch target.

### WR-05: `WidgetRouter` uses `as any` instead of discriminated-union narrowing

**Files modified:** `apps/website/components/test/widget-router.tsx`
**Commit:** b398dad
**Applied fix:** Removed the `/* eslint-disable @typescript-eslint/no-explicit-any */` banner and the `shared = { ... as any }` intermediate. Each `case` now passes explicitly-typed props to its widget (e.g. `answer as PickAnswer | undefined`). Added an exhaustiveness-guarded `default: { const _exhaustive: never = question; return null }` branch. Mirrored the same pattern in `isAnswerReady`, plus an early `answer.type !== question.type` guard to protect against stale answer leaks. (Note: the `as` casts that remain are narrow union-to-variant casts, not `as any`.)

### WR-06: Confidence widget scores free 3 points without interaction

**Files modified:** `apps/website/components/test/widgets/confidence-slider-widget.tsx`, `apps/website/components/test/widget-router.tsx`, `apps/website/__tests__/components/test/confidence-slider-widget.test.tsx`, `packages/e2e-tools/tests/test-assessment.spec.ts`
**Commit:** 64613c2
**Applied fix:** `isAnswerReady` for `confidence` now returns `(answer as ConfidenceAnswer).step != null` — no free pass on undefined/null answer. Removed the `if (!answer) return question.type === 'confidence'` shortcut. Slider thumb remains visually at mid-position as an affordance but the widget is dimmed (`opacity-60`), `data-unset="true"` is set, and the aria-live region announces `"Confidence: noch nicht gesetzt"` until first interaction. Updated vitest to cover both unset and set states. Updated the Playwright `answerCurrentWidget` helper to press a digit key on the confidence widget so the E2E flow still advances.

### WR-07: `dangerouslySetInnerHTML` fallback for future untrusted content

**Files modified:** `apps/website/components/test/widgets/prompt-best-pick-widget.tsx`
**Commit:** 912158f
**Applied fix:** Deleted the `escapeHtml()` + `fallbackPre()` helpers and the `html = highlightedCode[opt.id] ?? fallbackPre(opt.code)` escape-hatch. The component now only uses `dangerouslySetInnerHTML` when `highlightedCode[opt.id]` is truthy; otherwise it renders React-escaped `<pre><code>{opt.code}</code></pre>`. This closes the trust-boundary leak: any future untrusted `opt.code` can no longer be silently injected through the fallback path.

## Post-Fix Verification

**TypeScript:** `tsc --noEmit` clean on all modified files (one pre-existing error in `skill-radar-chart.test.tsx` unrelated to Phase 24 fixes).

**Vitest:** 17 test files, 74 tests — all green.

```
Test Files  17 passed (17)
Tests       74 passed (74)
```

**Lint:** 0 new errors introduced. The only two remaining eslint errors are pre-existing in `components/ui/labeled-nodes.tsx` and `lib/assessment/use-assessment.tsx`, both untouched by this pass.

**Determinism guarantees preserved:** No `Math.random`, `Date.now`, `fetch`, or `await` introduced into the scoring path. Scoring module (`scoring.ts`) was not modified.

**A11y contracts preserved:**
- All `aria-live` regions intact (plus one new dynamic message in the confidence widget for the unset state).
- `aria-label`, `aria-checked`, `aria-describedby` preserved.
- WR-03 expanded keyboard contract — arrow-key nav now functional in all four radio-group widgets.

**CSP compliance:** No new inline scripts or `<style>` tags added.

## Additional cleanup commit

- **d18795d** `chore(24): silence lint noise for exhaustive + CheckpointCelebration props` — suppressed two new `no-unused-vars` warnings introduced by the exhaustive-check `_exhaustive` locals and the `CheckpointCelebration` compat-prop, plus removed a stale `eslint-disable-next-line react/no-danger` comment.

---

_Fixed: 2026-04-24T12:33:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
