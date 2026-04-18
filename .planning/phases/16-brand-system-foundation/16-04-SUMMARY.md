---
phase: 16
plan: 04
subsystem: apps/website
tags: [fonts, geist, logo, microcopy, brand-migration, focus-ring, umlauts]
dependency_graph:
  requires: [16-02, 16-03]
  provides: [Geist fonts active in website, Logo in header/footer, VOICE.md microcopy, focus-ring uses --text]
  affects: [apps/website]
tech_stack:
  added: []
  patterns: [geist/font next/font import, Logo colorway=auto context prop, VOICE.md canonical error strings]
key_files:
  created: []
  modified:
    - apps/website/app/layout.tsx
    - apps/website/app/globals.css
    - apps/website/components/layout/header.tsx
    - apps/website/components/layout/footer.tsx
    - apps/website/components/sections/signup.tsx
    - apps/website/lib/schema.ts
decisions:
  - "Inter + CascadiaCode localFont removed; GeistSans + GeistMono loaded via geist/font package (not next/font/google directly)"
  - "terminal-splash.tsx DEFERRED — square-variant logo not in asset drop; PNG + inline filter preserved as-is"
  - "network-grid/signal-grid JS CSS-var fallback hex (#CEFF32, #666666) left as-is — these are runtime token reads not hardcoded UI styles"
  - "schema.ts fuer→für treated as microcopy scope (user-facing structured data injected into HTML)"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-18T16:08:10Z"
  tasks_completed: 2
  files_modified: 6
---

# Phase 16 Plan 04: Website Migration Summary

Inter → Geist fonts, Logo component in header/footer, focus-ring using `--text` token, VOICE.md microcopy applied, umlauts restored in metadata and structured data.

## What Was Built

### Task 1 — Font Migration + Focus-Ring Fix

**`apps/website/app/layout.tsx`:**
- Removed `import { Inter } from "next/font/google"` and `import localFont from "next/font/local"`
- Removed `cascadiaCode` localFont block (was: `--font-mono`, `CascadiaCode.woff2`)
- Removed `inter` declaration (`--font-inter`, subset latin)
- Added `import { GeistSans } from "geist/font/sans"` + `import { GeistMono } from "geist/font/mono"`
- `<html>` className: `${inter.variable} ${cascadiaCode.variable}` → `${GeistSans.variable} ${GeistMono.variable}`
- `export const dynamic = "force-dynamic"` preserved (CSP nonce invariant)
- Metadata umlauts restored: `"Kuenstliche Intelligenz"` → `"Künstliche Intelligenz"`, all `"fuer"` → `"für"` in title/description/OG/Twitter fields

**`apps/website/app/globals.css`:**
- `@theme inline`: `--font-sans: var(--font-inter), system-ui, sans-serif` → `--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Added `--font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", Menlo, monospace`
- `:focus-visible` outline: `var(--accent)` → `var(--text)`, offset `3px` → `2px`
- Element-specific focus ring (button/a/input/select/textarea/[role=button]): `var(--accent)` → `var(--text)`, offset `3px` → `2px`

### Task 2 — Logo Swap + Microcopy + Hex Audit

**`apps/website/components/layout/header.tsx`:**
- Removed `import Image from "next/image"` (no longer needed)
- Added `import { Logo } from "@genai/ui"`
- `<Image src={theme==='dark' ? '/logos/generationai-blau-neon-transparent.png' : '/logos/generationai-pink-rot-transparent.png'} ... />` → `<Logo context="header" theme={theme} size="md" className="hover:opacity-90 transition-opacity" />`
- No filter/drop-shadow on Logo usage (brand/DESIGN.md §F enforced)

**`apps/website/components/layout/footer.tsx`:**
- Removed `import Image from "next/image"`
- Added `import { Logo } from "@genai/ui"`
- Theme-switched `<Image>` block → `<Logo context="footer" theme={theme} size="md" />`
- Added `aria-label="Generation AI - Startseite"` to wrapping Link (accessibility improvement)
- No filter/drop-shadow on Logo usage

**`apps/website/components/sections/signup.tsx` (microcopy):**

| Old string | New string (VOICE.md canonical) |
|------------|----------------------------------|
| `'Ein Fehler ist aufgetreten.'` (line 98, thrown error) | `"Ups, da ist was schiefgelaufen. Probier's nochmal!"` |
| `'Ein Fehler ist aufgetreten.'` (line 103, catch fallback) | `"Ups, da ist was schiefgelaufen. Probier's nochmal!"` |

**`apps/website/lib/schema.ts` (umlaut restore):**

| Old string | New string |
|------------|------------|
| `"Die erste kostenlose KI-Community fuer Studierende im DACH-Raum"` (×2) | `"Die erste kostenlose KI-Community für Studierende im DACH-Raum"` |

### Neutral Hex Audit

Grep run: `grep -rn "#[0-9a-fA-F]{3,6}" apps/website/components/ apps/website/app/ --include="*.tsx" --include="*.ts"` (excluding globals.css, test files)

**Findings:**

