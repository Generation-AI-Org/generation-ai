/**
 * Track A — /events Page — Playwright E2E Smoke Suite
 *
 * Phase 22.6, Plan 01 (Wave 0): Stub file. All tests use test.fixme() so the
 * suite is registered (visible in reporter as "skipped") but never fails the build.
 *
 * Plans 02-05 each remove one .fixme and fill the test body with real assertions.
 * DO NOT rename test cases — later plans grep these exact strings to find stubs.
 *
 * Requirements covered: A-req-1, A-req-2, A-req-3, A-req-4, A-req-5, A-req-6, A-req-8
 * (A-req-7 is a Vitest unit test — see apps/website/lib/mdx/__tests__/events.test.ts)
 *
 * Run (list only):
 *   pnpm --filter @genai/e2e-tools exec playwright test tests/events.spec.ts --list
 */
import { test, expect } from '@playwright/test';

const EVENTS_URL = '/events';

test.describe('events page — Track A smoke', () => {
  // A-req-1: /events route loads, renders Hero section + Events grid
  // A-req-2: At least one upcoming event card from MDX pipeline is visible
  // Filled by Plan 03.
  test('lädt: /events rendert Hero + Grid (A-req-1, A-req-2)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    await expect(page.getByRole('heading', { level: 1, name: /Events, die dich weiterbringen/i })).toBeVisible();
    await expect(page.locator('[data-section="events-hero"]')).toBeVisible();
    await expect(page.locator('[data-section="events-grid"]')).toBeVisible();
  });

  // A-req-2: Grid shows at least 1 event card sourced from MDX
  // Filled by Plan 03.
  test('grid: zeigt mindestens 1 kommendes Event aus MDX (A-req-2)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    const cards = page.locator('[data-event-card]');
    await expect(cards.first()).toBeVisible();
    // We seeded 3 placeholder upcoming events → at least 1 card visible before "mehr anzeigen"
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  // A-req-3: "Mehr anzeigen" button appears when >3 events, expands via client-state (no re-fetch)
  // Filled by Plan 03.
  test('mehr anzeigen: Button erscheint bei >3 Events und expandiert client-side (A-req-3)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    const button = page.locator('[data-action="show-more-events"]');
    // We have 3 placeholder upcoming events at launch → button should NOT appear (≤3 events).
    // Test contract: if there ARE > 3 events, button is visible AND clicking expands.
    // Otherwise: button is absent. Both outcomes are correct depending on seeded data count.
    const total = await page.locator('[data-event-card]').count();
    if (total > 3) {
      await expect(button).toBeVisible();
      await button.click();
      expect(await page.locator('[data-event-card]').count()).toBeGreaterThan(3);
    } else {
      await expect(button).toHaveCount(0);
    }
  });

  // A-req-4: Clicking an event card opens a modal (aria-modal=true, Escape closes it, focus-trap active)
  test.fixme('modal: Klick auf Event-Card öffnet Modal mit aria-modal + Escape schließt (A-req-4)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    // Filled by Plan 04 once Modal exists
  });

  // A-req-5: Logged-out user clicking "Anmelden" is redirected to /join?redirect_after=/events/[slug]
  test.fixme('redirect: Anmelde-Click logged-out redirected zu /join?redirect_after=/events/[slug] (A-req-5)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    // Filled by Plan 04 once Anmelde-Flow lebt
  });

  // A-req-6: /events/[slug] renders as standalone page with H1 visible
  test.fixme('slug page: /events/[slug] rendert Standalone (A-req-6)', async ({ page }) => {
    await page.goto('/events/2026-05-15-prompting-masterclass');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  // A-req-8: /sitemap.xml contains /events entry (and slug entries added by Plan 05)
  test.fixme('sitemap: /sitemap.xml enthält /events + /events/[slug] (A-req-8)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    expect(xml).toContain('/events');
  });
});
