import { test, expect } from '@playwright/test';

const EVENTS_URL = '/events';

test.describe('events page — Track A smoke', () => {
  test.fixme('lädt: /events rendert Hero + Grid (A-req-1, A-req-2)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-section="events-hero"]')).toBeVisible();
    await expect(page.locator('[data-section="events-grid"]')).toBeVisible();
  });

  test.fixme('grid: zeigt mindestens 1 kommendes Event aus MDX (A-req-2)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    const cards = page.locator('[data-event-card]');
    await expect(cards.first()).toBeVisible();
  });

  test.fixme('mehr anzeigen: Button erscheint bei >3 Events und expandiert client-side (A-req-3)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    // Filled by Plan 03 once Mehr-Anzeigen state exists
  });

  test.fixme('modal: Klick auf Event-Card öffnet Modal mit aria-modal + Escape schließt (A-req-4)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    // Filled by Plan 04 once Modal exists
  });

  test.fixme('redirect: Anmelde-Click logged-out redirected zu /join?redirect_after=/events/[slug] (A-req-5)', async ({ page }) => {
    await page.goto(EVENTS_URL);
    // Filled by Plan 04 once Anmelde-Flow lebt
  });

  test.fixme('slug page: /events/[slug] rendert Standalone (A-req-6)', async ({ page }) => {
    await page.goto('/events/2026-05-15-prompting-masterclass');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test.fixme('sitemap: /sitemap.xml enthält /events + /events/[slug] (A-req-8)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    expect(xml).toContain('/events');
  });
});
