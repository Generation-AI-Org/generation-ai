---
phase: 25
plan: F
slug: admin-reprovision-route
status: complete
completed: 2026-04-24
commits:
  - e5140e5
---

# Plan 25-F SUMMARY — Admin reprovision endpoint (D-05)

## What was built

- `apps/website/lib/admin-auth.ts` — reusable `checkAdminAuth(request)` helper (session + role/allowlist gate)
- `apps/website/app/api/admin/circle-reprovision/route.ts` — POST endpoint
- `apps/website/lib/__tests__/admin-auth.test.ts` — 6 unit tests covering all auth-gate branches

## Key files

- `apps/website/lib/admin-auth.ts`
- `apps/website/app/api/admin/circle-reprovision/route.ts`
- `apps/website/lib/__tests__/admin-auth.test.ts`

## Verification

- `pnpm --filter @genai/website test` → 83/83 pass (6 new + 77 existing)
- `pnpm --filter @genai/website exec tsc --noEmit` clean for Plan F files (pre-existing phase-24 test error unchanged)

## Deviations

- **Route-level tests deferred to Plan H**: Plan F3 explicitly permits this fallback. vitest-jsdom for Next.js route handlers + NextRequest needs edge-runtime/vm setup this app doesn't currently have. Plan H E2E covers the exact same surface (401/403/400/404/200/502) against the built app.
- **Admin rate-limiter** lives in `lib/rate-limit.ts` (`checkAdminReprovisionRateLimit`) alongside the other limiters — moved there in Plan D so Plan F could reuse. Kept plan's prefix `ratelimit:admin-reprovision:userid`.
- **`listUsers({ perPage: 1000 })`** is the V1 lookup path documented in the plan. Post-launch, if user-count grows past ~10k, swap to `from('auth.users').select(...).eq('email', ...)` via service_role SQL.
- **`ADMIN_EMAIL_ALLOWLIST` env var** — NEW env var, not in plan A. Added to HUMAN-UAT list for Luca to set.

## Hand-off

- Plan H adds E2E tests for the full 200/502/429 paths via mock Circle.
- Plan I documents the curl invocation pattern + ADMIN_EMAIL_ALLOWLIST in DEPLOYMENT.md.
