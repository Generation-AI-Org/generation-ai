/**
 * CSP Assertion Helpers.
 * collectCspViolations: hängt console-listener an, sammelt CSP-bezogene errors.
 * assertCspHeader: inspiziert Response-Header auf Content-Security-Policy.
 */
import type { Page, Response } from "@playwright/test"

type CspViolation = { text: string; location?: string }

export function collectCspViolations(page: Page): CspViolation[] {
  const violations: CspViolation[] = []
  page.on("console", (msg) => {
    if (msg.type() !== "error") return
    const text = msg.text()
    if (
      text.includes("Content Security Policy") ||
      text.includes("Content-Security-Policy") ||
      text.includes("Refused to execute inline script") ||
      text.includes("Refused to load") ||
      text.includes("violates the following")
    ) {
      violations.push({ text, location: msg.location().url })
    }
  })
  page.on("pageerror", (err) => {
    if (err.message.toLowerCase().includes("content security policy")) {
      violations.push({ text: err.message })
    }
  })
  return violations
}

export function assertCspHeader(
  response: Response | null,
  opts: { mode?: "enforced" | "report-only"; mustContain?: string[] } = {}
) {
  if (!response) throw new Error("assertCspHeader: response is null")
  const headers = response.headers()
  const headerKey =
    opts.mode === "report-only"
      ? "content-security-policy-report-only"
      : "content-security-policy"
  const value = headers[headerKey]
  if (!value) {
    throw new Error(
      `Missing ${headerKey} header. Got: ${Object.keys(headers).join(", ")}`
    )
  }
  for (const directive of opts.mustContain ?? []) {
    if (!value.includes(directive)) {
      throw new Error(
        `CSP header missing directive "${directive}". Got: ${value}`
      )
    }
  }
  return value
}
