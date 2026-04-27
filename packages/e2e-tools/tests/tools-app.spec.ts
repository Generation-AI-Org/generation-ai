import { test, expect } from '@playwright/test';

// tools-app runs on its own subdomain in prod and on localhost:3001 in dev.
// Override via TOOLS_URL env for CI / Vercel-Preview.
const TOOLS_URL = process.env.TOOLS_URL ?? 'http://localhost:3001';

test.describe('tools-app website alignment — Phase 28 smoke', () => {
  test('public desktop: website header, member CTA, footer and preview cards are aligned', async ({ page }) => {
    await page.goto(TOOLS_URL);

    const desktopNav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(desktopNav).toBeVisible();
    await expect(desktopNav.getByRole('link', { name: 'Tools' })).toBeVisible();
    await expect(desktopNav.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(desktopNav.getByRole('link', { name: 'Community' })).toBeVisible();
    await expect(desktopNav.getByRole('link', { name: /Für Partner/ })).toBeVisible();
    await expect(desktopNav.getByRole('link', { name: /Über uns/ })).toBeVisible();

    await expect(page.locator('header').getByText('Impressum')).toHaveCount(0);
    await expect(page.locator('header').getByText('Datenschutz')).toHaveCount(0);

    await expect(
      desktopNav.getByRole('link', { name: 'Jetzt beitreten' }),
    ).toHaveAttribute('href', 'https://generation-ai.org/join?utm_source=tools');

    const primary = page.locator('[data-cta="member-panel-register"]');
    await expect(primary).toBeVisible();
    await expect(primary).toHaveText(/Kostenlos Mitglied werden/);
    await expect(primary).toHaveAttribute('href', 'https://generation-ai.org/join?utm_source=tools');

    const secondary = page.locator('[data-cta="member-panel-login"]');
    await expect(secondary).toBeVisible();
    await expect(secondary).toHaveText(/Einloggen/);

    await expect(page.getByText('Member-Modus')).toBeVisible();
    await expect(page.getByText(/Community-Zugang, Events und einen stärkeren KI-Assistenten/)).toBeVisible();

    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Impressum')).toBeVisible();
    await expect(footer.getByText('Datenschutz')).toBeVisible();

    const firstCard = page.locator('[data-card]').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).not.toContainText('✨');
  });

  test('hero: Hero-Sektion sichtbar zwischen Header und FilterBar mit H1 "KI-Tools"', async ({ page }) => {
    await page.goto(TOOLS_URL);

    const hero = page.locator('[data-section="tools-hero"]');
    await expect(hero).toBeVisible();

    const h1 = hero.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/KI-Tools/);

    await expect(hero).toContainText(/deine ki-tool-bibliothek/i);
    await expect(hero).toContainText(/Über 100 Tools/);
  });

  test('mobile: burger exposes nav and CTAs, search stays near content', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(TOOLS_URL);

    const header = page.locator('header');
    await expect(header.getByLabel(/Suche öffnen/)).toBeHidden();

    const contentSearch = page.getByRole('button', { name: /Suche öffnen/ });
    await expect(contentSearch).toBeVisible();
    await contentSearch.click();
    await expect(page.getByPlaceholder('Tool suchen...')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Menü öffnen' }).click();
    const mobileNav = page.getByRole('navigation', { name: 'Hauptnavigation mobil' });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Tools' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Community' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: /Für Partner/ })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: /Über uns/ })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Jetzt beitreten' })).toBeVisible();
  });

  test('chat: public badge says Lite and attachment disabled label has no sparkle', async ({ page }) => {
    await page.goto(TOOLS_URL);

    await page.getByLabel('Chat öffnen').click();
    await expect(page.getByText('Lite', { exact: true })).toBeVisible();
    await expect(page.getByTitle('Spracheingabe starten')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('bald ✨');
  });

  test('detail route: footer appears and full summary remains available', async ({ page }) => {
    await page.goto(`${TOOLS_URL}/chatgpt`);

    await expect(page.getByRole('heading', { level: 1, name: /ChatGPT/i })).toBeVisible();
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Impressum')).toBeVisible();
  });

  test('eingeloggt: Account-Menü statt public CTA — kein Regression', async ({ page }) => {
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

    const accountButton = page.getByLabel('Account-Menü öffnen');
    await expect(accountButton).toBeVisible();
    await accountButton.click();
    await expect(page.getByRole('menuitem', { name: /Einstellungen/ })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Community öffnen/ })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Abmelden/ })).toBeVisible();
  });
});
