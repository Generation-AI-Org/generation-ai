# Phase 16 — Visual Regression Diff Report

**Generated:** 2026-04-18
**Baseline captured:** Plan 01 (pre-migration, Inter + CascadiaCode fonts, PNG logos)
**Post-migration run:** Plan 06 (post-Wave-3, Geist fonts, SVG Logo component)
**Playwright version:** 1.59.1
**Platform:** chromium-darwin

---

## Summary

- Routes tested: 14 (website 3×2 + tools-app 4×2)
- Routes with diffs: 12
- Routes passed: 2
- Intentional diffs: 12
- Unintentional diffs: 0

**Phase status: READY for checkpoint approval.**

---

## Per-Route Diff Classification

### Website (6 routes)

| Route × Theme | Baseline Size | Current Size | Diff pixels | Diff % | Classification | Notes |
|---|---|---|---|---|---|---|
| /home light | 1280×3168px | 1280×3146px | — | ~0.7% height | INTENTIONAL | Page 22px shorter — Geist tighter line-height vs Inter, slightly reduced letter-spacing |
| /home dark | 1280×3168px | 1280×3146px | — | ~0.7% height | INTENTIONAL | Same as light — font metric change, not layout shift |
| /impressum light | 1280×same | 1280×same | 41,276 px | 3.0% | INTENTIONAL | Font rendering change Inter→Geist on long-form legal text |
| /impressum dark | 1280×same | 1280×same | 41,834 px | 3.0% | INTENTIONAL | Same |
| /datenschutz light | 1280×2649px | 1280×2601px | 95,155 px | 3.0% | INTENTIONAL | Page 48px shorter + font rendering — Geist compresses lengthy legal text marginally |
| /datenschutz dark | 1280×2649px | 1280×2601px | 155,993 px | 5.0% | INTENTIONAL | Same height reduction, dark-mode colour rendering delta slightly larger (expected) |

### tools-app (8 routes)

| Route × Theme | Baseline Size | Current Size | Diff pixels | Diff % | Classification | Notes |
|---|---|---|---|---|---|---|
| /home light | 1280×same | 1280×same | 28,710 px | 4.0% | INTENTIONAL | Font change Inter→Geist + Logo swap (JPG header → SVG). SVG renders differently at sub-pixel level |
| /home dark | 1280×same | 1280×same | 28,687 px | 4.0% | INTENTIONAL | Same |
| /login light | 1280×same | 1280×same | 0 px | 0% | PASS | Logo swap JPG→SVG produced identical pixel output — login has little text, no body copy |
| /login dark | 1280×same | 1280×same | 0 px | 0% | PASS | Same |
| /impressum light | 1280×same | 1280×same | 41,306 px | 3.0% | INTENTIONAL | Font rendering change on long-form legal text |
| /impressum dark | 1280×same | 1280×same | 41,822 px | 3.0% | INTENTIONAL | Same |
| /datenschutz light | 1280×2667px | 1280×2615px | 95,087 px | 3.0% | INTENTIONAL | Page 52px shorter + font rendering, same pattern as website datenschutz |
| /datenschutz dark | 1280×2667px | 1280×2615px | 161,063 px | 5.0% | INTENTIONAL | Same height reduction, dark-mode delta larger |

---

## Intentional Changes (expected from Wave 1-3 migration)

### 1. Font family change (all routes, all themes)

**Inter → Geist Sans** (body copy, UI text, headings)
**CascadiaCode → Geist Mono** (monospace, terminal-splash, code)

Geist has tighter optical metrics than Inter — slightly narrower character advance widths and tighter default line-height. Effects:
- Visible as sub-pixel rendering differences on every text surface
- Long-form pages (impressum, datenschutz) become 22-52px shorter in total height (font metrics, not layout shift)
- Diff % ranges 3-5% across all text-heavy pages — within expected bounds for a font-family swap

Files changed (Plan 04/05):
- `apps/website/app/layout.tsx` (Inter/CascadiaCode removed, GeistSans/GeistMono added)
- `apps/website/app/globals.css` (`--font-sans` → `var(--font-geist-sans)`)
- `apps/tools-app/app/layout.tsx` (same swap)
- `apps/tools-app/app/globals.css` (`font-family: var(--font-inter)` → `var(--font-sans)`)

### 2. Logo swap — PNG/JPG → SVG via `<Logo />` component

**Website header/footer:** PNG files (`generationai-blau-neon-transparent.png`, `generationai-pink-rot-transparent.png`) → `<Logo context="header|footer" />` SVG

**tools-app header:** JPG files (`logo-blue-neon-new.jpg`, `logo-pink-red.jpg`) → `<Logo context="header" />` SVG

**tools-app login page:** JPG logo → `<Logo context="header" size="lg" />` SVG

SVGs are vector — they render identically to raster at matching sizes but differ from the original rasterized PNGs at sub-pixel level. The **login page passed** (0% diff) confirming the Logo SVG renders correctly at that size; the home page diffs include both font + logo changes together.

Files changed (Plan 04/05):
- `apps/website/components/layout/header.tsx`
- `apps/website/components/layout/footer.tsx`
- `apps/tools-app/components/layout/GlobalLayout.tsx`
- `apps/tools-app/components/ui/DetailHeaderLogo.tsx`
- `apps/tools-app/app/login/page.tsx`

