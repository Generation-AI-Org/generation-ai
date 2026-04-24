import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const TEST_URL = `${BASE_URL}/test`

// Minimal per-widget interaction needed to satisfy isAnswerReady and enable Next.
async function answerCurrentWidget(page: Page): Promise<string | null> {
  const widget = page.locator('[data-widget-type]').first()
  await widget.waitFor({ state: 'visible', timeout: 10000 })
  const widgetType = await widget.getAttribute('data-widget-type')
  switch (widgetType) {
    case 'pick':
    case 'mc':
    case 'best-prompt':
    case 'side-by-side':
      await page.locator('[role="radio"]').first().click()
      break
    case 'spot':
      await page.locator('[role="option"]').first().click()
      break
    case 'match': {
      const selects = page.locator('[data-widget-type="match"] select')
      const count = await selects.count()
      for (let s = 0; s < count; s++) {
        await selects.nth(s).selectOption({ index: 1 })
      }
      break
    }
    case 'fill': {
      const selects = page.locator('[data-widget-type="fill"] select')
      const count = await selects.count()
      for (let s = 0; s < count; s++) {
        await selects.nth(s).selectOption({ index: 1 })
      }
      break
    }
    case 'confidence': {
      // WR-06: user must explicitly interact before the answer counts as ready.
      // Focus the widget and press a number key to set the step.
      const confWidget = page.locator('[data-widget-type="confidence"]')
      await confWidget.focus().catch(() => {})
      await confWidget.press('3')
      break
    }
    case 'rank':
      // Rank widget initializes order from items (length === correctOrder.length).
      // isAnswerReady therefore returns true on mount — no-op.
      break
    default:
      break
  }
  return widgetType
}

test.describe('/test AI Literacy Assessment', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('terminal-splash-seen', 'true')
      } catch {
        // ignore
      }
    })
  })

  test('hero page loads with title and Start button', async ({ page }) => {
    const response = await page.goto(TEST_URL)
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/AI Literacy Test/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Wo stehst du wirklich',
    )
    await expect(page.getByRole('link', { name: 'Test starten' })).toBeVisible()
  })

  test('Start button navigates to Aufgabe 1', async ({ page }) => {
    await page.goto(TEST_URL)
    await page.getByRole('link', { name: 'Test starten' }).click()
    await page.waitForURL(/\/test\/aufgabe\/1$/)
    await expect(page.locator('[data-widget-type]').first()).toBeVisible()
  })

  test('at least 3 distinct widget types appear across the 10 questions', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/test/aufgabe/1`)
    const seenTypes = new Set<string>()

    for (let i = 1; i <= 10; i++) {
      if (page.url().includes('/test/ergebnis')) break
      const widgetType = await answerCurrentWidget(page)
      if (widgetType) seenTypes.add(widgetType)
      await page.getByRole('button', { name: 'Nächste Aufgabe' }).click()
      if (i === 5) await page.waitForTimeout(1800)
    }

    expect(seenTypes.size).toBeGreaterThanOrEqual(3)
  })

  test('completing all 10 questions lands on /test/ergebnis with level + primary CTA', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/test/aufgabe/1`)

    for (let i = 1; i <= 10; i++) {
      await answerCurrentWidget(page)
      await page.getByRole('button', { name: 'Nächste Aufgabe' }).click()
      if (i === 5) await page.waitForTimeout(1800)
    }

    await page.waitForURL(/\/test\/ergebnis$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Level \d/)
    const primaryCta = page.getByRole('link', { name: /Jetzt beitreten/ }).first()
    await expect(primaryCta).toBeVisible()
    const href = await primaryCta.getAttribute('href')
    expect(href).toMatch(
      /^\/join\?pre=(neugieriger|einsteiger|fortgeschritten|pro|expert)&source=test&skills=/,
    )
  })

  test('Skill Radar figure exists on results page', async ({ page }) => {
    await page.goto(`${BASE_URL}/test/aufgabe/1`)
    for (let i = 1; i <= 10; i++) {
      await answerCurrentWidget(page)
      await page.getByRole('button', { name: 'Nächste Aufgabe' }).click()
      if (i === 5) await page.waitForTimeout(1800)
    }
    await page.waitForURL(/\/test\/ergebnis$/)
    await expect(page.locator('[data-testid="skill-radar"]')).toBeVisible()
  })

  test('/test/aufgabe/1 loads standalone and renders Aufgabe layout', async ({
    page,
  }) => {
    const response = await page.goto(`${BASE_URL}/test/aufgabe/1`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-widget-type]').first()).toBeVisible()
    await expect(page.getByText(/Aufgabe 1\/10/)).toBeVisible()
  })

  test('/test/ergebnis without completed test shows NoResultFallback', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/test/ergebnis`)
    await expect(page.getByText(/Kein Ergebnis vorhanden/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Test starten' })).toBeVisible()
  })
})
