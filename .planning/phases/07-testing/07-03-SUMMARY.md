---
phase: 07-testing
plan: 03
subsystem: testing
tags: [api-tests, e2e, playwright, vitest]
dependency_graph:
  requires: [07-01, 07-02]
  provides: [api-route-tests, e2e-auth-specs, e2e-chat-specs]
  affects: [ci-pipeline]
tech_stack:
  added: [next-test-api-route-handler]
  patterns: [api-route-mocking, playwright-smoke-tests]
key_files:
  created:
    - apps/tools-app/__tests__/api/health.test.ts
    - apps/tools-app/__tests__/api/chat.test.ts
    - packages/e2e-tools/tests/auth.spec.ts
    - packages/e2e-tools/tests/chat.spec.ts
    - packages/e2e-tools/.env.example
  modified:
    - apps/tools-app/vitest.config.mts
    - apps/tools-app/package.json
decisions:
  - "next-test-api-route-handler fuer API Route Testing (emuliert Next.js-Kontext)"
  - "environmentMatchGlobs fuer gemischte jsdom/node Tests"
  - "Smoke Tests ohne Auth, volle Flows als skip markiert"
metrics:
  duration: "~3 min"
  completed: "2026-04-14"
---

# Phase 07 Plan 03: API Route Tests + E2E Auth/Chat Specs Summary

API Route Tests mit next-test-api-route-handler fuer /api/chat und /api/health, plus Playwright E2E Specs fuer Auth und Chat Flows als Smoke Tests.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | b8ffea8 | API route tests for chat and health endpoints |
| 2 | 3c5875c | E2E specs for auth and chat flows |

## What Was Built

### API Route Tests (Task 1)

**health.test.ts:**
- GET /api/health returns 200 with status "ok" and timestamp

**chat.test.ts:**
- POST /api/chat returns 400 when message is empty
- POST /api/chat returns 400 when message is whitespace only
- POST /api/chat returns 200 with valid message (all dependencies mocked)
- POST /api/chat returns 429 when rate limited (with Retry-After header)

**Vitest Config:**
- Added `environmentMatchGlobs` to run API tests in `node` environment
- Component tests continue using `jsdom`

### E2E Specs (Task 2)

**auth.spec.ts:**
- Homepage loads with expected title
- Login page accessible with form elements
- Signup page accessible with form elements
- Protected route redirect check
- Full login flow (skipped, requires test credentials)

**chat.spec.ts:**
- Chat page loads
- Chat interface or login prompt visible
- Chat container elements present
- Full message send flow (skipped, requires auth)
- AI response verification (skipped, requires auth)

## Verification Results

```
Test Files  3 passed (3)
     Tests  11 passed (11)
  Duration  1.42s
```

E2E specs created and ready for local testing with `pnpm --filter @genai/e2e-tools e2e`.

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

1. **Mock Strategy:** All external dependencies (Supabase, Rate Limit, LLM, Agent) mocked at module level using vi.mock() to isolate API route logic

2. **Environment Separation:** Using `environmentMatchGlobs` pattern to auto-detect test environment based on file path (api/*.test.ts -> node, *.test.tsx -> jsdom)

3. **E2E Approach:** Smoke tests that verify pages load and basic UI elements exist. Full authenticated flows marked as skip() for future activation with test credentials.

## Self-Check: PASSED

- [x] apps/tools-app/__tests__/api/health.test.ts exists
- [x] apps/tools-app/__tests__/api/chat.test.ts exists
- [x] packages/e2e-tools/tests/auth.spec.ts exists
- [x] packages/e2e-tools/tests/chat.spec.ts exists
- [x] packages/e2e-tools/.env.example exists
- [x] Commit b8ffea8 exists
- [x] Commit 3c5875c exists
