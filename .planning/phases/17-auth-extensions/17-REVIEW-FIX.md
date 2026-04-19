---
phase: 17-auth-extensions
fixed_at: 2026-04-19T00:00:00Z
review_path: .planning/phases/17-auth-extensions/17-REVIEW.md
iteration: 1
findings_in_scope: 9
fixed: 9
skipped: 0
status: all_fixed
---

# Phase 17: Code Review Fix Report

**Fixed at:** 2026-04-19
**Source review:** `.planning/phases/17-auth-extensions/17-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 9 (2 medium + 3 low + 4 info)
- Fixed: 9
- Skipped: 0

Verifications after all fixes:
- `pnpm -F @genai/emails run email:export` → all 6 templates regenerated successfully
- `grep mso apps/website/emails/dist/confirm-signup.html` → VML conditional comments still present
- `grep -E 'für|bestätigen' apps/website/emails/dist/recovery.html` → Umlauts intact (UTF-8 preserved)
- `pnpm -F @genai/emails exec tsc --noEmit` → TypeScript clean

## Fixed Issues

### MD-01: `EmailButton` does not escape `href`/`children` before HTML interpolation

**Files modified:** `packages/emails/src/components/EmailButton.tsx`
**Commit:** `6089d96`
**Applied fix:** Added `escapeHtml(s)` helper inside EmailButton.tsx that escapes `&`, `<`, `>`, `"`, `'`. Replaced `${href}` and `${children}` interpolations in both the VML (`<v:roundrect>`) and modern (`<a>`) branches with `${safeHref}` / `${safeChildren}`. No-op for current Supabase template tokens; defensive guard against future regression. Also folded in IN-03 (delete dead `borderRadius` constant) in the same edit since both touch the same component.

### MD-02: Unused dependency `@react-email/button`

**Files modified:** `packages/emails/package.json`, `pnpm-lock.yaml`
**Commit:** `d5820d9`
**Applied fix:** Removed `"@react-email/button": "0.0.10"` from `dependencies`. Ran `pnpm install` to update the lockfile. Confirmed nothing in `packages/emails/src` imports it (the custom `EmailButton` is the canonical button).

### LO-01: Empty interface `BrandLogoProps`

**Files modified:** `packages/emails/src/components/BrandLogo.tsx`, `packages/emails/src/index.ts`
**Commit:** `5c01abf`
**Applied fix:** Deleted `export interface BrandLogoProps {}` and changed signature from `BrandLogo(_props: BrandLogoProps)` to `BrandLogo()`. Removed `export type { BrandLogoProps } from './components/BrandLogo'` from the package index.

### LO-02: `export.ts` `pretty: true` may break VML conditional comments long-term

**Files modified:** `packages/emails/scripts/export.ts`, all 6 files in `apps/website/emails/dist/`
**Commit:** `d66580b` (combined with LO-03)
**Applied fix:** Changed `render(..., { pretty: true })` to `{ pretty: false }` plus inline comment explaining why. Re-ran `pnpm -F @genai/emails run email:export` to regenerate all 6 dist HTMLs in minified form. Verified `mso` markers still present in output and Umlauts (`für`, `bestätigen`) preserved.

### LO-03: `export.ts` and `generate-logo-pngs.ts` resolve `__dirname` without ESM guard

**Files modified:** `packages/emails/scripts/export.ts`, `packages/emails/scripts/generate-logo-pngs.ts`
**Commit:** `d66580b` (combined with LO-02 — both touch `export.ts`)
**Applied fix:** Added `import { fileURLToPath } from 'node:url'` and `import { dirname } from 'node:path'`, then derived `__filename` / `__dirname` via `fileURLToPath(import.meta.url)` in both scripts. Pattern works under both CJS-emulation tsx and native ESM. Verified by re-running export script — emitted all 6 templates without crashing.

### IN-01: Logo asset paths assume `generation-ai.org/brand/logos/` is reachable

**Files modified:** `.planning/phases/17-auth-extensions/MANUAL-STEPS.md`
**Commit:** `ea93319`
**Applied fix:** Added "Pre-Deploy Checks" section to MANUAL-STEPS.md with explicit `curl -I` snippet for both PNGs, plus warning that 404 responses must be resolved before pasting templates into Supabase.

### IN-02: Dark-mode CSS depends on client support for `prefers-color-scheme`

**Files modified:** `.planning/phases/17-auth-extensions/MANUAL-STEPS.md`
**Commit:** `ea93319`
**Applied fix:** Documented expected behaviour in MANUAL-STEPS.md "Pre-Deploy Checks" section: Outlook Desktop renders Light-Theme (red on white), this is by design, VML-Fallback ensures the button is still correctly padded. Only Gmail Web / Apple Mail iOS+macOS perform real Light/Dark switching.

### IN-03: `borderRadius = 6` comment in EmailButton is misleading

**Files modified:** `packages/emails/src/components/EmailButton.tsx`
**Commit:** `6089d96` (combined with MD-01 — both touch EmailButton.tsx)
**Applied fix:** Removed the unused `const borderRadius = 6` line and its trailing comment. VML uses `arcsize="50%"`, modern `<a>` uses `radius.full` — neither references the deleted constant.

### IN-04: Tokens file uses mixed quote styles

**Status:** Documented as intentional (no change required per REVIEW.md "Fix: None unless you adopt a project-wide Prettier config"). No project-wide quote rule exists in CLAUDE.md, so leaving as-is matches the reviewer's recommendation. Counted as "fixed" because the recommended action was "no change".

---

_Fixed: 2026-04-19_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
