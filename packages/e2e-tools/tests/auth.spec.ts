import { test, expect } from "@playwright/test"
import { getTestUser, requireTestUser } from "../fixtures/test-user"
import { collectCspViolations, assertCspHeader } from "../helpers/csp-assertions"
import { generateMagicLink, generateRecoveryLink, ensureTestUser } from "../helpers/supabase-admin"

// All auth tests share one Supabase user account on production.
// Serial mode prevents parallel signout/login races between tests.
test.describe.configure({ mode: "serial" })

// Aligned mit playwright.config.ts (Phase 19 D-08): E2E_BASE_URL primary, BASE_URL legacy-fallback.
const TOOLS_URL =
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  "https://tools.generation-ai.org"
const WEBSITE_URL = process.env.WEBSITE_URL || "https://generation-ai.org"

/** Helper: login via password on the tools-app login page */
async function loginWithPassword(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto(`${TOOLS_URL}/login`)
  // Login form defaults to Magic Link — click the toggle to reveal password field
  await page.getByRole("button", { name: /mit passwort anmelden/i }).click()
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.getByRole("button", { name: /anmelden/i }).click()
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20_000 })
}

// ─── Pfad 1: Login via Email+Passwort ────────────────────────────────
test.describe("Auth Path 1: Password Login", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto(`${TOOLS_URL}/login`)
    // Label text is "E-Mail" (German, hyphenated) — use id selector for reliability
    await expect(page.locator("#email")).toBeVisible({ timeout: 10_000 })
  })

  test("password login sets sb- cookie with domain=.generation-ai.org", async ({ page }) => {
    test.setTimeout(60_000)
    const user = requireTestUser()
    await loginWithPassword(page, user.email, user.password)
    const cookies = await page.context().cookies(TOOLS_URL)
    const session = cookies.find((c) => c.name.startsWith("sb-"))
    expect(session, "Expected an sb- session cookie to be set after login").toBeTruthy()
    expect(session?.domain).toBe(".generation-ai.org")
    // @supabase/ssr browser client sets httpOnly: false by design (JS needs to read the token).
    // Security note: XSS can steal the session. Tracked as F1 in AUTH-FLOW.md (backlog).
    expect(session?.httpOnly).toBe(false)
    // sameSite=Lax provides CSRF protection. secure flag managed by browser on HTTPS.
    expect(session?.sameSite).toBe("Lax")
  })

  test("session persists across reload", async ({ page }) => {
    test.setTimeout(60_000)
    const user = requireTestUser()
    await loginWithPassword(page, user.email, user.password)
    // Grab cookie before reload
    const cookiesBefore = await page.context().cookies(TOOLS_URL)
    const sessionBefore = cookiesBefore.find((c) => c.name.startsWith("sb-"))
    expect(sessionBefore).toBeTruthy()
    // Reload and verify cookie still present + no redirect to login
    await page.reload()
    await page.waitForLoadState("networkidle")
    expect(page.url()).not.toContain("/login")
    const cookiesAfter = await page.context().cookies(TOOLS_URL)
    const sessionAfter = cookiesAfter.find((c) => c.name.startsWith("sb-"))
    expect(sessionAfter, "Session cookie should persist after reload").toBeTruthy()
  })
})

// ─── Pfad 2: Magic Link ──────────────────────────────────────────────
test.describe("Auth Path 2: Magic Link", () => {
  test("admin-generated magic link signs user in", async ({ page }) => {
    test.setTimeout(60_000)
    const user = requireTestUser()
    // Generate magic link via admin API (bypasses email delivery)
    const { actionLink } = await generateMagicLink(user.email, `${TOOLS_URL}/auth/confirm`)
    await page.goto(actionLink)
    // Should redirect away from /auth/confirm after OTP exchange
    await page.waitForURL(
      (url) => !url.pathname.includes("/auth/confirm") && !url.pathname.includes("/login"),
      { timeout: 20_000 }
    )
    const cookies = await page.context().cookies(TOOLS_URL)
    const session = cookies.find((c) => c.name.startsWith("sb-"))
    expect(session, "Magic link should set sb- session cookie").toBeTruthy()
    expect(session?.domain).toBe(".generation-ai.org")
  })
})

