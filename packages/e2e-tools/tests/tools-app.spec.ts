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

  test('nav: alle Items sichtbar (Events, Tools active, Community, Für Partner, Über uns) (B-req-4)', async ({ page }) => {
    await page.goto(TOOLS_URL);

    const desktopNav = page.locator('[data-tools-nav="desktop"]');
    await expect(desktopNav).toBeVisible();

    // All 5 items present with correct text (Umlaute mandatory)
    await expect(desktopNav.locator('[data-nav-item="events"]')).toHaveText('Events');
    await expect(desktopNav.locator('[data-nav-item="tools"]')).toHaveText('Tools');
    await expect(desktopNav.locator('[data-nav-item="community"]')).toHaveText('Community');
    await expect(desktopNav.locator('[data-nav-item="partner"]')).toHaveText(/Für Partner/);
    await expect(desktopNav.locator('[data-nav-item="about"]')).toHaveText(/Über uns/);

    // Tools is the active item
    const tools = desktopNav.locator('[data-nav-item="tools"]');
    await expect(tools).toHaveAttribute('aria-current', 'page');

    // Cross-domain hrefs hardcoded (B-05 full page-load via <a>, no SPA routing)
    await expect(desktopNav.locator('[data-nav-item="events"]')).toHaveAttribute('href', 'https://generation-ai.org/events');
    await expect(desktopNav.locator('[data-nav-item="community"]')).toHaveAttribute('href', 'https://generation-ai.org/community');
    await expect(desktopNav.locator('[data-nav-item="partner"]')).toHaveAttribute('href', 'https://generation-ai.org/partner');
    await expect(desktopNav.locator('[data-nav-item="about"]')).toHaveAttribute('href', 'https://generation-ai.org/about');
  });

  test('eingeloggt: User-Menu statt CTA-Buttons sichtbar — kein Regression (B-req-5)', async ({ page }) => {
    test.setTimeout(60_000);

    // Aligned with Phase 19 + auth.spec.ts: TEST_USER_EMAIL / TEST_USER_PASSWORD via repo secrets in CI.
    // Skips gracefully in dev environments without credentials.
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'TEST_USER_EMAIL + TEST_USER_PASSWORD env vars required for logged-in regression test');
      return;
    }

    // Log in via password (mirrors auth.spec.ts loginWithPassword helper)
    await page.goto(`${TOOLS_URL}/login`);
    await page.getByRole('button', { name: /mit passwort anmelden/i }).click();
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: /^anmelden$/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });

    // After login, the public CTAs MUST be gone (logged-in branch active)
    await expect(page.locator('[data-cta="primary-register"]')).toHaveCount(0);
    await expect(page.locator('[data-cta="secondary-login"]')).toHaveCount(0);

    // User-menu hallmarks from GlobalLayout's logged-in branch:
    // Settings link (aria-label="Einstellungen") + Signout button (aria-label="Abmelden")
    // are mobile-only (md:hidden). On default Playwright viewport (1280×720) they would
    // be hidden. We assert COUNT > 0 (in DOM) rather than visible — this proves the
    // logged-in branch rendered, which is what the regression check protects.
    await expect(page.getByLabel('Einstellungen')).toHaveCount(1);
    await expect(page.getByLabel('Abmelden')).toHaveCount(1);
  });
});
