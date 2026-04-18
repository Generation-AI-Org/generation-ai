---
phase: 16
plan: 03
subsystem: packages/ui
tags: [logo, component, vitest, tdd, brand]
dependency_graph:
  requires: [16-01, 16-02]
  provides: [Logo component, @genai/ui barrel export, SVG assets in both app public dirs]
  affects: [apps/website, apps/tools-app, packages/ui]
tech_stack:
  added: [vitest, @testing-library/react, @testing-library/jest-dom, @vitejs/plugin-react, jsdom]
  patterns: [TDD (red-green), img-based logo rendering, colorway auto-resolution matrix]
key_files:
  created:
    - packages/ui/src/components/Logo.tsx
    - packages/ui/src/components/Logo.test.tsx
    - packages/ui/src/test-setup.ts
    - packages/ui/vitest.config.ts
    - apps/website/public/brand/logos/ (11 SVGs)
    - apps/tools-app/public/brand/logos/ (11 SVGs)
    - packages/ui/src/assets/logos/ (11 SVGs)
  modified:
    - packages/ui/src/index.ts
    - packages/ui/package.json
    - apps/website/package.json
    - apps/tools-app/package.json
decisions:
  - "@vitejs/plugin-react pinned to ^4 (vite 5 compat — v6 requires vite ^8 which is not in this monorepo)"
  - "test-setup imports '@testing-library/jest-dom' directly (no /vitest subpath in jest-dom v6)"
  - "Logo renders as <img> (not inline SVG) per DESIGN.md §F to prevent CSS leakage into SVG paths"
  - "detectTheme() fallback: SSR returns 'light'; callers should pass theme prop explicitly for SSR correctness"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-18"
  tasks_completed: 2
  files_created: 37
  tests: 17
---

# Phase 16 Plan 03: Logo Component Summary

Logo component as `<img>`-based React component with colorway auto-resolution matrix. 11 SVGs distributed to all runtime destinations. 17 Vitest tests green.

## What Was Built

### Task 1 — SVG Distribution

11 brand logo SVGs copied verbatim from `brand/logos/` to 3 destinations:

| Destination | Count | Purpose |
|-------------|-------|---------|
| `apps/website/public/brand/logos/` | 11 | Served at `/brand/logos/*.svg` in website |
| `apps/tools-app/public/brand/logos/` | 11 | Served at `/brand/logos/*.svg` in tools-app |
| `packages/ui/src/assets/logos/` | 11 | Backup reference for package consumers |

SVG content untouched. Source `brand/logos/` unchanged.

### Task 2 — Logo Component

**Component API (exported from `@genai/ui`):**

```tsx
import { Logo } from '@genai/ui';

// Defaults: variant=wide, colorway=auto, context=header, size=md
<Logo />

// Explicit usage
<Logo variant="wide" colorway="red" size="lg" />
<Logo theme="dark" context="footer" />
<Logo colorway="pink-red" height={48} className="my-logo" />
```

**Exported types:**
- `Logo` — React component
- `LogoProps` — full prop interface
- `LogoColorway` — `"auto" | "red" | "neon" | "black" | "white" | "pink" | "blue" | "pink-red" | "red-on-pink" | "blue-neon" | "neon-on-blue" | "sand"`
- `LogoContext` — `"header" | "footer" | "mail"`
- `LogoSize` — `"sm" | "md" | "lg"`
- `LogoTheme` — `"light" | "dark"`

**colorway="auto" resolution matrix:**

| context | theme | resolved colorway |
|---------|-------|------------------|
| header | light | red |
| header | dark | neon |
| footer | light | black |
| footer | dark | white |
| mail | light | red |
| mail | dark | neon |

**Size map:** sm=32px, md=40px (default), lg=56px. Explicit `height` prop overrides size.

**Min-size enforcement:** `console.warn` if `height < 32` (per DESIGN.md §F).

**Rendering:** Always `<img>` element (never inline SVG). Inline style sets `margin: 0; height: {n}px; width: auto`. No CSS filters applied.

### Test Results

**17/17 tests passing** — `pnpm --filter @genai/ui test`:

- 6 colorway auto-resolution matrix combos
- 2 explicit colorway override tests
- 4 sizing tests (sm/md/lg + explicit height override)
- 2 min-size enforcement tests (warn / no-warn)
- 3 rendering tests (img tag, className passthrough, alt text)

### @genai/ui Workspace Dep

Both apps wired:
- `apps/website/package.json` — `"@genai/ui": "workspace:*"` in dependencies
- `apps/tools-app/package.json` — `"@genai/ui": "workspace:*"` in dependencies

Both apps `pnpm build` exit 0 after wiring.

## For Plans 04 and 05

Import pattern:
```tsx
import { Logo } from '@genai/ui';
```

SVGs are served at `/brand/logos/logo-wide-{colorway}.svg` from each app's public dir.

The component does NOT yet replace existing hardcoded logo patterns in:
- `apps/website/components/layout/header.tsx`
- `apps/website/components/layout/footer.tsx`
- `apps/tools-app/components/layout/GlobalLayout.tsx`
- `apps/tools-app/app/login/page.tsx`
- `apps/tools-app/components/ui/DetailHeaderLogo.tsx`
- `apps/website/components/terminal-splash.tsx`

Those migrations are Plans 04/05 scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @vitejs/plugin-react version incompatibility**
- **Found during:** Task 2, Step 1 (pnpm install)
- **Issue:** Plan specified `@vitejs/plugin-react: "^6.0.1"` which requires `vite ^8.0.0`. This monorepo uses vite 5.4.x. pnpm install raised an unmet peer dependency warning; tests would have failed at transform.
- **Fix:** Downgraded to `@vitejs/plugin-react: "^4.3.4"` which is compatible with vite 4/5.
- **Files modified:** `packages/ui/package.json`
- **Commit:** `5d4709e`

**2. [Rule 1 - Bug] jest-dom setup import path**
- **Found during:** Task 2, GREEN phase — tests failed with "Invalid Chai property: toHaveAttribute"
- **Issue:** Plan specified `import '@testing-library/jest-dom/vitest'` which does not exist as an export in jest-dom v6. The vitest subpath was removed in recent versions.
- **Fix:** Changed setup import to `import '@testing-library/jest-dom'` (default export auto-extends vitest `expect`).
- **Files modified:** `packages/ui/src/test-setup.ts`
- **Commit:** `5d4709e`

## Known Stubs

None. Component is fully wired. SVGs are real brand assets. Tests cover all specified behaviors.

## Threat Flags

None. This plan creates no network endpoints, auth paths, or trust boundary crossings. Static SVG files + a pure React component with no external data fetching.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `packages/ui/src/components/Logo.tsx` | FOUND |
| `packages/ui/src/components/Logo.test.tsx` | FOUND |
| `packages/ui/vitest.config.ts` | FOUND |
| 11 SVGs in `apps/website/public/brand/logos/` | FOUND |
| 11 SVGs in `apps/tools-app/public/brand/logos/` | FOUND |
| Commit `69253ea` (SVG copy) | FOUND |
| Commit `5d4709e` (Logo component) | FOUND |
| `pnpm --filter @genai/ui test` | 17/17 PASS |