// ─── Pfad 3: Session-Refresh ─────────────────────────────────────────
test.describe("Auth Path 3: Session Refresh", () => {
  // Token-Expiry-Simulation not feasible in short automated tests (tokens valid for hours).
  // Verified manually via Playwright-MCP run — see docs/AUTH-FLOW.md ## Manual-Only Evidence.
  // updateSession() in packages/auth/src/middleware.ts handles refresh via @supabase/ssr.
  test.skip("manual-only: session refresh verified per Playwright-MCP run in AUTH-FLOW.md", async () => {
    // Laut Research Open Question 1: Token-Expiry-Simulation in kurzen Tests nicht machbar.
    // Manuell verifiziert: middleware updateSession() rotiert Token bei Bedarf (Supabase canonical pattern).
  })
})

// ─── Pfad 4: Signout ─────────────────────────────────────────────────
test.describe("Auth Path 4: Signout (POST-only regression)", () => {
  test("GET /auth/signout returns 405 (regression test für Session-Drop-Bug f5f9cb7)", async ({ request }) => {
    const response = await request.get(`${TOOLS_URL}/auth/signout`, { maxRedirects: 0 })
    expect(response.status()).toBe(405)
  })

  test("POST /auth/signout clears sb- cookies", async ({ page }) => {
    test.setTimeout(60_000)
    const user = requireTestUser()
    // First login to establish session
    await loginWithPassword(page, user.email, user.password)
    const cookiesBefore = await page.context().cookies(TOOLS_URL)
    const sessionBefore = cookiesBefore.find((c) => c.name.startsWith("sb-"))
    expect(sessionBefore, "Must be logged in before signout test").toBeTruthy()
    // POST signout — follow redirects to final page
    await page.request.post(`${TOOLS_URL}/auth/signout`)
    // Reload page context to pick up cleared cookies
    await page.goto(TOOLS_URL)
    await page.waitForLoadState("networkidle")
    const cookiesAfter = await page.context().cookies(TOOLS_URL)
    const sessionAfter = cookiesAfter.find((c) => c.name.startsWith("sb-"))
    // After signout cookie should be gone or have an empty/past-expiry value
    const cookieCleared = !sessionAfter || sessionAfter.value === "" || sessionAfter.expires < Date.now() / 1000
    expect(cookieCleared, "Session cookie should be cleared after POST signout").toBe(true)
  })
})

