import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const JOIN_URL = `${BASE_URL}/join`

// Unique email per test run to avoid unique-index collisions in waitlist table
function testEmail() {
  return `e2e-join+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@generation-ai.test`
}

test.describe('/join page', () => {
  test.beforeEach(async ({ page }) => {
    // Skip Terminal-Splash so it doesn't block pointer events (same pattern as about.spec.ts)
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('terminal-splash-seen', 'true')
      } catch {
        // sessionStorage may be unavailable in some contexts — safe to ignore.
      }
    })
  })

  test('loads successfully with correct title', async ({ page }) => {
    const response = await page.goto(JOIN_URL)
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/Jetzt beitreten · Generation AI/)
  })

  test('renders hero with correct H1 + eyebrow + benefit row', async ({
    page,
  }) => {
    await page.goto(JOIN_URL)
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('2 Minuten')
    await expect(h1).toContainText('dann bist du dabei')

    // Eyebrow
    await expect(
      page.getByText('// jetzt beitreten', { exact: false }),
    ).toBeVisible()

    // 3 Benefit items (verbatim from UI-SPEC Copywriting Contract)
    for (const label of ['Kostenlos', 'Keine Verpflichtung', 'In 2 Minuten']) {
      await expect(
        page.getByText(label, { exact: false }).first(),
      ).toBeVisible()
    }
  })

  test('renders form with all required fields', async ({ page }) => {
    await page.goto(JOIN_URL)

    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="status"]')).toHaveValue('student')
    await expect(page.locator('input[name="university"]')).toBeVisible()
    await expect(page.locator('select[name="study_field"]')).toBeVisible()
    await expect(page.locator('input[name="consent"]')).toBeVisible()
    await expect(page.locator('input[name="marketing_opt_in"]')).toBeVisible()

    // Honeypot should exist (sr-only, hidden from visible layout)
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveCount(1)

    // Submit button visible
    await expect(
      page.getByRole('button', { name: 'Kostenlos beitreten' }),
    ).toBeVisible()
  })

  test('shows inline error on invalid email', async ({ page }) => {
    await page.goto(JOIN_URL)
    const emailInput = page.locator('input[name="email"]')
    await emailInput.fill('not-an-email')
    await emailInput.blur()

    // Copy verbatim from UI-SPEC Copywriting Contract
    await expect(
      page.getByText('Hmm, die Mail-Adresse passt noch nicht ganz.'),
    ).toBeVisible()
  })

  test('shows inline error when consent is missing on submit', async ({
    page,
  }) => {
    await page.goto(JOIN_URL)
    await page.getByRole('textbox', { name: 'E-MAIL' }).fill(testEmail())
    await page
      .getByRole('textbox', { name: 'VOR- UND NACHNAME' })
      .fill('Test User')
    await page.getByRole('combobox', { name: 'HOCHSCHULE' }).fill('Test Uni')
    // consent deliberately not checked
    await page.getByRole('button', { name: 'Kostenlos beitreten' }).click()
    // Copy verbatim from UI-SPEC Copywriting Contract
    await expect(
      page.getByText(
        'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.',
      ),
    ).toBeVisible()
  })

  test('status switch hides university for working applicants', async ({
    page,
  }) => {
    await page.goto(JOIN_URL)
    await page.getByRole('radio', { name: /Berufstätig/ }).click()
    await expect(page.locator('input[name="status"]')).toHaveValue('working')
    await expect(page.locator('input[name="university"]')).toHaveCount(0)
    await page.locator('select[name="study_field"]').selectOption('Informatik')
    await expect(
      page.getByRole('combobox', { name: /STUDIENFELD/ }).last(),
    ).toHaveValue(
      'Informatik',
    )
  })

  test('uni combobox accepts free-text input', async ({ page }) => {
    await page.goto(JOIN_URL)
    const uni = page.getByRole('combobox', { name: 'HOCHSCHULE' })
    await uni.click()
    await uni.fill('Meine Spezial-Akademie XYZ')
    await uni.blur()
    await expect(uni).toHaveValue('Meine Spezial-Akademie XYZ')
  })

  test('uni combobox filters fixed university list and supports Andere', async ({
    page,
  }) => {
    await page.goto(JOIN_URL)
    const uni = page.getByRole('combobox', { name: 'HOCHSCHULE' })
    await uni.click()
    await uni.fill('HdM')
    await expect(
      page.getByRole('option', { name: /Hochschule der Medien/ }),
    ).toBeVisible()
    await page.getByRole('option', { name: /Hochschule der Medien/ }).click()
    await expect(uni).toHaveValue(/Hochschule der Medien/)

    await uni.fill('Nicht in der Liste')
    await expect(page.getByRole('option', { name: 'Andere' })).toBeVisible()
    await page.getByRole('option', { name: 'Andere' }).click()
    await expect(uni).toHaveValue('Andere')
    await expect(
      page.getByRole('textbox', { name: /Welche Hochschule/ }),
    ).toBeVisible()
  })

  test('study field Sonstiges reveals optional detail input', async ({
    page,
  }) => {
    await page.goto(JOIN_URL)
    await page.locator('select[name="study_field"]').selectOption('Sonstiges')
    await expect(
      page.getByRole('textbox', { name: /Welches Studienfeld/ }),
    ).toBeVisible()
    await page
      .getByRole('textbox', { name: /Welches Studienfeld/ })
      .fill('AI Policy')
    await expect(page.locator('input[name="study_program"]')).toHaveValue(
      'Studienfeld: AI Policy',
    )
  })

  test('uni combobox keyboard navigation + select', async ({ page }) => {
    await page.goto(JOIN_URL)
    const uni = page.getByRole('combobox', { name: 'HOCHSCHULE' })
    await uni.click()
    await uni.fill('LMU')
    // Wait for filtered dropdown to render (role="listbox" from aria-combobox pattern)
    await expect(page.getByRole('listbox')).toBeVisible()
    await uni.press('ArrowDown')
    await uni.press('Enter')
    await expect(uni).toHaveValue(/LMU/i)
  })

  test('redirect_after query param is passed through as hidden input', async ({
    page,
  }) => {
    await page.goto(`${JOIN_URL}?redirect_after=%2Fevents%2Fsample`)
    const hidden = page.locator('input[name="redirect_after"]')
    await expect(hidden).toHaveCount(1)
    await expect(hidden).toHaveValue('/events/sample')
  })

  test('valid submit swaps form for success card', async ({ page }) => {
    // Skip in CI if no Supabase + Resend configured — requires live DB
    if (process.env.CI && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      test.skip()
      return
    }

    await page.goto(JOIN_URL)
    await page.getByRole('textbox', { name: 'E-MAIL' }).fill(testEmail())
    await page
      .getByRole('textbox', { name: 'VOR- UND NACHNAME' })
      .fill('Max Mustermann')
    await page
      .getByRole('combobox', { name: 'HOCHSCHULE' })
      .fill('LMU München')
    await page
      .locator('select[name="study_field"]')
      .selectOption('BWL / Wirtschaft')
    await page.locator('input[name="consent"]').check()
    await page.getByRole('button', { name: 'Kostenlos beitreten' }).click()

    await expect(
      page.getByRole('heading', { name: /Willkommen, Max!/ }),
    ).toBeVisible({ timeout: 10_000 })
    // Assessment CTA (D-15 verbatim)
    await expect(
      page.getByRole('link', { name: /Jetzt Level testen/ }),
    ).toHaveAttribute('href', '/test')
    // Secondary link (D-15 verbatim)
    await expect(page.getByText('Später im Dashboard')).toBeVisible()
  })

  test('form state survives page reload via sessionStorage', async ({
    page,
  }) => {
    await page.goto(JOIN_URL)
    // Fill fields and wait for debounced sessionStorage write (300ms per Plan 23-05)
    await page
      .locator('input[name="email"]')
      .fill('reload-test@generation-ai.test')
    await page.locator('input[name="name"]').fill('Reload User')
    await page.getByRole('combobox', { name: 'HOCHSCHULE' }).fill('TU Berlin')
    await page.locator('select[name="study_field"]').selectOption('Informatik')
    await page.waitForTimeout(500)

    // Reload page
    await page.reload()

    // Verify state was restored from sessionStorage (R4.7 Guard)
    await expect(page.getByRole('textbox', { name: 'E-MAIL' })).toHaveValue(
      'reload-test@generation-ai.test',
    )
    await expect(
      page.getByRole('textbox', { name: 'VOR- UND NACHNAME' }),
    ).toHaveValue('Reload User')
    await expect(page.getByRole('combobox', { name: 'HOCHSCHULE' })).toHaveValue(
      'TU Berlin',
    )
    await expect(page.locator('select[name="study_field"]')).toHaveValue(
      'Informatik',
    )
  })

  test('no CSP violations on page load', async ({ page }) => {
    const violations: string[] = []
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        /Content Security Policy|CSP/i.test(msg.text())
      ) {
        violations.push(msg.text())
      }
    })
    await page.goto(JOIN_URL)
    // Wait for async scripts to settle
    await page.waitForLoadState('networkidle')
    expect(violations).toEqual([])
  })
})
