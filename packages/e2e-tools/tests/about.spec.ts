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

  test("Story-Timeline rendert die Vereinsentstehung", async ({ page }) => {
    await page.goto(`${BASE_URL}/about#story`)

    const timeline = page.locator('[data-timeline="about-story"]')
    await expect(timeline).toBeVisible()
    await expect(
      page.getByRole("list", { name: "Timeline der Vereinsentstehung" }),
    ).toBeVisible()

    for (const label of ["Februar 2026", "März 2026", "April 2026", "Mai 2026"]) {
      await expect(timeline.getByText(label)).toBeVisible()
    }
  })

  test("Story-Timeline bleibt mit Reduced Motion lesbar", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(`${BASE_URL}/about#story`)

    const timeline = page.locator('[data-timeline="about-story"]')
    await expect(timeline).toBeVisible()
    await expect(timeline.getByText("Generation AI wird Verein.")).toBeVisible()
  })

  test("Verein-Formular ist sichtbar und validiert Pflichtfelder", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/about#verein`)

    const form = page.locator("#verein-form")
    await expect(form).toBeVisible()
    await expect(form.getByLabel("Name")).toBeVisible()
    await expect(form.getByRole("textbox", { name: "E-Mail" })).toBeVisible()
    await expect(form.getByLabel("Wobei willst du mitmachen?")).toBeVisible()

    await form.getByRole("button", { name: "Nachricht senden" }).click()
    await expect(form.getByText("Dieses Feld ist erforderlich.").first()).toBeVisible()
  })

  test("Mitmach-CTA springt zum Verein-Formular", async ({ page }) => {
    await page.goto(`${BASE_URL}/about#mitmach`)

    const link = page.getByRole("link", { name: "Zum Formular" })
    await expect(link).toHaveAttribute("href", "#verein-form")
    await link.click()
    await expect(page.locator("#verein-form")).toBeInViewport()
  })

  test("Verein-Formular Submit zeigt Success-Screen (skip ohne Resend)", async ({
    page,
  }) => {
    if (!process.env.RESEND_API_KEY) {
      test.skip()
      return
    }

    await page.goto(`${BASE_URL}/about#verein`)
    const form = page.locator("#verein-form")

    await form.getByLabel("Name").fill("Test Person")
    await form.getByRole("textbox", { name: "E-Mail" }).fill("test@example.com")
    await form.getByLabel("Wobei willst du mitmachen?").selectOption("Tech")
    await form.getByLabel("Nachricht (optional)").fill("Ich möchte beim Tech-Team helfen.")
    await form.getByRole("button", { name: "Nachricht senden" }).click()

    await expect(page.getByText("Nachricht angekommen.")).toBeVisible({
      timeout: 10000,
    })
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
    // Skip-Link existiert im DOM und verweist auf #main-content. Initial
    // visuell versteckt (top: -100%), wird bei :focus sichtbar.
    const skipLink = page.locator(".skip-link")
    await expect(skipLink).toHaveAttribute("href", "#main-content")
    // Fokussierbarkeit + Navigation: Link direkt fokussieren und Enter drücken.
    await skipLink.focus()
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
