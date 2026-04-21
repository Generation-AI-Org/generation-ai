---
phase: 20-navigation-landing-skeleton
plan: 03
subsystem: ui
tags: [motion, aurora, number-ticker, scroll-divergence, csp-nonce, a11y, reduced-motion]

# Dependency graph
requires:
  - phase: 20-navigation-landing-skeleton
    plan: 01
    provides: "AuroraBackground + NumberTicker copy-ins, brand-aurora CSS vars, reduced-motion guard in globals.css"
  - phase: 20-navigation-landing-skeleton
    plan: 02
    provides: "Hero-Section + Discrepancy-Section stubs wired in home-client.tsx, MotionConfig with request nonce"
  - phase: 16-brand-system-foundation
    provides: "brand-{blue,neon,pink,red}-{1-12} scales, --accent + --accent-glow + --text-on-accent vars"
provides:
  - "Hero-Section with AuroraBackground + claim placeholder + Primary-CTA → /join (R1.2)"
  - "Discrepancy-Section with 6 locked Number-Tickers + scroll-divergence Bento-Split + Closer (R1.3)"
  - "Both sections reduced-motion safe: useReducedMotion + CSS @keyframe guard in globals.css"
  - "Both sections pass R1.2 + CSP Playwright tests (2/2) green against local prod"
