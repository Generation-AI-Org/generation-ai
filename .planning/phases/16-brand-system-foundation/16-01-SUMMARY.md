---
phase: 16
plan: "01"
subsystem: brand-system
tags: [dependencies, playwright, visual-regression, geist, radix-colors]
dependency_graph:
  requires: []
  provides:
    - "@radix-ui/colors@3.0.0 installed in @genai/config"
    - "geist@1.7.0 installed in @genai/website and @genai/tools-app"
    - "packages/ui bootstrapped as proper workspace package"
    - "Visual regression baseline — 14 PNGs for Plan 06 diff"
  affects:
    - "packages/config/package.json"
    - "packages/ui/"
    - "apps/website/package.json"
    - "apps/tools-app/package.json"
tech_stack:
  added:
    - "@radix-ui/colors@3.0.0"
    - "geist@1.7.0"
  patterns:
    - "pnpm workspace install via --filter"
    - "Playwright toHaveScreenshot for visual regression baseline"
key_files:
  created:
    - packages/ui/package.json
    - packages/ui/src/index.ts
    - packages/ui/tsconfig.json
    - packages/e2e-tools/tests/visual-baseline.spec.ts
    - packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/ (14 PNGs)
  modified:
    - apps/website/package.json (added geist@1.7.0)
    - apps/tools-app/package.json (added geist@1.7.0)
    - packages/config/package.json (added @radix-ui/colors@3.0.0)
    - pnpm-lock.yaml
decisions:
  - "@radix-ui/colors placed in @genai/config (not @genai/ui) because base.css lives in packages/config and CSS @import must be resolvable from there"
  - "packages/ui peerDependencies reference catalog: protocol — Plan 03 fills actual components"
  - "Baseline PNGs use chromium-darwin suffix (platform-specific, expected for local dev capture)"
metrics:
  duration: "2m"
  completed_date: "2026-04-18"
  tasks_completed: 2
  tasks_total: 2
  files_created: 18
  files_modified: 4
---

# Phase 16 Plan 01: Foundation Install + Baseline Summary

Install brand-system foundation packages (@radix-ui/colors@3.0.0, geist@1.7.0) and capture 14 Playwright visual-regression baseline PNGs — pre-migration reference for Plan 06 diff.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install @radix-ui/colors + geist font packages | 5080225 |
| 2 | Playwright visual-regression baseline spec + 14 baseline PNGs | 5290a37 |

## Package Versions Resolved

| Package | Version | Location |
|---------|---------|----------|
| `@radix-ui/colors` | 3.0.0 | `packages/config` (resolvable from base.css) |
| `geist` | 1.7.0 | `apps/website`, `apps/tools-app` |

## packages/ui Bootstrap

- `packages/ui/package.json` — declares `@genai/ui` with `@radix-ui/colors` dependency
- `packages/ui/src/index.ts` — empty placeholder (`export {};`) — Plan 03 fills this
- `packages/ui/tsconfig.json` — extends `@genai/config/tsconfig/base.json`

## Baseline Snapshots

- **Location:** `packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/`
- **Count:** 14 PNGs (3 website routes × 2 themes + 4 tools-app routes × 2 themes)
- **Platform:** chromium-darwin (local dev capture)
- **All 14 tests passed in 13.5s** — servers confirmed ready via curl before Playwright run

### Snapshot Inventory

**Website (3 routes × 2 themes = 6):**
- website-home-light-chromium-darwin.png
- website-home-dark-chromium-darwin.png
- website-impressum-light-chromium-darwin.png
- website-impressum-dark-chromium-darwin.png
- website-datenschutz-light-chromium-darwin.png
- website-datenschutz-dark-chromium-darwin.png

**tools-app (4 routes × 2 themes = 8):**
- tools-home-light-chromium-darwin.png
- tools-home-dark-chromium-darwin.png
- tools-login-light-chromium-darwin.png
- tools-login-dark-chromium-darwin.png
- tools-impressum-light-chromium-darwin.png
- tools-impressum-dark-chromium-darwin.png
- tools-datenschutz-light-chromium-darwin.png
- tools-datenschutz-dark-chromium-darwin.png

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `packages/ui/src/index.ts` — intentional empty placeholder (`export {};`), Plan 03 fills components. Does not block this plan's goal.

## Threat Flags

None — this plan only installs packages and captures screenshots. No new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED
