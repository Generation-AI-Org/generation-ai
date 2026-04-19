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

// Only the neon logo is shipped — emails always render on dark terminal chrome,
// so no red variant is needed.
const TARGETS = [{ src: 'logo-wide-neon.svg', dest: 'logo-wide-neon.png' }]

// SVG viewBox is 960x540 (16:9). BrandLogo displays at ~180px wide in emails.
// Rasterize at 2x native SVG size (1920x1080) for ~10x retina crispness.
const TARGET_WIDTH = 1920
const TARGET_HEIGHT = 1080

/**
 * CRT scanline overlay for the whole logo PNG. Flattens transparency to the
 * terminal content bg (#1c1c1c) first so the PNG merges seamlessly with the
 * surrounding terminal content area, then paints horizontal bands across the
 * entire image — bg and letters alike — for a consistent retro look.
 */
function buildScanlineSvg(w: number, h: number): Buffer {
  // Display size is ~180x101. For visible "every other row" scanlines at that
  // size, we need pitch ~2 display px = ~22 raster px at 1080 height.
  // Line thickness 8 raster px (≈0.75 display px) to survive downsampling.
  // Matches website terminal-splash: 1px line on 3px pitch, ~0.4 opacity.
  // In 1080px raster at ~10.7x display scale: pitch 11, thickness 4, slight
  // opacity bump (0.35) to survive Apple Mail / Gmail image recompression.
  const pitch = 11
  const thickness = 4
  const rows: string[] = []
  for (let y = 0; y < h; y += pitch) {
    rows.push(`<rect x="0" y="${y}" width="${w}" height="${thickness}" fill="black" fill-opacity="0.35"/>`)
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rows.join('')}</svg>`
  return Buffer.from(svg)
}

// Terminal content background — must match BrandLogo.tsx `contentBg`.
const TERMINAL_BG = { r: 28, g: 28, b: 28 } // #1c1c1c

async function run() {
  for (const { src, dest } of TARGETS) {
    const svgBuffer = readFileSync(join(SRC_DIR, src))
    const outPath = join(DEST_DIR, dest)
    const scanlines = buildScanlineSvg(TARGET_WIDTH, TARGET_HEIGHT)

    await sharp(svgBuffer, { density: 1152, limitInputPixels: false })
      .resize({
        height: TARGET_HEIGHT,
        kernel: sharp.kernel.lanczos3,
        fastShrinkOnLoad: false,
      })
      // Flatten transparency onto the terminal content bg so the PNG blends
      // seamlessly with the <td> it sits in — no visible rectangle around the logo.
      .flatten({ background: TERMINAL_BG })
      .composite([{ input: scanlines, blend: 'multiply' }])
      .png({ compressionLevel: 9, palette: false })
      .toFile(outPath)
    console.log(`✓ ${src} → ${outPath} (flattened to terminal bg + scanlines)`)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
