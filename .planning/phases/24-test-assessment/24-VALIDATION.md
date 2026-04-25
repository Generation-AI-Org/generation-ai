---
phase: 24
slug: test-assessment
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-24
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution of /test AI Literacy Assessment.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x (unit, jsdom) + Playwright 1.x (smoke, in packages/e2e-tools) |
| **Config file** | `apps/website/vitest.config.mts` + `packages/e2e-tools/playwright.config.ts` |
| **Quick run command** | `pnpm --filter @genai/website test -- lib/assessment` |
| **Full suite command** | `pnpm --filter @genai/website test && pnpm --filter @genai/website build` |
| **Estimated runtime** | ~25s (unit) + ~60s (build) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @genai/website test -- lib/assessment` (scoring unit tests)
- **After every plan wave:** Run full unit suite + `pnpm --filter @genai/website build`
- **Before `/gsd-verify-work`:** Unit suite green + build `ƒ /test`, `ƒ /test/aufgabe/[n]`, `ƒ /test/ergebnis` + Playwright smoke `test-assessment.spec.ts` green against local dev server
- **Max feedback latency:** 30s (unit), 90s (build+smoke)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Purpose | Test Type | Automated Command | Status |
|---------|------|------|---------|-----------|-------------------|--------|
| 24-01-01 | 01 | 1 | Dependencies installed | build | `pnpm --filter @genai/website build` | ⬜ pending |
| 24-01-02 | 01 | 1 | MDX config + pageExtensions | build | `pnpm --filter @genai/website build` | ⬜ pending |
| 24-02-01 | 02 | 1 | Types discriminated-union + Answer typings | tsc | `pnpm --filter @genai/website exec tsc --noEmit` | ⬜ pending |
| 24-02-02 | 02 | 1 | scoring.ts deterministic pure-fn | unit | `pnpm --filter @genai/website test -- scoring` | ⬜ pending |
| 24-02-03 | 02 | 1 | Scoring fixtures cover 3 answer patterns | unit | `pnpm --filter @genai/website test -- scoring` | ⬜ pending |
| 24-03-01 | 03 | 1 | questions.json has ≥10 items, ≥5 widget types | unit | `pnpm --filter @genai/website test -- content` | ⬜ pending |
| 24-03-02 | 03 | 1 | 5 MDX profile files present | build | `pnpm --filter @genai/website build` | ⬜ pending |
| 24-03-03 | 03 | 1 | community-index.json 10-20 entries, level-indexed | unit | `pnpm --filter @genai/website test -- community` | ⬜ pending |
| 24-04-01 | 04 | 2 | CardPickWidget + MCWidget keyboard-operable | unit (RTL) | `pnpm --filter @genai/website test -- widgets` | ⬜ pending |
| 24-04-02 | 04 | 2 | ConfidenceSliderWidget ARIA-slider | unit (RTL) | `pnpm --filter @genai/website test -- confidence` | ⬜ pending |
| 24-04-03 | 04 | 2 | FillInWidget native select + shiki code | unit (RTL) | `pnpm --filter @genai/website test -- fill-in` | ⬜ pending |
| 24-05-01 | 05 | 2 | DragRankWidget sortable order | unit (RTL) | `pnpm --filter @genai/website test -- drag-rank` | ⬜ pending |
| 24-05-02 | 05 | 2 | MatchingWidget mobile dropdown fallback | unit (RTL) | `pnpm --filter @genai/website test -- matching` | ⬜ pending |
| 24-06-01 | 06 | 2 | PromptBestPickWidget shiki-highlighted | unit (RTL) | `pnpm --filter @genai/website test -- prompt-best-pick` | ⬜ pending |
| 24-06-02 | 06 | 2 | SideBySideWidget two-phase reveal | unit (RTL) | `pnpm --filter @genai/website test -- side-by-side` | ⬜ pending |
| 24-06-03 | 06 | 2 | FehlerspotWidget click-to-mark span | unit (RTL) | `pnpm --filter @genai/website test -- fehlerspot` | ⬜ pending |
| 24-07-01 | 07 | 3 | /test route renders with hero | build | `pnpm --filter @genai/website build` | ⬜ pending |
| 24-07-02 | 07 | 3 | /test/aufgabe/[n] dynamic route renders | build | `pnpm --filter @genai/website build` | ⬜ pending |
| 24-07-03 | 07 | 3 | AufgabeLayout + URL-state guard | unit (RTL) | `pnpm --filter @genai/website test -- aufgabe-layout` | ⬜ pending |
| 24-08-01 | 08 | 3 | /test/ergebnis route + LevelBadge | build | `pnpm --filter @genai/website build` | ⬜ pending |
| 24-08-02 | 08 | 3 | SkillRadarChart renders 5 dims | unit (RTL) | `pnpm --filter @genai/website test -- radar` | ⬜ pending |
| 24-08-03 | 08 | 3 | SparringSlot placeholder mode | unit (RTL) | `pnpm --filter @genai/website test -- sparring-slot` | ⬜ pending |
| 24-08-04 | 08 | 3 | CTA emits /join query params correctly | unit (RTL) | `pnpm --filter @genai/website test -- results-cta` | ⬜ pending |
| 24-09-01 | 09 | 4 | Meta tags on all 3 routes | build | `pnpm --filter @genai/website build` + grep | ⬜ pending |
| 24-09-02 | 09 | 4 | Sitemap includes /test | unit | `pnpm --filter @genai/website test -- sitemap` | ⬜ pending |
| 24-09-03 | 09 | 4 | Playwright smoke E2E walks test → results → /join link | e2e | `pnpm --filter @genai/e2e-tools exec playwright test test-assessment.spec.ts` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/lib/assessment/__tests__/fixtures.ts` — 3 answer patterns (low/mid/high) with expected `{level, slug, skills}`
- [ ] `apps/website/__tests__/components/test/` dir created for widget RTL tests
- [ ] `packages/e2e-tools/tests/test-assessment.spec.ts` — smoke stub (red) before implementation

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Visual widget feel (Framer Motion transitions, drag feel, hover glow) | Subjective UX polish | Run `pnpm --filter @genai/website dev`, walk through /test on localhost, verify transitions feel right |
| Mobile touch interaction on real device | Emulator cannot validate haptic feel | Open /test on iOS Safari + Android Chrome, test W1/W2/W6 touch flows |
| Keyboard drag-drop for W2/W6 | Screen-reader output must be verified | Enable VoiceOver / NVDA, navigate via Tab → Space → Arrow keys, verify announcements |
| Content accuracy (questions have correct answers, distractors plausible, level profiles tone-match brand) | Editorial review | Luca reviews questions.json + profiles/*.mdx after execute |
| Checkpoint micro-celebration (Aufgabe 5 → 6) | Visual verification | Walk through to Aufgabe 5 on localhost, confirm "Halbzeit!" text + confetti (or reduced-motion fallback text-only) |
| Lighthouse scores >90 on all 3 routes | Real-network measurement | `pnpm lhci --collect` against local Prod build, or manual Lighthouse run in DevTools |

---

## Validation Sign-Off

- [ ] All 26 tasks have `<automated>` verify or explicit Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all fixture/helper references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
