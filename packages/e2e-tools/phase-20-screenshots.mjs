// Phase 20 Screenshot Gallery
// Generates PNG screenshots of the landing page for manual UAT.
// Run: node /tmp/phase-20-screenshots.mjs  (from within packages/e2e-tools workspace)

import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const BASE_URL = 'http://localhost:3030/'
const OUT_DIR = '/Users/lucaschweigmann/projects/generation-ai/.planning/phases/20-navigation-landing-skeleton/screenshots'

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 375, height: 812 }

const SECTIONS = [
  'hero',
  'discrepancy',
  'offering',
  'tool-showcase',
  'community-preview',
  'audience-split',
  'trust',
  'final-cta',
]

const results = { ok: [], failed: [] }

async function withContext({ viewport, theme = 'dark', reducedMotion = 'no-preference' }) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport,
    reducedMotion,
    deviceScaleFactor: 1,
    // Skip the terminal splash by pre-seeding sessionStorage + theme in localStorage.
    // We inject the init script here so it runs before any page script.
  })
  await context.addInitScript(
    ([themeArg]) => {
      try {
        sessionStorage.setItem('terminal-splash-seen', 'true')
      } catch {}
      try {
        localStorage.setItem('theme', themeArg)
      } catch {}
    },
    [theme],
  )
  const page = await context.newPage()
  return { browser, context, page }
}

async function goto(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  // Terminal splash is skipped via sessionStorage seed. Wait for the hero section
  // to be visible, plus a settle for Motion entrance animations to finish.
  await page.locator('[data-section="hero"]').waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function shot(page, file, opts = {}) {
  const path = resolve(OUT_DIR, file)
  try {
    await page.screenshot({ path, ...opts })
    results.ok.push(file)
    console.log(`  ✓ ${file}`)
  } catch (err) {
    results.failed.push({ file, error: err.message })
    console.error(`  ✗ ${file} — ${err.message}`)
  }
}

async function shotLocator(page, selector, file) {
  const path = resolve(OUT_DIR, file)
  try {
    const loc = page.locator(selector).first()
    await loc.waitFor({ state: 'visible', timeout: 5000 })
    await loc.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await loc.screenshot({ path })
    results.ok.push(file)
    console.log(`  ✓ ${file}`)
  } catch (err) {
    results.failed.push({ file, error: err.message })
    console.error(`  ✗ ${file} — ${err.message}`)
  }
}

async function scenarioDesktopDark() {
  console.log('\n[1] desktop-dark-full')
  const { browser, page } = await withContext({ viewport: DESKTOP, theme: 'dark' })
  try {
    await goto(page)
    await shot(page, 'desktop-dark-full.png', { fullPage: true })

    // Header + Footer crops
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)
    await shotLocator(page, 'header', 'header-desktop.png')

    // Section crops (dark desktop)
    for (const name of SECTIONS) {
      await shotLocator(page, `[data-section="${name}"]`, `section-${name}-desktop.png`)
    }

    await shotLocator(page, 'footer', 'footer-desktop.png')

    // Dropdown open
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)
    const dropdownTrigger = page.getByRole('button', { name: /Für Partner Untermenü öffnen/i })
    await dropdownTrigger.click()
    await page.waitForTimeout(400)
    await shot(page, 'dropdown-open.png', { clip: { x: 0, y: 0, width: DESKTOP.width, height: 400 } })
    // Close dropdown
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
  } finally {
    await browser.close()
  }
}

async function scenarioDesktopLight() {
  console.log('\n[2] desktop-light-full')
  const { browser, page } = await withContext({ viewport: DESKTOP, theme: 'light' })
  try {
    await goto(page)
    await shot(page, 'desktop-light-full.png', { fullPage: true })
  } finally {
    await browser.close()
  }
}

async function scenarioMobileDark() {
  console.log('\n[3] mobile-dark-full')
  const { browser, page } = await withContext({ viewport: MOBILE, theme: 'dark' })
  try {
    await goto(page)
    await shot(page, 'mobile-dark-full.png', { fullPage: true })

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)
    await shotLocator(page, 'header', 'header-mobile.png')
    await shotLocator(page, 'footer', 'footer-mobile.png')

    // Open hamburger sheet
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)
    const hamburger = page.getByRole('button', { name: /Menü öffnen/i })
    await hamburger.click()
    await page.waitForTimeout(500)
    await shot(page, 'mobile-sheet-open.png', { fullPage: false })
  } finally {
    await browser.close()
  }
}

async function scenarioMobileLight() {
  console.log('\n[4] mobile-light-full')
  const { browser, page } = await withContext({ viewport: MOBILE, theme: 'light' })
  try {
    await goto(page)
    await shot(page, 'mobile-light-full.png', { fullPage: true })
  } finally {
    await browser.close()
  }
}

async function scenarioReducedMotion() {
  console.log('\n[5] reduced-motion-dark')
  const { browser, page } = await withContext({
    viewport: DESKTOP,
    theme: 'dark',
    reducedMotion: 'reduce',
  })
  try {
    await goto(page)
    await shot(page, 'reduced-motion-dark.png', { fullPage: true })
  } finally {
    await browser.close()
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log(`Writing screenshots to: ${OUT_DIR}`)

  await scenarioDesktopDark()
  await scenarioDesktopLight()
  await scenarioMobileDark()
  await scenarioMobileLight()
  await scenarioReducedMotion()

  console.log('\n---')
  console.log(`✓ ${results.ok.length} ok, ✗ ${results.failed.length} failed`)
  if (results.failed.length) {
    for (const f of results.failed) console.log(`  - ${f.file}: ${f.error}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
