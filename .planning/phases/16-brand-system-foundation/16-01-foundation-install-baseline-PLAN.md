---
phase: 16
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/package.json
  - apps/tools-app/package.json
  - packages/ui/package.json
  - packages/e2e-tools/package.json
  - packages/e2e-tools/tests/visual-baseline.spec.ts
  - packages/e2e-tools/playwright.config.ts
autonomous: true
requirements:
  - BRAND-16-01-install-radix
  - BRAND-16-02-install-geist
  - BRAND-16-07-visual-regression-baseline
must_haves:
  truths:
    - "@radix-ui/colors package is installed and resolvable in workspace"
    - "geist package (Geist Sans + Geist Mono) is installed and resolvable"
    - "Baseline Playwright screenshots exist: 3 website routes + 4 tools-app routes (14 PNGs total — 7 routes × Light + Dark)"
  artifacts:
    - path: "packages/ui/package.json"
      provides: "@radix-ui/colors dependency declared for shared consumption"
      contains: "@radix-ui/colors"
    - path: "apps/website/package.json"
      provides: "geist font package declared"
      contains: "geist"
    - path: "apps/tools-app/package.json"
      provides: "geist font package declared"
      contains: "geist"
    - path: "packages/e2e-tools/tests/visual-baseline.spec.ts"
      provides: "Playwright visual baseline spec covering 3 website routes (/, /impressum, /datenschutz) + 4 tools-app routes (/, /login, /impressum, /datenschutz) in Light + Dark — 14 PNGs total"
      min_lines: 40
  key_links:
    - from: "packages/e2e-tools/tests/visual-baseline.spec.ts"
      to: "apps/website + apps/tools-app prod/preview URLs"
      via: "playwright toHaveScreenshot"
      pattern: "toHaveScreenshot"
---

<objective>
Install brand-system foundation packages (@radix-ui/colors, geist) and capture Playwright visual-regression baseline screenshots BEFORE any migration touches the codebase. Baselines are the pre-migration reference that Plan 06 will diff against.

Purpose: Without a pre-migration baseline committed to git, we cannot prove that Wave 3 migrations introduce only intentional visual changes (font swap, token-based color resolution) and no unintentional layout regressions.

Output: Installed packages + committed baseline screenshots in `packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/16-brand-system-foundation/CONTEXT.md
@.planning/phases/16-brand-system-foundation/16-UI-SPEC.md
@packages/e2e-tools/playwright.config.ts
@packages/e2e-tools/package.json

<interfaces>
<!-- Package catalog + workspace pattern (from pnpm-workspace.yaml) -->
<!-- Existing apps use `"next": "catalog:"` to pull from workspace catalog.  -->
<!-- geist is NOT in the catalog, so we add it directly to each app.         -->

From `pnpm-workspace.yaml`:
- Workspace root: `apps/*`, `packages/*`
- Catalog entries: react, react-dom, next, @supabase/*, tailwindcss, typescript, eslint

Existing e2e-tools pattern (packages/e2e-tools/playwright.config.ts):
- Tests run against `process.env.TARGET_URL` (prod/preview)
- Uses @playwright/test `^1.52.0`
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Install @radix-ui/colors + geist font packages</name>
  <read_first>
    - apps/website/package.json
    - apps/tools-app/package.json
    - packages/ui/package.json (does not exist yet — check with `ls packages/ui/` first)
    - pnpm-workspace.yaml
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Token Architecture + Font Loading sections)
  </read_first>
  <action>
Use Context7 for current package docs BEFORE installing to confirm API stability: `mcp__context7__resolve-library-id` with `libraryName: "geist"` and `libraryName: "@radix-ui/colors"`, then `mcp__context7__get-library-docs` for the resolved IDs focused on "nextjs app router setup" and "css imports".

Then execute from repo root:

1. Initialize `packages/ui` as a proper workspace package (currently README-only per packages/ui/README.md):
   - Create `packages/ui/package.json` with:
     ```json
     {
       "name": "@genai/ui",
       "version": "0.0.1",
       "private": true,
       "exports": {
         ".": "./src/index.ts"
       },
       "dependencies": {
         "@radix-ui/colors": "^3.0.0"
       },
       "peerDependencies": {
         "react": "catalog:",
         "react-dom": "catalog:"
       },
       "devDependencies": {
         "@types/react": "catalog:",
         "typescript": "catalog:"
       }
     }
     ```
   - Create `packages/ui/src/index.ts` as an empty placeholder exporting nothing (`export {};`). Plan 03 fills this.
   - Create `packages/ui/tsconfig.json` extending `@genai/config/tsconfig/base.json` with `"jsx": "react-jsx"` and `"include": ["src/**/*"]`.

