---
phase: 20-navigation-landing-skeleton
plan: 02
subsystem: ui
tags: [navigation, header, footer, sections, motion, csp-nonce, a11y, playwright]

# Dependency graph
requires:
  - phase: 20-navigation-landing-skeleton
    plan: 01
    provides: "motion, shadcn dropdown-menu + sheet, Aceternity/MagicUI copy-ins, lighthouserc.json, landing.spec.ts skeleton, legacy sections deleted"
  - phase: 16-brand-system-foundation
    provides: "brand tokens (--accent, --bg-header, --text-on-header), Logo component, Radix colors"
  - phase: 13-auth-flow-audit
    provides: "CSP-with-nonce pattern (proxy.ts request-header nonce + force-dynamic)"
provides:
  - "Header with Tools/Community external links + Für Partner dropdown (base-ui Menu) + Über uns + Jetzt beitreten CTA"
  - "Header mobile Hamburger → Sheet overlay with staggered motion + Partner accordion"
  - "Theme toggle preserved in Header (D-20), existing SVG paths kept"
  - "Footer with 4-col grid: Logo+Tagline | Sitemap (5 links) | Legal (2 links) | Kontakt+LinkedIn"
  - "8 section stub files in components/sections/ with data-section attributes for DOM identification"
  - "home-client.tsx mounts all 8 sections in R1.2–R1.9 order wrapped in MotionConfig with request nonce"
  - "app/page.tsx reads x-nonce via await headers() (preserves force-dynamic + CSP nonce flow)"
  - "landing.spec.ts sessionStorage beforeEach hook for splash-skip (R1.1 tests now runnable locally)"
