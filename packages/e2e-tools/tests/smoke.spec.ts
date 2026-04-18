import { test, expect } from "@playwright/test"

/**
 * Prod-Smoke-Test — fängt den 2026-04-18 Incident (CSP blockt alle Scripts →
 * schwarze Seite bei HTTP 200). Siehe LEARNINGS.md.
 *
 * Läuft via .github/workflows/smoke-prod.yml gegen die echten Prod-URLs
 * (nach jedem main-Push + stündlich via cron).
 *
 * Whitelist: Vercel Speed-Insights-Noise ignorieren. Alles andere ist rot.
 */

const URLS = [
  { name: "website", url: "https://generation-ai.org" },
  { name: "tools-app", url: "https://tools.generation-ai.org" },
]

const ERROR_WHITELIST = [
  /speed-insights/i,
  /vercel-scripts/i,
  /vitals\.vercel-insights/i,
]

function isWhitelisted(msg: string): boolean {
  return ERROR_WHITELIST.some((re) => re.test(msg))
}

for (const { name, url } of URLS) {
  test(`${name}: rendert ohne CSP-Violations + sichtbarer Content`, async ({
    page,
  }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on("console", (msg) => {
      if (msg.type() === "error" && !isWhitelisted(msg.text())) {
        consoleErrors.push(msg.text())
      }
    })
    page.on("pageerror", (err) => {
      if (!isWhitelisted(err.message)) pageErrors.push(err.message)
    })

    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 20_000,
    })

    expect(response?.status(), `HTTP-Status ${url}`).toBeLessThan(400)

    // 1. CSP-Violations sind sofort rot — genau der Bug vom 18.04.2026.
    const cspErrors = [...consoleErrors, ...pageErrors].filter((e) =>
      /Content Security Policy|script-src|strict-dynamic|nonce/i.test(e)
    )
    expect(
      cspErrors,
      `CSP-Violations auf ${url}:\n${cspErrors.join("\n")}`
    ).toHaveLength(0)

    // 2. Body muss sichtbaren Text haben — schwarze Seite hat leeren body.innerText.
    const bodyText = (await page.locator("body").innerText()).trim()
    expect(
      bodyText.length,
      `Body von ${url} ist leer/fast-leer (schwarze Seite?): "${bodyText.slice(0, 100)}"`
    ).toBeGreaterThan(20)

    // 3. Keine sonstigen Runtime-Errors.
    expect(
      pageErrors,
      `Unhandled page errors auf ${url}:\n${pageErrors.join("\n")}`
    ).toHaveLength(0)
    expect(
      consoleErrors,
      `Console errors auf ${url}:\n${consoleErrors.join("\n")}`
    ).toHaveLength(0)
  })
}
