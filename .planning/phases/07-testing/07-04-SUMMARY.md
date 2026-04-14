---
phase: 07-testing
plan: 04
subsystem: ci-infrastructure
tags: [turborepo, github-actions, ci-cd, testing]
dependency_graph:
  requires: [07-01, 07-02, 07-03]
  provides: [turbo-test-tasks, ci-workflow]
  affects: [all-packages]
tech_stack:
  added: [github-actions]
  patterns: [turbo-caching, conditional-ci-jobs]
key_files:
  created:
    - .github/workflows/ci.yml
  modified:
    - turbo.json
    - package.json
decisions:
  - "E2E Job conditional on STAGING_URL variable (optional activation)"
  - "Playwright browsers cached via actions/cache"
  - "TURBO_TOKEN/TURBO_TEAM for optional Vercel Remote Cache"
metrics:
  duration: ~1min
  completed: 2026-04-14T00:59:41Z
---

# Phase 07 Plan 04: CI Pipeline Setup Summary

Turborepo test/e2e Tasks konfiguriert, GitHub Actions CI Workflow erstellt mit Build/Lint/Test Pipeline.

## Completed Tasks

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | turbo.json Test-Tasks konfigurieren | 2d9d68a | test/test:watch/e2e Tasks in turbo.json, root scripts |
| 2 | GitHub Actions CI Workflow | 788cb14 | .github/workflows/ci.yml mit build-and-test + e2e Jobs |
| 3 | Verifizierung | - | Alle 20 Tests pass, FULL TURBO auf zweitem Run |

## Test Results

| Package | Tests | Status |
|---------|-------|--------|
| @genai/auth | 4 | PASS |
| @genai/website | 5 | PASS |
| @genai/tools-app | 11 | PASS |
| **Total** | **20** | **PASS** |

## CI Pipeline Architecture

```
PR/Push to main
    |
    v
[build-and-test] -----> [e2e] (nur wenn STAGING_URL gesetzt)
    |                      |
    +-- Checkout           +-- Checkout
    +-- pnpm install       +-- pnpm install
    +-- pnpm build         +-- Playwright install (cached)
    +-- pnpm lint          +-- pnpm e2e
    +-- pnpm test          +-- Upload Report on failure
```

## GitHub Setup Required

### Secrets (Settings > Secrets > Actions)

| Secret | Purpose | Required |
|--------|---------|----------|
| TURBO_TOKEN | Vercel Remote Cache Token | Optional |

### Variables (Settings > Variables > Actions)

| Variable | Purpose | Required |
|----------|---------|----------|
| TURBO_TEAM | Vercel Team Slug | Optional |
| STAGING_URL | E2E Test Target URL | Optional (aktiviert E2E Job) |

### E2E Aktivierung

E2E Tests laufen nur wenn `STAGING_URL` Variable gesetzt ist:
1. GitHub Repo > Settings > Variables > Actions
2. "New repository variable"
3. Name: `STAGING_URL`, Value: z.B. `https://staging.tools.generation-ai.org`

## Local Commands

```bash
# Unit Tests (alle Packages)
pnpm test

# Watch Mode
pnpm test:watch

# E2E Tests
pnpm e2e

# Einzelnes Package testen
pnpm test --filter=@genai/auth
```

## Turbo Caching

- test: cached via inputs (src/**, __tests__/**, vitest.config.mts)
- test:watch: nicht gecached (persistent)
- e2e: cached via outputs (playwright-report/**, test-results/**)

Zweiter `pnpm test` Run: "FULL TURBO" (0ms execution, nur log replay)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] turbo.json hat test, test:watch, e2e Tasks
- [x] package.json hat test, test:watch, e2e Scripts
- [x] .github/workflows/ci.yml existiert
- [x] `pnpm test` laeuft alle 20 Tests erfolgreich
- [x] Turbo Caching funktioniert (FULL TURBO)