affects: [20-03, 20-04, 20-05, 20-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nav-Items as shared top-level const arrays (navLinks + partnerSubItems) — Desktop + Mobile consume the same source of truth"
    - "Dropdown structure: base-ui Menu requires Menu.Group wrapper around Menu.GroupLabel + Menu.Items (shadcn DropdownMenuGroup) — otherwise Error #31 prevents render"
    - "Sheet custom close: showCloseButton={false} + explicit SheetClose inside SheetHeader with aria-label (required to get localized 'Menü schließen' label)"
    - "Mobile-Nav stagger motion: useReducedMotion() guard; stagger = delay * index * 0.05 on motion.li"
    - "Server component reads request nonce: async page.tsx + await headers() → nonce prop → <MotionConfig nonce> on client boundary"
    - "Section stubs pattern: each stub is 'use client' named-function + <section data-section='...' aria-labelledby='...-stub-heading'> — Wave-3 plans fill the body without touching home-client.tsx or stub file structure"

key-files:
  created:
    - "apps/website/components/sections/hero-section.tsx"
    - "apps/website/components/sections/discrepancy-section.tsx"
    - "apps/website/components/sections/offering-section.tsx"
    - "apps/website/components/sections/tool-showcase-section.tsx"
    - "apps/website/components/sections/community-preview-section.tsx"
    - "apps/website/components/sections/audience-split-section.tsx"
    - "apps/website/components/sections/trust-section.tsx"
    - "apps/website/components/sections/final-cta-section.tsx"
  modified:
    - "apps/website/components/layout/header.tsx"
    - "apps/website/components/layout/footer.tsx"
    - "apps/website/components/home-client.tsx"
    - "apps/website/app/page.tsx"
    - "packages/e2e-tools/tests/landing.spec.ts"

key-decisions:
  - "Nav-Items as shared const arrays (navLinks + partnerSubItems) — avoids duplication between Desktop render and MobileNavList render. Plan-Verify grep for href='...' pattern does not match array-literal form, but functional DOM output is identical and verified via curl (8 unique data-sections, correct URLs)"
  - "LinkedIn icon as inline SVG (LinkedinIcon) instead of lucide-react import — lucide-react@1.8.0 does not export 'Linkedin' (brand icons landed in later versions). Self-contained, no dependency bump in this plan"
  - "Dropdown Close-Button override via showCloseButton={false} + manual SheetClose in SheetHeader — shadcn's built-in button hard-codes sr-only 'Close' text; overriding keeps German 'Menü schließen' label while staying in the base-ui Dialog a11y primitive"
  - "CSP test switched from networkidle to domcontentloaded + 500ms settle — Vercel Speed-Insights 404s locally prevent networkidle from ever firing"
  - "MotionConfig in home-client.tsx (client boundary) rather than app/layout.tsx — keeps Root-Layout server-side (no 'use client' break of layout convention); nonce flows server (page.tsx) → client (HomeClient) as a plain string prop"

patterns-established:
  - "Server-to-Client nonce bridge: async server pages read `(await headers()).get('x-nonce')` and pass the value as a plain prop to the top-level client component, which then wraps its tree in <MotionConfig nonce>. This works because `await headers()` is itself a dynamic-rendering trigger, reinforcing the force-dynamic directive in Root-Layout (no hidden static prerender that would strip the nonce)"
  - "Section-stub contract: each section file (a) starts with 'use client', (b) exports a named function matching the file base PascalCased, (c) renders a single <section> with data-section='kebab-case-name' and aria-labelledby pointing to a child heading. Wave-3 plans may replace the inner content freely but must preserve the outer <section> + data-section attribute for DOM order assertions"

requirements-completed: [R1.1, R1.10]

# Metrics
duration: 35min
completed: 2026-04-20
---

# Phase 20 Plan 02: Navigation + Layout Shell Summary

**Header umgebaut zu voller Top-Nav mit Tools/Community/Partner-Dropdown/Über uns/CTA + Mobile-Sheet-Overlay. Footer zu 4-Spalten-Grid mit Sitemap/Legal/Kontakt/LinkedIn erweitert. 8 Section-Stubs mit `data-section` Attributen in korrekter R1.2–R1.9 Reihenfolge in home-client.tsx gemountet, das ganze Tree in MotionConfig mit Request-Nonce gewrappt. R1.1 Playwright-Tests (Dropdown Click + Keyboard + Mobile-Nav) + CSP-Test: 4/4 grün gegen lokalen Prod.**

## Performance

- **Duration:** ~35 min (inkl. 3 Rule-1-Fixes: LinkedIn-Icon, Menu-Group-Context, Sheet-Close-Label)
- **Tasks:** 3/3
- **Files modified:** 5
- **Files created:** 8
- **Commits:** 3 (plus this SUMMARY commit)

## Task Commits

Each task was committed atomically on branch `feature/phase-20-landing-skeleton`:

1. **Task 1 — Header restructure with dropdown nav + mobile sheet** — `96d690c` (feat)
2. **Task 2 — Footer extended with sitemap + legal + contact + LinkedIn** — `c945a88` (feat)
3. **Task 3 — 8 section stubs + home-client wiring + page.tsx nonce** — `81d6ca4` (feat)

## Header Diff Highlights

**New structure:**
- `navLinks` + `partnerSubItems` + `aboutLink` as top-level `const` arrays (Single Source of Truth for Desktop + Mobile render paths)
- Desktop (md+): `Tools · Community · Für Partner ▾ · Über uns · [Jetzt beitreten]` with theme-toggle right-aligned
- Mobile (<md): Hamburger (lucide `Menu` icon, 44×44 tap target, `aria-label="Menü öffnen"`) → `<Sheet side="right">` overlay
- Mobile-Nav `MobileNavList` component:
  - `motion.li` per nav item with stagger (`delay = index * 0.05`, 200ms duration)
  - `useReducedMotion()` guard → animations skip when user opts out (D-06)
  - Partner as accordion: `<button aria-expanded aria-controls="mobile-partner-submenu">` toggles 3 sub-items
  - Custom close: `showCloseButton={false}` on SheetContent + explicit `<SheetClose aria-label="Menü schließen">` with lucide `X` icon in SheetHeader

**What was deleted:**
- Old `<a href="#signup">Beitreten</a>` (Plan 01 deleted `#signup` section, so the anchor was stale)
- Entire inline-render of CTA in single `<div>` — split into Desktop (visible md+) vs Mobile (inside Sheet)

**What was preserved (D-20):**
- `useTheme()` + theme-toggle button with identical sun/moon SVG paths from the old header
- Skip-Link, outer `<header>` classes, max-width container, nav aria-label="Hauptnavigation"

## Footer Sitemap

4 columns on desktop (md+), stacked on mobile:

| Col | Content |
|-----|---------|
| 1 | Logo (neon in dark / auto in light) + Tagline "Die KI-Community für Studierende im DACH-Raum." |
| 2 | Sitemap: Über uns (`/about`), Tools (extern), Community (extern), Für Partner (`/partner`), Jetzt beitreten (`/join`) |
| 3 | Rechtliches: Impressum (`/impressum`), Datenschutz (`/datenschutz`) |
| 4 | Kontakt: `admin@generation-ai.org` mailto + LinkedIn (inline SVG brand icon + external link) |

Bottom bar (border-t): `© 2026 Generation AI e.V. (i.G.). Alle Rechte vorbehalten.` + `Made with care in Berlin & Hamburg.`

Contact mail changed from `info@` → `admin@generation-ai.org` (matches plan spec and ImprovMX routing).

## Section-Stub Inventory

All 8 stubs live in `apps/website/components/sections/`:

| File | Export | `data-section` | Target Plan |
|------|--------|----------------|-------------|
| hero-section.tsx | HeroSection | `hero` | Plan 03 Task 1 |
| discrepancy-section.tsx | DiscrepancySection | `discrepancy` | Plan 03 Task 2 |
| offering-section.tsx | OfferingSection | `offering` | Plan 04 Task 1 |
| tool-showcase-section.tsx | ToolShowcaseSection | `tool-showcase` | Plan 04 Task 2 |
| community-preview-section.tsx | CommunityPreviewSection | `community-preview` | Plan 04 Task 3 |
| audience-split-section.tsx | AudienceSplitSection | `audience-split` | Plan 05 Task 1 |
| trust-section.tsx | TrustSection | `trust` | Plan 05 Task 2 |
| final-cta-section.tsx | FinalCTASection | `final-cta` | Plan 05 Task 3 |

Each stub: `'use client'` + named export + `<section aria-labelledby="*-stub-heading" data-section="*">` + single `<h2 id="*-stub-heading">` placeholder like `[Hero — Plan 03 Task 1]`. `min-h-[60vh]` so the scrolling skeleton looks like a real landing even without content. `border-b border-border` on 7/8 (final-cta omits the bottom border since footer follows).

## MotionConfig Wiring

**Nonce flow (server → client):**

```
proxy.ts (middleware)
  └→ request.headers.set("x-nonce", base64Uuid)
     └→ app/page.tsx (server component, async)
        └→ const nonce = (await headers()).get("x-nonce") ?? ""
           └→ <HomeClient nonce={nonce} />
              └→ home-client.tsx (client component)
                 └→ <MotionConfig nonce={nonce}>
                    └→ <Header /> + <main>{8 sections}</main> + <Footer />
```

`await headers()` in `page.tsx` simultaneously reads the nonce AND triggers dynamic rendering — the latter is required by LEARNINGS.md (CSP nonce + static prerender = black page). Root-Layout's `export const dynamic = "force-dynamic"` remains the primary guarantee; `await headers()` reinforces it at page level.

`app/layout.tsx` was NOT modified (frontmatter `files_modified` listed it defensively, but keeping Root-Layout server-side is cleaner and there's no need for MotionConfig to wrap the entire app — only the landing tree uses motion components).

## Playwright Results

Ran `E2E_BASE_URL=http://localhost:3000 playwright test landing.spec.ts -g "R1.1|CSP"` after the final commit against a fresh local prod build:

```
[1/4] R1.1 — Nav-Dropdown opens via keyboard (Enter) and closes via Escape
[2/4] R1.1 — Mobile-Nav: Hamburger opens overlay, X closes
[3/4] CSP — keine Console-Errors mit 'Content Security Policy' auf Landing
[4/4] R1.1 — Nav-Dropdown 'Für Partner' opens on click
4 passed (2.1s)
```

Other tests (R1.2/R1.5/R1.6/R1.8) intentionally fail — stubs don't yet contain the required DOM (hero CTA link, Beispiel-badges, `.animate-marquee`). These will pass as Wave-3 plans land content.

## Build Output

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

`/` stays `ƒ` (dynamic) — LEARNINGS.md CSP-gate respected.

## CSP Header Proof (local prod)

```
content-security-policy: default-src 'self'; script-src 'self' 'nonce-NjcxYjNkOTItYzY0YS00ZTUxLWEwZGYtZjRjZDM0YzQyYWI3' 'strict-dynamic' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; …
```

Nonce value is per-request fresh (different on every curl), confirming the proxy.ts request-header pattern still works end-to-end through the new MotionConfig integration.

## DOM Smoke (local prod)

```bash
curl -s http://localhost:3000 | grep -oE 'data-section="[a-z-]+"' | sort -u
```

Returns all 8 unique section identifiers:

```
data-section="audience-split"
data-section="community-preview"
data-section="discrepancy"
data-section="final-cta"
data-section="hero"
data-section="offering"
data-section="tool-showcase"
data-section="trust"
```

## Decisions Made

See frontmatter `key-decisions`. Notable:

- Nav-Items as shared constants (Single Source of Truth) rather than duplicating `<Link>` markup for Desktop + Mobile paths
- LinkedIn icon as inline SVG to avoid a lucide-react version bump (current 1.8.0 lacks `Linkedin` export)
- DropdownMenuGroup wrapper is required (not optional) for shadcn DropdownMenuLabel — base-ui Menu throws Error #31 without it
- CSP test uses `domcontentloaded` + 500ms settle instead of `networkidle` (Speed-Insights 404s hang networkidle locally)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] lucide-react@1.8.0 does not export `Linkedin` icon**
- **Found during:** Task 2 (Footer social link)
- **Issue:** Plan specified `import { Linkedin } from "lucide-react"`, but the installed version is too old — brand icons landed in later lucide-react releases. Build failed with `Export Linkedin doesn't exist in target module`.
- **Fix:** Inlined a minimal LinkedIn SVG brand glyph as a local `LinkedinIcon` React component inside footer.tsx. 24×24 viewBox, `fill="currentColor"`, semantically identical to the lucide icon.
- **Files modified:** apps/website/components/layout/footer.tsx
- **Verification:** Build green, LinkedIn glyph renders with correct color inheritance.
- **Committed in:** `c945a88` (Task 2 commit)

**2. [Rule 1 - Bug] base-ui Menu throws Error #31 — MenuGroupRootContext missing**
- **Found during:** Task 3 wave-verify (Playwright R1.1 Dropdown test)
- **Issue:** The shadcn DropdownMenuLabel component (which wraps `Menu.GroupLabel` from `@base-ui/react/menu`) requires a `Menu.Group` ancestor, exposed via `DropdownMenuGroup`. Without it, clicking the trigger fires a runtime error and the popup never mounts — dropdown appears broken from the user's perspective.
- **Fix:** Wrapped `DropdownMenuLabel` + the `.map()` of `DropdownMenuItem` inside `<DropdownMenuGroup>`, added `DropdownMenuGroup` to the imports list.
- **Files modified:** apps/website/components/layout/header.tsx
- **Verification:** Playwright R1.1 dropdown tests (click + keyboard) go from red to green.
- **Committed in:** `81d6ca4` (Task 3 commit)

**3. [Rule 1 - Bug] Two Close-Buttons in SheetContent broke strict-mode test locator**
- **Found during:** Task 3 wave-verify (Mobile-Nav Playwright test)
- **Issue:** Initial implementation kept the shadcn built-in Close button (renders sr-only text "Close") AND an additional sr-only `<SheetClose aria-label="Menü schließen">` for the German label. Playwright's `getByRole("button", { name: /Menü schließen|Close/i })` matched both → strict-mode violation.
- **Fix:** Disabled the built-in close (`showCloseButton={false}`), replaced with a single explicit `<SheetClose aria-label="Menü schließen">` positioned inside SheetHeader top-right with lucide `X` icon.
- **Files modified:** apps/website/components/layout/header.tsx (+ `X` icon import)
- **Verification:** Playwright Mobile-Nav test goes from red to green.
- **Committed in:** `81d6ca4` (Task 3 commit)

**4. [Rule 3 - Blocking] Terminal-Splash intercepts pointer events in Playwright**
- **Found during:** Task 3 wave-verify (first R1.1 run against fresh browser context)
- **Issue:** TerminalSplash uses `sessionStorage.getItem("terminal-splash-seen")` to skip on repeat visits. Every Playwright test opens a fresh context (no sessionStorage) so the splash always renders and intercepts the first click for ~1.5s of animation.
- **Fix:** Added `test.beforeEach` hook in landing.spec.ts that runs `page.addInitScript` to pre-seed sessionStorage with `"terminal-splash-seen": "true"` — mirrors the real returning-visitor experience.
- **Files modified:** packages/e2e-tools/tests/landing.spec.ts
- **Verification:** All 3 R1.1 tests proceed past the initial click without "element intercepts pointer events" errors.
- **Committed in:** `81d6ca4` (Task 3 commit)

**5. [Rule 3 - Blocking] CSP Playwright test hung on networkidle**
- **Found during:** Task 3 wave-verify
- **Issue:** The Plan-01 landing.spec.ts CSP test used `page.goto(..., { waitUntil: "networkidle" })`. Locally, Vercel Speed-Insights fires requests to `/_vercel/speed-insights/script.js` which return 404 in production mode (script is Vercel-only) — these requests prevent networkidle from ever firing in the 30s Playwright timeout.
- **Fix:** Changed `waitUntil` to `domcontentloaded` + explicit `waitForTimeout(500)`. CSP violations surface during initial script execution, well before networkidle would fire anyway.
- **Files modified:** packages/e2e-tools/tests/landing.spec.ts
- **Verification:** CSP test completes in ~2s, passes.
- **Committed in:** `81d6ca4` (Task 3 commit)

**Non-deviation flag:** The plan's frontmatter listed `apps/website/app/layout.tsx` in `files_modified` defensively. Root-Layout was NOT touched — MotionConfig lives inside the client boundary (HomeClient), not inside the server Root-Layout. This is a cleaner pattern (`'use client'` stays out of layout.tsx) and the plan explicitly acknowledged this as "pragmatisch: nonce in layout.tsx lesen, dann an einen ClientWrapper als prop reichen, ODER MotionConfig direkt in home-client.tsx einsetzen und nonce via Server-Action/headers vom Server-Page übergeben. EMPFEHLUNG: nonce in app/page.tsx (server) lesen, an HomeClient als prop übergeben, dort <MotionConfig nonce={nonce}> einbauen." — we took the recommended path.

---

**Total deviations:** 5 auto-fixed (3 Rule 1 — real bugs, 2 Rule 3 — blocking test infra). No Rule 4 escalations.
**Impact on plan:** All auto-fixes were necessary to make the plan's own verification pass (Playwright green + build green). No scope creep, no architectural changes.

## Issues Encountered

- lucide-react 1.8.0 pre-dates the social-brand-icons additions; future plans that want real brand icons (Instagram, X/Twitter, Discord) will need an upgrade. Not blocking Phase 20.
- The shadcn Sheet component requires `showCloseButton={false}` + a custom `SheetClose` if you need anything other than English "Close" sr-only text. This is known shadcn limitation. Plans 03-05 won't hit it (they don't modify the Sheet).

