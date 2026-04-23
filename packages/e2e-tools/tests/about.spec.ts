import { test, expect } from "@playwright/test"

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000"

test.describe("Phase 21 — /about", () => {
  test.beforeEach(async ({ page }) => {
    // Skip Terminal-Splash (Pattern aus landing.spec.ts) — sonst blockt
    // das Splash-Overlay ~1.5s lang pointer events und macht Tests flaky.
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("terminal-splash-seen", "true")
      } catch {
        // sessionStorage may be unavailable in some contexts — safe to ignore.
      }
    })
  })

  test("Route /about lädt mit HTTP 200 und rendert alle 9 Sections", async ({
    page,
  }) => {
    const response = await page.goto(`${BASE_URL}/about`)
    expect(response?.status()).toBe(200)

    const expectedSections = [
      "about-hero",
      "about-story",
      "about-team",
      "about-values",
      "about-verein",
      "about-mitmach",
      "about-faq",
      "about-final-cta",
      "about-kontakt",
    ]
    for (const name of expectedSections) {
      await expect(
        page.locator(`section[data-section="${name}"]`),
      ).toBeVisible()
    }
  })

  test("Meta-Tags korrekt gesetzt", async ({ page }) => {
    await page.goto(`${BASE_URL}/about`)
    await expect(page).toHaveTitle(/Über uns · Generation AI/)

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content")
    expect(description).toContain("Warum es Generation AI gibt")
  })

  test("Anker #team, #verein, #mitmach, #faq, #kontakt existieren", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/about`)
    for (const anchor of ["team", "verein", "mitmach", "faq", "kontakt"]) {
      await expect(page.locator(`#${anchor}`)).toBeAttached()
    }
  })

  test("Story-Anker #story und Werte-Anker #werte existieren", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/about`)
    await expect(page.locator("#story")).toBeAttached()
    await expect(page.locator("#werte")).toBeAttached()
  })

  test("FAQ-Accordion öffnet bei Klick auf Trigger", async ({ page }) => {
    await page.goto(`${BASE_URL}/about#faq`)

    const firstTrigger = page.getByRole("button", {
      name: /Was ist Generation AI/i,
    })
    await expect(firstTrigger).toBeVisible()
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false")

    await firstTrigger.click()
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true")

    await expect(
      page.getByText(/kostenlose KI-Community für Studierende im DACH-Raum/i),
    ).toBeVisible()
  })

  test("FAQ-Multi-Open: 2 Panels gleichzeitig geöffnet", async ({ page }) => {
    await page.goto(`${BASE_URL}/about#faq`)

    const trigger1 = page.getByRole("button", {
      name: /Was ist Generation AI/i,
    })
    const trigger2 = page.getByRole("button", {
      name: /Wer kann Mitglied werden/i,
    })

    await trigger1.click()
    await trigger2.click()

    // Beide Panels müssen gleichzeitig expanded sein (Multi-Open, D-03).
    await expect(trigger1).toHaveAttribute("aria-expanded", "true")
    await expect(trigger2).toHaveAttribute("aria-expanded", "true")
  })

  test("Deep-Link /about#faq scrollt zur FAQ-Section", async ({ page }) => {
    await page.goto(`${BASE_URL}/about#faq`)

    const faqSection = page.locator("#faq")
    await expect(faqSection).toBeInViewport({ timeout: 2000 })
  })

  test("Nav-Link 'Über uns' im Header führt zu /about", async ({ page }) => {
    await page.goto(BASE_URL)
    // Mehrere "Über uns" Links können existieren (desktop + mobile menu) —
    // `.first()` wählt den Desktop-Nav-Link (sichtbar bei Default-Viewport md+).
    const aboutLink = page.getByRole("link", { name: "Über uns" }).first()
    await expect(aboutLink).toBeVisible()
    await aboutLink.click()
    await page.waitForURL("**/about")
    expect(page.url()).toContain("/about")
  })

  test("Skip-Link 'Zum Inhalt springen' funktioniert auf /about", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/about`)
    // Skip-link ist das erste fokussierbare Element im Header.
    await page.keyboard.press("Tab")
    const skipLink = page.locator(".skip-link")
    await expect(skipLink).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("#main-content")).toBeInViewport()
  })

  test("Keine Console-Errors auf /about (CSP-Regression-Check)", async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })

    await page.goto(`${BASE_URL}/about`)
    await page.waitForLoadState("networkidle")

    // Bekannte benign errors ausfiltern (Speed-Insights 404 ist Vercel-only).
    const fatalErrors = errors.filter(
      (e) => !e.includes("Speed Insights") && !e.includes("vitals"),
    )
    expect(fatalErrors).toEqual([])
  })
})
