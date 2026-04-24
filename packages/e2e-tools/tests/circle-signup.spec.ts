import { expect, test } from '@playwright/test'
import { restoreCircle, setupCircleFailure } from './helpers/circle-mock'

const BASE =
  process.env.PLAYWRIGHT_TARGET_URL ??
  process.env.E2E_BASE_URL ??
  'http://localhost:3000'

/** Generate isolated test-email per run so duplicates never poison the DB. */
const testEmail = (label: string) =>
  `e2e-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`

test.describe('Phase 25 Circle-Sync unified signup', () => {
  test('[H3-1] Happy path: form submit → ok:true + success card', async ({ page }) => {
    test.skip(
      process.env.SIGNUP_ENABLED !== 'true',
      'SIGNUP_ENABLED=false — skipping live signup test',
    )

    const email = testEmail('happy')
    await page.goto(`${BASE}/join`)

    await page.fill('input[name="email"]', email)
    await page.fill('input[name="name"]', 'E2E Test User')
    await page.fill('input[name="university"]', 'Testuni')
    await page.check('input[name="consent"]')
    await page.click('button[type="submit"]')

    await expect(
      page.locator('text=/Check dein Postfach|Alles klar|Loslegen|Wir haben dir/i'),
    ).toBeVisible({ timeout: 10_000 })
  })

  test('[H3-2] Duplicate email → no-leak silent success', async ({ page }) => {
    test.skip(process.env.SIGNUP_ENABLED !== 'true', 'needs live signup')

    const email = testEmail('dup')

    for (let i = 0; i < 2; i++) {
      await page.goto(`${BASE}/join`)
      await page.fill('input[name="email"]', email)
      await page.fill('input[name="name"]', `Submission ${i + 1}`)
      await page.fill('input[name="university"]', 'Testuni')
      await page.check('input[name="consent"]')
      await page.click('button[type="submit"]')
      await expect(
        page.locator('text=/Check dein Postfach|Alles klar|Loslegen|Wir haben dir/i'),
      ).toBeVisible({ timeout: 10_000 })
    }

    // Second submission must not show "already registered" error
    await expect(
      page.locator('text=/bereits registriert|schon registriert/i'),
    ).not.toBeVisible()
  })

  test('[H3-3] Circle API down → signup success (D-03 non-blocking)', async ({
    page,
    context,
  }) => {
    test.skip(
      process.env.SIGNUP_ENABLED !== 'true',
      'needs SIGNUP_ENABLED=true (browser-side circle mock only reaches client-side Circle calls)',
    )

    await setupCircleFailure(context, { status: 500 })
    const email = testEmail('circle-down')

    await page.goto(`${BASE}/join`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="name"]', 'Circle Down User')
    await page.fill('input[name="university"]', 'Testuni')
    await page.check('input[name="consent"]')
    await page.click('button[type="submit"]')

    // D-03: UI signals success even if Circle-API fails server-side.
    // Server-side Circle calls aren't mocked by this browser context — the
    // real D-03 assertion needs CIRCLE_TEST_FORCE_FAIL wired into the dev
    // server. This test is a scaffold; upgrade when server-mocking lands.
    await expect(
      page.locator('text=/Check dein Postfach|Alles klar|Loslegen|Wir haben dir/i'),
    ).toBeVisible({ timeout: 10_000 })

    await restoreCircle(context)
  })

  test('[H3-4] Confirm route without circle_member_id → /welcome fallback', async ({
    page,
  }) => {
    // Requires a pre-built confirm-link URL for a user WITHOUT circle_member_id.
    // Fixture setup is out of E2E scope (needs admin.generateLink + DB state
    // pre-test). Skipped by default; supply URL via env to run locally.
    test.skip(
      !process.env.E2E_TEST_CONFIRM_URL,
      'provide E2E_TEST_CONFIRM_URL to run — built via admin.generateLink fixture',
    )

    await page.goto(process.env.E2E_TEST_CONFIRM_URL!)
    await page.waitForURL(/\/welcome\?circle=pending/, { timeout: 10_000 })

    await expect(page.locator('h1')).toContainText(/drin|Willkommen/i)
    await expect(page.locator('a:has-text("Zur Community")')).toHaveAttribute(
      'href',
      /community\.generation-ai\.org/,
    )
  })
})