## User Setup Required

None. Purely code changes, all within `apps/website/` and `packages/e2e-tools/`.

## Known Stubs

The 8 section files are intentional scaffolding stubs — each renders a `[<Section Name> — Plan N Task M]` placeholder heading. This is tracked here so the Phase-20 verifier knows these are not oversights:

| File | Reason | Resolved by |
|------|--------|-------------|
| sections/hero-section.tsx | Wave-2 Boundary-Marker | Plan 03 Task 1 |
| sections/discrepancy-section.tsx | Wave-2 Boundary-Marker | Plan 03 Task 2 |
| sections/offering-section.tsx | Wave-2 Boundary-Marker | Plan 04 Task 1 |
| sections/tool-showcase-section.tsx | Wave-2 Boundary-Marker | Plan 04 Task 2 |
| sections/community-preview-section.tsx | Wave-2 Boundary-Marker | Plan 04 Task 3 |
| sections/audience-split-section.tsx | Wave-2 Boundary-Marker | Plan 05 Task 1 |
| sections/trust-section.tsx | Wave-2 Boundary-Marker | Plan 05 Task 2 |
| sections/final-cta-section.tsx | Wave-2 Boundary-Marker | Plan 05 Task 3 |

These are **by design** — the whole purpose of Plan 02 is to lock the Wave-3 boundary so Plans 03/04/05 can run in parallel without fighting over home-client.tsx or mount order.

