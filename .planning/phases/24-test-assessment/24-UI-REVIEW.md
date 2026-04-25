---
phase: 24
slug: test-assessment
type: ui-review
status: complete
audited: 2026-04-24
baseline: 24-UI-SPEC.md (approved 2026-04-24)
screenshots: not captured (dev server at localhost:3000 detected but code-only audit per phase context)
scores:
  copywriting: 3
  visuals: 3
  color: 4
  typography: 3
  spacing: 4
  experience_design: 3
  total: 20
---

# Phase 24 — UI Review

**Audited:** 2026-04-24
**Baseline:** 24-UI-SPEC.md (approved — 6/6 dimensions)
**Screenshots:** Not captured (code-only audit — no browser interaction required per phase context)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | All spec CTAs implemented correctly; checkpoint overlay is text-only (no header-bg per spec); minor: trust line is duplicated on hero |
| 2. Visuals | 3/4 | Strong widget visual variety and hierarchy; checkpoint celebration misses spec's header-strip bg shift and renders as full-screen overlay instead |
| 3. Color | 4/4 | Accent reserved exactly per contract; level colors correct; bg-primary in Progress/Slider resolves to --accent via globals.css aliasing |
| 4. Typography | 3/4 | Two spec deviations: level badge number uses text-3xl (spec: 48px Geist Mono), empfehlungs heading uses text-2xl (spec: --fs-h2 token); one arbitrary eyebrow size text-[11px] |
| 5. Spacing | 4/4 | 8pt scale adherence excellent; 48px touch targets enforced on all interactive elements; two w-[Nrem] label spans in ConfidenceSlider are justified layout aids |
| 6. Experience Design | 3/4 | Loading/error/empty states covered well; DragRankWidget missing the spec-required "Reihenfolge bestätigen" confirm button; no error.tsx boundary for /test routes |

**Overall: 20/24**

---

## Top 3 Priority Fixes

1. **DragRankWidget missing "Reihenfolge bestätigen" confirm button** — The spec (W2) requires an explicit confirm button as the enable condition for Nächste Aufgabe ("Reihenfolge bestätigen" button that enables Nächste Aufgabe), but `isAnswerReady` currently passes once any drag has occurred and items fill `order`. Without the confirm step, users who drag accidentally cannot undo their decision since there is no back button (D-06). Fix: add a "Reihenfolge bestätigen" button below the drag list that sets a `confirmed: true` flag in the answer, and gate `isAnswerReady` on that flag for `rank` type questions.

2. **Typography spec drift: level badge number and empfehlungs section heading** — `level-badge.tsx:55` uses `text-3xl` (approx. 30px) for the level number; spec requires 48px. `test-results-client.tsx:67` uses hardcoded `text-2xl font-semibold` for the empfehlungs heading instead of `style={{ fontSize: 'var(--fs-h2)' }}`. Fix: replace `text-3xl` with `style={{ fontSize: '48px' }}` or a DS token on the level number; replace `text-2xl` with `style={{ fontSize: 'var(--fs-h2)' }}` on the empfehlungs heading.

3. **CheckpointCelebration visual deviation from spec** — The spec defines the checkpoint as a header-strip background shift (`var(--bg) → var(--accent-soft)` with "Halbzeit! Weiter so." centered in the header). The implementation renders as a full-screen `absolute inset-0` overlay with the same text. This causes visual weight mismatch: a full-screen dimming overlay is far more disruptive than the spec's subtle header accent pulse, and it prevents users from seeing the progress bar update. Fix: scope the celebration to `h-14 absolute top-0 left-0 right-0` matching the header strip dimensions, and apply `bg-[var(--accent-soft)]` as the bg transition rather than overlaying the widget area.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Against spec — all declared strings verified:**

