---
phase: 20-navigation-landing-skeleton
plan: 01
subsystem: ui
tags: [motion, shadcn, aceternity, magicui, tailwind-v4, playwright, lighthouse-ci, csp]

# Dependency graph
requires:
  - phase: 16-brand-system-foundation
    provides: "Radix Colors + brand-{neon,blue,pink,red}-{1-12} scales, --bg/--text/--accent CSS vars"
  - phase: 13-auth-flow-audit
    provides: "CSP-with-nonce + force-dynamic pattern (proxy.ts, lib/csp.ts)"
provides:
  - "motion@^12 installed in @genai/website"
  - "shadcn dropdown-menu + sheet primitives (components/ui/)"
  - "Aceternity copy-ins: aurora-background, bento-grid, infinite-moving-cards, lamp"
  - "MagicUI copy-ins: number-ticker, marquee"
  - "cn() helper (apps/website/lib/utils.ts) — already existed, verified"
  - "Animation keyframes in globals.css: aurora + scroll + marquee + marquee-vertical"
  - "prefers-reduced-motion guard on all Phase-20 loop animations (D-06)"
  - "Brand Aurora CSS vars (--brand-aurora-{1..5}, theme-aware via .light)"
  - "lighthouserc.json at repo root (Performance/A11y/Best-Practices/SEO ≥0.9, CLS ≤0.1)"
  - "packages/e2e-tools/tests/landing.spec.ts skeleton (8 tests: R1.1×3 + R1.2 + R1.5 + R1.6 + R1.8 + CSP)"
  - "Legacy sections deleted (hero.tsx + features/target-audience/signup.tsx) — D-21"
  - "home-client.tsx cleaned (no section imports, ready for Wave-2 wiring)"
affects: [20-02, 20-03, 20-04, 20-05, 20-06]

# Tech tracking
tech-stack:
  added:
    - "motion@^12.38.0 (animation library)"
    - "@tabler/icons-react@^3.41.1 (auto-pulled as peer dep by shadcn lamp recipe)"
    - "@radix-ui/react-dropdown-menu + @radix-ui/react-dialog (via shadcn)"
  patterns:
    - "shadcn copy-in components live in apps/website/components/ui/ (NOT packages/ui/ which hosts @genai/ui Logo lib)"
    - "All Aceternity/MagicUI components use motion/react imports, never framer-motion"
    - "Brand-token rebrand required per copy-in: neutral/cyan/purple/violet/fuchsia/indigo mapped to brand-{neon,blue,pink,red} or --bg/--text/--border vars"
    - "Animation keyframes live in globals.css under @theme inline { --animate-* } + top-level @keyframes blocks (Tailwind v4 pattern)"
    - "Reduced-motion guard via @media (prefers-reduced-motion: reduce) with !important animation-play-state: paused"

key-files:
  created:
    - "apps/website/components/ui/dropdown-menu.tsx"
    - "apps/website/components/ui/sheet.tsx"
    - "apps/website/components/ui/aurora-background.tsx"
    - "apps/website/components/ui/bento-grid.tsx"
    - "apps/website/components/ui/infinite-moving-cards.tsx"
    - "apps/website/components/ui/lamp.tsx"
    - "apps/website/components/ui/number-ticker.tsx"
    - "apps/website/components/ui/marquee.tsx"
    - "lighthouserc.json"
    - "packages/e2e-tools/tests/landing.spec.ts"
  modified:
    - "apps/website/package.json (+motion, +@tabler/icons-react, +@radix-ui deps)"
    - "pnpm-lock.yaml"
    - "apps/website/app/globals.css (+aurora/scroll keyframes, +reduced-motion guard, +brand-aurora CSS vars, +marquee keyframes by MagicUI CLI)"
    - "apps/website/components/home-client.tsx (removed 4 legacy section imports)"
  deleted:
    - "apps/website/components/hero.tsx"
    - "apps/website/components/sections/features.tsx"
    - "apps/website/components/sections/target-audience.tsx"
    - "apps/website/components/sections/signup.tsx"

key-decisions:
  - "Aurora brand-rebrand via CSS custom props (--brand-aurora-1..5 in :root + .light) instead of two stacked dark:/light: layers — single layer follows theme switch via CSS vars, simpler markup"
  - "Kept existing apps/website/lib/utils.ts cn() helper (already present from earlier setup) — no rewrite needed"
  - "Sheet install skipped button.tsx overwrite (kept existing custom button with SignalGrid integration)"
  - "Used URL-fallback for MagicUI (pnpm dlx shadcn@latest add https://magicui.design/r/{name}.json) — @magicui/ registry alias would have required components.json edit"
  - "Accepted @tabler/icons-react as auto-added peer dep from Aceternity bento-grid CLI install (Rule 2: missing dep = critical, auto-install OK)"

