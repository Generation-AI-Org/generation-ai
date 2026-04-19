import { test, expect, type ConsoleMessage } from "@playwright/test"

const LANDING_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000"

test.describe("Phase 20 — Landing", () => {
  test("R1.1 — Nav-Dropdown 'Für Partner' opens on click", async ({ page }) => {
    await page.goto(LANDING_URL)
    await page.getByRole("button", { name: /Für Partner/i }).click()
    await expect(page.getByRole("menu")).toBeVisible()
  })

  test("R1.1 — Nav-Dropdown opens via keyboard (Enter) and closes via Escape", async ({ page }) => {
    await page.goto(LANDING_URL)
    const trigger = page.getByRole("button", { name: /Für Partner/i })
    await trigger.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("menu")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("menu")).not.toBeVisible()
  })

  test("R1.1 — Mobile-Nav: Hamburger opens overlay, X closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto(LANDING_URL)
    await page.getByRole("button", { name: /Menü öffnen|Open menu/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.getByRole("button", { name: /Menü schließen|Close/i }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })

  test("R1.2 — Hero CTA links to /join", async ({ page }) => {
    await page.goto(LANDING_URL)
    const cta = page.getByRole("link", { name: /Jetzt beitreten/i }).first()
    await expect(cta).toHaveAttribute("href", /\/join/)
  })

  test("R1.5 — Tool-Showcase: 'Beispiel'-Badge sichtbar", async ({ page }) => {
    await page.goto(LANDING_URL)
    const badges = page.getByText("Beispiel", { exact: true })
    await expect(badges.first()).toBeVisible()
  })

  test("R1.6 — Community-Preview: 'Beispiel'-Badge sichtbar", async ({ page }) => {
    await page.goto(LANDING_URL)
    // Plan 04 garantiert mindestens 2 Beispiel-Badges (Tool-Showcase + Community-Preview)
    const badges = page.getByText("Beispiel", { exact: true })
    expect(await badges.count()).toBeGreaterThanOrEqual(2)
  })

  test("R1.8 — Trust marquee pauses on prefers-reduced-motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" })
    const page = await context.newPage()
    await page.goto(LANDING_URL)
    const marquee = page.locator(".animate-marquee").first()
    // Bei reduced-motion: animation-play-state = paused (durch globals.css Guard)
    const playState = await marquee.evaluate((el) => getComputedStyle(el).animationPlayState)
    expect(playState).toBe("paused")
    await context.close()
  })

  test("CSP — keine Console-Errors mit 'Content Security Policy' auf Landing", async ({ page }) => {
    const cspErrors: string[] = []
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error" && /Content Security Policy/i.test(msg.text())) {
        cspErrors.push(msg.text())
      }
    })
    await page.goto(LANDING_URL, { waitUntil: "networkidle" })
    expect(cspErrors).toHaveLength(0)
  })
})
