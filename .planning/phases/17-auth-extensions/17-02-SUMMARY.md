---
phase: 17-auth-extensions
plan: "02"
subsystem: emails
tags: [logos, email, png, sharp, brand]
dependency_graph:
  requires: [17-01]
  provides: [mail-safe-logo-pngs]
  affects: [packages/emails, apps/website/public]
tech_stack:
  added: [sharp@0.33.5, @types/sharp@0.31.1]
  patterns: [SVG-to-PNG rasterization via sharp, 2x Retina density]
key_files:
  created:
    - packages/emails/scripts/generate-logo-pngs.ts
    - apps/website/public/brand/logos/logo-wide-red.png
    - apps/website/public/brand/logos/logo-wide-neon.png
  modified:
    - packages/emails/package.json
decisions:
  - density-384: Used density 384 for high-quality SVG rasterization before resizing to 80px
  - target-height-80: 2x of 40px BrandLogo display height for Retina crispness
metrics:
  duration: "~10 minutes"
  completed: "2026-04-19T00:30:04Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 17 Plan 02: Logo PNG Generation Summary

**One-liner:** Sharp-based SVG→PNG script generates 142x80 RGBA PNGs from brand SVG sources, hosted at /brand/logos/ for mail-safe Light/Dark logo rendering.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write sharp-based SVG→PNG generation script | 86d71f8 | packages/emails/scripts/generate-logo-pngs.ts, packages/emails/package.json |
| 2 | Run script and commit PNG assets | 1026040 | apps/website/public/brand/logos/logo-wide-red.png, apps/website/public/brand/logos/logo-wide-neon.png |

---

## What Was Built

Two mail-safe PNG logo assets generated from the canonical SVG sources in `brand/logos/`:

- `logo-wide-red.png` — 142x80 RGBA (Light-theme mail header logo, 3.5KB)
- `logo-wide-neon.png` — 142x80 RGBA (Dark-theme mail header logo, 3.3KB)

A reproducible generation script at `packages/emails/scripts/generate-logo-pngs.ts` reads both SVGs using sharp at density 384, resizes to 80px height (maintaining 960:540 aspect ratio → 142px wide), outputs PNG with alpha transparency and max compression.

Registered as `pnpm -F @genai/emails run logos:generate` — can be re-run whenever logo SVGs are updated.

---

## Decisions Made

**density: 384 for rasterization** — Sharp defaults to 72 DPI for SVG, which produces blurry output when downsizing. 384 DPI gives the rasterizer enough resolution to anti-alias cleanly before the resize step.

**Target height 80px** — BrandLogo component displays at `h-10` (40px). 2x gives Retina clarity on HiDPI screens without excessive file size.

**No `@types/sharp` catalog entry needed** — `@types/sharp` includes its own types bundled with the package (`sharp/build/Release/sharp.node` bundles type defs). The `@types/sharp` package is a community re-export; sharp 0.33.x ships its own bundled `.d.ts`. Either works — installed `@types/sharp` for explicit dev-dep traceability.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. Both PNG assets are fully generated binary files from canonical SVG sources.

---

## Threat Flags

None. Static PNG files in the public directory — no new network endpoints, auth paths, or trust boundary changes.

---

## Self-Check

All files found. All commits verified.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| apps/website/public/brand/logos/logo-wide-red.png | FOUND |
| apps/website/public/brand/logos/logo-wide-neon.png | FOUND |
| packages/emails/scripts/generate-logo-pngs.ts | FOUND |
| commit 86d71f8 | FOUND |
| commit 1026040 | FOUND |
