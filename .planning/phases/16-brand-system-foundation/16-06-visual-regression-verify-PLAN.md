---
phase: 16
plan: 06
type: execute
wave: 4
depends_on: [16-04, 16-05]
files_modified:
  - packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/
  - .planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md
autonomous: false
requirements:
  - BRAND-16-16-visual-regression-diff
  - BRAND-16-17-build-verification
must_haves:
  truths:
    - "Playwright visual-diff run compares post-migration against baseline from Plan 01"
    - "All intentional diffs (font change Inter→Geist, token-based color resolution) are documented"
    - "No unintentional layout regressions (element shifts, broken components, text overflow)"
    - "Both apps pnpm build green end-of-phase"
    - "User reviews diff report before phase-complete signal"
  artifacts:
    - path: ".planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md"
      provides: "Human-readable diff report listing per-route diff status, intentional vs unintentional changes"
      min_lines: 30
  key_links:
    - from: "packages/e2e-tools/tests/visual-baseline.spec.ts"
      to: "baseline PNG snapshots (Plan 01)"
      via: "Playwright toHaveScreenshot diff"
      pattern: "toHaveScreenshot"
---

<objective>
Verify Phase 16 migration outcome by:
1. Running Playwright visual-regression against baseline snapshots from Plan 01
2. Categorizing diffs as intentional (font swap, token-based color resolution, logo component swap) vs unintentional (layout shifts, text overflow, broken components)
3. Human checkpoint for Luca to review diff report and approve phase completion
4. Final end-of-phase build verification on both apps

Purpose: The Visual Regression Gate in UI-SPEC.md requires that Phase 16 ships ONLY intentional visual changes. This plan executes that gate before phase is marked complete.

Output: Diff report committed, baseline snapshots updated (after user approves the intentional diffs), both apps build green.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/16-brand-system-foundation/16-UI-SPEC.md
@.planning/phases/16-brand-system-foundation/16-01-SUMMARY.md
@.planning/phases/16-brand-system-foundation/16-04-SUMMARY.md
@.planning/phases/16-brand-system-foundation/16-05-SUMMARY.md
@packages/e2e-tools/tests/visual-baseline.spec.ts
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Run visual-regression diff + generate diff report</name>
  <read_first>
    - packages/e2e-tools/tests/visual-baseline.spec.ts
    - packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/ (list)
    - .planning/phases/16-brand-system-foundation/16-01-SUMMARY.md (baseline details)
    - .planning/phases/16-brand-system-foundation/16-04-SUMMARY.md (website migration details)
    - .planning/phases/16-brand-system-foundation/16-05-SUMMARY.md (tools-app migration details)
  </read_first>
  <action>
**Step 1 — Start dev servers for both apps:**

```bash
pnpm dev:website &
pnpm dev:tools &
```

Wait for both to be ready (port 3000 + 3001 respond). If servers fail to start, document blocker in the report and STOP.

**Step 2 — Run visual-regression diff (without --update-snapshots):**

```bash
pnpm --filter @genai/e2e-tools exec playwright test visual-baseline
```

Expected result: tests fail showing per-snapshot diffs (because fonts, possibly colors changed). Playwright writes diff PNGs to `packages/e2e-tools/test-results/` for each failure.

**Step 3 — Generate diff report:**

Create `.planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md` with this structure:

