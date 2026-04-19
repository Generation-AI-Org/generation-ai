import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// ESM-safe __dirname — works regardless of package "type" field or tsx ESM mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const REPO_ROOT = join(__dirname, '..', '..', '..')
const SRC_DIR = join(REPO_ROOT, 'brand', 'logos')
const DEST_DIR = join(REPO_ROOT, 'apps', 'website', 'public', 'brand', 'logos')
const LOGO_SRC = 'logo-wide-neon.svg'
const LOGO_DEST = 'logo-wide-neon.png'
const TERMINAL_DEST = 'terminal-header.png'

// Logo raster at 2x native SVG size (1920x1080) for retina crispness
const LOGO_RASTER_W = 1920
const LOGO_RASTER_H = 1080

// Terminal header raster. 4x retina = 1120 wide.
// Height chosen so there's generous whitespace above + below the logo inside
// the content area (~140 raster px = ~35 display px each side).
const TERMINAL_W = 1120
const TERMINAL_H = 700
const TITLEBAR_H = 96
const CONTENT_H = TERMINAL_H - TITLEBAR_H // 604

// Logo placement inside terminal content area — centered with generous space.
const LOGO_W_IN_TERMINAL = 680
const LOGO_H_IN_TERMINAL = Math.round((LOGO_W_IN_TERMINAL * 540) / 960) // 382
const LOGO_X = Math.round((TERMINAL_W - LOGO_W_IN_TERMINAL) / 2) // 220
const LOGO_Y = TITLEBAR_H + Math.round((CONTENT_H - LOGO_H_IN_TERMINAL) / 2) // 96+141 = 237

const TERMINAL_BG = { r: 28, g: 28, b: 28 } // #1c1c1c

/**
 * CRT scanlines masked to logo alpha. Only paints on the letters.
 */
function buildScanlineSvg(w: number, h: number): Buffer {
  const pitch = 11
  const thickness = 4
  const rows: string[] = []
  for (let y = 0; y < h; y += pitch) {
    rows.push(`<rect x="0" y="${y}" width="${w}" height="${thickness}" fill="black" fill-opacity="0.35"/>`)
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rows.join('')}</svg>`
  return Buffer.from(svg)
}

/**
 * Full terminal-window SVG: rounded rect frame, dark title bar, 3 traffic-light
 * dots, centered "generation-ai — zsh" title, dark content area. Logo gets
 * composited on top later. Rendered as ONE PNG so Gmail/other mail clients
 * cannot invert or theme-shift individual parts.
 */
function buildTerminalChromeSvg(): Buffer {
  const radius = 20
  const titleBarBg = '#3a3a3a'
  const titleBarText = '#a0a0a0'
  const contentBg = '#1c1c1c'
  const borderColor = '#2a2a2a'
  const dotsY = Math.round(TITLEBAR_H / 2)
  const dotRadius = 16

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TERMINAL_W}" height="${TERMINAL_H}">
  <defs>
    <clipPath id="win">
      <rect x="0" y="0" width="${TERMINAL_W}" height="${TERMINAL_H}" rx="${radius}" ry="${radius}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#win)">
    <rect width="${TERMINAL_W}" height="${TERMINAL_H}" fill="${contentBg}"/>
    <rect x="0" y="0" width="${TERMINAL_W}" height="${TITLEBAR_H}" fill="${titleBarBg}"/>
    <line x1="0" y1="${TITLEBAR_H}" x2="${TERMINAL_W}" y2="${TITLEBAR_H}" stroke="${borderColor}" stroke-width="2"/>
    <circle cx="56" cy="${dotsY}" r="${dotRadius}" fill="#ff5f57"/>
    <circle cx="${56 + 40}" cy="${dotsY}" r="${dotRadius}" fill="#febc2e"/>
    <circle cx="${56 + 80}" cy="${dotsY}" r="${dotRadius}" fill="#28c840"/>
    <text x="${TERMINAL_W / 2}" y="${dotsY + 14}" text-anchor="middle"
          font-family="ui-monospace, 'Geist Mono', Menlo, monospace"
          font-size="36" fill="${titleBarText}" letter-spacing="1.2">generation-ai — zsh</text>
  </g>
  <rect x="1" y="1" width="${TERMINAL_W - 2}" height="${TERMINAL_H - 2}"
        rx="${radius}" ry="${radius}" fill="none" stroke="${borderColor}" stroke-width="2"/>
</svg>`
  return Buffer.from(svg)
}

