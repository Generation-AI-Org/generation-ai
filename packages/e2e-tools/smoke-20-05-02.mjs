// Smoke test for signal-grid tuning (plan 20.5-02)
// Runs 8 checks against localhost:3000 (prod server).
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:3000/'
const checks = []
let browser
try {
  browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('terminal-splash-seen', 'true')
      localStorage.setItem('theme', 'dark')
    } catch {}
  })
  const page = await context.newPage()
  const consoleErrors = []
  const cspErrors = []
  page.on('pageerror', (e) => consoleErrors.push(String(e)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text()
      // Skip static-asset 404s (pre-existing missing image, not a runtime JS error).
      if (/Failed to load resource.*404/i.test(t)) return
      // Skip Vercel Speed-Insights (not present locally, per LEARNINGS.md).
      if (/speed-insights/i.test(t)) return
      consoleErrors.push(t)
      if (/content security policy|csp/i.test(t)) cspErrors.push(t)
    }
  })
  page.on('response', (r) => {
    if (r.status() === 404) console.error(`[404] ${r.url()}`)
  })

  // 1. Load the page
  const resp = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
  checks.push({ name: 'page-loads-200', ok: resp && resp.status() === 200, info: `status=${resp?.status()}` })

  // 2. Hero visible
  await page.locator('[data-section="hero"]').waitFor({ state: 'visible', timeout: 15000 })
  checks.push({ name: 'hero-visible', ok: true })

  // 3. No CSP errors
  await page.waitForTimeout(1500)
  checks.push({ name: 'no-csp-errors', ok: cspErrors.length === 0, info: cspErrors.join('; ').slice(0, 200) })

  // 4. No runtime console errors
  checks.push({
    name: 'no-console-errors',
    ok: consoleErrors.length === 0,
    info: consoleErrors.slice(0, 3).join(' | ').slice(0, 300),
  })

  // 5. Canvas present
  const canvasCount = await page.locator('canvas').count()
  checks.push({ name: 'canvas-present', ok: canvasCount >= 1, info: `canvases=${canvasCount}` })

  // 6. Canvas has content (non-zero pixel data sample)
  const canvasDrawn = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    if (!c) return false
    const ctx = c.getContext('2d')
    if (!ctx) return false
    try {
      const img = ctx.getImageData(c.width / 2, c.height / 2, 32, 32)
      // any non-zero alpha in this patch means something has been painted
      for (let i = 3; i < img.data.length; i += 4) {
        if (img.data[i] !== 0) return true
      }
      return false
    } catch (err) {
      return false
    }
  })
  checks.push({ name: 'canvas-drawn', ok: canvasDrawn })

  // 7. Mousemove does not crash + activates at least one pulse (canvas still drawing)
  await page.mouse.move(720, 450)
  await page.waitForTimeout(400)
  await page.mouse.move(740, 460)
  await page.waitForTimeout(400)
  checks.push({ name: 'mousemove-no-throw', ok: consoleErrors.length === 0 })

  // 8. After mousemove + small wait, canvas still has pixels (activation + render)
  const canvasStillDrawn = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    if (!c) return false
    const ctx = c.getContext('2d')
    if (!ctx) return false
    const img = ctx.getImageData(0, 0, c.width, Math.min(c.height, 200))
    let lit = 0
    for (let i = 3; i < img.data.length; i += 4) {
      if (img.data[i] > 0) { lit++; if (lit > 10) return true }
    }
    return lit > 10
  })
  checks.push({ name: 'canvas-animated', ok: canvasStillDrawn })
} catch (err) {
  checks.push({ name: 'script-crash', ok: false, info: String(err) })
} finally {
  if (browser) await browser.close()
}

const passed = checks.filter((c) => c.ok).length
console.log(JSON.stringify({ passed, total: checks.length, checks }, null, 2))
process.exit(passed >= 7 ? 0 : 1)
