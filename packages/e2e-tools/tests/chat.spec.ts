import { test, expect } from '@playwright/test'

/**
 * Chat-Smoke-Tests gegen Prod (Phase 19 D-08).
 * Test-Runner ist unauthenticated → Server redirected /chat zu /login.
 * Diese Tests prüfen nur: Page lädt ohne 5xx, eine bekannte UI (Chat oder Login) ist sichtbar.
 *
 * Volle Chat-Flows mit echtem User sind im BACKLOG (Mail-Inbox-Scraping nötig für Magic-Link-Flow).
 */

test.describe('Chat Flow (prod smoke)', () => {
  test('chat page loads', async ({ page }) => {
    const response = await page.goto('/chat', { waitUntil: 'networkidle' })
    expect(response?.status(), 'HTTP status < 400').toBeLessThan(400)
    await expect(page.locator('body')).toBeVisible()
  })

  test('unauthenticated /chat shows login prompt or chat interface', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'networkidle' })
    // Unauthenticated: server redirects to /login → email input visible.
    // Authenticated (rare in CI): chat textbox visible.
    const loginEmail = page.locator('#email')
    const chatInput = page.getByRole('textbox')
    await expect(loginEmail.or(chatInput)).toBeVisible({ timeout: 10_000 })
  })

  test('/chat is not a 5xx page', async ({ page }) => {
    const response = await page.goto('/chat')
    expect(response?.status(), '/chat must not 5xx').toBeLessThan(500)
    // Final URL is either /chat (authenticated) or /login (redirect).
    const finalPath = new URL(page.url()).pathname
    expect(['/chat', '/login']).toContain(finalPath)
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