affects: [20-04, 20-05, 20-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reduced-motion split pattern: useReducedMotion() → (a) motion initial={false} to skip entry, (b) useTransform ranges [0%,0%] instead of [0%,±4%] to neutralize scroll-driven x-translation"
    - "Scroll-divergence with CLS-mitigation: useScroll target + offset ['start 80%','end 20%'] + useTransform x ±4% + overflow-hidden on section — ±4% stays inside the clipped container, zero layout-shift"
    - "NumberTicker inView gate: outer useInView(ref, { amount: 0.3, once: true }) on the tickers container gates {tickersInView ? <NumberTicker /> : <span>0</span>} — prevents tickers from counting pre-scroll while still using the component's internal useInView for the spring transition"
    - "Brand-aurora theme-swap rides on Plan-01 --brand-aurora-{1..5} CSS vars — Hero just mounts <AuroraBackground> and gets dark/light theme-awareness automatically via the .light override"

key-files:
  created: []
  modified:
    - "apps/website/components/sections/hero-section.tsx"
    - "apps/website/components/sections/discrepancy-section.tsx"

key-decisions:
  - "Hero claim wording is explicit Deferred per CONTEXT.md — kept a substantive placeholder ('KI-Skills, die im Studium fehlen.' + subline) instead of lorem-ipsum so the section reads as real even in preview reviews"
  - "NumberTicker inView gating via outer useInView wrapper (conditional render) + the component's own internal useInView for spring-transition — keeps the ticker dormant before the container enters viewport, then triggers both the mount and the spring in one step"
  - "Aurora mounted with min-h-[80vh] override (not 100vh) — leaves a visible transition to the Discrepancy-Section below without requiring scroll into a second 'screen' of pure aurora"
  - "Both column panels use light/dark token pairs: light bg-brand-{blue,red}-2 (soft tinted background) + text-brand-{blue,red}-11 (strong-contrast brand accent); dark dark:bg-brand-{blue,red}-12/40 (40% opacity depth tint) + dark:text-brand-{neon,pink}-9 (vivid neon text for the wow-factor)"

patterns-established:
  - "Hero Aurora-mount pattern: <section aria-labelledby data-section> → <AuroraBackground className='min-h-[80vh]'> → <motion.div z-10 relative>{content}</motion.div>. The section preserves the required wrapper attrs from Plan 02; Aurora supplies the canvas; motion.div handles entry animation + respects reduced-motion."
  - "Discrepancy scroll-divergence pattern: useRef<HTMLElement> + useScroll({target, offset}) + two useTransform mirroring [±4%] → style={{x}} on the two panels. Overflow-hidden on the parent section clips the ±4% creep — no CLS. Reduced-motion switches both useTransform ranges to ['0%','0%']."

requirements-completed: [R1.2, R1.3]

# Metrics
duration: 18min
completed: 2026-04-20
---

# Phase 20 Plan 03: Hero + Discrepancy (Wow-Peaks 1+2) Summary

**Hero-Section gefüllt mit Aurora-Background + Claim-Placeholder + Primary-CTA nach `/join`. Discrepancy-Section gefüllt mit Custom-Bento-Split, 6 lockierten Number-Tickern (7× / 56% / 73% | 83.5% / 75% / 6.4%), scroll-getriebener Spalten-Divergenz (±4%, CLS-safe via overflow-hidden) und Closer-Zeile "Generation AI schließt diese Lücke." Reduced-Motion sauber in beiden Sections: Aurora-Keyframe pausiert via globals.css, motion-Entries skippen, useTransform liefert 0%. R1.2 + CSP Playwright grün (2/2) gegen lokalen Prod. Build grün mit `ƒ /`. Wow-Peaks 1+2 visuell platziert.**

## Performance

- **Duration:** ~18 min (inkl. Build + Smoke + Playwright + Summary)
- **Tasks:** 2/2
- **Files modified:** 2
- **Commits:** 2 (plus this SUMMARY commit)

## Task Commits

Each task was committed atomically on branch `feature/phase-20-landing-skeleton`:

1. **Task 1 — Hero-Section mit Aurora-Background + CTA** — `c52cc4f` (feat)
2. **Task 2 — Discrepancy-Section mit Bento-Split + Number-Ticker + Divergenz** — `55b286a` (feat)

## Hero Implementation Details

**Structure:**
- `<section aria-labelledby="hero-heading" data-section="hero" className="relative isolate">`
  - `<AuroraBackground className="min-h-[80vh]">` — Plan-01-copy, 90% Raycast-vibe swirl
    - `<motion.div initial={…} animate={…} className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">`
      - Kicker: "Generation AI · DACH-Community" (font-mono text-xs tracking-[0.2em] text-text-muted)
      - H1 (id="hero-heading"): "KI-Skills, die im Studium fehlen." (placeholder, Marketing-Pass pending)
      - Sub-Line: "Die Community für Studierende, die KI nicht nur benutzen, sondern verstehen wollen."
      - CTA: `<Link href="/join">Jetzt beitreten</Link>` — bg-[var(--accent)] + hover shadow-[0_0_20px_var(--accent-glow)]
      - Micro: "Kostenlos · gemeinnützig · für Studierende und Early-Career"

**Aurora component used:** `AuroraBackground` (default named export) — Props taken: `children`, `className`. `showRadialGradient` default (true) kept. No prop-signature surprise.

**Reduced-motion:**
- `useReducedMotion()` → motion.div `initial={false}` + `animate={{}}` (no entry tween)
- Aurora CSS `@keyframes aurora` pauses via globals.css `@media (prefers-reduced-motion)` guard (Plan 01)

**Token choices:**
- Text: `text-text`, `text-text-muted`, `text-text-secondary` (semantic vars from packages/config/tailwind/base.css)
- CTA: `bg-[var(--accent)]` + `text-[var(--text-on-accent)]` + `hover:shadow-[0_0_20px_var(--accent-glow)]` (matches Component-Standards Primary-Button pattern)
- Typography: `font-mono` for H1 + kicker + CTA (Geist Mono, Phase 16 H1-role)

## Discrepancy Implementation Details

**Locked data (RESEARCH §D-09, not modified):**

| Side | # | Value | Suffix | Decimals | Label |
|------|---|-------|--------|----------|-------|
| LEFT "Was Wirtschaft will" | 1 | 7    | × | 0 | Nachfrage nach KI-Talent (2023→2025) |
| | 2 | 56   | % | 0 | Lohnaufschlag für KI-Kompetenz |
| | 3 | 73   | % | 0 | Unternehmen können KI nicht ausschöpfen |
| RIGHT "Was Studis mitbringen" | 4 | 83.5 | % | 1 | auf Anfänger-Level |
| | 5 | 75   | % | 0 | „Studium bereitet mich nicht vor." |
| | 6 | 6.4  | % | 1 | intensive KI-Lehre im Studium |

**NumberTicker props used** (matches the MagicUI copy-in signature verified in `apps/website/components/ui/number-ticker.tsx`):
- `value: number` ✓
- `decimalPlaces: number` ✓ (0 for integers, 1 for 83.5 + 6.4)
- `delay`, `direction`, `startValue`, `className` — not used (defaults fine)

**useScroll configuration:**
- `target: sectionRef` (ref on `<section>` root)
- `offset: ["start 80%", "end 20%"]` — progress starts when section top hits 80% viewport, completes when section bottom passes 20% viewport. Gives a calm divergence window during the whole section visit.

**Brand token choices:**

| Panel | Light BG | Light Header/Nums | Dark BG | Dark Header/Nums |
|-------|----------|-------------------|---------|------------------|
| LEFT Wirtschaft | `bg-brand-blue-2` | `text-brand-blue-11` | `dark:bg-brand-blue-12/40` | `dark:text-brand-neon-9` |
| RIGHT Studis | `bg-brand-red-2` | `text-brand-red-11` | `dark:bg-brand-red-12/40` | `dark:text-brand-pink-9` |

Rationale: Radix 12-step scales — step 2 for subtle tinted BGs (light-mode), step 11 for strong-contrast text on those BGs. Dark-mode uses step 12 with 40% alpha for depth + step 9 neon/pink for the wow-factor number color.

**Reduced-motion handling:**
- `useTransform(scrollYProgress, [0,1], prefersReducedMotion ? ["0%","0%"] : ["0%","-4%"])` — when reduced-motion is on, the transform is constant 0% (no panel drift)
- Intro + Closer motion.p/motion.div use `initial={false}` + empty `animate={{}}` when reduced-motion
- NumberTicker internally has its own `useInView` + spring — on reduced-motion the spring still runs briefly to reach final, which is fine per OQ-5 (final value display matters more than transition smoothness)

**CLS-mitigation (per RESEARCH OQ-5):**
- `overflow-hidden` on the section (clips the ±4% x-translation so it doesn't push sibling content)
- `will-change: transform` hint on both panels for GPU-compositing

## Motion-API usage

All Phase-20 motion bits use `motion/react` (never `framer-motion`):
- `motion` — `motion.div`, `motion.p`
- `useScroll` — scroll progress driver in Discrepancy
- `useTransform` — maps scrollYProgress to x-translation
- `useInView` — tickers-container visibility gate
- `useReducedMotion` — reduced-motion switch (both sections)

MotionConfig nonce (wired in home-client.tsx by Plan 02) automatically applies to all motion components — no per-component nonce plumbing needed.

## Build Output (proof / ƒ)

```
Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /api/auth/signup
├ ƒ /datenschutz
├ ƒ /impressum
├ ○ /robots.txt
└ ○ /sitemap.xml

ƒ Proxy (Middleware)
```

`/` stays `ƒ` (dynamic) — LEARNINGS.md CSP-gate respected.

## DOM Smoke (local prod on PORT=3030)

```bash
# href="/join" count
curl -s http://localhost:3030 | grep -oE 'href="/join"' | wc -l   # → 3
# (Header-Nav + Hero-CTA + Footer-Sitemap)

# Closer line present
curl -s http://localhost:3030 | grep -c "Generation AI schließt diese Lücke"   # → 1

# All 8 data-sections render
curl -s http://localhost:3030 | grep -oE 'data-section="[a-z-]+"' | sort -u
# → audience-split, community-preview, discrepancy, final-cta, hero, offering, tool-showcase, trust
```

## CSP Header (local prod proof)

```
content-security-policy: default-src 'self'; script-src 'self' 'nonce-YWY0ODM0YWYtZWNmNi00ZjQyLWE0MTAtYmY2MWEwOGZkMzlj' 'strict-dynamic' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'
```

Nonce per-request fresh, CSP intact after Aurora + useScroll-driven transforms mounted.

## Playwright Results

`E2E_BASE_URL=http://localhost:3030 pnpm exec playwright test landing.spec.ts -g "R1.2|CSP" --reporter=line`:

```
Running 2 tests using 2 workers

[1/2] [chromium] › landing.spec.ts:44:7 › Phase 20 — Landing › R1.2 — Hero CTA links to /join
[2/2] [chromium] › landing.spec.ts:74:7 › Phase 20 — Landing › CSP — keine Console-Errors mit 'Content Security Policy' auf Landing

2 passed (1.5s)
```

## Decisions Made

See frontmatter `key-decisions`. Notable:

- Hero claim kept as substantive placeholder (not lorem/TODO) so preview reviews still read as a real landing
- NumberTicker gating via outer `useInView` wrapper — cleaner than passing a `startOnVisible` prop (which the copy-in doesn't expose)
- Aurora mounted with `min-h-[80vh]` — leaves a natural transition to the Discrepancy-Section without requiring a full second screen of pure aurora

## Deviations from Plan

None. The plan was executed exactly as written:

- AuroraBackground export name matched the plan assumption (`AuroraBackground`, not `Aurora` / `AuroraBg`)
- NumberTicker prop signature matched the plan assumption (`value`, `decimalPlaces` both supported)
- No Rule 1 / 2 / 3 auto-fixes were needed
- No scope-boundary out-of-scope discoveries worth a deferred entry (pre-existing nested `<main>` in AuroraBackground copy is noted in hero-section.tsx as a comment but NOT fixed here — it lives in `components/ui/aurora-background.tsx` from Plan 01 and is out-of-scope for Plan 03)

## Issues Encountered

- None. Both sections compiled first-try, build first-try, smoke first-try, Playwright first-try.

## User Setup Required

None. Purely code changes.

## Known Stubs

None. Hero claim text is a substantive placeholder explicitly tracked as Deferred via CONTEXT.md + CONTEXT.md "Deferred Ideas" + ROADMAP Phase 26 — finales Wording kommt mit Marketing-Pass. The placeholder is clearly a section-functional statement, not a TODO string.

## Threat Flags

None. All changes are client-side section components consuming the already-wired MotionConfig nonce. No new network endpoints, auth paths, file access patterns, or schema changes.

## Next Phase Readiness

**Ready for Plan 04 (Offering + Tool-Showcase + Community-Preview):**
- Wave-3 section-stub contract held: outer `<section data-section="…">` + `id="…-heading"` preserved on both filled sections
- home-client.tsx NOT touched (Wave-2-Boundary respected per Plan 02)
- R1.2 test green → next tests to flip red→green: R1.5 (Tool-Showcase badge), R1.6 (Community-Preview badge)

**Ready for Plan 05 (Audience-Split + Trust + Final-CTA):**
- Same boundary contract
- R1.8 (Trust marquee reduced-motion) still pending Plan 05

**Ready for Plan 06 (Polish + Lighthouse-Gate):**
- Wow-Peaks 1+2 visually placed — Plan 06 Lighthouse run will measure LCP on the new Hero image-less design (Aurora is pure CSS gradients + mix-blend, cheap)
- CLS expected ≤0.1: Discrepancy divergence is overflow-clipped, no shift

## Manual Sight-Check Notes (for Plan 06 review)

- Hero: Aurora-swirl is visible and animated in dark mode; reduced-motion pauses the keyframe — verified via globals.css guard, not in this plan's scope to re-smoke
- Discrepancy: 6 number tickers animate from 0 to their final values when the container scrolls into view; the two panels drift apart by ±4% as you scroll through the section — manual UAT still deferred to Lucas-review (Plan 06)
- Typography: mono for H1 + kicker + ticker values reads as "Raycast-tech", sans for the intro H2 + labels reads as "Anthropic-wärme" — the 90/10 mix per CONTEXT.md D-04

## Self-Check: PASSED

Verified files and commits exist on disk:

- `apps/website/components/sections/hero-section.tsx` — FOUND (modified)
- `apps/website/components/sections/discrepancy-section.tsx` — FOUND (modified)
- Commit `c52cc4f` (Task 1) — FOUND in git log
- Commit `55b286a` (Task 2) — FOUND in git log
- Build output `ƒ /` — FOUND in fresh build log
- R1.2 + CSP Playwright tests — 2/2 passed

---
*Phase: 20-navigation-landing-skeleton*
*Completed: 2026-04-20*
