import { test, expect } from '@playwright/test';

// Visual baseline for Phase 16 Brand System Foundation.
// Pre-migration reference — Plan 06 diffs Wave 3 output against these snapshots.
// Opt-in: nur aktiv wenn TARGET_WEBSITE oder TARGET_TOOLS gesetzt ist.
// Lokal: `TARGET_WEBSITE=http://localhost:3000 TARGET_TOOLS=http://localhost:3001 pnpm e2e visual-baseline`
// In CI wird dieser Suite übersprungen — keine Dev-Server-Start nötig.

const WEBSITE = process.env.TARGET_WEBSITE ?? 'http://localhost:3000';
const TOOLS = process.env.TARGET_TOOLS ?? 'http://localhost:3001';

const BASELINE_ENABLED = Boolean(process.env.TARGET_WEBSITE || process.env.TARGET_TOOLS);

test.skip(
  !BASELINE_ENABLED,
  'visual-baseline requires TARGET_WEBSITE or TARGET_TOOLS env (opt-in for local/manual runs)'
);

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