```markdown
# Phase 16 — Visual Regression Diff Report

**Generated:** [date]
**Baseline captured:** Plan 01 (pre-migration)
**Post-migration run:** Plan 06 (post-Wave-3)

## Summary

- Routes tested: 14 (website 3×2 + tools-app 4×2)
- Routes with diffs: [N]
- Intentional diffs: [N]
- Unintentional diffs: [N]

## Per-Route Diff Classification

### Website

| Route × Theme | Diff % | Classification | Notes |
|---------------|--------|---------------|-------|
| /home light | X.X% | INTENTIONAL | Font Inter→Geist, focus-ring color change |
| /home dark | X.X% | INTENTIONAL | Same |
| /impressum light | X.X% | INTENTIONAL | Font only |
| /impressum dark | X.X% | INTENTIONAL | Same |
| /datenschutz light | X.X% | INTENTIONAL | Font only |
| /datenschutz dark | X.X% | INTENTIONAL | Same |

### tools-app

| Route × Theme | Diff % | Classification | Notes |
|---------------|--------|---------------|-------|
| /home light | X.X% | INTENTIONAL | Font + Logo swap |
| ... | | | |

## Intentional Changes (expected)

1. **Font family change (all routes, all themes)**: Inter → Geist Sans, Cascadia → Geist Mono. Visible on all text surfaces.
2. **Logo swap (header, footer, login, terminal-splash)**: PNG/JPG sources → SVG via `<Logo />`. SVGs render crisp at all sizes; may differ slightly in sub-pixel rendering from PNG originals.
3. **Focus-ring color (interactive elements)**: `var(--accent)` → `var(--text)`. Only visible with keyboard-focus; baseline likely didn't capture focused state.
4. **Microcopy string replacements**: [list per-file from 16-04 / 16-05 summaries, e.g. "/login: 'Einen Augenblick bitte' → 'Einen Moment…'"]

## Unintentional Changes (MUST FIX)

[List any diffs that don't fit the categories above. Include route, theme, diff %, screenshot path, hypothesis.]

If this list is non-empty → PHASE BLOCKED. Do NOT proceed to checkpoint. Open an issue and route back to Plan 04 / Plan 05 for fix.

## Diff Artifacts

All diff PNGs: `packages/e2e-tools/test-results/`
Format: `{spec-name}-{route}-{theme}-diff.png` (actual vs expected vs diff)
```

**Step 4 — Review diffs programmatically where possible:**

For each failed snapshot, check the diff-pixel percentage:
- <1% diff → likely font-subpixel noise, acceptable
- 1-10% diff → likely legitimate intentional change (font, color swap), acceptable IF pattern matches
- >10% diff → investigate — could be layout shift, text overflow, broken component

Use `ls packages/e2e-tools/test-results/` to enumerate diff outputs and inspect diff-pixel percentages from Playwright's JSON reporter output if available (`--reporter=json`).

**Step 5 — Do NOT auto-update snapshots.**

Even if all diffs look intentional, do NOT run `--update-snapshots` yet. The human checkpoint in Task 2 governs that decision.
  </action>
  <verify>
    <automated>test -f .planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md && grep -q "Intentional Changes" .planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md && grep -q "Unintentional Changes" .planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md</automated>
  </verify>
  <acceptance_criteria>
    - `test -f .planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md` → 0
    - Report contains per-route classification table for website (≥6 rows) and tools-app (≥8 rows)
    - Report contains `## Intentional Changes` section with at least 3 documented change categories (font, logo, focus-ring)
    - Report contains `## Unintentional Changes` section — empty or listed with actionable notes
    - If unintentional diffs exist → report marks phase BLOCKED; else marks phase READY for checkpoint
    - Playwright diff artifacts exist in `packages/e2e-tools/test-results/`
  </acceptance_criteria>
  <done>Visual-regression run complete, diff report written classifying every per-route change as intentional or unintentional.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Human checkpoint — Luca reviews diff report + approves phase completion</name>
  <what-built>
Automated visual-regression diff against pre-migration baseline. Diff report committed at `.planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md` listing every per-route change as intentional (font Geist, logo component, focus ring, microcopy) or unintentional (layout shifts, overflow, broken components).

Playwright diff PNGs available at `packages/e2e-tools/test-results/` for side-by-side actual/expected/diff inspection.

Apps migrated in Wave 3:
- apps/website: Geist fonts, Logo component in header/footer/terminal-splash, focus-ring fixed, microcopy pass, umlauts restored in metadata
- apps/tools-app: Geist fonts, Logo component in GlobalLayout/DetailHeaderLogo/login, focus-ring fixed, microcopy pass
  </what-built>
  <how-to-verify>