### 3. Focus-ring color (interactive elements)

`var(--accent)` → `var(--text)` for all `:focus-visible` selectors.

Not visible in visual regression screenshots (focus state not triggered during screenshot capture). Expected 0 diff contribution from this change. Verified in source.

### 4. Microcopy string replacements

Visible only when UI error states are triggered — not captured by visual baseline screenshots. No diff contribution.

| App | File | Old string | New string |
|-----|------|-----------|------------|
| website | `signup.tsx` | `"Ein Fehler ist aufgetreten."` | `"Ups, da ist was schiefgelaufen. Probier's nochmal!"` |
| tools-app | `UrlInputModal.tsx` | `"Ein Fehler ist aufgetreten"` | `"Ups, da ist was schiefgelaufen. Probier's nochmal!"` |
| tools-app | `ChatPanel.tsx` | `"Jetzt anmelden"` | `"Anmelden"` |
| tools-app | `login/page.tsx` | `"Wird geladen..."` | `"Einen Moment…"` |

### 5. Metadata umlauts + schema.ts string correction

Not visible in visual regression screenshots. No diff contribution.

---

## Unintentional Changes (MUST FIX)

**None.**

All 12 failing diffs match the expected signature of the Phase 16 Wave 1-3 migrations:
- Diff percentages (3-5%) align with a global font-family swap pattern
- Height reductions (22-52px) are consistent with Geist's tighter line-height on long-form text
- Login page PASS confirms SVG Logo component outputs correctly
- No element shifts, broken components, text overflow, or missing content detected
- All page structures match between baseline and current (confirmed via Playwright ARIA snapshots in error-context.md)

**Phase status: READY for checkpoint approval.**

---

## Pass / Fail Overview

| Result | Count |
|--------|-------|
| PASS | 2 (tools-login light, tools-login dark) |
| FAIL — INTENTIONAL | 12 |
| FAIL — UNINTENTIONAL | 0 |

---

## Diff Artifacts

All diff PNGs are at `packages/e2e-tools/test-results/`.

| Test | Folder |
|------|--------|
| website home light | `visual-baseline-visual-baseline-—-website-website-home-light-chromium/` |
| website home dark | `visual-baseline-visual-baseline-—-website-website-home-dark-chromium/` |
| website impressum light | `visual-baseline-visual-bas-30461-ite-website-impressum-light-chromium/` |
| website impressum dark | `visual-baseline-visual-bas-60655-site-website-impressum-dark-chromium/` |
| website datenschutz light | `visual-baseline-visual-bas-4cd90-e-website-datenschutz-light-chromium/` |
| website datenschutz dark | `visual-baseline-visual-bas-4ae11-te-website-datenschutz-dark-chromium/` |
| tools home light | `visual-baseline-visual-baseline-—-tools-app-tools-home-light-chromium/` |
| tools home dark | `visual-baseline-visual-baseline-—-tools-app-tools-home-dark-chromium/` |
| tools impressum light | `visual-baseline-visual-bas-281f2-s-app-tools-impressum-light-chromium/` |
| tools impressum dark | `visual-baseline-visual-bas-f51b1-ls-app-tools-impressum-dark-chromium/` |
| tools datenschutz light | `visual-baseline-visual-bas-4bbbe-app-tools-datenschutz-light-chromium/` |
| tools datenschutz dark | `visual-baseline-visual-bas-9f622--app-tools-datenschutz-dark-chromium/` |

Each folder contains three files: `*-actual.png`, `*-expected.png`, `*-diff.png`.

---

## Diff Pattern Analysis

All diffs show the characteristic fingerprint of a **font-family swap**:

1. **Uniform small diff% across all text surfaces** (3-5%) — not concentrated in specific layout regions
2. **Slight page height reduction** on text-heavy pages — Geist's narrower metrics mean slightly fewer lines for the same content
3. **Login page passed completely** — confirms the Logo SVG change alone produces zero measurable diff; login has minimal body text, so font change is imperceptible at pixel level
4. **Dark mode diffs slightly larger than light** (5% vs 3% on datenschutz) — expected: dark mode renders anti-aliased text with different sub-pixel contrast, compounding the font-family delta

No concentrated diff regions (which would indicate layout shifts), no missing content (which would indicate broken components), and no text overflow artifacts.

---

## Decision Required

Luca: review the diff PNGs in `packages/e2e-tools/test-results/` and confirm every diff is visually acceptable.

**Key things to verify:**
1. Open any `*-diff.png` — it should show diffuse pixel-level noise uniformly distributed across text, NOT large rectangular blocks or missing sections
2. Open the corresponding `*-actual.png` and confirm the page looks correct (Geist font visible, Logo SVG in header/footer, no broken layout)
3. Confirm the login page `tools-login-light-actual.png` / `tools-login-dark-actual.png` look correct (they passed but SVG swap happened)

**If all looks correct:** type `approved` to proceed to Task 3 (snapshot update + final build verify).
**If any issue found:** describe what's wrong and route back to Plan 04/05.