| File | Hex values | Disposition |
|------|-----------|-------------|
| `terminal-splash.tsx` | `#6c6c6c`, `#96d461`, `#3a3a3c`, `#78dce8`, `#a0a0a0`, `#c7c7c7`, `#1e1e1e`, `#ff5f57`, `#febc2e`, `#28c840`, `#e0e0e0`, `#4a4a4c` | **DEFERRED** — these are intentional terminal-emulator theme colors (macOS terminal window chrome, syntax highlighting, cursor). Replacing with Radix slate tokens would break the terminal aesthetic. Out-of-scope per CONTEXT.md. |
| `network-grid.tsx` | `#CEFF32` (fallback), `#666666` (fallback) | **Acceptable** — JS runtime reads of `--accent` and `--text-muted` CSS variables. Fallback only fires if CSS vars unavailable. Not inline UI styling. |
| `signal-grid.tsx` | `#CEFF32` (fallback), `#666666` (fallback) | Same as above. |
| `layout.tsx` | `#141414`, `#F6F6F6` | **Acceptable** — `themeColor` metadata values are brand BG tokens. Required as literal hex for `<meta name="theme-color">`. |
| `datenschutz/page.tsx` | Address strings containing numbers | **Not hex colors** — postal addresses, ignored. |

No neutral grey hardcodes (`#333`, `#666`, `#999`, `#EEE`) found outside terminal-splash.

## Deferred Items

### terminal-splash.tsx — Square Logo Swap (Post-Phase)

`apps/website/components/terminal-splash.tsx` renders a **220×220 square** PNG at line 408:
```tsx
<Image src="/logos/generationai-blau-neon-transparent.png" width={220} height={220} ... style={{ filter: 'contrast(1.2) saturate(1.1) drop-shadow(...)' }} />
```

**Blocked by:**
1. Square-variant logo assets not in designer asset drop (CONTEXT.md: "Square-Logo-Varianten nicht in Asset-Drop")
2. `<Logo variant="square">` not implemented in `packages/ui/` (Plan 03 only ships `variant="wide"`)

**Action needed:** Request square variant from designer → implement `<Logo variant="square">` in @genai/ui → swap in terminal-splash. The inline `filter: drop-shadow` on the current `<Image>` is intentional terminal-splash visual effect and should be removed when the Logo swap happens (per brand/DESIGN.md §F no filters on Logo component).

**File untouched in this plan** — only `files_modified` items were changed.

## Orphan Files (Do Not Delete — Plan 06 Cleanup)

| File | Status | Notes |
|------|--------|-------|
| `apps/website/app/fonts/CascadiaCode.woff2` | Orphan candidate | `localFont` import removed. File still on disk. Harmless. Plan 06 can delete after visual regression confirms no reference. |
| `apps/website/public/logos/generationai-pink-rot-transparent.png` | Orphan candidate | Was used in header + footer. Replaced by `<Logo />`. Still referenced by terminal-splash indirectly via the blau-neon variant. |
| `apps/website/public/logos/generationai-blau-neon-transparent.png` | **STILL IN USE** | Used by `terminal-splash.tsx` line 408. Do NOT delete. |

## CSP / Force-Dynamic Invariants

- `proxy.ts` — **untouched**
- `lib/csp.ts` — **untouched**
- `export const dynamic = "force-dynamic"` in `apps/website/app/layout.tsx` — **preserved**
- `next/font` via `geist` package self-hosts — no external font request at runtime, no CSP change needed

## Build Output Confirmation

```
pnpm --filter @genai/website build

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /api/auth/signup
├ ƒ /datenschutz
├ ƒ /impressum
├ ○ /robots.txt
└ ○ /sitemap.xml

ƒ Proxy (Middleware)
```

All user-facing routes: `ƒ` (dynamic). Static routes (`robots.txt`, `sitemap.xml`) are non-HTML, CSP-irrelevant. Exit 0.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Scope Notes

- `brand/VOICE.md` microcopy search found violations only in `signup.tsx` (error strings) and `schema.ts` + `layout.tsx` (umlaut). No other utility strings violated VOICE.md patterns. Marketing copy on landing page and legal pages left untouched per scope discipline.
- `"Bitte fülle alle Pflichtfelder aus."` in `signup.tsx` line 73 — left as-is. This is a form validation string; the VOICE.md canonical for empty required fields is `"Das Feld darf nicht leer sein."` but this message covers multiple fields simultaneously. Borderline case, left untouched to avoid changing form validation semantics.

## Known Stubs

None. All Logo usages are wired to the real `<Logo />` component with live SVG assets. Font variables are active via Geist. Microcopy replacements use canonical strings.

## Threat Flags

None. This plan modifies only presentation-layer files (fonts, component import swaps, string constants). No new network endpoints, auth paths, or trust boundary crossings.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `apps/website/app/layout.tsx` | FOUND |
| `apps/website/app/globals.css` | FOUND |
| `apps/website/components/layout/header.tsx` | FOUND |
| `apps/website/components/layout/footer.tsx` | FOUND |
| `apps/website/components/sections/signup.tsx` | FOUND |
| `apps/website/lib/schema.ts` | FOUND |
| `grep GeistSans apps/website/app/layout.tsx` | FOUND |
| `grep force-dynamic apps/website/app/layout.tsx` | FOUND |
| `grep var(--font-geist-sans) apps/website/app/globals.css` | FOUND |
| `grep "outline: 2px solid var(--text)" apps/website/app/globals.css` | FOUND (×2) |
| `grep 'import { Logo }' header.tsx` | FOUND |
| `grep 'import { Logo }' footer.tsx` | FOUND |
| `grep 'generationai-blau-neon' terminal-splash.tsx` | FOUND (preserved) |
| `pnpm --filter @genai/website build` | EXIT 0 |
| All user routes `ƒ` (dynamic) | CONFIRMED |
| Commit `7f98c99` (Task 1) | FOUND |
| Commit `ff6282c` (Task 2) | FOUND |