| Element | Spec | Implementation | Status |
|---------|------|----------------|--------|
| Hero H1 | "Wo stehst du wirklich mit KI?" | Matches exactly — `test-hero-section.tsx:57` | PASS |
| Hero Subline | "15 Minuten. 10 Aufgaben. Ehrliches Ergebnis." | Matches — `test-hero-section.tsx:69` | PASS |
| Hero Lede | "Kein Selbsteinschätzungs-Quiz — wir fragen ab, was du kannst." | Matches — `test-hero-section.tsx:77` | PASS |
| Trust line | "Kein Self-Assessment — wir fragen ab, was du kannst, nicht was du glaubst zu können." | `test-hero-section.tsx:108` | PASS (but duplicate intent with lede — see below) |
| Badge row | "Kostenlos · Keine Anmeldung · Anonym · Max 15 Min" | Rendered as 4 separate pills — `test-hero-section.tsx:10-11` | PASS |
| Primary CTA (Hero) | "Test starten" | `test-hero-section.tsx:99` | PASS |
| Nächste Aufgabe button | "Nächste Aufgabe" | `aufgabe-layout.tsx:88` | PASS |
| Nächste Aufgabe disabled tooltip | "Beantworte zuerst diese Aufgabe" | `aufgabe-layout.tsx:80` | PASS |
| Checkpoint text | "Halbzeit! Weiter so." | `checkpoint-celebration.tsx:30` | PASS |
| Empty state (no result) | "Kein Ergebnis vorhanden. Starte den Test, um dein Ergebnis zu sehen." | `no-result-fallback.tsx:12` | PASS |
| Empfehlungs heading | "Das empfehlen wir für Level {N}" | `test-results-client.tsx:68` | PASS |
| PRISMA message | Matches spec verbatim | `sparring-slot.tsx:17-18` | PASS |
| Sparring CTA | "Jetzt beitreten →" | `sparring-slot.tsx:59` | PASS |
| Primary CTA (Results) | "Jetzt beitreten & loslegen" | `results-cta-cluster.tsx:55` | PASS |
| Secondary CTA (Results) | "Test nochmal machen" | `results-cta-cluster.tsx:61` | PASS |
| W5 instruction | "Klicke auf den problematischen Textabschnitt." | `fehlerspot-widget.tsx:37` | PASS |
| W2 mobile helper | "Tippe zum Auswählen, dann Zielposition." | `drag-rank-widget.tsx:249` | PASS |
| Error state (load failure) | Handled via notFound() in server component | `aufgabe/[n]/page.tsx:26` | PARTIAL — no human-readable error page specific to questions.json load failure |

**Minor issue — hero trust line and lede overlap in meaning:**
The lede (`test-hero-section.tsx:77`: "Kein Selbsteinschätzungs-Quiz — wir fragen ab, was du kannst.") and the trust line (`test-hero-section.tsx:108`: "Kein Self-Assessment — wir fragen ab, was du kannst, nicht was du glaubst zu können.") express the same concept twice in different words. The spec defines both as distinct; in practice they feel redundant. This is a content refinement, not a blocking issue.

**Generic labels check:** No "Submit", "Click Here", "OK", "Cancel", or "Save" found. No "No data" / "Nothing here" patterns. Profile MDX content is appropriately specific and persona-relevant (neugieriger.mdx, expert.mdx reviewed — tone matches brand voice: direct, motivating, community-pointing).

**SEO metadata:** Title, description, OG, Twitter, canonical, robots all match spec — `layout.tsx` and route-level metadata verified.

---

### Pillar 2: Visuals (3/4)

**Hero (/test):**
- LabeledNodes background with `relative isolate` wrapper — matches subpage hero pattern.
- H1 focal point clear: `--fs-display` Geist Mono + text-shadow creates strong anchor.
- Eyebrow line (`// Generation AI · AI Literacy Test`) with accent dot pulse — good entry hook.
- Badge row creates scannable trust row above fold — distinct from buttons.
- CTA button (`bg-[var(--accent)] rounded-full`) appropriately dominant.

**Task page (/test/aufgabe/[n]):**
- Minimal header strip with progress bar only — correct chrome reduction.
- Question stem H2 at `text-xl sm:text-2xl font-semibold` provides clear anchor before widget.
- Widget visual variety across 9 types creates genuine cognitive diversity — meets the "interaktiv & spannend" brief.
- Widget-to-widget transitions via Framer Motion AnimatePresence (mode="wait", x±30/20px) provide clear spatial direction.
- Nächste Aufgabe button fixed to footer with border-top — consistently findable.

