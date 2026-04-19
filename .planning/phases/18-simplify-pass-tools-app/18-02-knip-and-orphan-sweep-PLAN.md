---
phase: 18-simplify-pass-tools-app
plan: 02
type: execute
wave: 2
depends_on: [18-01]
files_modified:
  - package.json
  - knip.json
  - .planning/phases/18-simplify-pass-tools-app/18-knip-report.txt
autonomous: false
requirements:
  - SIMPL-ORPHAN-SWEEP
must_haves:
  truths:
    - "knip report exists and lists every unused export/file across the monorepo"
    - "Each finding is classified as DELETE / KEEP-WITH-REASON / DEFER"
    - "Stop-gate triggered for any ambivalent finding (Luca decides)"
  artifacts:
    - path: "knip.json"
      provides: "Reproducible knip config (workspaces, entry points, ignored patterns)"
    - path: ".planning/phases/18-simplify-pass-tools-app/18-knip-report.txt"
      provides: "Raw knip output + per-finding disposition table"
  key_links:
    - from: "knip.json"
      to: "pnpm-workspace.yaml"
      via: "workspaces glob"
      pattern: "apps/\\*"
---

<objective>
Run knip across the monorepo to surface unused files, exports, dependencies. Classify each finding. Apply only the unambiguous DELETE items as a single commit. Anything ambivalent → stop-gate for Luca.

Purpose: Systematic orphan detection beyond what manual CONCERNS.md captured. knip becomes the long-term unused-exports check.
Output: Reproducible `knip.json`, classified findings report, possibly one cleanup commit.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/codebase/CONCERNS.md
@.planning/codebase/STRUCTURE.md
@.planning/phases/18-simplify-pass-tools-app/CONTEXT.md
@.planning/phases/18-simplify-pass-tools-app/18-baseline.txt
@pnpm-workspace.yaml
@LEARNINGS.md
</context>

<interfaces>
Workspaces (from pnpm-workspace.yaml):
- apps/website (@genai/website)
- apps/tools-app (@genai/tools-app)
- packages/auth, ui, types, config, emails, e2e-tools

Known entry points to declare in knip.json:
- apps/*/app/**/{page,layout,route,loading,error,not-found,global-error}.{ts,tsx}
- apps/*/proxy.ts
- apps/*/instrumentation.ts, apps/*/instrumentation-client.ts
- apps/*/sentry.*.config.ts
- packages/*/src/index.ts
- packages/auth/src/{server,browser,helpers,middleware,admin}.ts (subpath exports)
- packages/emails/src/templates/*.tsx
- packages/e2e-tools/tests/**/*.spec.ts
- packages/*/__tests__/**/*.test.ts
- apps/*/__tests__/**/*.test.{ts,tsx}
- apps/*/vitest.config.mts, packages/*/vitest.config.mts

