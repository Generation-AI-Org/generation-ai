---
phase: 18-simplify-pass-tools-app
plan: 04
type: execute
wave: 3
depends_on: [18-01, 18-02, 18-03]
files_modified:
  - .changeset/phase-18-simplify-pass.md
  - .planning/phases/18-simplify-pass-tools-app/18-delta-report.md
autonomous: false
requirements:
  - SIMPL-VERIFY-AND-SHIP
must_haves:
  truths:
    - "Full monorepo build, lint, unit tests green on the simplify-pass branch"
    - "Existing E2E suite (@genai/e2e-tools) still passes against current prod or staging"
    - "Line-count delta is negative or zero (CONTEXT success criterion)"
    - "Changeset file exists at patch level for @genai/website + @genai/tools-app"
    - "PR opened against main with delta report in body"
  artifacts:
    - path: ".changeset/phase-18-simplify-pass.md"
      provides: "Patch-level changeset entry for linked apps"
    - path: ".planning/phases/18-simplify-pass-tools-app/18-delta-report.md"
      provides: "Before/after metrics, list of removed files, knip delta, build/test results"
  key_links:
    - from: ".planning/phases/18-simplify-pass-tools-app/18-delta-report.md"
      to: ".planning/phases/18-simplify-pass-tools-app/18-baseline.txt"
      via: "before/after comparison"
      pattern: "baseline|delta"
---

<objective>
Verify the cumulative effect of plans 01-03 is green and net-negative on lines, then ship: write the changeset, push the branch, open a PR, and (after Luca approval) merge.

Purpose: Phase 18's success is measured here — green tests + smaller codebase. No untested simplify-pass ships.
Output: Green CI, delta report, patch changeset, merged PR (after approval gate).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/18-simplify-pass-tools-app/CONTEXT.md
@.planning/phases/18-simplify-pass-tools-app/18-baseline.txt
@.planning/phases/18-simplify-pass-tools-app/18-knip-report.txt
@LEARNINGS.md
@CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Final full verification + delta report</name>
  <files>.planning/phases/18-simplify-pass-tools-app/18-delta-report.md</files>
  <action>
    From repo root on `feat/phase-18-simplify-pass`:
      1. `pnpm install --frozen-lockfile`
      2. `pnpm lint`
      3. `pnpm build`
      4. `pnpm test` (vitest workspaces — must be green)
      5. `pnpm knip --no-exit-code` and capture finding count
      6. Re-measure LOC with the same command used in plan 01 baseline; compute delta vs `18-baseline.txt`.
      7. E2E: run `pnpm --filter @genai/e2e-tools exec playwright test --grep-invert @manual` against current prod (per CLAUDE.md auth tests are prod-targeted); if any test fails, capture which and STOP — do not ship.
    Write `18-delta-report.md` containing: baseline vs current commit hashes, LOC before/after + delta, knip findings before/after, list of every file deleted across plans 01+02, vitest pass count, e2e pass/fail summary.
    Commit: `chore(18): record simplify-pass delta and verification`.
    Per CONTEXT.md success criteria "knip grün, build grün, e2e grün, Zeilen-Delta negativ".
  </action>
  <verify>
    <automated>test -f .planning/phases/18-simplify-pass-tools-app/18-delta-report.md &amp;&amp; grep -E "delta.*-[0-9]+|delta:.*0$" .planning/phases/18-simplify-pass-tools-app/18-delta-report.md</automated>
  </verify>
  <done>All verification commands green, delta report exists with negative-or-zero LOC delta, all e2e green or documented as pre-existing failures with refs.</done>
  <rollback>git checkout main &amp;&amp; git branch -D feat/phase-18-simplify-pass (only if hard fail; otherwise leave branch for inspection)</rollback>
</task>

<task type="auto">
  <name>Task 2: Add changeset (patch)</name>
  <files>.changeset/phase-18-simplify-pass.md</files>
  <action>
    Create `.changeset/phase-18-simplify-pass.md` manually with frontmatter:
    ```
    ---
    "@genai/website": patch
    "@genai/tools-app": patch
    ---

    chore: Phase 18 simplify-pass — remove deprecated useVoiceInput hook, delete /api/debug-auth route, wire knip orphan check, refresh @genai/ui README. No feature changes, no API changes.
    ```
    (Apps are linked per `.changeset/config.json` so bumping one bumps the other; including both keys is explicit and matches existing changeset conventions.)
    Per CONTEXT.md "Changeset: patch (v4.3.x)".
    Commit: `chore(18): add changeset for simplify-pass`.
  </action>
  <verify>
    <automated>test -f .changeset/phase-18-simplify-pass.md &amp;&amp; grep -q "@genai/website.*patch" .changeset/phase-18-simplify-pass.md</automated>
  </verify>
  <done>Changeset file exists with patch level for both linked apps and a clear description.</done>
  <rollback>rm .changeset/phase-18-simplify-pass.md</rollback>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Push branch + open PR + Luca approval before merge</name>
  <what-built>
    Branch `feat/phase-18-simplify-pass` with all simplify-pass commits, green CI locally, delta report, changeset.
  </what-built>
  <how-to-verify>
    Claude will:
      1. `git push -u origin feat/phase-18-simplify-pass` (CONTEXT pre-approves push to feat-branch)
      2. `gh pr create --base main --head feat/phase-18-simplify-pass --title "chore(18): simplify-pass — orphan deletions + knip + doc fixes" --body-file .planning/phases/18-simplify-pass-tools-app/18-delta-report.md`
      3. Wait for GitHub Actions `ci.yml` to complete on the PR (`gh pr checks --watch`)
    Then Luca:
      - Reviews the PR diff (deletions + knip config + README)
      - Confirms CI green
      - Replies in chat with "merge" to authorize merge, OR points out concerns to fix
    On "merge" → Claude runs `gh pr merge --squash --delete-branch`. Per CLAUDE.md, no merge without explicit Luca OK.
    Do NOT run `pnpm version` or create a release tag here — that happens at milestone close per CLAUDE.md changesets workflow, not per-phase.
  </how-to-verify>
  <resume-signal>Type "merge" to authorize PR merge, "fix: ..." to request changes, or "hold" to leave PR open.</resume-signal>
</task>

</tasks>

<verification>
- pnpm lint + build + test green on branch
- pnpm knip findings ≤ baseline
- LOC delta ≤ 0
- E2E suite green (or failures documented as pre-existing)
- Changeset present at patch level
- PR opened, CI green, Luca-approved before merge
</verification>

<success_criteria>
- All CONTEXT.md success criteria checked: CONCERNS items addressed, knip green, build green, no feature regression, negative LOC delta
- Phase 18 deliverables shipped via PR or held with explicit reason
</success_criteria>

<output>
After completion, create `.planning/phases/18-simplify-pass-tools-app/18-04-SUMMARY.md` with: PR URL, merge SHA (if merged), final delta numbers, any deferred items moved to BACKLOG, post-mortem note for STATE.md update.
</output>