**Widget visual consistency observations:**
- CardPickWidget, MCWidget, PromptBestPickWidget, SideBySide all share the same selected-state visual (border-accent + check icon top-right) — creates learned interaction pattern.
- DragRankWidget drag state (border-accent bg on picked item) is visually clear.
- FehlerspotWidget instruction banner appears but selected spans only get accent-soft bg + underline — the default state provides no visual affordance that spans are clickable. Users may not discover the interaction without the instruction.
- MatchingWidget desktop: tools appear as a wrapping flex grid above drop zones — spatial relationship between tools and drop targets is functional but not immediately obvious. The "hierher ziehen" placeholder text inside drop zones helps.

**Results page (/test/ergebnis):**
- Level Badge → Profile text → Radar → Empfehlungs-Cards → Sparring → CTAs is a clean narrative scroll.
- SectionTransition `soft-fade` between sections prevents visual abruptness.
- PRISMA sparring slot is visually contained and clearly labeled "Kommt bald" — no false affordance.

**Checkpoint celebration deviation:**
- Spec: header strip background transitions to `--accent-soft` with text centered in the `h-14` strip.
- Implementation: `absolute inset-0` overlay covering the entire main content area (`checkpoint-celebration.tsx:21`). The confetti dots fire from `top-1/2 left-1/2` of whatever container they're in, which is the full main area — this means confetti bursts from mid-screen rather than from the progress bar area. The 8 CSS keyframe animations (`confetti-burst-0` through `confetti-burst-7`) are present and correct in globals.css, but the overlay scope is wrong.

---

### Pillar 3: Color (4/4)

**60/30/10 split verification:**
- Dominant (60%): `var(--bg)` = `#141414` on task pages, page bg — correct.
- Secondary (30%): `var(--bg-card)` on all widget cards — consistent.
- Elevated: `var(--bg-elevated)` for selected states and drag-over zones — consistent.
- Accent (10%): reserved usage verified (see table below).

**Accent reservation compliance:**

| Usage | Spec allows? | Actual location |
|-------|-------------|-----------------|
| Primary CTA buttons (hero + aufgabe + results + fallback) | Yes | All 4 locations correct |
| Progress bar fill | Yes | Via `bg-primary` → `--color-primary: var(--accent)` aliased in globals.css:18 |
| Selected card border (border-accent) | Yes | All card widgets use `border-[var(--border-accent)]` |
| Level badge background/border | Yes | `level-badge.tsx:49-51` via `color-mix()` |
| Focus rings | Yes | `focus-visible:outline-[var(--accent)]` on all interactive elements |
| Confetti dots | Yes | `checkpoint-celebration.tsx:36` |
| Empfehlungs card link text | Yes (CTA link) | `empfehlungs-card.tsx:33` |
| Sparring slot link | Yes (text link in message) | `sparring-slot.tsx:57` |
| Sparring send button (disabled) | Yes (primary button, disabled state) | `sparring-slot.tsx:77` |
| Header logo dot | Borderline — decorative element | `aufgabe-layout.tsx:46` — small accent dot on GenAI logo in header; not explicitly in reserved list but minor |

**Level color system:**
All 5 levels use correct color vars per spec:
- neugieriger: `--slate-9` — `level-badge.tsx:21`
- einsteiger: `--brand-blue` — `level-badge.tsx:22`
- fortgeschritten: `--brand-neon` — `level-badge.tsx:25`
- pro: `--brand-pink` — `level-badge.tsx:29`
- expert: `--brand-red` — `level-badge.tsx:30`

Skill Radar chart uses the same `LEVEL_COLOR` map — `skill-radar-chart.tsx:16-23`.

**No hardcoded hex colors found** in any test component (grep confirmed clean). All colors go through CSS custom properties.

**bg-primary / bg-muted in primitive components:** `progress.tsx:48` uses `bg-primary` (indicator fill) and `bg-muted` (track). `slider.tsx:37` uses `bg-muted` (track) and `bg-primary` (range). These resolve correctly because `globals.css:18` sets `--color-primary: var(--accent)` — the Progress fill is indeed accent-colored.

