---
phase: 21
plan: 02
subsystem: website/about
tags: [ui, components, about, hero, story]
requires: []
provides: [AboutHeroSection, AboutStorySection]
affects: [apps/website/components/about/]
tech-stack:
  added: []
  patterns: [motion-react, useReducedMotion, ds-tokens, heading-hierarchy-h1-h2]
key-files:
  created:
    - apps/website/components/about/about-hero-section.tsx
    - apps/website/components/about/about-story-section.tsx
  modified: []
key-decisions:
  - Display-Claim nutzt --fs-h2-Token statt neuer 28-36px-Size (UI-SPEC-Flag-Fix)
  - Alle Section-Heads semantisch h2 (Heading-Hierarchie H1 Hero → H2 alle Sections); visuelle Size differiert via --fs-h3 vs --fs-h2 Token
  - useReducedMotion-Gate auf fadeIn-Entry, Pattern reused aus kurz-faq-section
requirements-completed: []
duration: 1 min
completed: 2026-04-24
---

# Phase 21 Plan 02: Hero + Story Sections Summary

Zwei Client-Components (wegen motion/react) für die ersten beiden Sections der /about-Seite. Typografie-getrieben, Copy 1:1 aus UI-SPEC mit echten Umlauten, DS-Token-only.

- **Tasks:** 3 (Hero + Story + Build-Verify)
- **Files created:** 2

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 5b22193 | AboutHeroSection (Eyebrow + H1 + Display-Claim + Intro-Lede) |
| 2 | fa88638 | AboutStorySection (Eyebrow + H2 + 3 Absätze + Inline-CTA) |
| 3 | — | Build-Verify (tsc --noEmit exit 0) |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `pnpm --filter @genai/website tsc --noEmit` → exit 0
- Display-Claim-Size: `grep 'var(--fs-h2)'` in hero → 1 Treffer (korrekt)
- Kein `28px|36px|text-[28]|text-[36]` als aktiver CSS-Code (nur im Kommentar der Regel-Beschreibung)
- Kein `<h3>` oder `motion.h3` auf der Page → Heading-Hierarchie H1 → H2 sauber
- Alle UI-SPEC-Copy-Strings verbatim: Eyebrow (inkl. Unicode ·), H1, Display-Claim (EN, D-07), Intro-Lede, 3 Story-Absätze, Inline-CTA
- useReducedMotion-Gate in beiden Components vorhanden
- id="story"-Anker load-bearing für Deep-Link /about#story

## Issues Encountered

None.

## Next Phase Readiness

Ready for 21-03 (Team Section — konsumiert 21-01 Sub-Components).
