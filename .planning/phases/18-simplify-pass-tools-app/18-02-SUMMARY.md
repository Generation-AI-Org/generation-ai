---
phase: 18-simplify-pass-tools-app
plan: 02
subsystem: monorepo / housekeeping
tags: [knip, orphan-sweep, cleanup, deps]
requires: [18-01]
provides:
  - "Permanent knip wiring (config + script) for unused-exports drift detection"
  - "Confident DELETE set applied: 7 orphan files, 4 unused deps, 13 export-keyword strips"
affects:
  - apps/website
  - apps/tools-app
  - packages/emails
  - packages/e2e-tools
tech-stack:
  added: [knip]
  patterns: ["unused-export sweep", "DELETE / KEEP-WITH-REASON / DEFER classification"]
key-files:
  created:
    - knip.json
    - .planning/phases/18-simplify-pass-tools-app/18-knip-report.txt
  modified:
    - package.json
    - apps/website/package.json
    - packages/emails/package.json
    - apps/website/components/ui/button.tsx
    - apps/tools-app/lib/agent.ts
    - apps/tools-app/lib/content.ts
    - apps/tools-app/lib/kb-tools.ts
    - apps/tools-app/lib/exa.ts
    - apps/tools-app/lib/ratelimit.ts
    - apps/tools-app/hooks/useDeepgramVoice.ts
    - packages/e2e-tools/fixtures/test-user.ts
    - packages/e2e-tools/helpers/csp-assertions.ts
  removed:
    - apps/tools-app/components/chat/ChatPanel.tsx
    - apps/tools-app/components/chat/UrlInputModal.tsx
    - apps/tools-app/components/ui/DetailHeaderLogo.tsx
    - apps/website/components/ui/network-grid.tsx
    - apps/website/components/ui/terminal.tsx
    - apps/website/components/ui/text-scramble.tsx
    - apps/website/lib/email.ts
decisions:
  - "ContentStatus re-export shim left untouched — type lives in @genai/types and is consumed there by ContentItem; out of scope for housekeeping"
  - "KiwiMascot deferred per Luca: brand-relevant, may return in marketing/empty-states"
  - "Supabase shims (lib/supabase/*, lib/supabase.ts) deferred pending auth audit"
  - "@supabase/ssr in apps treated as KEEP-WITH-REASON (peer-imported via @genai/auth)"
metrics:
  duration: ~30min (this session)
  completed: 2026-04-19
---

# Phase 18 Plan 02: Knip Orphan-Sweep Summary

Wired knip permanently into the monorepo, captured a full unused-exports/files/deps report, classified every finding as DELETE / KEEP-WITH-REASON / DEFER, and applied the Confident DELETE set after Luca approved at the Task 2 decision checkpoint.

## What Shipped

### Task 1: knip wiring + report (already complete from prior session)
- `knip.json` workspace config covering all 9 workspaces
- `pnpm knip` script in repo root
- Full report at `.planning/phases/18-simplify-pass-tools-app/18-knip-report.txt` with disposition table
- Commits: `495ccc2 chore(18): add knip config and capture orphan report`, `f529352 docs(18-02): classify knip findings`

### Task 2: Decision checkpoint — Luca chose PROCEED
Applied the Confident DELETE set (Files / Deps / Exports separated into atomic commits).

### Task 3: DELETE applied (this session)
**Three atomic commits, each preceded by lint+build+test:**

1. `f102ba6 chore(18-02): remove orphan files surfaced by knip` — 7 files removed (1280 deletions)
2. `aac57cd chore(18-02): remove unused dependencies surfaced by knip` — `framer-motion`, `shadcn`, `resend` (apps/website), `@types/sharp` (packages/emails)
3. `04e4a7c chore(18-02): convert unused exports to local symbols (knip)` — 5 unused exports + 8 unused exported types stripped to local symbols

## Knip Delta (before → after)

| Category           | Before | After | Δ   |
| ------------------ | -----: | ----: | --: |
| Unused files       |     12 |     5 |  −7 |
| Unused deps        |      9 |     6 |  −3 |
| Unused devDeps     |      7 |     6 |  −1 |
| Unused exports     |      6 |     2 |  −4 |
| Unused exp. types  |      8 |     1 |  −7 |

All remaining findings are documented as DEFER or KEEP-WITH-REASON in the disposition table.

## Deviations from Plan

### Auto-fixed Issues

**1. [Scope] ContentStatus export NOT stripped**
- **Found during:** Task 3 export-strip pass
- **Issue:** Knip flagged `ContentStatus` at `apps/tools-app/lib/types.ts:4:3`, but that's a re-export shim. The actual `export type ContentStatus` lives in `packages/types/src/content.ts` and is consumed there by `ContentItem`. Stripping the shim would cascade into the shared types package — out of scope for housekeeping.
- **Fix:** Documented in commit body and SUMMARY; left for a future shared-types audit.
- **Files modified:** none
- **Commit:** n/a (decision)

No other deviations. Plan executed as classified.

## Verification

```
pnpm lint   → 0 errors, 10 warnings (all pre-existing, no new ones from edits)
pnpm build  → 2 successful (website + tools-app), all routes ƒ (dynamic)
pnpm test   → 5 successful (15 + 5 + 4 unit tests)
pnpm knip   → fewer findings (see delta table above)
```

## Self-Check: PASSED

- All 7 deleted files confirmed removed from disk (`git status` clean)
- All 3 commits visible in `git log`: `f102ba6`, `aac57cd`, `04e4a7c`
- knip report file exists and was the source for classification
- LOC measurement deferred to Plan 18-04 delta report