patterns-established:
  - "Phase-20 animation layer: all loop animations (aurora, scroll, marquee, marquee-vertical) use CSS @keyframes in globals.css + --animate-* vars in @theme inline block. Reduced-motion guard targets .animate-* utility classes."
  - "Brand Aurora theme-awareness: single Aurora layer reads --brand-aurora-{1..5} which is overridden by .light class on <html> — no JS theme detection, no dual layers."
  - "Landing E2E tests live in packages/e2e-tools/tests/landing.spec.ts with LANDING_URL from E2E_BASE_URL env (default http://localhost:3000), mirrors existing smoke.spec.ts pattern."

requirements-completed: [R1.1, R1.2, R1.3, R1.5, R1.8]

# Metrics
duration: 6min
completed: 2026-04-20
---

# Phase 20 Plan 01: Stack-Setup + Component Copy-in + Legacy Teardown Summary

**Motion 12 + shadcn primitives + 6 Aceternity/MagicUI components copied-in with brand-token rebrand, animation keyframes + reduced-motion guard in globals.css, lighthouserc.json + landing.spec.ts skeleton, 4 legacy sections deleted. Foundation for Phase 20 Waves 2-3 ready.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-19T23:03:06Z
- **Completed:** 2026-04-19T23:09:11Z
- **Tasks:** 3/3
- **Files modified:** 4
- **Files created:** 10
- **Files deleted:** 4

## Accomplishments

- motion@^12 installed, shadcn dropdown-menu + sheet available under `@/components/ui`
- 6 Aceternity/MagicUI components copied-in and fully brand-rebranded (zero cyan/purple/violet/fuchsia/indigo classes remain in `components/ui/`)
- All motion imports use `motion/react` (framer-motion ist nicht installiert und wird nicht installiert — nur noch 1 Treffer in einem Kommentar)
- globals.css extended with @keyframes aurora / scroll / marquee / marquee-vertical + brand-aurora CSS vars + reduced-motion guard
- lighthouserc.json at repo root with ≥0.9 thresholds for all four Lighthouse categories + CLS ≤0.1
- packages/e2e-tools/tests/landing.spec.ts skeleton with 8 tests (parses via `playwright test --list`)
- All 4 legacy sections (D-21) deleted; home-client.tsx compiles without Section-Imports
- Build green, `/` route stays `ƒ` (dynamic) — LEARNINGS.md CSP-gate respected

## Task Commits

Each task was committed atomically on branch `feature/phase-20-landing-skeleton`:

1. **Task 1: Install motion + shadcn primitives + cn-helper** — `27a645d` (feat)
2. **Task 2: Copy-in Aceternity + MagicUI components with brand rebrand** — `5c9e9ee` (feat)
3. **Task 3: Delete legacy sections + lighthouserc.json + landing.spec.ts** — `6a52f21` (feat)

_(Final metadata commit follows this SUMMARY.)_

## Installed Packages + Versions

| Package                             | Version    | Source         | Purpose                                       |
| ----------------------------------- | ---------- | -------------- | --------------------------------------------- |
| motion                              | ^12.38.0   | npm            | Animation (D-01)                              |
| @tabler/icons-react                 | ^3.41.1    | npm (auto)     | Peer dep of shadcn lamp recipe                |
| @radix-ui/react-dropdown-menu       | (shadcn)   | npm (auto)     | Peer dep of shadcn dropdown-menu              |
| @radix-ui/react-dialog              | (shadcn)   | npm (auto)     | Peer dep of shadcn sheet                      |

## Copied Components + URL Sources