---

### Pillar 4: Typography (3/4)

**Font size distribution in test components:**
- `text-sm` — 42 occurrences (body in widgets, labels, buttons)
- `text-xs` — 7 occurrences (meta labels, keyboard hint in drag-rank)
- `text-xl` — 4 occurrences (question stem H2, empfehlungs card title, fallback H1)
- `text-base` — 3 occurrences (option card text, fehlerspot instruction, passage body)
- `text-2xl` — 3 occurrences (question stem H2 desktop, empfehlungs heading, fallback H1 desktop)
- `text-3xl` — 2 occurrences (level badge number)

**Against spec (4-size scale: Display / Heading / Body / Small):**

| Element | Spec | Implementation | Finding |
|---------|------|----------------|---------|
| Hero H1 | `var(--fs-display)` Geist Mono | `style={{ fontSize: 'var(--fs-display)' }}` + `font-mono` — `test-hero-section.tsx:54-55` | PASS |
| Results H1 (Level Name) | `var(--fs-display)` Geist Mono | `style={{ fontSize: 'var(--fs-display)' }}` — `level-badge.tsx:65` | PASS |
| Subline (hero) | `var(--fs-h2)` Geist Mono bold | `style={{ fontSize: 'var(--fs-h2)' }}` + `font-mono font-bold` — `test-hero-section.tsx:63-66` | PASS |
| Question stem H2 | `var(--fs-h2)` Geist Sans weight 700 | `text-xl sm:text-2xl font-semibold` — `aufgabe-client.tsx:112` | DEVIATION — uses px class scale not DS token; weight is semibold not 700 |
| Empfehlungs heading | `var(--fs-h2)` Geist Sans weight 700 | `text-2xl font-semibold` — `test-results-client.tsx:67` | DEVIATION — hardcoded `text-2xl` not DS token |
| Level badge number | 48px Geist Mono weight 700 | `text-3xl font-bold` (~30px) — `level-badge.tsx:55` | DEVIATION — 18px smaller than spec |
| Buttons | Geist Mono 14px weight 700 tracking +0.02em | All CTAs use `font-mono text-sm font-bold tracking-[0.02em]` | PASS |
| Body text (widgets) | Geist Sans 16px weight 400 | `text-base` or `text-sm` in most widgets | MINOR — option-card uses `text-base`, most widget body uses `text-sm` |
| Small / meta text | 14px weight 400 | `text-sm` consistent | PASS |
| Code blocks (shiki, fill-in) | Geist Mono 14px | `font-mono text-sm` + `style={{ fontFamily: 'var(--font-geist-mono)' }}` | PASS |
| Widget/level badges | Geist Mono 14px weight 700 tracking +0.08em | `font-mono text-sm font-bold tracking-[0.08em]` | PASS |

**Eyebrow arbitrary size:** `test-hero-section.tsx:34` uses `text-[11px]` — one arbitrary size outside the 4-size scale. Acceptable as an eyebrow label (too large at `text-xs`/12px, too visible at `text-sm`/14px), but technically outside the declared spec.

**Font weight discipline:** Only `font-bold` (14 occurrences) and `font-semibold` (5 occurrences) used — no unexpected weights. Semibold appears on H2-level text (question stem, card titles) and bold on all button/mono/label elements. Consistent with intent.

---

### Pillar 5: Spacing (4/4)

**Spacing scale adherence:**

Most common spacing values map to spec tokens:
- `gap-3` (12px) — widget card gaps, badge gaps
- `p-3` (12px) — card inner padding (compact widgets)
- `p-4` (16px, `--space-4`) — card inner padding (standard), code blocks
- `px-4 py-8` (widget area) — within mobile spec
- `px-8 py-3` (CTA buttons) — consistent
- `gap-4` (16px) — grid gaps
- `py-8` (section padding)
- `py-16` (level badge hero section)
- `py-12` (CTA cluster)

The spacing is rhythmically consistent across pages. No rogue margin/padding values that break the 4-base grid were found.

