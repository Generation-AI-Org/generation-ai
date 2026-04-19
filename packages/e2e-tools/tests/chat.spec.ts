import { test, expect } from '@playwright/test'

/**
 * Auth-Gate-Smoke-Tests gegen Prod (Phase 19 D-08).
 *
 * Test-Runner ist unauthenticated → `/settings` (geschützte Server-Component) redirected zu `/login`.
 * Diese Tests prüfen nur: Page lädt ohne 5xx, Redirect zum Login funktioniert, Login-UI sichtbar.
 *
 * Hinweis: `/chat` existiert als eigene Route NICHT — Chat ist ein Floating-Bubble-Widget, kein Page-Route.
 * Volle Chat-Flows mit echtem User sind im BACKLOG (Mail-Inbox-Scraping nötig für Magic-Link-Flow).
 */

test.describe('Auth Gate (prod smoke)', () => {
  test('protected route loads', async ({ page }) => {
    const response = await page.goto('/settings', { waitUntil: 'networkidle' })
    expect(response?.status(), 'HTTP status < 400').toBeLessThan(400)
    await expect(page.locator('body')).toBeVisible()
  })

  test('unauthenticated /settings redirects to login', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })
    // Unauthenticated: server redirects to /login → email input visible.
    const loginEmail = page.locator('#email')
    await expect(loginEmail).toBeVisible({ timeout: 10_000 })
    expect(new URL(page.url()).pathname).toBe('/login')
  })

  test('/settings is not a 5xx page', async ({ page }) => {
    const response = await page.goto('/settings')
    expect(response?.status(), '/settings must not 5xx').toBeLessThan(500)
    // Final URL is either /settings (authenticated) or /login (redirect).
    const finalPath = new URL(page.url()).pathname
    expect(['/settings', '/login']).toContain(finalPath)
  })

  // TODO: Full chat flow with authenticated user (BACKLOG — needs mail-inbox-scraping for magic link)
  test.skip('can send message in chat', async ({ page }) => {
    await page.goto('/chat')
    const input = page.getByRole('textbox')
    await input.fill('Hallo, das ist ein Test')
    await page.getByRole('button', { name: /senden|send/i }).click()
    await expect(page.getByText('Hallo, das ist ein Test')).toBeVisible()
  })

  test.skip('receives AI response after sending message', async ({ page }) => {
    await page.goto('/chat')
    const input = page.getByRole('textbox')
    await input.fill('Was sind KI-Tools?')
    await page.getByRole('button', { name: /senden|send/i }).click()
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 30000 })
  })
})
