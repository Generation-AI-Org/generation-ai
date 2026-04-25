---
phase: 22-partner-page
plan: 22-08
subsystem: testing
tags: [playwright, e2e, partner-page, smoke-test, aria]

requires:
  - phase: 22-07
    provides: /partner route fully assembled
provides:
  - partner.spec.ts with 13 smoke tests covering route, tabs, form, mobile, a11y
affects: []

tech-stack:
  added: []
  patterns: [ARIA-based selectors (getByRole), guarded Resend test with test.skip()]

key-files:
  created:
    - packages/e2e-tools/tests/partner.spec.ts

key-decisions:
  - "Form submit test guarded with RESEND_API_KEY check — skips in CI without env"
  - "ARIA selectors throughout: getByRole('tablist'), getByRole('tab'), getByRole('tabpanel')"
  - "BASE_URL from E2E_BASE_URL env var (consistent with about.spec.ts pattern)"

patterns-established:
  - "E2E test uses E2E_BASE_URL env var, not playwright config baseURL (website vs tools-app)"

requirements-completed: [R3.1, R3.2, R3.3, R3.4, R3.5, R3.6]

duration: 8min
completed: 2026-04-24
---

# Plan 22-08: Playwright Smoke Tests Summary

**13 ARIA-based Playwright tests for /partner covering route load, 4-tab render, tab switch + URL update, deep-link, keyboard nav, form visibility, person cards, trust section, verein link, and mobile viewport**

## Performance

- **Duration:** 8 min
- **Completed:** 2026-04-24
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- 13 tests (vs minimum 12 required)
- All selectors use ARIA roles (getByRole) — no brittle CSS/test-id selectors
- Tab switch test verifies: active tab, inactive tab, panel content, URL update via pushState
- Deep-link tests for hochschulen, initiativen, and invalid slug (fallback to unternehmen)
- Form submit test guarded: `if (!process.env.RESEND_API_KEY) { test.skip(); return }`
- Mobile test: 390px viewport, tab rail visible

## Task Commits
1. **Task 1** - `25322e1` (test)

## Decisions Made
- Used `E2E_BASE_URL ?? 'http://localhost:3000'` (same pattern as about.spec.ts — website tests)
- trust section check uses `[data-section="trust"]` (already on TrustSection component)

## Deviations from Plan
None.

## Issues Encountered
None.

## Next Phase Readiness
- Tests are dry-run ready; actual run requires live /partner server at E2E_BASE_URL

---
*Phase: 22-partner-page*
*Completed: 2026-04-24*
