---
phase: 24
slug: test-assessment
type: review
status: issues_found
depth: standard
reviewed: 2026-04-24
files_reviewed: 70
findings:
  critical: 2
  warning: 7
  info: 16
  total: 25
---

# Phase 24 — Code Review Report

**Phase:** 24 — /test AI Literacy Assessment
**Depth:** standard
**Files reviewed:** 70
**Status:** issues_found

## Summary

Phase 24 ships a 3-route assessment flow (`/test`, `/test/aufgabe/[n]`, `/test/ergebnis`) with 9 widget types, deterministic scoring, 5-level outcome taxonomy, radar chart, and sparring-slot placeholder. Core scoring (`scoring.ts`) is genuinely pure and well-tested; deterministic contract holds. Content integrity is verified by `content.test.ts`. Test coverage is strong — 12 vitest files plus a Playwright spec.

Overall quality is high. Three categories of issues:

1. **One rendering bug** in the shared `Slider` primitive that causes the ConfidenceSlider to render two thumbs instead of one.
2. **Two UX/state hazards** around the checkpoint `setTimeout` race and a JSON content double-backslash that leaks literal `\:` into rendered recommendation copy.
3. **A11y gaps** — radio-group arrow-key navigation missing, touch-target under 48px on secondary buttons, hydration-mismatch risk in `useIsTouch` for tappable widgets.

Determinism and security posture look good. No hardcoded secrets, no unsafe eval, shiki is server-side. The `dangerouslySetInnerHTML` usage is scoped to trusted shiki output of trusted JSON content.

---

## Critical

### CR-01: Confidence slider renders two thumbs for single-value input

**File:** `apps/website/components/ui/slider.tsx:13-17`

When callers pass a scalar `value` (the `ConfidenceSliderWidget` does: `<Slider value={step} …/>` with `step: 0..4`), `_values = Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]` falls through to `[min, max]` = `[0, 4]` (length 2). The render loop then renders **two** `SliderPrimitive.Thumb` elements. Visually wrong and confusing for keyboard users (two separate thumbs to navigate).

**Fix:**
```tsx
const _values = Array.isArray(value)
  ? value
  : Array.isArray(defaultValue)
    ? defaultValue
    : typeof value === 'number'
      ? [value]
      : typeof defaultValue === 'number'
        ? [defaultValue]
        : [min]  // single thumb, not [min, max]
```
Add a unit test asserting `container.querySelectorAll('[data-slot="slider-thumb"]').length === 1` for the ConfidenceSliderWidget.

### CR-02: JSON content leaks literal backslash in rendered recommendations

**File:** `apps/website/content/assessment/community-index.json:30,118` + `apps/website/content/assessment/profiles/expert.mdx:5`

Two recommendation descriptions use `Kommiliton\\:innen` and `Expert\\:innen`. In JSON, `\\` encodes a single backslash, so the in-memory string is `Kommiliton\:innen`. Users see literal `\:` in the UI. Same issue in MDX where `\:` is not a reserved character.

**Fix:** Replace `\\:` with `:` in both JSON strings and MDX paragraphs. Verify in rendered `/test/ergebnis` that no `\:` appears.

---

## Warnings

### WR-01: Checkpoint setTimeout races with component lifecycle + double-dismiss

**File:** `apps/website/components/test/aufgabe-client.tsx:58-74` (also `checkpoint-celebration.tsx:22`)

`handleNext` uses a bare `setTimeout(…, 1500)` to dismiss the celebration and navigate. Problems:
1. Not cleared on unmount (user navigates via Back or logo Link) — `router.push` fires late.
2. `CheckpointCelebration` also has its own `setTimeout(onDismiss, 1500)` — duplicated dismissal.
3. Under `useReducedMotion`, the 1500ms delay still blocks navigation.

**Fix:** Store the timeout in a `useRef`, clear on unmount via `useEffect`, halve the delay under `reducedMotion`. Remove the duplicate timer in `CheckpointCelebration`.

### WR-02: `useIsTouch` causes hydration mismatch

**File:** `apps/website/hooks/use-is-touch.ts:8-19` (callers: `drag-rank-widget.tsx:151`, `matching-widget.tsx:124`)

`useIsTouch` defaults to `false` on first render. On a touch device, server/initial HTML renders the desktop branch; effect flips `isTouch` to `true`, unmounting DndContext. Causes hydration mismatch + flash of desktop UI.

**Fix:** Initialize `isTouch` as `null`, render a neutral shell until mount resolves, branch once resolved. Alternative: CSS `@media (pointer: coarse)` for the visual fallback.

### WR-03: Radio-groups lack WAI-ARIA arrow-key navigation

