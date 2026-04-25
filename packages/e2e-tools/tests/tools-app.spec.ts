import { test, expect } from '@playwright/test';

// tools-app runs on its own subdomain in prod and on localhost:3001 in dev.
// Override via TOOLS_URL env for CI / Vercel-Preview.
const TOOLS_URL = process.env.TOOLS_URL ?? 'http://localhost:3001';

test.describe('tools-app polish — Track B smoke (Phase 22.6)', () => {
  test('login: 2 sichtbare Elemente (Primary CTA + Secondary Link) when logged-out (B-req-1)', async ({ page }) => {
    await page.goto(TOOLS_URL);

    // Primary CTA button — "Kostenlos registrieren" (always visible)
    const primary = page.locator('[data-cta="primary-register"]');
    await expect(primary).toBeVisible();
    await expect(primary).toHaveText(/Kostenlos registrieren/);

    // Secondary login link — "Bereits Mitglied? Einloggen"
    // Hidden below sm-breakpoint, visible on default Playwright viewport (1280×720 desktop)
    const secondary = page.locator('[data-cta="secondary-login"]');
    await expect(secondary).toBeVisible();
    await expect(secondary).toHaveText(/Bereits Mitglied/);
  });

  test('utm: "Kostenlos registrieren" href hat ?utm_source=tools (B-req-2)', async ({ page }) => {
    await page.goto(TOOLS_URL);

    const primary = page.locator('[data-cta="primary-register"]');
    await expect(primary).toBeVisible();
    const href = await primary.getAttribute('href');
    expect(href).toBe('https://generation-ai.org/join?utm_source=tools');
  });

  test('hero: Hero-Sektion sichtbar zwischen Header und FilterBar mit H1 "KI-Tools" (B-req-3)', async ({ page }) => {
    await page.goto(TOOLS_URL);

    // Hero section visible — stable selector via data-section attribute
    const hero = page.locator('[data-section="tools-hero"]');
    await expect(hero).toBeVisible();

    // H1 contains "KI-Tools"
    const h1 = hero.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/KI-Tools/);

    // Eyebrow label visible
    await expect(hero).toContainText(/deine ki-tool-bibliothek/i);

    // Body text visible — Umlaute mandatory ("Über", not "Ueber")
    await expect(hero).toContainText(/Über 100 Tools/);
  });

  test.fixme('nav: alle Items sichtbar (Events, Tools active, Community, Für Partner, Über uns, CTA) (B-req-4)', async ({ page }) => {
    await page.goto(TOOLS_URL);
    // Filled by Plan 09: assert nav text + Tools aria-current="page"
  });

  test.fixme('eingeloggt: User-Menu statt CTA-Buttons sichtbar — kein Regression (B-req-5)', async ({ page }) => {
    await page.goto(TOOLS_URL);
    // Filled by Plan 09: log in + assert user-menu present + CTAs absent
  });
});
