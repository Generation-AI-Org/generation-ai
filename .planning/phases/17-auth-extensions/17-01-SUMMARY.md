---
phase: 17-auth-extensions
plan: "01"
subsystem: emails
tags: [react-email, email-templates, design-tokens, typescript, workspace-package]
dependency_graph:
  requires: [brand/tokens.json, packages/config]
  provides: ["@genai/emails workspace package", "Layout component", "BrandLogo component", "EmailButton component", "tokens module"]
  affects: [packages/emails]
tech_stack:
  added: ["@react-email/components@0.0.31", "@react-email/button@0.0.10", "@react-email/render@1.0.1", "react-email@3.0.1"]
  patterns: ["React Email component tree", "inline design tokens", "CSS media query dark mode", "VML bulletproof button via pX/pY props"]
key_files:
  created:
    - packages/emails/package.json
    - packages/emails/tsconfig.json
    - packages/emails/src/tokens.ts
    - packages/emails/src/index.ts
    - packages/emails/src/components/Layout.tsx
    - packages/emails/src/components/BrandLogo.tsx
    - packages/emails/src/components/EmailButton.tsx
  modified:
    - pnpm-lock.yaml
decisions:
  - "Used @react-email/button@0.0.10 directly alongside @react-email/components@0.0.31 to get pX/pY TypeScript API for Outlook VML bulletproof buttons (that API was removed in 0.0.11+)"
  - "PNG logos at generation-ai.org/brand/logos/ referenced but not yet uploaded — Plan 17-05 handles asset delivery"
  - "tokens.ts exports plain hex/string values (no CSS variables) to match email-client inline-style requirement"
metrics:
  duration_minutes: 10
  completed_date: "2026-04-19"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 2
---

# Phase 17 Plan 01: React Email Foundation Summary

**One-liner:** `@genai/emails` workspace package with React Email infrastructure — typed token module, dark-mode-adaptive Layout wrapper, PNG-logo BrandLogo, and pX/pY VML-safe EmailButton.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Scaffold @genai/emails package | a6d5e6b | package.json, tsconfig.json, tokens.ts, index.ts, component stubs |
| 2 | Implement Layout + BrandLogo + EmailButton | e38596c | Layout.tsx, BrandLogo.tsx, EmailButton.tsx |

---

## What Was Built

### `packages/emails/src/tokens.ts`
Typed `tokens` object with `light` and `dark` keys, each containing resolved hex values from `brand/tokens.json`. Also exports `radius`, `space`, and `fontStack` as `as const` objects for direct inline-style use. No CSS variables — email clients require literal values.

Key values:
- `tokens.light.accent = '#F5133B'` (Generation AI red)
- `tokens.dark.accent = '#CEFF32'` (Generation AI neon green)

### `packages/emails/src/components/BrandLogo.tsx`
Renders two `<Img>` tags (PNG only, no SVG):
- Light: `logo-wide-red.png` with class `email-logo-light` (visible by default)
- Dark: `logo-wide-neon.png` with class `email-logo-dark` (hidden by default, shown via dark media query in Layout)

PNG URLs at `https://generation-ai.org/brand/logos/` — asset upload handled in Plan 17-05.

### `packages/emails/src/components/EmailButton.tsx`
Wraps `@react-email/button@0.0.10` (the version that has `pX`/`pY` TypeScript props):
- `pX={24} pY={12}` triggers React Email's VML rendering path — generates `<!--[if mso]>...<![endif]-->` markup that Outlook Desktop needs
- No `padding:` CSS property in code (would bypass VML fallback)
- Pill border-radius (`9999px`), Geist Mono font stack, brand red fill
- `className="email-btn"` for dark-mode override in Layout's style block

### `packages/emails/src/components/Layout.tsx`
Shared wrapper for all 6 auth templates:
- `<Html lang="de">` with `<Head>` containing `color-scheme` + `supported-color-schemes` meta tags
- Raw `<style>` block with `@media (prefers-color-scheme: dark)` covering 9 CSS class overrides: body bg, card bg/border, heading, text, muted, footer, divider, button bg/color, logo swap
- `<Preview>` slot for inbox preview text
- `<Body>` → `<Container>` (max 480px) → `<Section>` header with `<BrandLogo />` → `{children}` → `<Hr>` → German footer text matching VOICE.md Utility-Signatur tone

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @react-email/button@0.0.19 (bundled in @react-email/components@0.0.31) removed pX/pY props**

- **Found during:** Task 2
- **Issue:** The plan specifies `pX`/`pY` props on the `<Button>` component for VML bulletproof-button generation. These props existed in `@react-email/button@0.0.10` but were removed in `0.0.11+`. The `@react-email/components@0.0.31` bundle includes `@react-email/button@0.0.19` which only accepts standard anchor props — TypeScript would reject `pX`/`pY`.
- **Fix:** Added `"@react-email/button": "0.0.10"` as a direct dependency to `packages/emails/package.json`. `EmailButton` imports `Button` from `@react-email/button` (not from `@react-email/components`), giving us the pX/pY TypeScript API while keeping the components bundle for all other primitives.
- **Files modified:** `packages/emails/package.json`, `packages/emails/src/components/EmailButton.tsx`
- **Commit:** e38596c

---

## Known Stubs

None — all components are fully implemented. PNG logo URLs are referenced but assets are not yet uploaded (intentional — Plan 17-05 handles delivery).

---

## Success Criteria Verification

- [x] `packages/emails/` workspace package exists with React Email deps
- [x] `tokens.ts` exports typed `light`+`dark` token sets matching `brand/tokens.json`
- [x] `Layout.tsx` uses `@media (prefers-color-scheme: dark)` to swap all visual tokens
- [x] `BrandLogo.tsx` references PNG URLs (no SVG) for light (red) + dark (neon) logos
- [x] `EmailButton.tsx` wraps React Email `<Button>` with `pX={24} pY={12}` (not CSS `padding`) — Outlook VML bulletproof-button fallback
- [x] `pnpm -F @genai/emails exec tsc --noEmit` passes

---

## Self-Check: PASSED

Files exist:
- packages/emails/package.json — FOUND
- packages/emails/src/tokens.ts — FOUND
- packages/emails/src/index.ts — FOUND
- packages/emails/src/components/Layout.tsx — FOUND
- packages/emails/src/components/BrandLogo.tsx — FOUND
- packages/emails/src/components/EmailButton.tsx — FOUND

Commits exist:
- a6d5e6b (Task 1) — FOUND
- e38596c (Task 2) — FOUND