1. Open `.planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md` and read per-route classification
2. For each INTENTIONAL row: confirm the listed change is expected and visually acceptable
3. For each UNINTENTIONAL row (if any): inspect the diff PNG at `packages/e2e-tools/test-results/` — decide fix-required vs accept-as-intentional
4. Boot both dev servers locally and smoke-test manually:
   ```bash
   pnpm dev:website  # visit http://localhost:3000, toggle light/dark, check header + footer + terminal-splash logo + body font
   pnpm dev:tools    # visit http://localhost:3001, /login, toggle light/dark, check header logo + body font + focus-ring on an input
   ```
5. Verify key points visually:
   - Geist Mono visible on H1 / hero headlines (not Inter)
   - Geist Sans visible on body text (not Inter)
   - Logo matches theme (red on light header / neon on dark header, black on light footer / white on dark footer)
   - Focus-ring when tabbing through links is black (light mode) / white-ish (dark mode), NOT brand-accent red/neon
   - Microcopy: trigger an error state (e.g. submit empty login form) — confirm message uses VOICE.md phrasing
6. Decision:
   - **Approve** → proceeds to Task 3 (snapshot update + final build verify)
   - **Reject** → document issues, return to Plan 04/05 for fixes, re-run Plan 06 after fix
  </how-to-verify>
  <resume-signal>Type "approved" to proceed OR describe unintentional changes that must be fixed before phase completion.</resume-signal>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Update baseline snapshots to post-migration + final build verify both apps</name>
  <read_first>
    - .planning/phases/16-brand-system-foundation/16-06-VISUAL-DIFF-REPORT.md (must confirm checkpoint approved)
  </read_first>
  <action>
Only execute this task AFTER Task 2 checkpoint approval.

**Step 1 — Update baseline snapshots to reflect approved post-migration state:**

```bash
pnpm --filter @genai/e2e-tools exec playwright test visual-baseline --update-snapshots
```

This overwrites `packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/` with the post-migration renders. These become the new baseline for Phase 17+ work.

**Step 2 — Verify the new baseline matches itself:**

```bash
pnpm --filter @genai/e2e-tools exec playwright test visual-baseline
```

Must exit 0 (updated snapshots match current render).

**Step 3 — Final clean build on both apps:**

```bash
pnpm --filter @genai/website build
pnpm --filter @genai/tools-app build
```

Both must exit 0. Spot-check build output:
- Routes should be `ƒ` (dynamic) for user-facing pages — CSP invariant preserved
- No "Inter" or "Cascadia" in build diagnostics
- No broken imports for @genai/ui or geist/font

**Step 4 — Run full test suite:**

```bash
pnpm test
```

All existing vitest tests should still pass. If any break (typically because a test asserts on old microcopy string or old font CSS value), document in SUMMARY — the test needs updating to match the new brand contract, but that's a follow-up if not trivial.

**Step 4b — Playwright smoke spec (existing E2E, post-migration):**

ROADMAP success criterion "Alle E2E-Tests grün" requires the PRE-EXISTING Playwright specs (not just the new visual-baseline spec) to still pass after the brand migration. Run the smoke spec locally against the running dev servers:

```bash
# Dev servers should still be running from Step 1. If not, restart:
pnpm dev:website &
pnpm dev:tools &
# Wait for readiness (same pattern as Plan 01):
timeout 60 bash -c 'until curl -sf http://localhost:3000 > /dev/null && curl -sf http://localhost:3001 > /dev/null; do sleep 2; done'

# Run smoke spec (no auth required):
pnpm --filter @genai/e2e-tools exec playwright test smoke --project=chromium
```

Must exit 0. If a smoke assertion breaks because of a microcopy / font / color change, update the assertion to match the new brand contract and re-run.

**Step 4c — Auth + Chat specs (require credentials, CHECKPOINT for post-deploy):**

The `auth.spec.ts` and `chat.spec.ts` specs require real Supabase credentials and are run against a deployed Preview URL in CI. They CANNOT run locally without test-user credentials. Add a manual post-deploy step to SUMMARY under "Manual verification (post-deploy)":

> After Vercel Preview deploy completes for the Phase 16 branch: run `TARGET_URL=<preview-url> pnpm e2e` (or `pnpm --filter @genai/e2e-tools exec playwright test auth chat --project=chromium`). Verify auth.spec.ts + chat.spec.ts exit 0. If any break due to brand changes (microcopy, selectors, focus-ring color assertions), update specs and re-run before Prod promotion.