## Threat Flags

None. All changes are client-side UI + a server component that only reads the request `x-nonce` header (pre-existing middleware-set value). No new network endpoints, auth paths, file access, schema changes, or data handling.

## Next Phase Readiness

**Ready for Plans 03/04/05 (Wave 3 — Sections):**
- All 8 section stubs have stable contracts: named export + `<section data-section="*">` wrapper. Wave-3 plans replace the inner content only.
- home-client.tsx does NOT need to be touched again in Phase 20 — mount order is locked, Section imports stable.
- MotionConfig is already wrapped around the tree — Wave-3 `motion.*` components will automatically pick up the nonce.
- Header + Footer are done — Wave-3 won't modify layout.
- R1.1 + CSP tests are green baseline; Wave-3 only needs to push R1.2/R1.5/R1.6/R1.8 from red → green as each section's content lands.

**Notes for Plan 03 (Hero + Discrepancy — two wow-peaks):**
- Keep the outer `<section data-section="hero">` / `<section data-section="discrepancy">` wrapper when replacing the stub body. The data-section attribute is how landing.spec.ts (and future DOM assertions) identify section order.
- Aurora-Background can mount directly inside the hero section — `--brand-aurora-*` CSS vars are already live (Plan 01).
- Number-Ticker needs the `useInView(ref, { once: true })` guard per RESEARCH §Pattern 4 — the 6 diskrepanz numbers are documented in RESEARCH §D-09.