**Arbitrary values found (justified):**
- `min-h-[48px]` / `min-w-[48px]` — touch target enforcement per spec
- `min-h-[80px]` — option card minimum height (spec: 80px for desktop cards)
- `min-h-[160px]` / `max-h-[240px]` — sparring slot message area (matches spec exactly)
- `max-h-[48px]` — not found (good)
- `w-[4rem]` / `w-[3rem]` in `confidence-slider-widget.tsx:86,109` — label columns for semantic/percent tick alignment. Justified layout aid, not a spacing token violation.

**Touch target compliance:**
All interactive elements verified at ≥48px:
- Option cards: `min-h-[80px]` — 80px, PASS
- Drag handles: `min-h-[48px] min-w-[48px]` — `drag-rank-widget.tsx:69`
- Tap fallback buttons: `min-h-[48px]` — `drag-rank-widget.tsx:123`
- Matching tool draggables: `min-h-[48px]` — `matching-widget.tsx:53`
- Matching drop zones: `min-h-[48px]` — `matching-widget.tsx:89`
- Touch select (matching): `min-h-[48px]` — `matching-widget.tsx:193`
- SideBySide reason chips: `min-h-[48px]` — `side-by-side-widget.tsx:162`
- Nächste Aufgabe button: `min-h-[48px]` — `aufgabe-layout.tsx:82`
- Hero CTA: `min-h-[48px]` — `test-hero-section.tsx:97`
- Results secondary CTA: `min-h-[48px]` — `results-cta-cluster.tsx:61`
- Slider thumb: shadcn Slider uses `after:absolute after:-inset-2` extending tap target to ~44px. Borderline — `size-3` thumb (12px) with `-inset-2` (8px) extension = 28px effective touch target. The slider `onKeyDown` handler on the parent `div` mitigates keyboard access, but touch target is slightly below 44px threshold for the thumb itself.

---

### Pillar 6: Experience Design (3/4)

**State coverage:**

| State type | Coverage | Evidence |
|-----------|---------|---------|
| Loading — widget pre-resolve | Skeleton shell for touch-detection hydration | `drag-rank-widget.tsx:224-243`, `matching-widget.tsx:154-171` — opacity-60 neutral shell during SSR hydration |
| Error — empty result (deep link) | NoResultFallback with accent CTA | `test-results-client.tsx:24-33`, `no-result-fallback.tsx` |
| Error — invalid aufgabe URL | notFound() → 404 | `aufgabe/[n]/page.tsx:25-27` |
| Error — missing prior answers (deep link) | Redirect to /test | `aufgabe-client.tsx:58-68` |
| Error — questions.json load failure | No user-visible error state — `loadQuestions()` throws, caught by Next.js error boundary (global), not a custom /test/error.tsx | MISSING — no route-specific error boundary |
| Disabled state — Nächste Aufgabe | `disabled + aria-disabled + cursor-not-allowed + opacity-50 + tooltip` | `aufgabe-layout.tsx:79-88` |
| Disabled state — PRISMA input | `disabled + aria-disabled + opacity-50 + cursor-not-allowed` | `sparring-slot.tsx:68-73` |
| Disabled state — confirmed answers | All widgets accept `disabled` prop and apply `disabled:opacity-60 disabled:cursor-not-allowed` | Verified across all 9 widget types |
| Empty state — empfehlungs cards | If `recs` is empty, grid renders empty — no explicit "no recommendations" state | MINOR — unlikely in practice (loadRecommendations always returns content) |

**Keyboard navigation:**
All widgets implement keyboard nav per spec. Roving tabindex via `useRadioGroupKeyboard` hook is used consistently in CardPick, MC, SideBySide, PromptBestPick — this is a strong a11y pattern. DragRank uses dnd-kit's built-in keyboard sensor + Space/Arrow/Escape. Matching uses dnd-kit for desktop. FillIn and ConfidenceSlider use native `<select>` and shadcn Slider respectively.

**Focus management:**
The question stem H2 has `tabIndex={-1}` (`aufgabe-client.tsx:111`) — correct. However, the code does not explicitly call `ref.focus()` on the H2 after the Framer Motion transition completes. The spec requires: "On Aufgabe transition complete: focus moves to the question stem `<h2>` via `ref.focus()`". This means screen readers may not automatically read the new question heading on route change. This is a real a11y gap.

