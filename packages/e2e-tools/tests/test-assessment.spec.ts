import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const TEST_URL = `${BASE_URL}/test`
const RESULT_STORAGE_KEY = 'genai:assessment:result:v1'

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
      await widget.locator('[role="radio"]').first().click()
      break
    case 'spot':
      await widget.locator('[role="option"]').first().click()
      break
    case 'match': {
      const selects = page.locator('[data-widget-type="match"] select')
      const count = await selects.count()
      if (count > 0) {
        for (let s = 0; s < count; s++) {
          await selects.nth(s).selectOption({ index: s + 1 })
        }
      } else {
        const tools = page.locator('[data-widget-type="match"] button[aria-label$="ziehen"]')
        const dropZones = page.locator('[data-widget-type="match"] [aria-label^="Drop-Zone"]')
        const taskCount = await dropZones.count()
        for (let i = 0; i < taskCount; i++) {
          await tools.nth(i).dragTo(dropZones.nth(i))
        }
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
      const confWidget = widget
      await confWidget.focus()
      await confWidget.press('3')
      break
    }
    case 'rank':
      await page.getByRole('button', { name: 'Reihenfolge bestätigen' }).click()
      break
    default:
      break
  }
  return widgetType
}

async function advanceFromQuestion(page: Page, questionNumber: number) {
  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click()
  if (questionNumber < 10) {
    await expect(page).toHaveURL(new RegExp(`/test/aufgabe/${questionNumber + 1}$`), {
      timeout: 10000,
    })
  } else {
    await expect(page).toHaveURL(/\/test\/ergebnis$/, { timeout: 10000 })
  }
}

async function completeAssessment(page: Page) {
  await page.goto(`${BASE_URL}/test/aufgabe/1`)
  for (let i = 1; i <= 10; i++) {
    await page.waitForURL(new RegExp(`/test/aufgabe/${i}$`), { timeout: 10000 })
    await answerCurrentWidget(page)
    await advanceFromQuestion(page, i)
  }
}

test.describe('/test AI Literacy Assessment', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('terminal-splash-seen', 'true')
      } catch {
        // ignore
      }
      const originalMatchMedia = window.matchMedia.bind(window)
      window.matchMedia = (query: string) => {
        if (query === '(pointer: coarse)') {
          return {
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
          } as MediaQueryList
        }
        return originalMatchMedia(query)
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

  test('all 4 launch widget types appear across the 10 questions', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/test/aufgabe/1`)
    const seenTypes = new Set<string>()

    for (let i = 1; i <= 10; i++) {
      if (page.url().includes('/test/ergebnis')) break
      await page.waitForURL(new RegExp(`/test/aufgabe/${i}$`), { timeout: 10000 })
      const widgetType = await answerCurrentWidget(page)
      if (widgetType) seenTypes.add(widgetType)
      await advanceFromQuestion(page, i)
    }

    expect(seenTypes).toEqual(new Set(['mc', 'match', 'confidence', 'rank']))
  })

  test('completing all 10 questions lands on /test/ergebnis with level + primary CTA', async ({
    page,
  }) => {
    await completeAssessment(page)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Level \d/)
    const primaryCta = page.getByRole('link', { name: 'Jetzt registrieren' })
    await expect(primaryCta).toBeVisible()
    await expect(page.getByRole('link', { name: 'Zur Community' })).toBeVisible()
    const href = await primaryCta.getAttribute('href')
    expect(href).toMatch(
      /^\/join\?pre=(neugieriger|einsteiger|fortgeschritten|pro|expert)&source=test&skills=/,
    )
  })

  test('Skill Radar figure exists on results page', async ({ page }) => {
    await completeAssessment(page)
    await expect(page.locator('[data-testid="skill-radar"]')).toBeVisible()
  })

  test('completed result persists across results-page reload', async ({ page }) => {
    await completeAssessment(page)
    await expect
      .poll(async () =>
        page.evaluate((key) => window.localStorage.getItem(key), RESULT_STORAGE_KEY),
      )
      .toContain('"source":"test"')

    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Level \d/)
    await expect(page.locator('[data-testid="skill-radar"]')).toBeVisible()
  })

  test('join CTA carries stored test result into the join form payload', async ({
    page,
  }) => {
    await completeAssessment(page)
    await page.getByRole('link', { name: 'Jetzt registrieren' }).click()
    await expect(page).toHaveURL(/\/join\?pre=.*source=test.*skills=/)

    const resultPayload = page.locator('input[name="test_result"]')
    await expect(resultPayload).toHaveCount(1)
    await expect(resultPayload).toHaveValue(/"source":"test"/)
    await expect(page.locator('input[name="source"]')).toHaveValue('test')
    await expect(page.locator('input[name="level"]')).toHaveValue(/[1-5]/)
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
