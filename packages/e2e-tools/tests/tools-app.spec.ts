import { test, expect } from '@playwright/test';

// tools-app runs on its own subdomain in prod and on localhost:3001 in dev.
// Override via TOOLS_URL env for CI / Vercel-Preview.
const TOOLS_URL = process.env.TOOLS_URL ?? 'http://localhost:3001';

test.describe('tools-app polish — Track B smoke (Phase 22.6)', () => {
  test.fixme('login: 2 sichtbare Elemente (Primary CTA + Secondary Link) when logged-out (B-req-1)', async ({ page }) => {
    await page.goto(TOOLS_URL);
    // Filled by Plan 07: assert "Kostenlos registrieren" button + "Bereits Mitglied? Einloggen" link
  });

  test.fixme('utm: "Kostenlos registrieren" href hat ?utm_source=tools (B-req-2)', async ({ page }) => {
    await page.goto(TOOLS_URL);
    // Filled by Plan 07: assert href ends with /join?utm_source=tools
  });

  test.fixme('hero: Hero-Sektion sichtbar zwischen Header und FilterBar mit H1 "KI-Tools" (B-req-3)', async ({ page }) => {
    await page.goto(TOOLS_URL);
    // Filled by Plan 08: data-section="tools-hero" + H1 contains "KI-Tools"
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
