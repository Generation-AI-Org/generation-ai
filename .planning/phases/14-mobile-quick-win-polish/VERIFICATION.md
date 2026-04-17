---
phase: 14
status: passed
verified_at: 2026-04-17
---

# Phase 14 — Verification

## Status: PASSED (automated gates)

Visual mobile smoke-tests require a human on device; automated gates (build, lint, type-check via Next build) are green.

## Plan 14-01: Auto-Resize fuer Diktat-Input (D-02)

**File:** `apps/tools-app/components/chat/FloatingChat.tsx`

Changes:
- Extracted single `resizeTextarea` useCallback near `textareaRef` (Z. 47) as DRY source of truth (min implicit / max 120px).
- Replaced duplicate inline resize in `useEffect` (Z. 228-231) with `resizeTextarea()` call; deps now `[message, isExpanded, resizeTextarea]` so the freshly mounted textarea on expand-toggle gets recomputed.
- Simplified `handleInputChange` — no longer duplicates resize logic; effect handles it.

Success criteria:
- [x] Build green (`pnpm -F tools-app build` — 46/46 pages)
- [x] Lint clean (no new errors/warnings)
- [x] No refs/struct changes to the two textarea render paths
- [ ] Voice-input live growth — **needs human smoke-test on mobile**
- [ ] Post-send shrink back to 44px — **needs human smoke-test**

## Plan 14-02: Legal Footer Hide on Expanded + Darkmode (D-03)

**File:** `apps/tools-app/components/AppShell.tsx`

Changes:
- Footer `className` now toggles `hidden` vs `flex` based on `isChatExpanded` — no layout-shift placeholder.
- Switched `text-text-muted` -> `text-[var(--text-muted)]` and `hover:text-text` -> `hover:text-[var(--text)]` for explicit theme-aware CSS-var consumption (consistent with the rest of the footer classes that already use `var(--border)`, `var(--bg-header)`).
- Verified tokens in `packages/config/tailwind/base.css`: light `#555555`, dark `#8A8A8A` — both pass WCAG AA contrast on `--bg-header`.
- No new state — reused existing `isChatExpanded`.

Success criteria:
- [x] Build green
- [x] Lint clean
- [x] Desktop unchanged (`lg:hidden` preserved)
- [ ] Mobile chat expanded -> footer visually gone — **needs human smoke-test**
- [ ] Darkmode toggle -> footer still readable — **needs human smoke-test**

## Out of Scope / Follow-ups

- Fade transition on footer hide (deferred to Phase 16 Micro-Animations).
- Shift+Enter verification (D-01, excluded per CONTEXT).