**Notes for Plan 04 (Offering + Tool-Showcase + Community-Preview):**
- "Beispiel" badge styling uses `bg-brand-neon-3 text-brand-neon-12` (dark) / `bg-brand-red-3 text-brand-red-12` (light) per RESEARCH §D-11. Place at least 2 badges total so R1.6 assertion `badges.count() >= 2` holds.

**Notes for Plan 05 (Audience-Split + Trust + Final-CTA — third wow-peak):**
- Trust-Marquee must use `.animate-marquee` utility class so R1.8 reduced-motion assertion (`getComputedStyle(el).animationPlayState === "paused"`) works. The globals.css guard from Plan 01 is already wired to this class.
- Lamp Effect is at `components/ui/lamp.tsx` with brand-rebrand already applied; just import and use.

## Self-Check: PASSED

Verified files and commits exist on disk:

- `apps/website/components/sections/hero-section.tsx` — FOUND
- `apps/website/components/sections/discrepancy-section.tsx` — FOUND
- `apps/website/components/sections/offering-section.tsx` — FOUND
- `apps/website/components/sections/tool-showcase-section.tsx` — FOUND
- `apps/website/components/sections/community-preview-section.tsx` — FOUND
- `apps/website/components/sections/audience-split-section.tsx` — FOUND
- `apps/website/components/sections/trust-section.tsx` — FOUND
- `apps/website/components/sections/final-cta-section.tsx` — FOUND
- `apps/website/components/layout/header.tsx` — MODIFIED (239 insertions / 20 deletions)
- `apps/website/components/layout/footer.tsx` — MODIFIED (150 insertions / 25 deletions)
- `apps/website/components/home-client.tsx` — MODIFIED (MotionConfig + 8 section imports)
- `apps/website/app/page.tsx` — MODIFIED (async + await headers())
- `packages/e2e-tools/tests/landing.spec.ts` — MODIFIED (beforeEach splash-skip + CSP domcontentloaded)
- Commits `96d690c`, `c945a88`, `81d6ca4` — all FOUND in git log on `feature/phase-20-landing-skeleton`

---
*Phase: 20-navigation-landing-skeleton*
*Completed: 2026-04-20*