2. Install `geist` (exposes both `GeistSans` and `GeistMono` via `next/font`) in both apps:
   ```bash
   pnpm --filter @genai/website add geist
   pnpm --filter @genai/tools-app add geist
   ```

3. Confirm `@radix-ui/colors` resolves via packages/ui workspace declaration (it will be imported via CSS `@import "@radix-ui/colors/slate.css"` in Plan 02 and must be resolvable from `packages/config/tailwind/base.css`). To make it resolvable from packages/config (which is where base.css lives), ALSO add it directly to `packages/config/package.json` `dependencies`:
   ```bash
   pnpm --filter @genai/config add @radix-ui/colors
   ```

4. Run `pnpm install` at repo root to sync workspace.

5. Verify:
   ```bash
   pnpm ls --filter @genai/website geist
   pnpm ls --filter @genai/tools-app geist
   pnpm ls --filter @genai/config @radix-ui/colors
   ```

Do NOT import anything yet — this task only installs. Plan 02 wires imports into base.css.
  </action>
  <verify>
    <automated>pnpm ls --filter @genai/website geist && pnpm ls --filter @genai/tools-app geist && pnpm ls --filter @genai/config @radix-ui/colors && test -f packages/ui/package.json && test -f packages/ui/src/index.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q "@radix-ui/colors" packages/config/package.json` → 0
    - `grep -q "\"geist\"" apps/website/package.json` → 0
    - `grep -q "\"geist\"" apps/tools-app/package.json` → 0
    - `test -f packages/ui/package.json` → 0
    - `grep -q "@genai/ui" packages/ui/package.json` → 0
    - `pnpm install` exits 0 on clean cache
    - No existing code imports anything from geist or @radix-ui/colors yet (migration happens Wave 2/3)
  </acceptance_criteria>
  <done>Packages installed, workspace resolves, no imports wired yet. `pnpm install` green.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Playwright visual-regression baseline spec</name>
  <read_first>
    - packages/e2e-tools/playwright.config.ts
    - packages/e2e-tools/package.json
    - packages/e2e-tools/tests/ (list to see existing specs)
    - packages/e2e-tools/helpers/ (any theme-toggle helpers already there)
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Visual Regression Gate section)
  </read_first>
  <action>
Create `packages/e2e-tools/tests/visual-baseline.spec.ts` — a Playwright spec that captures full-page screenshots across 5 routes × 2 themes × 2 apps. Screenshots become the pre-migration baseline committed to git.

File contents:

```ts
import { test, expect } from '@playwright/test';

// Visual baseline for Phase 16 Brand System Foundation.
// Pre-migration reference — Plan 06 diffs Wave 3 output against these snapshots.
// Run against local dev (default) or prod: `TARGET_WEBSITE=... TARGET_TOOLS=... pnpm e2e visual-baseline`

const WEBSITE = process.env.TARGET_WEBSITE ?? 'http://localhost:3000';
const TOOLS = process.env.TARGET_TOOLS ?? 'http://localhost:3001';

const WEBSITE_ROUTES = [
  { path: '/', name: 'home' },
  { path: '/impressum', name: 'impressum' },
  { path: '/datenschutz', name: 'datenschutz' },
];

const TOOLS_ROUTES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/impressum', name: 'impressum' },
  { path: '/datenschutz', name: 'datenschutz' },
];

const THEMES = ['light', 'dark'] as const;

async function setTheme(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  // ThemeProvider persists via localStorage key "theme"
  await page.addInitScript((t) => {
    try { localStorage.setItem('theme', t); } catch {}
  }, theme);
}

