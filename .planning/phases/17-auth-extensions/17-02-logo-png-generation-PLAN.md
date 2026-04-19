---
phase: 17-auth-extensions
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/public/brand/logos/logo-wide-red.png
  - apps/website/public/brand/logos/logo-wide-neon.png
  - packages/emails/scripts/generate-logo-pngs.ts
  - packages/emails/package.json
autonomous: true
requirements: [AUTH-EMAIL-03]
must_haves:
  truths:
    - "PNG versions of logo-wide-red and logo-wide-neon exist in apps/website/public/brand/logos/"
    - "PNGs are at 2x density (min-size 32px Retina = 64px tall, width proportional)"
    - "A reproducible script exists to regenerate the PNGs from the SVG source"
  artifacts:
    - path: "apps/website/public/brand/logos/logo-wide-red.png"
      provides: "Mail-safe Light-theme logo asset, hosted at https://generation-ai.org/brand/logos/logo-wide-red.png in prod"
    - path: "apps/website/public/brand/logos/logo-wide-neon.png"
      provides: "Mail-safe Dark-theme logo asset"
    - path: "packages/emails/scripts/generate-logo-pngs.ts"
      provides: "Reproducible regeneration script (sharp-based SVG→PNG)"
  key_links:
    - from: "packages/emails/src/components/BrandLogo.tsx"
      to: "https://generation-ai.org/brand/logos/logo-wide-red.png"
      via: "Hardcoded absolute URL in Img src"
      pattern: "logo-wide-red.png"
---

<objective>
Generate mail-safe PNG versions of the two logo variants used in email Layout (`logo-wide-red` for Light, `logo-wide-neon` for Dark) from the existing SVG sources in `brand/logos/`. Place them in `apps/website/public/brand/logos/` so they're served at `https://generation-ai.org/brand/logos/*.png` after deploy.

Purpose: Email clients (Gmail, Outlook) do not reliably render SVG. Without PNG versions, BrandLogo would fail in production mail. This plan produces the binary assets + a reproducible script.
Output: Two PNG files in website/public and a `generate-logo-pngs.ts` script.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@brand/DESIGN.md
@brand/tokens.json

<interfaces>
Source SVGs (from brand/logos/):
- brand/logos/logo-wide-red.svg
- brand/logos/logo-wide-neon.svg