// ─── Pfad 5: Password-Reset ──────────────────────────────────────────
test.describe("Auth Path 5: Password Reset End-to-End", () => {
  test("recovery link → /auth/set-password → re-login works", async ({ page }) => {
    test.setTimeout(90_000)
    const user = requireTestUser()
    const originalPassword = user.password
    const tempPassword = `Reset!${Date.now()}`

    // Generate recovery link via admin API
    const { actionLink } = await generateRecoveryLink(user.email, `${TOOLS_URL}/auth/confirm`)

    // Navigate recovery link — should redirect to /auth/set-password after OTP exchange
    await page.goto(actionLink)
    await page.waitForURL((url) => url.pathname.includes("/auth/set-password"), { timeout: 20_000 })

    // Set new (temporary) password
    await expect(page.locator("#password")).toBeVisible({ timeout: 10_000 })
    await page.locator("#password").fill(tempPassword)
    await page.locator("#confirmPassword").fill(tempPassword)
    await page.getByRole("button", { name: /passwort speichern/i }).click()

    // Wait for success message (set-password page shows toast, then redirects after 1500ms)
    await expect(page.locator("text=Passwort erfolgreich gesetzt")).toBeVisible({ timeout: 20_000 })
    // Wait for the 1500ms redirect to complete
    await page.waitForURL((url) => !url.pathname.includes("/auth/set-password"), { timeout: 10_000 })

    // Clear cookies to simulate fresh session
    await page.context().clearCookies()

    // Re-login with new temporary password
    await loginWithPassword(page, user.email, tempPassword)
    const cookies = await page.context().cookies(TOOLS_URL)
    const session = cookies.find((c) => c.name.startsWith("sb-"))
    expect(session, "Should be able to re-login with new password after reset").toBeTruthy()

    // Cleanup: reset password back to original via another recovery link
    await page.context().clearCookies()
    const { actionLink: cleanupLink } = await generateRecoveryLink(user.email, `${TOOLS_URL}/auth/confirm`)
    await page.goto(cleanupLink)
    await page.waitForURL((url) => url.pathname.includes("/auth/set-password"), { timeout: 20_000 })
    await page.locator("#password").fill(originalPassword)
    await page.locator("#confirmPassword").fill(originalPassword)
    await page.getByRole("button", { name: /passwort speichern/i }).click()
    await expect(page.locator("text=Passwort erfolgreich gesetzt")).toBeVisible({ timeout: 20_000 })
    await page.waitForURL((url) => !url.pathname.includes("/auth/set-password"), { timeout: 10_000 })
  })
})

// ─── Pfad 6: Cross-Domain Session ────────────────────────────────────
test.describe("Auth Path 6: Cross-Domain Cookie", () => {
  test("login on tools-app, cookie valid on website (domain=.generation-ai.org)", async ({ page }) => {
    test.setTimeout(60_000)
    const user = requireTestUser()
    // Login on tools-app
    await loginWithPassword(page, user.email, user.password)
    const toolsCookies = await page.context().cookies(TOOLS_URL)
    const toolsSession = toolsCookies.find((c) => c.name.startsWith("sb-"))
    expect(toolsSession, "Must have session on tools-app after login").toBeTruthy()
    expect(toolsSession?.domain).toBe(".generation-ai.org")

    // Navigate to the main website in same browser context
    await page.goto(WEBSITE_URL)
    await page.waitForLoadState("networkidle")

    // Cookie with Domain=.generation-ai.org should be sent by the browser on both subdomains.
    // Playwright's context().cookies(url) filters by matching domain — we query all cookies
    // and check that the sb- cookie's domain covers the website subdomain too.
    const allCookies = await page.context().cookies()
    const websiteSession = allCookies.find(
      (c) => c.name.startsWith("sb-") && c.domain === ".generation-ai.org"
    )
    expect(websiteSession, "Session cookie with domain=.generation-ai.org should cover both subdomains").toBeTruthy()
    expect(websiteSession?.domain).toBe(".generation-ai.org")
  })
})

// ─── CSP Smoke (Baseline — Plan 04/05 erweitert) ────────────────────
test.describe("CSP Baseline", () => {
  test("no CSP-violations on /login load (may not have CSP yet → still passes)", async ({ page }) => {
    const violations = collectCspViolations(page)
    await page.goto(`${TOOLS_URL}/login`)
    await page.waitForLoadState("networkidle")
    // Vor Plan 05: kein CSP → keine Violations. Nach Plan 05: enforced CSP → immer noch keine.
    expect(violations).toHaveLength(0)
  })

  test.skip("TODO-wave2: tools-app /login serves enforced Content-Security-Policy header", async ({ page }) => {
    const response = await page.goto(`${TOOLS_URL}/login`)
    const csp = assertCspHeader(response, {
      mode: "enforced",
      mustContain: ["default-src 'self'", "frame-ancestors 'none'", "'nonce-"],
    })
    expect(csp).not.toContain("'unsafe-inline'")
  })
})

// Sanity holdover aus pre-Phase-13 — bleiben
test.describe("General", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto(TOOLS_URL)
    await expect(page.locator("body")).toBeVisible()
  })
})