| Component                           | Source URL                                                                   | Token Rebrand                                                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ui/dropdown-menu.tsx                | shadcn/ui (dropdown-menu)                                                    | none (neutral defaults match --color-primary mapping)                                                                                        |
| ui/sheet.tsx                        | shadcn/ui (sheet)                                                            | none                                                                                                                                         |
| ui/aurora-background.tsx            | https://ui.aceternity.com/components/aurora-background                        | blue-400/indigo-300/violet-200/blue-300/blue-500 → `--brand-aurora-1..5` (theme-aware via .light), bg-zinc-900/50 → `bg-bg`                  |
| ui/bento-grid.tsx                   | https://ui.aceternity.com/components/bento-grid                               | neutral-200/white/black → `bg-bg-card` + `border-border`, hover → `hover:border-brand-neon-6` + neon-glow shadow                             |
| ui/infinite-moving-cards.tsx        | https://ui.aceternity.com/components/infinite-moving-cards                    | zinc-200/700 + gradient bgs → `bg-bg-card` + `border-border`; neutral-500/gray-400 → `text-text-muted`; renamed CSS var to `--scroll-duration` |
| ui/lamp.tsx                         | https://ui.aceternity.com/components/lamp-effect                              | cyan-400/500 → `brand-neon-8/9`, slate-950 → `bg-bg`, slate-300/500 text gradient → `from-text to-text-muted`, bg-cyan-500 blur → `bg-brand-blue-5/60` |
| ui/number-ticker.tsx                | https://magicui.design/docs/components/number-ticker                          | text-black/dark:text-white → `text-text`                                                                                                     |
| ui/marquee.tsx                      | https://magicui.design/docs/components/marquee                                | no color tokens to rewrite (semantic-only); CLI auto-added marquee keyframes to globals.css                                                  |

## globals.css Additions

- New `@theme inline` block with `--animate-aurora` + `--animate-scroll`
- New `@keyframes aurora` (background-position shift 60s)
- New `@keyframes scroll` (translate -50% for Aceternity Infinite Moving Cards)
- `--brand-aurora-{1..5}` CSS vars on `:root` (dark-mode default: brand-blue + brand-neon)
- `.light` override for same vars (brand-pink + brand-red)
- New `@media (prefers-reduced-motion: reduce)` block pausing `.animate-aurora`, `.animate-scroll`, `.animate-marquee`, `.animate-marquee-vertical`
- `--animate-marquee` + `--animate-marquee-vertical` + marquee keyframes added automatically by MagicUI CLI

## Build Output (proof / ƒ)

```
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

## CSP Smoke (lokaler Prod-Check)

```
content-security-policy: default-src 'self'; script-src 'self' 'nonce-OTkzZGJlZGItM2YzOS00ZWIyLWJkNTMtYmZiN2M1ZTBiNmFh' 'strict-dynamic' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' https://wbohulnuwqrhystaamjc.supabase.co wss://wbohulnuwqrhystaamjc.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

Header contains `nonce-…` — CSP intact after new components added.

## Playwright `--list` Proof

```
Total: 8 tests in 1 file
```

8 tests in landing.spec.ts parse without errors (tests themselves will fail until Plans 02-05 wire Header/sections — expected).

## Decisions Made

See frontmatter `key-decisions`. Notable:

- Accepted `@tabler/icons-react` auto-install from Aceternity bento-grid CLI (Rule 2 — missing dep needed by recipe; single lightweight icon package)
- Skipped button.tsx overwrite when installing sheet (existing custom button.tsx has SignalGrid integration worth preserving)
- Used URL-direct install for MagicUI (`https://magicui.design/r/{name}.json`) instead of registry alias

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `@tabler/icons-react` auto-added by shadcn bento-grid recipe**
- **Found during:** Task 2 (Aceternity Bento Grid install via shadcn CLI)
- **Issue:** shadcn CLI pulled `@tabler/icons-react@^3.41.1` as a declared dependency of the bento-grid recipe. Not listed in plan.
- **Fix:** Accepted the auto-install — it's a peer dependency of the copy-in. No additional action needed; the package lands in apps/website/package.json.
- **Files modified:** apps/website/package.json, pnpm-lock.yaml
- **Verification:** Build grün, no import errors.
- **Committed in:** `5c9e9ee` (Task 2 commit)

**2. [Rule 2 - Missing Critical] MagicUI CLI registry alias not configured in components.json**
- **Found during:** Task 2 (MagicUI number-ticker + marquee install)
- **Issue:** Plan suggested `pnpm dlx shadcn@latest add @magicui/number-ticker` but `components.json` only has `@aceternity` registry. Attempting `@magicui/...` would fail.
- **Fix:** Used URL-direct fallback per plan Section Task 2 Step 5 (`pnpm dlx shadcn@latest add "https://magicui.design/r/number-ticker.json"`). Same for marquee.
- **Files modified:** apps/website/components/ui/number-ticker.tsx, apps/website/components/ui/marquee.tsx, apps/website/app/globals.css (marquee keyframes auto-added)
- **Verification:** Both files parse, marquee keyframes present in globals.css.
- **Committed in:** `5c9e9ee` (Task 2 commit)