Target PNG output:
- Height: 80px (2x the 40px display height used by BrandLogo for Retina crispness)
- Width: proportional (SVG has fixed aspect ratio — sharp handles this)
- Format: PNG with alpha transparency
- Placement: apps/website/public/brand/logos/ (public assets are served at /brand/logos/*)

Existing public brand dir: apps/website/public/brand/logos/ (already exists from Phase 16)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Write sharp-based SVG→PNG generation script</name>
  <files>packages/emails/scripts/generate-logo-pngs.ts, packages/emails/package.json</files>
  <read_first>
    - packages/emails/package.json (from 17-01 — need to add sharp devDep and a script)
    - brand/logos/logo-wide-red.svg (verify path + contents, confirm viewBox for aspect ratio)
    - brand/logos/logo-wide-neon.svg (same)
    - apps/website/public/brand/logos/ (list existing logos to confirm target dir exists and naming convention matches)
    - sharp API docs via context7: `mcp__context7__resolve-library-id` with "sharp", then `get-library-docs` for `.resize()` and `.png()` usage
  </read_first>
  <action>
    1. Add `"sharp": "^0.33.5"` to `packages/emails/package.json` devDependencies. Add npm script `"logos:generate": "tsx scripts/generate-logo-pngs.ts"`.
    2. Run `pnpm install` to pick up sharp.
    3. Create `packages/emails/scripts/generate-logo-pngs.ts`:
       ```ts
       import sharp from 'sharp';
       import { readFileSync } from 'node:fs';
       import { join } from 'node:path';

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

       run().catch((err) => { console.error(err); process.exit(1); });
       ```
    4. Do NOT run the script here — Task 2 executes it and verifies the output files.
  </action>
  <verify>
    <automated>grep -q '"sharp"' packages/emails/package.json && grep -q '"logos:generate"' packages/emails/package.json && test -f packages/emails/scripts/generate-logo-pngs.ts && pnpm -F @genai/emails exec tsc --noEmit</automated>
  </verify>
  <done>
    - sharp in devDependencies of @genai/emails
    - Script file exists and type-checks
    - npm script `logos:generate` registered
  </done>
  <acceptance_criteria>
    - grep `"sharp":` in packages/emails/package.json → matches
    - grep `"logos:generate":` in packages/emails/package.json → matches
    - grep `logo-wide-red.svg` AND `logo-wide-neon.svg` in scripts/generate-logo-pngs.ts → both match
    - grep `TARGET_HEIGHT = 80` in scripts/generate-logo-pngs.ts → matches
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
  </acceptance_criteria>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Run script and commit PNG assets</name>
  <files>apps/website/public/brand/logos/logo-wide-red.png, apps/website/public/brand/logos/logo-wide-neon.png</files>
  <read_first>
    - packages/emails/scripts/generate-logo-pngs.ts (from Task 1)
    - apps/website/public/brand/logos/ (verify dir exists)
  </read_first>
  <action>
    1. From repo root: `pnpm -F @genai/emails run logos:generate`. Script reads the two SVGs from `brand/logos/` and writes PNGs into `apps/website/public/brand/logos/`.
    2. Verify output files exist and have non-trivial size (>1KB each, likely 3-10KB).
    3. Use `file` command to confirm they're valid PNGs: `file apps/website/public/brand/logos/logo-wide-red.png` should output "PNG image data, ... 80 pixels" (approximate).
    4. Do NOT manually hand-edit the PNGs. If output is unsatisfactory, adjust the script in Task 1 and re-run.
  </action>
  <verify>
    <automated>test -f apps/website/public/brand/logos/logo-wide-red.png && test -f apps/website/public/brand/logos/logo-wide-neon.png && file apps/website/public/brand/logos/logo-wide-red.png | grep -q "PNG image data" && file apps/website/public/brand/logos/logo-wide-neon.png | grep -q "PNG image data" && [ $(stat -f%z apps/website/public/brand/logos/logo-wide-red.png 2>/dev/null || stat -c%s apps/website/public/brand/logos/logo-wide-red.png) -gt 1024 ]</automated>
  </verify>
  <done>
    - Both PNGs exist in website public dir
    - Both are valid PNG format per `file` command
    - Both have reasonable size (>1KB)
  </done>
  <acceptance_criteria>
    - `test -f apps/website/public/brand/logos/logo-wide-red.png` exits 0
    - `test -f apps/website/public/brand/logos/logo-wide-neon.png` exits 0
    - `file apps/website/public/brand/logos/logo-wide-red.png` output contains "PNG image data"
    - `file apps/website/public/brand/logos/logo-wide-neon.png` output contains "PNG image data"
    - Size of logo-wide-red.png > 1024 bytes
    - Height reported by `file` ≈ 80px (stdout should mention "80 x" or similar)
  </acceptance_criteria>
</task>

</tasks>

<verification>
- Both PNGs exist and are readable
- Script is reproducible (can be re-run after logo updates)
- No manual image editing — SVG source remains authoritative
</verification>

<success_criteria>
- [ ] logo-wide-red.png and logo-wide-neon.png in apps/website/public/brand/logos/
- [ ] Generation script works reproducibly (`pnpm -F @genai/emails run logos:generate`)
- [ ] URLs will resolve at https://generation-ai.org/brand/logos/logo-wide-red.png after website deploy
</success_criteria>

<output>
After completion, create `.planning/phases/17-auth-extensions/17-02-SUMMARY.md`
</output>
