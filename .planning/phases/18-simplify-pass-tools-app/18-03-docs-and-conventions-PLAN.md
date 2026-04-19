---
phase: 18-simplify-pass-tools-app
plan: 03
type: execute
wave: 2
depends_on: [18-01]
files_modified:
  - packages/ui/README.md
autonomous: true
requirements:
  - SIMPL-DOC-DRIFT
must_haves:
  truths:
    - "packages/ui/README.md accurately documents that <Logo /> is exported (no longer 'leer by design')"
    - "No code or behavior changed; only doc accuracy"
  artifacts:
    - path: "packages/ui/README.md"
      provides: "Up-to-date description of @genai/ui package"
  key_links:
    - from: "packages/ui/README.md"
      to: "packages/ui/src/components/Logo.tsx"
      via: "documented export"
      pattern: "Logo"
---

<objective>
Fix one piece of documentation drift surfaced by CONCERNS.md: `packages/ui/README.md` claims the package is intentionally empty, but Phase 16 added `<Logo />` plus a CHANGELOG. Update README to match reality.

Purpose: Docs must not lie. This is a 1-file, ~30-line edit. Independent from plan 02, can run in the same wave.
Output: Accurate README in `packages/ui`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/codebase/CONCERNS.md
@packages/ui/README.md
@packages/ui/src/index.ts
@packages/ui/CHANGELOG.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite packages/ui/README.md</name>
  <files>packages/ui/README.md</files>
  <action>
    Replace the current "Status: Leer (by design)" content with an accurate description matching the existing source structure (verify by reading `packages/ui/src/index.ts` and `packages/ui/src/components/Logo.tsx` first):
      - Title `# @genai/ui — Shared UI Components`
      - One-paragraph purpose (cross-app primitives shared between website and tools-app)
      - "Exports" section listing what `src/index.ts` actually exports (e.g. `Logo`)
      - Usage snippet showing `import { Logo } from "@genai/ui"`
      - Pointer to `CHANGELOG.md` for history
      - Note: future additions follow the convention from `@.planning/codebase/CONVENTIONS.md` § "Where to Add New Code → New shared UI component"
    Keep it short (under ~50 lines). German is fine for prose; code identifiers stay English. Use real Umlaute per global rule.
    Commit: `docs(18): update @genai/ui README to reflect Logo export (Phase 16)`.
    Per CONCERNS.md "@genai/ui README possibly stale".
  </action>
  <verify>
    <automated>grep -q "Logo" packages/ui/README.md &amp;&amp; ! grep -qi "leer.*by design\|status: leer" packages/ui/README.md</automated>
  </verify>
  <done>README mentions Logo, no longer claims package is empty, no other files changed.</done>
  <rollback>git revert HEAD</rollback>
</task>

</tasks>

<verification>
- README content matches actual `src/index.ts` exports
- No source code touched
- Single atomic commit
</verification>

<success_criteria>
- Docs drift on `@genai/ui` resolved
- Build/test untouched (no code change)
</success_criteria>

<output>
After completion, create `.planning/phases/18-simplify-pass-tools-app/18-03-SUMMARY.md` noting the README diff.
</output>
