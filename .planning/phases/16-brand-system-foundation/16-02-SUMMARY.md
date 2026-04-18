---
phase: 16
plan: 02
subsystem: design-system
tags: [tokens, css, radix-colors, typography, dark-mode]
dependency_graph:
  requires: [16-01]
  provides: [radix-slate-tokens, geist-font-bindings, semantic-status-tokens]
  affects: [packages/config/tailwind/base.css, apps/website, apps/tools-app]
tech_stack:
  added: ["@radix-ui/colors@3.0.0 CSS imports"]
  patterns: ["Radix Colors CSS token aliasing", "CSS custom property semantic layer"]
key_files:
  modified:
    - packages/config/tailwind/base.css
decisions:
  - "Radix v3 .dark selector aliased onto :root:not(.light) via explicit dark-value re-declaration (not CSS selector forwarding) — chosen for correctness over cleverness"
  - "slate-alpha.css used (not slateA.css) — confirmed against installed package files"
  - "--font-family-sans added to @theme inline alongside existing --font-family-mono"
  - "status-warning uses #F59E0B (amber-500) matching brand/DESIGN.md §C, not #D97706 from PLAN description"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-18T15:57:00Z"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 16 Plan 02: Tokens — base.css Extension — Summary

One-liner: Extended `packages/config/tailwind/base.css` with Radix Colors slate imports (v3.0.0), dark-mode aliasing for `:root`-is-dark convention, Geist font family bindings, and semantic status tokens — both apps build green.

## What Was Built

Extended `packages/config/tailwind/base.css` with three additions required by the brand contract:

1. **Radix Colors imports** — `slate.css`, `slate-dark.css`, `slate-alpha.css` imported at top of file
2. **Dark-mode aliasing** — `:root:not(.light)` block re-declares dark slate values to fix Radix selector convention mismatch
3. **Geist font bindings** — `--font-sans` and `--font-mono` CSS variables wired to `next/font` class variables
4. **Semantic status tokens** — `--status-error/success/warning/info` defined in `:root`
5. **@theme inline extensions** — `--font-family-sans`, `--color-slate-1..12`, `--color-status-*` exposed as Tailwind utility classes
6. **Documentation** — RADIX SLATE semantic role mapping comment, canonical type scale from UI-SPEC.md

## MANDATORY: Radix Dark-Mode Selector Convention (verbatim grep output)

```
grep -E 'dark-theme|prefers-color-scheme' node_modules/@radix-ui/colors/slate-dark.css
```

**Output:**
```
.dark, .dark-theme {
    .dark, .dark-theme {
```

**Analysis:** `@radix-ui/colors` version 3.0.0 uses **class-based dark mode** — neither `@media (prefers-color-scheme: dark)` nor `:root`. The dark slate values are attached to `.dark, .dark-theme` selectors only.

**Impact on this project:** Our convention is dark-default on `:root` (no class), light via `.light` class on `<html>`. The Radix dark selector (`.dark`) never fires. Without aliasing, `:root` would have light slate values from `slate.css` (`slate.css` targets `:root, .light, .light-theme`), and dark slate values would never be applied.

**Resolution applied:** Added `:root:not(.light)` block that re-declares all 12 dark slate values verbatim from `slate-dark.css`. This ensures the dark default gets correct slate tokens. When `.light` is applied to `<html>`, the `.light` selector in `slate.css` wins (higher specificity + import order), so light slate values correctly override.

**For Plans 04/05 executors:** The `:root:not(.light)` aliasing block in `base.css` is load-bearing for dark mode slate tokens. Do not remove it. The `.dark` class from Radix is never used in this project.

## Files Modified

| File | Lines added | Lines removed | Key change |
|------|------------|---------------|------------|
| `packages/config/tailwind/base.css` | +135 | −9 | Radix imports, dark aliasing, font vars, status tokens, @theme extensions |

## Commit

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Radix Colors imports + Geist fonts + status tokens to base.css | `426c2c3` | `packages/config/tailwind/base.css` |

## Installed Package Details

- **Package:** `@radix-ui/colors` version `3.0.0`
- **Location:** `packages/config/node_modules/@radix-ui/colors/`
- **Files imported:**
  - `slate.css` — `:root, .light, .light-theme { --slate-1..12 }` (light values)
  - `slate-dark.css` — `.dark, .dark-theme { --slate-1..12 }` (dark values)
  - `slate-alpha.css` — `:root, .light, .light-theme { --slate-a1..12 }` (light alpha values)
- **Note:** File is `slate-alpha.css`, NOT `slateA.css`. The plan mentioned both possibilities — verified against actual installed files before editing.
- **Note:** `slate-dark-alpha.css` exists in the package but was NOT imported — alpha dark values are manually declared in the `:root:not(.light)` aliasing block using approximate rgba equivalents. If precise dark alpha values are needed in Plans 04/05, import `slate-dark-alpha.css` and add a corresponding `:root:not(.light)` block for `--slate-a*` dark values.

## Verification Results

All acceptance criteria passed:

| Check | Result |
|-------|--------|
| `@import "@radix-ui/colors` count ≥ 3 | 3 (slate, slate-dark, slate-alpha) |
| `var(--font-geist-sans)` present | FOUND |
| `var(--font-geist-mono)` present | FOUND |
| `--status-error: #DC2626` present | FOUND |
| `--status-success: #16A34A` present | FOUND |
| `--status-warning: #F59E0B` present | FOUND |
| `--status-info: #2563EB` present | FOUND |
| `--color-slate-N` count = 12 | 12 |
| Cascadia removed | REMOVED |
| `--bg-header` preserved | PRESERVED |
| `#FC78FE` (Rosa) preserved | PRESERVED |
| `#3A3AFF` (Blau) preserved | PRESERVED |
| `pnpm --filter @genai/website build` | EXIT 0 |
| `pnpm --filter @genai/tools-app build` | EXIT 0 |
| Radix dark-mode selector documented verbatim | DONE — `.dark, .dark-theme` |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written with one minor clarification:

**1. [Clarification] Dark alpha values approximated rather than importing slate-dark-alpha.css**
- **Found during:** Task 1
- **Issue:** Plan specified importing slate-alpha.css (light alpha) but did not mention slate-dark-alpha.css. The `:root:not(.light)` aliasing block needed dark alpha values for completeness.
- **Fix:** Added approximate rgba dark alpha values inline in the `:root:not(.light)` block. `slate-dark-alpha.css` can be imported in a follow-up if precise P3-wide-gamut dark alpha values are required.
- **Impact:** Zero — dark alpha values are not yet referenced by any component code.

**2. [Clarification] status-warning hex: #F59E0B used (matching brand/DESIGN.md §C)**
- The PLAN.md action section mentioned `#D97706` while the brand/DESIGN.md §C table lists `#F59E0B` (amber-500). Used the brand/DESIGN.md value as authoritative source per plan hierarchy.

## Known Stubs

None — this plan adds CSS variables only. No UI rendering depends on these tokens until Plans 04/05 migrate app-level code.

## Threat Flags

None — CSS-only change, no new network endpoints, auth paths, or trust boundaries introduced.

## Self-Check: PASSED

- [x] `packages/config/tailwind/base.css` exists and contains all required sections
- [x] Commit `426c2c3` exists
- [x] Both app builds exit 0
- [x] Radix selector convention documented verbatim