async function buildLogoWithScanlines(): Promise<Buffer> {
  const svgBuffer = readFileSync(join(SRC_DIR, LOGO_SRC))
  const scanlines = buildScanlineSvg(LOGO_RASTER_W, LOGO_RASTER_H)

  const logoRaster = await sharp(svgBuffer, { density: 1152, limitInputPixels: false })
    .resize({ height: LOGO_RASTER_H, kernel: sharp.kernel.lanczos3, fastShrinkOnLoad: false })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()

  const maskedScanlines = await sharp(scanlines)
    .composite([{ input: logoRaster, blend: 'dest-in' }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()

  return await sharp(logoRaster)
    .composite([{ input: maskedScanlines, blend: 'over' }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
}

/**
 * CTA button as a PNG. Neon-outlined pill with neon mono text. Rendered as
 * an image because Gmail iOS "smart-invert" flips any colored fill to a
 * lighter shade and even dims pure neon text — mail clients don't invert images.
 *
 * Slug → label map is kept in one place below (buttons table in run()).
 */
async function buildButtonPng(label: string, outPath: string): Promise<void> {
  // Display target ~200x44 (pill height 44). 4x retina = 800x176.
  const W = 800
  const H = 176
  const strokeW = 6
  const r = H / 2 - strokeW / 2
  // Monospace font, bold, ~56px in raster (= 14px display)
  const fontSize = 56

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="${strokeW / 2}" y="${strokeW / 2}"
        width="${W - strokeW}" height="${H - strokeW}"
        rx="${r}" ry="${r}"
        fill="none" stroke="#CEFF32" stroke-width="${strokeW}"/>
  <text x="${W / 2}" y="${H / 2 + fontSize / 3}" text-anchor="middle"
        font-family="ui-monospace, 'Geist Mono', Menlo, Consolas, monospace"
        font-size="${fontSize}" font-weight="700" letter-spacing="1"
        fill="#CEFF32">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
</svg>`

  await sharp(Buffer.from(svg), { density: 288 })
    .resize({ width: W, height: H, fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outPath)
  console.log(`✓ ${outPath} — "${label}"`)
}

const BUTTONS: Array<{ slug: string; label: string }> = [
  { slug: 'confirm-signup', label: 'E-Mail bestätigen' },
  { slug: 'magic-link', label: 'Anmelden' },
  { slug: 'recovery', label: 'Passwort zurücksetzen' },
  { slug: 'email-change', label: 'Änderung bestätigen' },
  { slug: 'invite', label: 'Account anlegen' },
]

async function run() {
  // 1. Logo PNG (on terminal bg, letters striped) — still produced for any
  //    other uses, but the terminal-header.png below is the primary email asset.
  const logoWithScanlines = await buildLogoWithScanlines()
  await sharp(logoWithScanlines)
    .flatten({ background: TERMINAL_BG })
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(DEST_DIR, LOGO_DEST))
  console.log(`✓ ${LOGO_DEST} — standalone logo on terminal bg`)

  // 2. Terminal header PNG: full window chrome + logo composed in one image.
  const chrome = buildTerminalChromeSvg()
  const logoResized = await sharp(logoWithScanlines)
    .resize({
      width: LOGO_W_IN_TERMINAL,
      height: LOGO_H_IN_TERMINAL,
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
  await sharp(chrome)
    .composite([{ input: logoResized, top: LOGO_Y, left: LOGO_X }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(DEST_DIR, TERMINAL_DEST))
  console.log(`✓ ${TERMINAL_DEST} — complete terminal window with logo`)

  // 3. CTA button PNGs — one per template label. Gmail iOS cannot invert images.
  for (const { slug, label } of BUTTONS) {
    await buildButtonPng(label, join(DEST_DIR, `btn-${slug}.png`))
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
