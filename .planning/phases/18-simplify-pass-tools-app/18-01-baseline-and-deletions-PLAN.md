---
phase: 18-simplify-pass-tools-app
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/tools-app/hooks/useVoiceInput.ts
  - apps/tools-app/app/api/debug-auth/route.ts
autonomous: true
requirements:
  - SIMPL-DEAD-FILES
must_haves:
  truths:
    - "Deprecated useVoiceInput hook no longer exists in repo"
    - "Production /api/debug-auth route no longer reachable"
    - "Baseline build + tests passed before deletions (recorded in plan output)"
  artifacts:
    - path: ".planning/phases/18-simplify-pass-tools-app/18-baseline.txt"
      provides: "Pre-change pnpm build/lint/test/loc snapshot"
  key_links:
    - from: "apps/tools-app/components/chat/FloatingChat.tsx"
      to: "apps/tools-app/hooks/useDeepgramVoice"
      via: "direct import (already canonical)"
      pattern: "useDeepgramVoice"
---

<objective>
Establish a green baseline, then delete two confirmed-dead files that CONCERNS.md flags as safe to remove. No semantic changes; both files have zero importers (useVoiceInput) or are explicit information-disclosure surfaces (debug-auth).

Purpose: Reduce attack surface and dead code with zero risk. Sets the verified baseline for the rest of Phase 18.
Output: Two deleted files, baseline snapshot committed under `.planning/phases/18-simplify-pass-tools-app/`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/codebase/CONCERNS.md
@.planning/phases/18-simplify-pass-tools-app/CONTEXT.md
@LEARNINGS.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Capture green baseline before any deletion</name>
  <files>.planning/phases/18-simplify-pass-tools-app/18-baseline.txt</files>
  <action>
    Create a feature branch `feat/phase-18-simplify-pass` off main. Then run from repo root and capture each command's exit code + stdout summary into `18-baseline.txt`:
      1. `git rev-parse HEAD` (record commit)
      2. `pnpm install --frozen-lockfile`
      3. `pnpm lint`
      4. `pnpm build`
      5. `pnpm test` (vitest across workspaces — E2E gated, do not run Playwright here)
      6. `tokei apps packages 2>/dev/null || cloc apps packages --quiet 2>/dev/null || (find apps packages -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1)` — record total LOC for delta comparison in plan 04.
    All steps 2-5 MUST pass green. If anything fails, STOP and report — do not proceed with deletions on a red baseline.
    Commit: `chore(18): record simplify-pass baseline`.
  </action>
  <verify>
    <automated>test -f .planning/phases/18-simplify-pass-tools-app/18-baseline.txt &amp;&amp; grep -E "(PASS|passed|✓)" .planning/phases/18-simplify-pass-tools-app/18-baseline.txt</automated>
  </verify>
  <done>Baseline file exists, all build/lint/test commands recorded as green, branch created, baseline commit on branch.</done>
  <rollback>git checkout main &amp;&amp; git branch -D feat/phase-18-simplify-pass</rollback>
</task>

<task type="auto">
  <name>Task 2: Delete deprecated useVoiceInput hook</name>
  <files>apps/tools-app/hooks/useVoiceInput.ts</files>
  <action>
    Pre-check: `grep -rn "useVoiceInput" apps packages --include="*.ts" --include="*.tsx"` MUST return zero matches outside the file itself. If anything matches, STOP and report — do not delete.
    Then `git rm apps/tools-app/hooks/useVoiceInput.ts`.
    Verify build still green: `pnpm --filter @genai/tools-app build` and `pnpm --filter @genai/tools-app test`.
    Commit: `chore(18): remove deprecated useVoiceInput hook (zero importers)`.
    Per CONCERNS.md "Deprecated useVoiceInput hook still in repo": file is a 266-line wrapper re-exporting `useDeepgramVoice` plus legacy Web Speech impl marked "kept for reference"; only consumer (FloatingChat) already imports `useDeepgramVoice` directly.
  </action>
  <verify>
    <automated>! test -f apps/tools-app/hooks/useVoiceInput.ts &amp;&amp; pnpm --filter @genai/tools-app build &amp;&amp; pnpm --filter @genai/tools-app test</automated>
  </verify>
  <done>File deleted, tools-app build + tests green, commit on branch.</done>
  <rollback>git revert HEAD (file restored from git history)</rollback>
</task>

<task type="auto">
  <name>Task 3: Delete /api/debug-auth route</name>
  <files>apps/tools-app/app/api/debug-auth/route.ts</files>
  <action>
    Pre-check: `grep -rn "debug-auth" apps packages docs --include="*.ts" --include="*.tsx" --include="*.md"` — note any references. Documentation references in `.planning/`, `docs/`, or `LEARNINGS.md` are acceptable (historical notes); production code/test references are blockers.
    Then `git rm apps/tools-app/app/api/debug-auth/route.ts` and remove the now-empty `apps/tools-app/app/api/debug-auth/` directory if empty.
    Verify: `pnpm --filter @genai/tools-app build &amp;&amp; pnpm --filter @genai/tools-app test`.
    Commit: `chore(18): remove /api/debug-auth route (info-disclosure surface, no longer needed)`.
    Per CONCERNS.md "tools-app /api/debug-auth route still live in production": leaks cookie names + session presence + user identity unauthenticated; was Phase-12 debugging aid.
  </action>
  <verify>
    <automated>! test -f apps/tools-app/app/api/debug-auth/route.ts &amp;&amp; pnpm --filter @genai/tools-app build</automated>
  </verify>
  <done>Route file deleted, build green, no production code referenced the route, commit on branch.</done>
  <rollback>git revert HEAD</rollback>
</task>

</tasks>

<verification>
- Baseline file exists with green build/lint/test snapshot
- Both deletion targets removed from disk
- `pnpm --filter @genai/tools-app build` green after each deletion
- No grep hits for `useVoiceInput` or production references to `debug-auth`
- Branch `feat/phase-18-simplify-pass` has 3 atomic commits
</verification>

<success_criteria>
- Branch created, baseline recorded green
- 2 dead files removed (~267 + ~80 LOC)
- No build/test regression
- All commits atomic and revertable
</success_criteria>

<output>
After completion, create `.planning/phases/18-simplify-pass-tools-app/18-01-SUMMARY.md` with: commit hashes, baseline metrics (LOC, test count), files deleted, any unexpected grep hits.
</output>
