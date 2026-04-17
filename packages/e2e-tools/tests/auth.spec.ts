import { test, expect } from "@playwright/test"
import { getTestUser, requireTestUser } from "../fixtures/test-user"
import { collectCspViolations, assertCspHeader } from "../helpers/csp-assertions"

const TOOLS_URL = process.env.BASE_URL || "https://tools.generation-ai.org"
const WEBSITE_URL = process.env.WEBSITE_URL || "https://generation-ai.org"

// ─── Pfad 1: Login via Email+Passwort ────────────────────────────────
test.describe("Auth Path 1: Password Login", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto(`${TOOLS_URL}/login`)
    // Label text is "E-Mail" (German, hyphenated) — use id selector for reliability
    await expect(page.locator("#email")).toBeVisible({ timeout: 10_000 })
  })

  test.skip("TODO-wave1: password login sets sb- cookie with domain=.generation-ai.org", async ({ page }) => {
    const user = requireTestUser()
    await page.goto(`${TOOLS_URL}/login`)
    await page.getByLabel(/email/i).fill(user.email)
    await page.getByLabel(/passwort|password/i).fill(user.password)
    await page.getByRole("button", { name: /anmelden|login/i }).click()
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10_000 })
    const cookies = await page.context().cookies(TOOLS_URL)
    const session = cookies.find((c) => c.name.startsWith("sb-"))
    expect(session).toBeTruthy()
    expect(session?.domain).toBe(".generation-ai.org")
  })

  test.skip("TODO-wave1: session persists across reload", async ({ page }) => {
    // Plan 02 implementiert
  })
})

// ─── Pfad 2: Magic Link ──────────────────────────────────────────────
test.describe("Auth Path 2: Magic Link", () => {
  test.skip("TODO-wave1: admin-generated magic link signs user in", async () => {
    // Plan 02 implementiert: generateMagicLink → page.goto(actionLink) → verify Session
  })
})

// ─── Pfad 3: Session-Refresh ─────────────────────────────────────────
test.describe("Auth Path 3: Session Refresh", () => {
  test.skip("TODO-wave1/manual: token rotation via proxy.ts", async () => {
    // Laut Research Open Question 1: evtl. manual-only. Plan 02 entscheidet.
  })
})

// ─── Pfad 4: Signout ─────────────────────────────────────────────────
test.describe("Auth Path 4: Signout (POST-only regression)", () => {
  test("GET /auth/signout returns 405 (regression test für Session-Drop-Bug f5f9cb7)", async ({ request }) => {
    const response = await request.get(`${TOOLS_URL}/auth/signout`, { maxRedirects: 0 })
    expect(response.status()).toBe(405)
  })

  test.skip("TODO-wave1: POST /auth/signout clears sb- cookies", async () => {
    // Plan 02 implementiert
  })
})

// ─── Pfad 5: Password-Reset ──────────────────────────────────────────
test.describe("Auth Path 5: Password Reset End-to-End", () => {
  test.skip("TODO-wave1: recovery link → /auth/set-password → re-login works", async () => {
    // Plan 02 implementiert: generateRecoveryLink → navigate → updateUser → re-login
  })
})

// ─── Pfad 6: Cross-Domain Session ────────────────────────────────────
test.describe("Auth Path 6: Cross-Domain Cookie", () => {
  test.skip("TODO-wave1: login on tools-app, cookie valid on website", async () => {
    // Plan 02 implementiert
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