test.describe('visual baseline — website', () => {
  for (const theme of THEMES) {
    for (const route of WEBSITE_ROUTES) {
      test(`website ${route.name} ${theme}`, async ({ page }) => {
        await setTheme(page, theme);
        await page.goto(`${WEBSITE}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500); // allow theme class to apply + fonts to paint
        await expect(page).toHaveScreenshot(`website-${route.name}-${theme}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
});

test.describe('visual baseline — tools-app', () => {
  for (const theme of THEMES) {
    for (const route of TOOLS_ROUTES) {
      test(`tools ${route.name} ${theme}`, async ({ page }) => {
        await setTheme(page, theme);
        await page.goto(`${TOOLS}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(`tools-${route.name}-${theme}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
});
```

Then run both dev servers and generate the baseline snapshots:

```bash
# Start both dev servers in background:
pnpm dev:website &
WEBSITE_PID=$!
pnpm dev:tools &
TOOLS_PID=$!

# MANDATORY readiness gate — block until BOTH servers return 200 OK.
# Without this, Playwright may capture a loading/error/404 state as the baseline,
# which silently corrupts Plan 06's diff reference.
timeout 60 bash -c 'until curl -sf http://localhost:3000 > /dev/null && curl -sf http://localhost:3001 > /dev/null; do sleep 2; done'
if [ $? -ne 0 ]; then
  echo "BLOCKER: dev servers did not become ready within 60s" >&2
  kill $WEBSITE_PID $TOOLS_PID 2>/dev/null
  exit 1
fi

# Both servers confirmed ready — now capture baseline:
pnpm --filter @genai/e2e-tools exec playwright test visual-baseline --update-snapshots

# Cleanup:
kill $WEBSITE_PID $TOOLS_PID 2>/dev/null
```

**Acceptance criterion (mandatory, not optional):** Both dev servers MUST respond 200 OK on `http://localhost:3000` AND `http://localhost:3001` BEFORE the Playwright spec starts. If the curl readiness loop times out (60s), STOP — do not run Playwright against a server that isn't ready. Document blocker in SUMMARY and bail. Do NOT mark task done.

This produces `packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/` with 14 PNGs (3 website routes × 2 themes + 4 tools routes × 2 themes). Commit these snapshots to git — they are the baseline.

If dev servers fail to start, document blocker in SUMMARY and bail.
  </action>
  <verify>
    <automated>test -f packages/e2e-tools/tests/visual-baseline.spec.ts && ls packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/ | wc -l | awk '{exit ($1>=14)?0:1}'</automated>
  </verify>
  <acceptance_criteria>
    - `test -f packages/e2e-tools/tests/visual-baseline.spec.ts` → 0
    - `grep -q "toHaveScreenshot" packages/e2e-tools/tests/visual-baseline.spec.ts` → 0
    - `grep -q "website-home-light" packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/website-home-light.png || ls packages/e2e-tools/tests/visual-baseline.spec.ts-snapshots/website-home-light*.png` → 0 (snapshot exists, platform-suffixed name OK)
    - Snapshot directory contains at least 14 PNG files (3×2 website + 4×2 tools)
    - **Dev-server readiness verified BEFORE playwright run:** `curl -sf http://localhost:3000` AND `curl -sf http://localhost:3001` both return 200 OK (enforced via inline `timeout 60 bash -c 'until ...; do sleep 2; done'` loop)
    - `pnpm --filter @genai/e2e-tools exec playwright test visual-baseline` exits 0 (baseline matches itself)
  </acceptance_criteria>
  <done>Visual-baseline spec committed + snapshots committed. Plan 06 can diff against these.</done>
</task>

</tasks>

<verification>
- `pnpm install` green at repo root
- `pnpm ls @radix-ui/colors` shows it resolved from packages/config
- `pnpm ls geist` shows it resolved in both apps
- Baseline spec file exists and contains `toHaveScreenshot`
- Baseline snapshot directory has ≥14 PNGs
- `pnpm --filter @genai/e2e-tools exec playwright test visual-baseline` passes (baseline-vs-itself)
</verification>

<success_criteria>
- @radix-ui/colors + geist installed, resolvable from base.css import path
- packages/ui initialized as proper workspace package (package.json + src/index.ts + tsconfig.json)
- Playwright baseline spec exists covering 3 website + 4 tools-app routes × Light + Dark themes (14 PNGs total)
- Baseline PNG snapshots committed to git
- Zero production code imports Geist or Radix yet — install + baseline only
</success_criteria>

<output>
After completion, create `.planning/phases/16-brand-system-foundation/16-01-SUMMARY.md` listing:
- Resolved package versions (@radix-ui/colors x.y.z, geist x.y.z)
- Baseline snapshot file count + paths
- Any env/server issues encountered during baseline capture
- Confirmation that packages/ui was bootstrapped cleanly
</output>