**Files:** `apps/website/components/test/widgets/option-card.tsx:27-32`, `prompt-best-pick-widget.tsx:65-74`, `side-by-side-widget.tsx:83-88`

Widgets declare `role="radiogroup"` / `role="radio"` but don't implement arrow-key nav + roving tabindex. Screen-reader users won't experience expected radio-group behavior.

**Fix:** Either implement roving tabindex + Arrow Up/Down/Left/Right handlers at the group level, or drop the ARIA roles and use native `<input type="radio" hidden>` + visible `<label>`.

### WR-04: Under-48px touch targets on reason chips and secondary CTAs

**Files:**
- `apps/website/components/test/widgets/side-by-side-widget.tsx:150` — reason chips `min-h-[40px]`
- `apps/website/components/test/results-cta-cluster.tsx:61` — "Test nochmal machen" `py-2.5` (~40px)
- `apps/website/components/test/no-result-fallback.tsx:17` — "Test starten" `py-3` (no explicit `min-h`)

UI-SPEC sets 48px min touch target.

**Fix:** Add `min-h-[48px]` to all three sites.

### WR-05: `WidgetRouter` uses `as any` instead of discriminated-union narrowing

**File:** `apps/website/components/test/widget-router.tsx:7,30-56`

Router uses `eslint-disable no-explicit-any` and casts every prop with `as any`. Defeats the discriminated-union in `types.ts`. Future Answer-shape refactors fail silently.

**Fix:** Leverage `question.type` switch for exhaustiveness narrowing. One `case` per type, no generic `shared` object. Add `default: { const _: never = question; return null }` for exhaustiveness guarantee.

### WR-06: Confidence widget scores free 3 points without interaction

**File:** `apps/website/components/test/widgets/confidence-slider-widget.tsx:34` + `widget-router.tsx:65-68`

`step` defaults to `2`; `isAnswerReady` returns `true` for confidence without user interaction. In scoring, `step=2` matches `groundTruthStep=2` → full marks (3 points in q-10). User can Tab through without interacting and get 3 free points.

**Fix:** `isAnswerReady` returns `answer != null && answer.step != null`. Remove "default step=2 without explicit answer" contract. Render the slider thumb as visually-unset until first interaction. Update Playwright `answerCurrentWidget` accordingly.

### WR-07: `dangerouslySetInnerHTML` fallback for future untrusted content

**File:** `apps/website/components/test/widgets/prompt-best-pick-widget.tsx:50,96`

`opt.code` currently comes from trusted `questions.json`, and the `fallbackPre` escape path is correct today. But the fallback hides the fact that the `dangerouslySetInnerHTML` branch exists — if a future question wires user-authored content, the trust boundary breaks silently.

**Fix:** Drop the fallback; render plain text through React when `highlightedCode[opt.id]` is missing:
```tsx
if (!html) return <pre><code>{opt.code}</code></pre>
```
Or add a runtime assertion + Sentry breadcrumb so missing shiki renders are visible.

---

## Info

### IN-01: `SparringSlot` props `level` and `skills` are unused

**File:** `apps/website/components/test/sparring-slot.tsx:20-23,25`

`level` and `skills` props are declared for forward-compat with live mode but unused in V1 placeholder. Make them optional or add a documented `TODO` comment for the V2 live-mode swap.

### IN-02: `LevelBadge` + `SkillRadarChart` duplicate the level→color map

**Files:** `apps/website/components/test/level-badge.tsx:20-31`, `skill-radar-chart.tsx:16-22`

Level-meta duplicated across components. Extract `lib/assessment/level-meta.ts` as single source.

### IN-03: Dimension-order literal repeated across files

**Files:** `apps/website/components/test/results-cta-cluster.tsx:24-30`, `skill-radar-chart.tsx:51`

Hardcoded 5-item dimension array. Import `DIMENSIONS` from `@/lib/assessment/types` everywhere.

### IN-04: `WidgetRouter` missing exhaustiveness check

**File:** `apps/website/components/test/widget-router.tsx:31-56`

After fixing WR-05, add `default: { const _: never = question; return null }` for compile-time exhaustiveness.

### IN-05: Rank-widget keyboard hint hidden in collapsed `<details>`

**File:** `apps/website/components/test/widgets/drag-rank-widget.tsx:261-267`

Keyboard-users need to Tab + Enter to expand the help. Move outside `<details>` as persistent small-text, or `open` by default.

### IN-06: `reducedMotion` doesn't zero out `delay` in LevelBadge

**File:** `apps/website/components/test/level-badge.tsx:43,71`

