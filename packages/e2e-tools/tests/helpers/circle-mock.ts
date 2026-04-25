/**
 * Phase 25 E2E — Circle-API mocking helpers.
 * Uses Playwright route-interceptors to override fetch-calls to Circle
 * without patching application code.
 *
 * NOTE: Playwright's context.route() only intercepts BROWSER-side fetches.
 * Server-side fetches from Next.js Route Handlers / Server Actions are NOT
 * covered — those go through Node.js fetch on the server.
 *
 * For server-side Circle interception use CIRCLE_TEST_FORCE_FAIL env var
 * (not yet wired — add to packages/circle/src/client.ts if needed for CI).
 */

import type { BrowserContext, Page } from '@playwright/test'

const CIRCLE_URL_PATTERN = /https?:\/\/app\.circle\.so\/api\/admin\/v2\/.*/

/**
 * Force all Circle API calls in this browser context to fail with the given
 * status (default 500). Simulates Circle-API-outage for D-03 testing.
 */
export async function setupCircleFailure(
  context: BrowserContext,
  opts: { status?: number } = {},
): Promise<void> {
  const status = opts.status ?? 500
  await context.route(CIRCLE_URL_PATTERN, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'forced test failure' }),
    })
  })
}

export async function restoreCircle(context: BrowserContext): Promise<void> {
  await context.unroute(CIRCLE_URL_PATTERN)
}

/**
 * Wait placeholder for Sentry-event scenarios.
 * In production-like tests we assert Sentry via Sentry-API or Vercel-logs
 * out-of-band, not from the browser.
 */
export async function waitForSentryEvent(page: Page, timeoutMs = 2000): Promise<void> {
  await page.waitForTimeout(timeoutMs)
}
