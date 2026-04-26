import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PARTNER_URL = `${BASE_URL}/partner`

const TABS = [
  { slug: 'unternehmen', label: 'Unternehmen', headingText: 'Employer Branding trifft echte Zielgruppe.' },
  { slug: 'stiftungen', label: 'Stiftungen', headingText: 'Impact mit Substanz.' },
  { slug: 'hochschulen', label: 'Hochschulen', headingText: 'Praxis direkt an die Uni.' },
  { slug: 'initiativen', label: 'Initiativen', headingText: 'Gemeinsam mehr erreichen.' },
]

test.describe('/partner page', () => {
  test('loads successfully with correct title', async ({ page }) => {
    const response = await page.goto(PARTNER_URL)
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/Für Partner · Generation AI/)
  })

  test('renders hero with correct H1', async ({ page }) => {
    await page.goto(PARTNER_URL)
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Lass uns zusammen was bewegen')
  })

  test('renders all 4 tabs', async ({ page }) => {
    await page.goto(PARTNER_URL)
    // Wait for tab system
    const tablist = page.getByRole('tablist', { name: 'Partnertypen' })
    await expect(tablist).toBeVisible()

    for (const tab of TABS) {
      const tabBtn = page.getByRole('tab', { name: tab.label })
      await expect(tabBtn).toBeVisible()
    }
  })

  test('Unternehmen tab is active by default', async ({ page }) => {
    await page.goto(PARTNER_URL)
    const unternehmenTab = page.getByRole('tab', { name: 'Unternehmen' })
    await expect(unternehmenTab).toHaveAttribute('aria-selected', 'true')

    const unternehmenPanel = page.getByRole('tabpanel', { name: 'Unternehmen' })
    await expect(unternehmenPanel).toBeVisible()
    await expect(unternehmenPanel).toContainText('Employer Branding trifft echte Zielgruppe.')
  })

  test('clicking Stiftungen tab switches active panel and updates URL', async ({ page }) => {
    await page.goto(PARTNER_URL)
    const stiftungenTab = page.getByRole('tab', { name: 'Stiftungen' })
    await stiftungenTab.click()

    // Tab is now active
    await expect(stiftungenTab).toHaveAttribute('aria-selected', 'true')

    // Previous tab inactive
    const unternehmenTab = page.getByRole('tab', { name: 'Unternehmen' })
    await expect(unternehmenTab).toHaveAttribute('aria-selected', 'false')

    // Panel content changed
    const stiftungenPanel = page.getByRole('tabpanel', { name: 'Stiftungen' })
    await expect(stiftungenPanel).toBeVisible()
    await expect(stiftungenPanel).toContainText('Impact mit Substanz.')

    // URL updated via pushState
    await expect(page).toHaveURL(/typ=stiftungen/)
  })

  test('deep-link ?typ=hochschulen sets active tab on mount', async ({ page }) => {
    await page.goto(`${PARTNER_URL}?typ=hochschulen`)
    const hochschulenTab = page.getByRole('tab', { name: 'Hochschulen' })
    await expect(hochschulenTab).toHaveAttribute('aria-selected', 'true')

    const panel = page.getByRole('tabpanel', { name: 'Hochschulen' })
    await expect(panel).toContainText('Praxis direkt an die Uni.')
  })

  test('deep-link ?typ=initiativen shows initiativen content', async ({ page }) => {
    await page.goto(`${PARTNER_URL}?typ=initiativen`)
    const initiativen = page.getByRole('tab', { name: 'Initiativen' })
    await expect(initiativen).toHaveAttribute('aria-selected', 'true')
    const panel = page.getByRole('tabpanel', { name: 'Initiativen' })
    await expect(panel).toContainText('Gemeinsam mehr erreichen.')
  })

  test('invalid ?typ= param falls back to Unternehmen', async ({ page }) => {
    await page.goto(`${PARTNER_URL}?typ=invalid`)
    const unternehmenTab = page.getByRole('tab', { name: 'Unternehmen' })
    await expect(unternehmenTab).toHaveAttribute('aria-selected', 'true')
  })

  test('contact form is visible', async ({ page }) => {
    await page.goto(PARTNER_URL)
    // Scroll to contact form
    await page.locator('[data-section="partner-kontakt"]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-section="partner-kontakt"]')).toBeVisible()
    // Form fields
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'E-Mail' })).toBeVisible()
    await expect(page.getByLabel('Organisation')).toBeVisible()
  })

  test('contact form submit shows success screen (skip if Resend env not configured)', async ({ page }) => {
    // Skip in CI if RESEND_API_KEY not available — this test requires real email infra
    if (!process.env.RESEND_API_KEY) {
      test.skip()
      return
    }

    await page.goto(PARTNER_URL)
    await page.locator('[data-section="partner-kontakt"]').scrollIntoViewIfNeeded()

    await page.getByLabel('Name').fill('Test Person')
    await page.getByRole('textbox', { name: 'E-Mail' }).fill('test@example.com')
    await page.getByLabel('Organisation').fill('Test GmbH')

    await page.getByRole('button', { name: 'Anfrage senden' }).click()

    // Success screen replaces form
    await expect(page.getByText('Anfrage eingegangen.')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('48 Stunden')).toBeVisible()
  })

  test('person cards render with names', async ({ page }) => {
    await page.goto(PARTNER_URL)
    await page.locator('[data-section="partner-kontakt"]').scrollIntoViewIfNeeded()

    await expect(page.getByText('Alex', { exact: true })).toBeVisible()
    await expect(page.getByText('Janna', { exact: true })).toBeVisible()
    await expect(page.getByText('Simon', { exact: true })).toBeVisible()
    await expect(page.getByText('Head of Partnerships', { exact: true })).toBeVisible()
  })

  test('trust section renders', async ({ page }) => {
    await page.goto(PARTNER_URL)
    // TrustSection has data-section="trust"
    const trustSection = page.locator('[data-section="trust"]')
    await trustSection.scrollIntoViewIfNeeded()
    await expect(trustSection).toBeVisible()
  })

  test('transparency link points to /about#verein', async ({ page }) => {
    await page.goto(PARTNER_URL)
    const vereinHint = page.locator('[data-section="partner-verein-hint"]')
    await vereinHint.scrollIntoViewIfNeeded()
    const link = vereinHint.getByRole('link', { name: /Vereinsstruktur/ })
    await expect(link).toHaveAttribute('href', '/about#verein')
  })

  test('keyboard tab switch: ArrowRight moves focus', async ({ page }) => {
    await page.goto(PARTNER_URL)
    const firstTab = page.getByRole('tab', { name: 'Unternehmen' })
    await firstTab.focus()
    await page.keyboard.press('ArrowRight')
    const secondTab = page.getByRole('tab', { name: 'Stiftungen' })
    await expect(secondTab).toBeFocused()
  })

  test('mobile: tab rail visible at 390px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(PARTNER_URL)
    const tablist = page.getByRole('tablist', { name: 'Partnertypen' })
    await expect(tablist).toBeVisible()
    // Tab buttons don't overflow outside viewport width
    const unternehmenTab = page.getByRole('tab', { name: 'Unternehmen' })
    await expect(unternehmenTab).toBeVisible()
  })
})