This is a CHECKPOINT note, not a blocking automated gate for this plan. Luca runs it post-deploy before promoting to Prod.

**Step 5 — Confirm no lingering old-logo PNG/JPG references in source:**

```bash
grep -rn "generationai-pink-rot-transparent\\|logo-blue-neon-new\\|logo-pink-red" apps/ --include="*.ts" --include="*.tsx"
# Note: generationai-blau-neon-transparent.png is DEFERRED (terminal-splash square variant) — excluded from this grep
```

Must return no results. (The files still exist in `public/` but are orphaned — cleanup is a post-phase task documented in SUMMARY.)
  </action>
  <verify>
    <automated>pnpm --filter @genai/e2e-tools exec playwright test visual-baseline && pnpm --filter @genai/e2e-tools exec playwright test smoke --project=chromium && pnpm --filter @genai/website build && pnpm --filter @genai/tools-app build && ! grep -rq "generationai-pink-rot-transparent\|logo-blue-neon-new\|logo-pink-red" apps/ --include="*.ts" --include="*.tsx"</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm --filter @genai/e2e-tools exec playwright test visual-baseline` exits 0 (post-migration snapshots match current render)
    - `pnpm --filter @genai/website build` exits 0
    - `pnpm --filter @genai/tools-app build` exits 0
    - `grep -r "generationai-pink-rot-transparent\\|logo-blue-neon-new\\|logo-pink-red" apps/ --include="*.ts" --include="*.tsx"` → empty (terminal-splash's blau-neon reference is DEFERRED and allowed)
    - `pnpm test` exits 0 OR any test failures are documented in SUMMARY with follow-up action
    - Updated snapshot PNG count in `packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/` matches baseline count from Plan 01 (14 PNGs)
    - **Existing Playwright smoke spec passes:** `pnpm --filter @genai/e2e-tools exec playwright test smoke --project=chromium` exits 0 (run against local dev servers)
    - SUMMARY documents manual post-deploy step for auth.spec + chat.spec against Preview URL
  </acceptance_criteria>
  <done>Baseline updated to post-migration state, both apps build green, no stale logo references in code, phase is complete.</done>
</task>

</tasks>

<verification>
- Visual-diff report committed with per-route classification
- Human checkpoint approved (Task 2 resume signal received)
- Baseline snapshots updated to post-migration state
- `pnpm --filter @genai/e2e-tools exec playwright test visual-baseline` green (self-match on new baseline)
- Both apps `pnpm build` green
- `pnpm test` green (or failures explicitly documented)
- No stale logo PNG/JPG references in ts/tsx source (except terminal-splash's blau-neon — DEFERRED)
- Existing Playwright smoke spec green post-migration
- Manual post-deploy checkpoint documented for auth + chat specs against Preview URL
- CSP / force-dynamic invariants preserved (verified in Plans 04/05, confirmed here by build output)
</verification>

<success_criteria>
- Phase 16 Visual Regression Gate satisfied: only intentional changes ship
- Diff report serves as human-readable audit trail for Phase 16
- Post-migration baseline committed as new reference for Phase 17+
- Both apps build green end-of-phase
- All tests green (or documented follow-ups)
- Phase ready for changeset (minor, v4.3.0)
</success_criteria>

<output>
After completion, create `.planning/phases/16-brand-system-foundation/16-06-SUMMARY.md` with:
- Total routes tested, diff counts, classification summary
- Link to diff report
- Confirmation of human approval
- Final build status both apps
- Test suite status
- Orphan file list for post-phase cleanup:
  - apps/website/public/logos/generationai-*.png (6 files likely)
  - apps/tools-app/public/logo-blue-neon-new.jpg
  - apps/tools-app/public/logo-pink-red.jpg
  - apps/website/app/fonts/CascadiaCode.woff2
  - apps/tools-app/app/fonts/CascadiaCode.woff2 (if exists)
- Changeset recommendation: minor bump (v4.3.0) per CONTEXT.md Changeset section
- Phase 17 readiness: React Email templates can now use brand tokens + `<Logo context="mail" />`
</output>
