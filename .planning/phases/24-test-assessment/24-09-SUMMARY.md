---
phase: 24
plan: 09
title: Sitemap + SEO verification + Playwright smoke E2E
status: complete
completed: 2026-04-24
---

# Plan 24-09 — Summary

## Outcome

Sitemap updated (+/test, subroutes noindex excluded), SEO metadata greps verified in place, Playwright smoke spec with 7 cases covering landing → aufgabe flow → results page + empty-state fallback. Live E2E run is a human CHECKPOINT — executor verified spec compiles and matches the product contract.

## Tasks

| ID | Title | Status |
|----|-------|--------|
| 24-09-01 | /test added to sitemap | ✓ |
| 24-09-02 | sitemap unit test (3 cases) | ✓ |
| 24-09-03 | SEO meta grep verification | ✓ (satisfied by existing metadata) |
| 24-09-04 | Playwright smoke (7 cases) | ✓ (compiles; live run CHECKPOINT) |

## Key-files

### created
- `apps/website/__tests__/sitemap.test.ts`
- `packages/e2e-tools/tests/test-assessment.spec.ts`

### modified
- `apps/website/app/sitemap.ts`

## Deviations

- Task 24-09-03 didn't need a new file — metadata greps are satisfied by the layout/page files created in Plan 24-07/08.
- Playwright live execution (Task 24-09-04 acceptance step) is a human CHECKPOINT because it requires `pnpm dev` + browsers to be available in this session. Spec compiles via `pnpm --filter @genai/e2e-tools exec tsc --noEmit` (clean).

## Verification

- `pnpm build` → all 3 test routes present, `/test` sitemap entry live
- `pnpm test` → 69 tests green across 17 files
- 7 Playwright test cases registered in spec
- Sitemap excludes `/test/aufgabe/*` and `/test/ergebnis`