**Reduced-motion:**
All Framer Motion components implement `useReducedMotion()` with correct fallbacks:
- `aufgabe-client.tsx:104-107` — no translate, opacity only at 150ms
- `level-badge.tsx:41-43` — opacity only at 150ms
- `side-by-side-widget.tsx:23 + 137` — reduced duration
- `checkpoint-celebration.tsx:17, 25` — no confetti rendered, opacity-only transition
- CSS `@media (prefers-reduced-motion: reduce)` in globals.css pauses all loop animations and disables confetti keyframes

**DragRankWidget "Reihenfolge bestätigen" gap:**
Per spec W2: "Nächste-Aufgabe-Button enable condition: all 4 cards have been interacted with (any reorder, or explicit 'I'm done' — widget shows 'Reihenfolge bestätigen' button that enables Nächste Aufgabe)". The implementation (`widget-router.tsx:155-158`) only checks `a.order.length === question.items.length` — which is true from initial render since order is pre-populated. The widget calls `commit()` (fires `onAnswer`) only on drag/tap, so the button IS blocked until interaction. But there is no explicit "Reihenfolge bestätigen" confirmation step — once any drag occurs, the user could advance immediately without consciously confirming their order.

---

## Registry Safety

Registry audit: 1 third-party block checked (`labeled-nodes` from @aceternity — already in codebase, no new fetch).

Suspicious pattern scan: no `fetch(`, `XMLHttpRequest`, `navigator.sendBeacon`, `process.env`, `eval(`, `Function(`, or external dynamic imports found in `components/ui/labeled-nodes.tsx`.

Result: **No flags** — registry safety PASS.

---

## Files Audited

**Routes:**
- `/Users/lucaschweigmann/projects/generation-ai/apps/website/app/test/page.tsx`
- `/Users/lucaschweigmann/projects/generation-ai/apps/website/app/test/layout.tsx`
- `/Users/lucaschweigmann/projects/generation-ai/apps/website/app/test/aufgabe/[n]/page.tsx`
- `/Users/lucaschweigmann/projects/generation-ai/apps/website/app/test/ergebnis/page.tsx`

**Top-level components:**
- `components/test/test-client.tsx`
- `components/test/test-layout-provider.tsx`
- `components/test/test-hero-section.tsx`
- `components/test/aufgabe-client.tsx`
- `components/test/aufgabe-layout.tsx`
- `components/test/test-results-client.tsx`
- `components/test/widget-router.tsx`
- `components/test/checkpoint-celebration.tsx`
- `components/test/level-badge.tsx`
- `components/test/skill-radar-chart.tsx`
- `components/test/empfehlungs-card.tsx`
- `components/test/sparring-slot.tsx`
- `components/test/results-cta-cluster.tsx`
- `components/test/no-result-fallback.tsx`

**Widget components (9):**
- `components/test/widgets/card-pick-widget.tsx`
- `components/test/widgets/drag-rank-widget.tsx`
- `components/test/widgets/prompt-best-pick-widget.tsx`
- `components/test/widgets/side-by-side-widget.tsx`
- `components/test/widgets/fehlerspot-widget.tsx`
- `components/test/widgets/matching-widget.tsx`
- `components/test/widgets/confidence-slider-widget.tsx`
- `components/test/widgets/fill-in-widget.tsx`
- `components/test/widgets/mc-widget.tsx`
- `components/test/widgets/option-card.tsx`
- `components/test/widgets/widget-types.ts`

**Primitives:**
- `components/ui/progress.tsx`
- `components/ui/slider.tsx`
- `components/ui/labeled-nodes.tsx` (registry audit)

**Globals:**
- `apps/website/app/globals.css` (Phase 24 confetti keyframes)
- `packages/config/tailwind/base.css` (CSS variable definitions)
- `apps/website/components.json` (shadcn config)

**Content:**
- `content/assessment/questions.json` (first 80 lines)
- `content/assessment/profiles/neugieriger.mdx`
- `content/assessment/profiles/fortgeschritten.mdx`
- `content/assessment/profiles/expert.mdx`
