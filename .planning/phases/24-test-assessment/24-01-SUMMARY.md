---
phase: 24
plan: 01
title: Dependencies + MDX config
status: complete
completed: 2026-04-24
---

# Plan 24-01 — Summary

## Outcome

All runtime dependencies installed and MDX wired into Next.js 16 build pipeline. Build passes (`✓ Compiled successfully in 3.3s`), no new warnings, existing pages still render `ƒ` (dynamic, CSP-safe).

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-01-01 | Install dnd-kit, recharts, shiki, MDX deps | ✓ |
| 24-01-02 | Configure Next.js MDX loader + pageExtensions | ✓ |
| 24-01-03 | Create mdx-components.tsx root file | ✓ |

## Key-files

### created
- `apps/website/mdx-components.tsx`

### modified
- `apps/website/package.json`
- `apps/website/next.config.ts`
- `pnpm-lock.yaml`

## Deviations

- `@next/mdx` pinned to `^16.2.3` (matches next catalog version — not in catalog so specified explicitly). Plan allowed this.
- `@types/mdx` resolved to `^2.0.13` (npm rejected `^0.0.13` as stale — latest is 2.0.13 series). Plan allowed latest fallback.

## Verification

- `pnpm --filter @genai/website build` → `✓ Compiled successfully in 3.3s`
- All 8 deps confirmed in `apps/website/package.json`
- No CSP regressions — all previously-dynamic pages still `ƒ`
