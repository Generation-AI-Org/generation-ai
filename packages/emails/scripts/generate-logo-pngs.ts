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

const TARGET_HEIGHT = 80; // 2x for Retina; BrandLogo displays at 40px

async function run() {
  for (const { src, dest } of TARGETS) {
    const svgBuffer = readFileSync(join(SRC_DIR, src));
    const outPath = join(DEST_DIR, dest);
    await sharp(svgBuffer, { density: 384 }) // high density for crisp rasterization
      .resize({ height: TARGET_HEIGHT })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ ${src} → ${outPath}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
