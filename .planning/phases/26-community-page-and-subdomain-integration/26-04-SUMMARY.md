---
phase: 26-community-page-and-subdomain-integration
plan: 04
subsystem: api

tags: [tools-app, public-api, edge-cache, supabase, vitest, badge-extract, server-component-prep]

requires:
  - phase: 22.7
    provides: tools-app subdomain polish, content_items schema stable
  - phase: 20.6
    provides: tool-showcase-section.tsx (stub) + community-preview-section.tsx (stub)
provides:
  - Public no-auth GET /api/public/featured-tools on tools-app (edge-cached)
  - FEATURED_TOOLS exported as single-source-of-truth (D-17)
  - Standalone BeispielBadge client-component at apps/website/components/ui/beispiel-badge.tsx
  - Vitest co-located __tests__/ discovery in tools-app
affects: [26-05]

tech-stack:
  added: []
  patterns:
    - Public API + Vercel Edge-Cache (Cache-Control s-maxage=300, swr=1800) replaces app-level rate-limit (D-07)
    - Hardcoded server-side const for featured-tools whitelist (no DB migration, D-17)
    - Co-located route tests at app/api/<route>/__tests__/ — vitest include broadened
    - Theme-aware client-component split out of soon-to-be Server Component parents

key-files:
  created:
    - apps/tools-app/app/api/public/featured-tools/route.ts
    - apps/tools-app/app/api/public/featured-tools/__tests__/route.test.ts
    - apps/website/components/ui/beispiel-badge.tsx
    - .changeset/phase-26-public-featured-tools-api.md
  modified:
    - apps/tools-app/lib/content.ts
    - apps/tools-app/vitest.config.mts
    - apps/website/components/sections/tool-showcase-section.tsx
    - apps/website/components/sections/community-preview-section.tsx

key-decisions:
  - "Public-API uses Vercel-Edge-Cache (s-maxage=300, swr=1800) instead of app-level rate-limit — D-07"
  - "FEATURED_TOOLS stays a hardcoded const, exported from lib/content.ts — single source for both getPublishedTools and the public route — D-17"
  - "Generic 500 message ('Failed to load featured tools') — no Supabase trace leak (T-26-04-02)"
  - "Explicit column whitelist in select() — no `*` (T-26-04-05 mitigation)"
  - "Vitest include broadened to **/__tests__/**/*.test.{ts,tsx} + **/*.test.{ts,tsx} — supports co-located route tests (PLAN-CHECK Blocker #1)"
  - "BeispielBadge is theme-aware (useTheme), so it must be a 'use client' standalone module before Plan 26-05 turns its parent into a Server Component (D-15 prep)"

patterns-established:
  - "Public read-only API on tools-app: edge-cached, no auth, server-side query with explicit column whitelist"
  - "Co-located route tests under app/api/<route>/__tests__/route.test.ts with chained Supabase mock (mockFrom → mockSelect → mockEq → mockEq → mockIn)"

requirements-completed:
  - R7.4
  - R7.5

duration: ~12min
completed: 2026-04-25
---

# Phase 26 Plan 04: tools-app Public API + BeispielBadge Extract Summary

**Public `/api/public/featured-tools` endpoint on tools-app (no-auth, edge-cached `s-maxage=300, swr=1800`) plus BeispielBadge extraction to its own client-component module — Plan 26-05 unblocked.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-25T01:18:00Z
- **Completed:** 2026-04-25T01:22:00Z
- **Tasks:** 2
- **Files modified:** 8 (4 created, 4 modified)

## Accomplishments

- New `GET /api/public/featured-tools` route on tools-app — no auth, edge-cached (300s + 1800s swr), explicit column whitelist, generic 500 on DB error.
- `FEATURED_TOOLS` exported from `apps/tools-app/lib/content.ts` as single source of truth (D-17 — re-used by both `getPublishedTools` and the new route).
- 4 vitest unit-tests covering: sort-by-FEATURED_TOOLS-array-order, Cache-Control header, generic 500 with no Supabase trace leak, response shape (slug/title/category/logo_domain/quick_win).
- Vitest include-pattern broadened in tools-app (`['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}']`) — enables co-located route tests; PLAN-CHECK Blocker #1 closed. Full tools-app suite still 19/19 green (no regression).
- `BeispielBadge` extracted to `apps/website/components/ui/beispiel-badge.tsx` as standalone `'use client'` module. Both importers (`tool-showcase-section.tsx`, `community-preview-section.tsx`) updated; behavior unchanged.

## Task Commits

Atomic commits on `feature/phase-26-community`:

