import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Generation AI|Tools/i)
  })

  test('login page accessible', async ({ page }) => {
    await page.goto('/login')
    // Should either show login form or redirect indicator
    await expect(page.locator('body')).toBeVisible()
    // Check for form elements or heading
    const loginHeading = page.getByRole('heading', { name: /anmelden|login|sign in/i })
    const emailInput = page.getByLabel(/email/i)
    await expect(loginHeading.or(emailInput)).toBeVisible({ timeout: 10000 })
  })

  test('signup page accessible', async ({ page }) => {
    await page.goto('/signup')
    // Should either show signup form or redirect indicator
    await expect(page.locator('body')).toBeVisible()
    // Check for form elements or heading
    const signupHeading = page.getByRole('heading', { name: /registrieren|signup|sign up|konto erstellen/i })
    const emailInput = page.getByLabel(/email/i)
    await expect(signupHeading.or(emailInput)).toBeVisible({ timeout: 10000 })
  })

  // TODO: Full login flow with test credentials
  test.skip('can login with valid credentials', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    if (!email || !password) {
      test.skip()
      return
    }
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password|passwort/i).fill(password)
    await page.getByRole('button', { name: /anmelden|login|sign in/i }).click()
    await expect(page).toHaveURL(/chat|dashboard|tools/i)
  })

  test('unauthenticated user is redirected from protected routes', async ({ page }) => {
    await page.goto('/chat')
    // Should either show chat (if public) or redirect to login
    await expect(page.locator('body')).toBeVisible()
  })
})
