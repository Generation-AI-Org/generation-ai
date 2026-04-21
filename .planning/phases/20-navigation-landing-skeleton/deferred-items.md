# Deferred Items — Phase 20


## 2026-04-21 — landing.spec.ts R1.8 (trust marquee reduced-motion)

- **Test:** `packages/e2e-tools/tests/landing.spec.ts:63` — R1.8 Trust marquee pauses on prefers-reduced-motion
- **Failure:** `animationPlayState` returns `""` (empty string) instead of `"paused"` under `reducedMotion: "reduce"` context.
- **Scope:** Unrelated to signal-grid refinements (Plan 20.5-02 crisp-dot pass). Target is `.animate-marquee` in globals.css guard.
- **Hypothesis:** The `@media (prefers-reduced-motion: reduce)` guard may have been lost or the class renamed. Out of scope for this commit.
- **Remaining smoke:** 7/8 pass, CSP-Test green, no regressions from signal-grid.