1. **Task 1: Public featured-tools API + FEATURED_TOOLS export + vitest include fix** — `3abdede` (feat)
2. **Task 2: Extract BeispielBadge to components/ui/** — `7d4ca02` (feat)

_Note: Task 1 was TDD-flavored (RED test confirmed missing route, GREEN added route handler) but committed as a single atomic feat-commit because the route + test are inseparable artifacts in this plan._

## Files Created/Modified

**Created:**
- `apps/tools-app/app/api/public/featured-tools/route.ts` — GET handler, cache header, whitelisted columns
- `apps/tools-app/app/api/public/featured-tools/__tests__/route.test.ts` — 4 vitest tests
- `apps/website/components/ui/beispiel-badge.tsx` — standalone `'use client'` BeispielBadge
- `.changeset/phase-26-public-featured-tools-api.md` — tools-app minor + website patch

**Modified:**
- `apps/tools-app/lib/content.ts` — `FEATURED_TOOLS` const → `export const FEATURED_TOOLS`
- `apps/tools-app/vitest.config.mts` — include broadened to match co-located + root tests
- `apps/website/components/sections/tool-showcase-section.tsx` — drop inline BeispielBadge + useTheme import; import from `@/components/ui/beispiel-badge`
- `apps/website/components/sections/community-preview-section.tsx` — switch import path to new badge module

## Decisions Made

None beyond the plan-frontmatter decisions (D-07, D-15, D-17). Plan executed exactly as written — no architectural deviations.

## Deviations from Plan

None — plan executed exactly as written. All threat-mitigations applied as specified in the plan's `<threat_model>` block (T-26-04-01 via cache-headers, T-26-04-02 via generic error message, T-26-04-03 via server-side const, T-26-04-04 via pre-existing proxy.ts matcher excluding `/api/*`, T-26-04-05 via explicit column whitelist).

## Issues Encountered

- **Local build needed env vars in worktree.** `apps/tools-app/.env.local` and `apps/website/.env.local` were absent in the phase-26 worktree (parallel to phase-25 which has them). Copied from `~/projects/generation-ai/apps/{tools-app,website}/.env.local` for local build verification. Files are gitignored (`.gitignore` matches `.env.local` and `.env.*.local`) — not committed. Pre-existing infra concern, not caused by Task 1.

## User Setup Required

**Manual follow-up (does NOT block this plan):**
- Set Vercel env-var `NEXT_PUBLIC_TOOLS_APP_URL=https://tools.generation-ai.org` for Production + Preview environments on the **website** Vercel project. Plan 26-05 uses this. Without it, Plan 26-01's next.config fallback defaults to the Production URL (acceptable for Production; means Preview deploys hit Prod tools-app — acceptable for this phase).

## Verification Results

| Check | Result |
|---|---|
| `pnpm --filter @genai/tools-app test app/api/public/featured-tools --run` | 4/4 green |
| `pnpm --filter @genai/tools-app test --run` (full suite, regression) | 19/19 green |
| `pnpm --filter @genai/tools-app exec tsc --noEmit` | clean |
| `pnpm --filter @genai/tools-app build` | green (`/api/public/featured-tools` in route table) |
| `pnpm --filter @genai/website exec tsc --noEmit` | clean |
| `pnpm --filter @genai/website build` | green |
| `grep "export const FEATURED_TOOLS" apps/tools-app/lib/content.ts` | match |
| `grep '\*\*/__tests__/\*\*/\*.test' apps/tools-app/vitest.config.mts` | match |
| BeispielBadge inline definition in tool-showcase-section.tsx | removed |
| Both sections import from `@/components/ui/beispiel-badge` | confirmed |

Live curl smoke-test against dev-server intentionally skipped — env-vars are dev secrets, the unit-tests already cover the route's full contract (status 200, sort order, Cache-Control header, error path, response shape) without needing a live Supabase round-trip.

## Next Phase Readiness

- **Plan 26-05 (Tool-Showcase upgrade) is fully unblocked:**
  - Live API exists at `/api/public/featured-tools` (deployable independently to Preview/Prod via the changeset above).
  - `BeispielBadge` is in `@/components/ui/beispiel-badge` — Plan 26-05 can refactor `tool-showcase-section.tsx` into a Server Component without touching badge logic.
- **No outstanding blockers.** PLAN-CHECK Blocker #1 (vitest include) resolved.

## Self-Check: PASSED

All 9 claimed artifacts exist on disk (route.ts, route.test.ts, beispiel-badge.tsx, changeset, content.ts, vitest.config.mts, tool-showcase-section.tsx, community-preview-section.tsx, this SUMMARY). Both task commits reachable on `feature/phase-26-community`: `3abdede` (Task 1), `7d4ca02` (Task 2).

---
*Phase: 26-community-page-and-subdomain-integration*
*Plan: 04*
*Completed: 2026-04-25*