**3. [Rule 1 - Bug] `cn()` helper already existed at apps/website/lib/utils.ts**
- **Found during:** Task 1 (cn-helper creation)
- **Issue:** Plan Task 1 Step 2 assumed cn-helper was missing. It was already present from earlier brand-system setup and matched the plan's expected content exactly.
- **Fix:** No action — verified content matched, left file untouched.
- **Files modified:** (none)
- **Verification:** `grep -q twMerge apps/website/lib/utils.ts` returns 0.
- **Committed in:** N/A (no change needed)

**4. [Rule 2 - Missing Critical] `--brand-aurora-{1..5}` CSS vars defined in globals.css, not tailwind base.css**
- **Found during:** Task 2 (Aurora brand rebrand)
- **Issue:** Aurora component references `--brand-aurora-{1..5}` custom vars that weren't defined anywhere. Without this, Aurora would render transparent.
- **Fix:** Added `:root { --brand-aurora-1..5 }` and `.light { --brand-aurora-1..5 }` overrides to globals.css. Dark default = brand-blue + brand-neon swirl (fallback hex if brand var missing); light = brand-pink + brand-red.
- **Files modified:** apps/website/app/globals.css
- **Verification:** Build green, visual inspection deferred to Wave 2 where Aurora mounts in Hero.
- **Committed in:** `5c9e9ee` (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (1 Rule 1, 2 Rule 2, 1 Rule 3)
**Impact on plan:** All auto-fixes were minor adaptations required by the actual repo state vs. plan assumptions. No scope creep, no architectural changes.

## Issues Encountered

- `pnpm dlx shadcn@latest add sheet --yes` prompted interactively to overwrite existing `button.tsx`. Solved by piping `n\n` to stdin — shadcn accepted the skip and continued with sheet.
- During Aurora rebrand, the upstream Aceternity layout stacked dark/light swirls with `dark:` prefixes assuming no `.light` class. Our Tailwind setup uses `.light` on `<html>` (Phase 16 pattern), so I swapped to a single CSS-var-driven gradient that inverts per theme via `.light` overrides — simpler and mirrors the existing theme convention.

## User Setup Required

None — purely code changes. `pnpm install` will pull the new deps automatically on next checkout.

## Known Stubs

None introduced in this plan. The home-client `<main>` body intentionally contains TODO comments pointing to Wave 2/3 — these will be wired in Plans 02-05.

## Threat Flags

None. All changes are client-side UI components + build config. No new network endpoints, auth paths, file access, or schema changes.

## Next Phase Readiness

**Ready for Plan 02 (Wave 2 — Navigation):**
- motion, shadcn dropdown-menu, shadcn sheet available
- Animation infrastructure (keyframes + reduced-motion guard) in place
- Clean home-client.tsx ready for Header/Footer upgrade + section wiring

**Ready for Plans 03-05 (Wave 3 — Sections):**
- All 6 Aceternity/MagicUI components available under `@/components/ui/*` with brand rebrand
- No further install work needed

**Notes for Plan 02:**
- `--brand-aurora-*` vars are active in `:root` and `.light` — when Hero mounts Aurora, it should just work theme-aware
- `.animate-scroll` utility works but requires each instance to set `--scroll-duration` inline (already handled by infinite-moving-cards copy-in)
- Reduced-motion guard targets `.animate-marquee`, `.animate-marquee-vertical`, `.animate-aurora`, `.animate-scroll` — any new Phase 20 loop animations should use these utility class names for automatic pause behavior

## Self-Check: PASSED

Verified files and commits exist on disk:

- `apps/website/components/ui/dropdown-menu.tsx` — FOUND
- `apps/website/components/ui/sheet.tsx` — FOUND
- `apps/website/components/ui/aurora-background.tsx` — FOUND
- `apps/website/components/ui/bento-grid.tsx` — FOUND
- `apps/website/components/ui/infinite-moving-cards.tsx` — FOUND
- `apps/website/components/ui/lamp.tsx` — FOUND
- `apps/website/components/ui/number-ticker.tsx` — FOUND
- `apps/website/components/ui/marquee.tsx` — FOUND
- `lighthouserc.json` — FOUND
- `packages/e2e-tools/tests/landing.spec.ts` — FOUND
- `apps/website/components/hero.tsx` — CORRECTLY DELETED
- `apps/website/components/sections/features.tsx` — CORRECTLY DELETED
- `apps/website/components/sections/target-audience.tsx` — CORRECTLY DELETED
- `apps/website/components/sections/signup.tsx` — CORRECTLY DELETED
- Commits: `27a645d`, `5c9e9ee`, `6a52f21` — all FOUND in git log

---
*Phase: 20-navigation-landing-skeleton*
*Completed: 2026-04-20*
