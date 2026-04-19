---
phase: 18-simplify-pass-tools-app
plan: 01
status: complete
completed: 2026-04-19
commits:
  - ceaaf71 docs(18): add phase 18 simplify-pass plans + context
  - e1c1c6c chore(18): record simplify-pass baseline
  - e03c52f chore(18): remove deprecated useVoiceInput hook (zero importers)
  - 23bfa66 chore(18): remove /api/debug-auth route (info-disclosure surface, no longer needed)
metrics:
  loc_baseline: 13295
  files_deleted: 2
  loc_deleted: 307
  tests_green: 41
  workspaces_green: 5
---

# Phase 18 Plan 01 — Baseline + Deletions Summary

## Objective Met
Established a green baseline on a fresh feature branch, then removed two
confirmed-dead files: deprecated `useVoiceInput` wrapper hook and the
`/api/debug-auth` info-disclosure route.

## Branch
`feat/phase-18-simplify-pass` (off `main` at `3e70366`)

## Baseline (commit `ceaaf71`)
- `pnpm install --frozen-lockfile` → exit 0
- `pnpm lint` → exit 0 (17 warnings, 0 errors)
- `pnpm build` → exit 0 (both apps)
- `pnpm test` → exit 0, 5/5 workspaces, 41 tests passing
- LOC (`apps`+`packages`, .ts/.tsx): **13295**

## Deletions
| File | LOC | Commit |
|---|---|---|
| `apps/tools-app/hooks/useVoiceInput.ts` | 266 | `e03c52f` |
| `apps/tools-app/app/api/debug-auth/route.ts` | 41 | `23bfa66` |

Total removed: **307 lines** plus one empty directory.

## Pre-check Results
- `useVoiceInput`: zero matches in `apps`/`packages` outside the file itself.
- `debug-auth`: only matches in `.planning/` (historical notes, plans, session logs) and `.planning/codebase/{ARCHITECTURE,STRUCTURE}.md` index references — no production code, no tests. Acceptable per plan rules.

## Verification
- After each deletion: `pnpm --filter @genai/tools-app build` green.
- After useVoiceInput delete: tools-app tests 15/15 green.

## Deviations from Plan
None. Plan executed exactly as written.

## Self-Check: PASSED
- `.planning/phases/18-simplify-pass-tools-app/18-baseline.txt` exists.
- `apps/tools-app/hooks/useVoiceInput.ts` removed.
- `apps/tools-app/app/api/debug-auth/route.ts` removed.
- Commits `e1c1c6c`, `e03c52f`, `23bfa66` present in `git log`.
