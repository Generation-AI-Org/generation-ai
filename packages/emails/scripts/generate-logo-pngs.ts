import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM-safe __dirname — works regardless of package "type" field or tsx ESM mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, '..', '..', '..');
const SRC_DIR = join(REPO_ROOT, 'brand', 'logos');
const DEST_DIR = join(REPO_ROOT, 'apps', 'website', 'public', 'brand', 'logos');

const TARGETS = [
  { src: 'logo-wide-red.svg', dest: 'logo-wide-red.png' },
  { src: 'logo-wide-neon.svg', dest: 'logo-wide-neon.png' },
];

// SVG viewBox is 960x540 (16:9). BrandLogo displays at 170px wide (~96px tall).
// Rasterize at the SVG's native size with very high density — no downscaling,
// no sharpen filter needed. Result is as crisp as the vector allows.
// Image is loaded from a URL by mail clients, not inlined, so file size does
// not count toward Gmail's 102KB HTML clipping threshold.
const TARGET_HEIGHT = 540;

async function run() {
  for (const { src, dest } of TARGETS) {
    const svgBuffer = readFileSync(join(SRC_DIR, src));
    const outPath = join(DEST_DIR, dest);
    await sharp(svgBuffer, { density: 1536 })
      .resize({
        height: TARGET_HEIGHT,
        kernel: sharp.kernel.lanczos3,
        fastShrinkOnLoad: false,
      })
      .png({ compressionLevel: 9, palette: false })
      .toFile(outPath);
    console.log(`✓ ${src} → ${outPath}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