Known false-positive patterns to ignore:
- next.config.ts, postcss.config.mjs, eslint.config.mjs (Next/build-time)
- generated SQL/types files
- packages/emails/scripts/* (build scripts)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add knip config and produce report</name>
  <files>knip.json, package.json, .planning/phases/18-simplify-pass-tools-app/18-knip-report.txt</files>
  <action>
    Install knip as repo-root devDep: `pnpm add -Dw knip`.
    Create `knip.json` at repo root using the `workspaces` schema; declare workspace globs `apps/*` and `packages/*`. For each workspace, set `entry` patterns from the &lt;interfaces&gt; block above and `project` to `**/*.{ts,tsx}` excluding `**/{node_modules,.next,dist,playwright-report,test-results}/**`. Mark known build-time/config files as ignored.
    Add root script: `"knip": "knip"` in `package.json`.
    Run `pnpm knip --reporter json --no-exit-code &gt; .planning/phases/18-simplify-pass-tools-app/18-knip-report.txt 2&gt;&amp;1` then also append the human-readable run: `pnpm knip --no-exit-code &gt;&gt; .planning/phases/18-simplify-pass-tools-app/18-knip-report.txt 2&gt;&amp;1`.
    Commit: `chore(18): add knip config and capture orphan report`.
    Per CONTEXT.md "knip / Unused-Exports-Check grün" success criterion.
  </action>
  <verify>
    <automated>test -f knip.json &amp;&amp; test -f .planning/phases/18-simplify-pass-tools-app/18-knip-report.txt &amp;&amp; pnpm knip --no-exit-code &gt;/dev/null 2&gt;&amp;1</automated>
  </verify>
  <done>knip installed, config committed, report file exists, knip runs without error (findings ≠ failure).</done>
  <rollback>git revert HEAD &amp;&amp; pnpm install</rollback>
</task>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 2: Classify knip findings</name>
  <decision>For each finding (unused file / unused export / unused dependency), assign disposition: DELETE (zero risk, e.g. dead helper), KEEP-WITH-REASON (knip false-positive — e.g. dynamically imported, side-effectful, exported for SDK consumers), or DEFER (needs broader refactor — moves to BACKLOG).</decision>
  <context>
    knip is conservative — it cannot see dynamic imports, route conventions, or runtime-only exports without explicit config. Each finding needs a 5-second human eyeball before deletion. CONCERNS.md stop-gates apply: ContentCard rename, hook rename → DEFER. tools-app `lib/supabase.ts` shim → DEFER (needs auth audit, not housekeeping).
    Append the disposition table to `18-knip-report.txt` as a markdown table: `Finding | Type | File | Disposition | Reason`.
  </context>
  <options>
    <option id="proceed">
      <name>Apply DELETEs and continue</name>
      <pros>Removes orphans quickly, knip baseline gets cleaner</pros>
      <cons>Each delete is its own risk; verify build after each</cons>
    </option>
    <option id="stop-deletes-needed">
      <name>Pause — only KEEPs/DEFERs, no clear deletes</name>
      <pros>Honest reporting, no risky changes</pros>
      <cons>Plan 02 produces no LOC reduction beyond plan 01</cons>
    </option>
  </options>
  <resume-signal>Type "proceed" to apply DELETE items, "stop" if nothing safely deletable</resume-signal>
</task>

<task type="auto">
  <name>Task 3: Apply DELETE classifications (if any)</name>
  <files>per disposition table in 18-knip-report.txt</files>
  <action>
    For each item marked DELETE in Task 2's table:
      1. Re-grep one final time to confirm zero importers
      2. `git rm` the file (or remove the export)
      3. After ALL deletes, run `pnpm lint &amp;&amp; pnpm build &amp;&amp; pnpm test`
      4. If any step red → `git checkout .` to revert and STOP (report which delete broke it)
    Single commit: `chore(18): remove orphan files surfaced by knip` listing each deleted file in the body.
    If Task 2 chose "stop" → SKIP this task entirely and note in summary.
  </action>
  <verify>
    <automated>pnpm lint &amp;&amp; pnpm build &amp;&amp; pnpm test &amp;&amp; pnpm knip --no-exit-code &gt;/dev/null 2&gt;&amp;1</automated>
  </verify>
  <done>All DELETE items removed, full monorepo lint/build/test green, knip re-run shows fewer findings.</done>
  <rollback>git revert HEAD (single commit, atomic)</rollback>
</task>

</tasks>

<verification>
- `knip.json` exists, valid, runs without crash
- `pnpm knip` script available
- Disposition table in `18-knip-report.txt` covers every finding
- If deletes applied: full pnpm lint+build+test green
</verification>

<success_criteria>
- knip is permanently wired (config + script) for future use
- Every knip finding has a documented disposition
- Stop-gate respected: nothing ambiguous deleted without Luca approval
- LOC delta recorded (count diff vs plan 01 baseline)
</success_criteria>

<output>
After completion, create `.planning/phases/18-simplify-pass-tools-app/18-02-SUMMARY.md` with: knip finding counts (before/after), disposition table summary, list of deleted files, any DEFER items added to BACKLOG.
</output>