`transition={{ delay: 0.1 }}` still applies under `reducedMotion`. Zero delays too for A/T users.

### IN-07: `loadQuestions()` casts JSON with `as unknown as Question[]`

**File:** `apps/website/lib/assessment/load-questions.ts:9`

Double-cast bypasses TypeScript shape check. If `questions.json` diverges, runtime throws deep in a widget. Use Zod (already a dep) to parse at load time, ideally in a test to avoid runtime bundle cost.

### IN-08: `handleNext` cross-checkpoint logic is off-by-one magic number

**File:** `apps/website/components/test/aufgabe-client.tsx:60`

`currentIndex === 4` only works with 10 questions. Derive from `questions.length`:
```tsx
const CHECKPOINT_INDEX = Math.floor(questions.length / 2) - 1
```

### IN-09: `FillInWidget` unknown tokens rendered as literal text

**File:** `apps/website/components/test/widgets/fill-in-widget.tsx:26-32`

Unknown `{{FOO}}` tokens rendered literally. Silent content bug. Add `console.warn` in dev-only.

### IN-10: `TestLayoutProvider` loads full questions payload on `/test` landing

**File:** `apps/website/components/test/test-layout-provider.tsx:12`

`loadQuestions()` at module-top ships the full JSON even for the landing page. Defer to `aufgabe/[n]` (which already loads server-side) or accept as-is and document.

### IN-11: `ResultsCtaCluster` retry flow needs Playwright coverage

**File:** `apps/website/components/test/results-cta-cluster.tsx:45-48`

`handleRetry` dispatches RESET then navigates. Not covered by E2E. Add a scenario: complete → retry → complete again with different answers → assert different output.

### IN-12: MDX profile registry eagerly imports all 5 profiles

**File:** `apps/website/lib/assessment/profiles.ts:7-11`

Ships all 5 profiles to every `/test/ergebnis` visitor. Consider `next/dynamic()` if bundle size becomes an issue.

### IN-13: `scoreQuestion` confidence path trusts type narrowing

**File:** `apps/website/lib/assessment/scoring.ts:129-133`

Already `clamp`-guarded but add an explicit `if (answer.step < 0 || answer.step > 4) return 0` for invariant enforcement.

### IN-14: `data-widget-type` attributes ship to production

Multiple widget files.

Playwright hook. Either move to `data-testid` with matching Playwright config, or document as intentional.

### IN-15: `useMDXComponents` override order

**File:** `apps/website/mdx-components.tsx:7-40`

`...components` at end means caller overrides win. If our DS styles should always win, spread `components` first.

### IN-16: `FehlerspotWidget` uses `<span role="option">` instead of `<button>`

**File:** `apps/website/components/test/widgets/fehlerspot-widget.tsx:48-73`

Works but more robust as `<button type="button" role="option">` for consistent focus-visible + a11y tooling behavior.

---

## Security / Determinism / Performance

**Determinism (scoring.ts) — verified pure:**
- No `Math.random`, `Date.now`, `performance.now`, `fetch`, `await` in scoring path.
- Only local mutations on `dp`, `dimEarned`, `dimMax`, `skills`.
- `__tests__/scoring.test.ts` has `Object.freeze` check.
- `Math.round` is deterministic across engines.

**Security:**
- No hardcoded secrets.
- `dangerouslySetInnerHTML` only in `prompt-best-pick-widget.tsx` (shiki, trusted JSON).
- URL-state guard in `aufgabe-client.tsx:46-56` redirects deep-links to unanswered questions.
- No localStorage/sessionStorage (matches D-05 "no persistence").
- `buildJoinHref` uses `URLSearchParams`.
- No `eval`, no `new Function`, no `exec`.
- CSP nonce pattern correctly applied.

**Performance:**
- `useMemo` + `useCallback` used consistently.
- `scoreAssessment` re-runs per state change; sub-ms for 10 questions.

---

## Verdict

**Ship-worthy after CR-01 + CR-02.** Warnings (WR-01 – WR-07) should be triaged before next phase but don't block closure. Info-level items are technical-debt capture for a later cleanup pass.

**Priority fix order:**
1. CR-01 `slider.tsx` double-thumb
2. CR-02 `community-index.json` + `expert.mdx` backslash escape
3. WR-01 `aufgabe-client.tsx` timeout race
4. WR-06 `confidence-slider-widget.tsx` free-points default
5. WR-02 `use-is-touch.ts` hydration
6. WR-04 touch-target min-h on 3 sites
7. WR-03 radio-group arrow-keys
8. WR-05 `widget-router.tsx` remove `as any`
9. WR-07 `prompt-best-pick-widget.tsx` innerHTML fallback
