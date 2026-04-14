import { test, expect } from '@playwright/test'

test.describe('Chat Flow', () => {
  test('chat page loads', async ({ page }) => {
    await page.goto('/chat')
    // Should redirect to login or show chat interface
    await expect(page.locator('body')).toBeVisible()
  })

  test('can see chat interface or login prompt', async ({ page }) => {
    await page.goto('/chat')
    // Check for chat input or login redirect
    const chatInput = page.getByRole('textbox')
    const loginButton = page.getByRole('link', { name: /login|anmelden|sign in/i })
    const loginForm = page.locator('form')
    await expect(chatInput.or(loginButton).or(loginForm)).toBeVisible({ timeout: 10000 })
  })

  test('chat interface has expected elements when accessible', async ({ page }) => {
    await page.goto('/chat')
    // If we can access chat, verify basic UI elements
    const chatContainer = page.locator('[data-testid="chat-container"]').or(page.locator('main'))
    await expect(chatContainer).toBeVisible()
  })

  // TODO: Full chat flow with authenticated user
  test.skip('can send message in chat', async ({ page }) => {
    // Requires authenticated session
    await page.goto('/chat')
    const input = page.getByRole('textbox')
    await input.fill('Hallo, das ist ein Test')
    await page.getByRole('button', { name: /senden|send/i }).click()
    await expect(page.getByText('Hallo, das ist ein Test')).toBeVisible()
  })

  // TODO: Verify AI response appears
  test.skip('receives AI response after sending message', async ({ page }) => {
    // Requires authenticated session and mocked AI
    await page.goto('/chat')
    const input = page.getByRole('textbox')
    await input.fill('Was sind KI-Tools?')
    await page.getByRole('button', { name: /senden|send/i }).click()
    // Wait for response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 30000 })
  })
})
