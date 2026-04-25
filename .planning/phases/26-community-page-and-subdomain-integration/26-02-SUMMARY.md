---
phase: 26
plan: 02
subsystem: website / community-page
tags:
  - community
  - landing
  - mdx
  - bento-grid
  - carousel
  - seo
requires:
  - 26-01 (lib/mdx + content/community fixtures)
provides:
  - "/community route (server-rendered, force-dynamic via root layout)"
  - "CommunityHero — LabeledNodes BG + max-w-4xl + --fs-display, external Direkt-zu-Circle CTA"
  - "PillarsGrid — 2x2 BentoGrid (Users / BookOpen / Newspaper / Lock)"
  - "ArticlesCarousel — CSS scroll-snap, KI-News badge on kind=ki-news"
  - "CommunityFinalCta — internal Link → /join"
affects:
  - "Header navigation /community link target (Plan 26-06 wires header link, this plan provides destination)"
tech-stack:
  added: []
  patterns:
    - "Subpage Hero pattern (LabeledNodes + max-w-4xl + --fs-display) — Memory hero_pattern_subpages"
    - "BentoGrid reuse for Pillar grid (D-12)"
    - "CSS scroll-snap-x for carousel (Tailwind v4 builtin, no Embla)"
    - "Server-Component page → Client-wrapper (MotionConfig nonce) — analog home-client"
key-files:
  created:
    - "apps/website/app/community/page.tsx"
    - "apps/website/app/community/community-client.tsx"
    - "apps/website/app/community/components/community-hero.tsx"
    - "apps/website/app/community/components/pillars-grid.tsx"
    - "apps/website/app/community/components/articles-carousel.tsx"
    - "apps/website/app/community/components/community-final-cta.tsx"
    - ".changeset/phase-26-community-page.md"
  modified: []
decisions:
  - "Followed PLAN.md path layout (apps/website/app/community/components/) over the orchestrator prompt's alternative path (apps/website/components/sections/community/) — PLAN.md is source of truth and matches the artifacts contract in frontmatter."
  - "Section header for the carousel kept inline in articles-carousel.tsx (not a separate community-articles-section.tsx) per Plan Task 1 step 2 explicit guidance to minimize file count."
  - "Task 1 commit intentionally did NOT wire ArticlesCarousel into community-client.tsx — kept the component-list of Task 1 strictly to the 5 artifacts named in PLAN.md. Carousel was wired in Task 2's commit."
  - "Final-CTA button styling matches `final-cta-section.tsx` filled-accent pattern (rounded-full px-6 py-3, font-mono, ArrowRight icon) — copy-paste of established button shape, no new variant introduced."
metrics:
  completed: 2026-04-25
  duration: ~25 minutes (autonomous, no human checkpoints — Yolo mode)
  tasks_completed: 3 (T1 + T2 implementation + T3 automated smoke verification)
  files_created: 7
  files_modified: 0
  commits: 2
---

# Phase 26 Plan 02: /community Landing Page Summary

`/community` SEO-Landing + Member-Gateway with Hero, 4-Pillar Bento-Grid, Article-Carousel reading real MDX from `getAllArticles()` (Plan 26-01), and Final-CTA → `/join`.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | page shell + Hero + Pillars + Final-CTA + changeset | `b49a596` | page.tsx, community-client.tsx, community-hero.tsx, pillars-grid.tsx, community-final-cta.tsx, .changeset/phase-26-community-page.md |
| 2 | articles-carousel + wire into community-client | `1685c0c` | articles-carousel.tsx, community-client.tsx |
| 3 | Visual checkpoint (automated smoke in Yolo-Mode) | — | (no file changes) |

## Implementation Notes

### Server / Client Split
- `app/community/page.tsx` — Server Component. Reads `x-nonce` (CSP) and calls `getAllArticles()` build-time. Exports `metadata` (title/description/canonical/OG).
- `community-client.tsx` — `'use client'` wrapper. Hosts `<MotionConfig nonce={nonce}>`, `<Header />`, the four sections, `<Footer />`. Pattern is identical to `home-client.tsx`.
- `community-hero.tsx` and `articles-carousel.tsx` are `'use client'` (motion / scroll respectively). `pillars-grid.tsx` and `community-final-cta.tsx` are Server Components — no interactivity needed.

### Hero Pattern
LabeledNodes BG + `max-w-4xl` content container + `font-size: var(--fs-display)` H1 with class fallback `text-4xl sm:text-5xl md:text-6xl`. Uses `min-h-[calc(80vh-5rem)]` (slightly shorter than home hero's `100vh` — subpage feel per Memory `hero_pattern_subpages`).

### Pillars (D-12)
Reused existing `BentoGrid` + `BentoGridItem` from `@/components/ui/bento-grid`. 2x2 layout via `md:grid-cols-2 md:auto-rows-[14rem]`. Lucide-Icons (`Users` / `BookOpen` / `Newspaper` / `Lock`) styled `h-5 w-5 text-[var(--accent)]` with `aria-hidden`. German copy from CONTEXT.md scope.

### Carousel (D-02 + D-04)
CSS scroll-snap-x (Tailwind v4 builtin, no Embla). Container has `role="region"` + `aria-label="Community-Artikel"` + `tabIndex={0}` so keyboard users can tab in then arrow-key scroll. Cards are `<Link>` to `/community/artikel/[slug]` (Plan 26-03 wires the dynamic route — currently 404, expected). KI-News badge renders only on `kind === "ki-news"` cards with accent-dot prefix.

### Threat-Model Mitigations
- T-26-02-01: Every external `<a target="_blank">` to `community.generation-ai.org` carries `rel="noopener noreferrer"` (verified by smoke against rendered HTML).
- T-26-02-02: `MotionConfig nonce={nonce}` propagates the CSP-Nonce to motion's injected styles, identical to `home-client.tsx`.

## Verification Performed

| Check | Result |
|-------|--------|
| `pnpm --filter @genai/website tsc --noEmit` | EXIT=0 (clean) |
| `pnpm --filter @genai/website test --run` | 3 files / 16 tests pass |
| `pnpm --filter @genai/website build` | success — `/community` listed as `ƒ` (dynamic) |
| Dev-Server `GET /community` | HTTP 200 |
| `<title>Community — Mehr als eine Community \| Generation AI</title>` | present |
| OG-Tags (title/description/url/type) | all present |
| Canonical `https://generation-ai.org/community` | present |
| Section order: hero → pillars → articles → final-cta | confirmed via `data-section` attrs |
| Hero H1 „Mehr als eine Community." | present |
| Hero external CTA `target="_blank" rel="noopener noreferrer"` → `community.generation-ai.org` | present (within hero CTA, header link unchanged) |
| 4 Pillars (Austausch / Lernpfade & Kurse / News & Insights / Exklusive Inhalte) | all 4 BentoGridItems render |
| Carousel a11y: `role="region"`, `aria-label="Community-Artikel"`, `tabindex="0"` | present |
| Carousel cards count | 4 (newest-first: ki-news-kw17-2026 → bachelorarbeit → prompting → 5-tools-bwl) |
| KI-News badge | present, count = 1 (only on ki-news-kw17-2026 card) |
| Final-CTA „Wir sehen uns drinnen." + 3× `href="/join"` | present (1 in CTA + 2 in Header/Footer) |
| Dev-Server console | clean (no warnings, no hydration errors) |
| Umlaute echt (Räume, für, Tiefgänge, …) | echt im Source verified |

## Deviations from Plan

### Auto-Fixed / Inline Decisions

**1. Task 1 commit deferred ArticlesCarousel wiring**
- **Found during:** Task 1 implementation
- **Issue:** `<files>` list of Task 1 includes `community-client.tsx` and Task 2's `<files>` only lists `articles-carousel.tsx` — but Task 2's action explicitly says to wire the carousel into `community-client.tsx`.
- **Resolution:** Task 1's `community-client.tsx` was committed without the ArticlesCarousel import (held the `articles` prop as `_articles` to keep tsc happy). Task 2 added the import and replaced the destructure. Result: per-task atomic commits, both work as standalone snapshots, and the file list of each task remains truthful to what each commit changes.
- **Rule:** Rule 1 (correctness) — kept commits atomic without breaking Task 2's contract.
- **Files modified:** `apps/website/app/community/community-client.tsx` (in both commits).
- **Commits:** `b49a596` (Task 1 partial wiring), `1685c0c` (Task 2 final wiring).

### Informational (no fix needed)

**2. Pre-existing Turbopack NFT warning on `lib/mdx/reader.ts`**
- **Surfaced during:** `pnpm --filter @genai/website build` for Task 3 smoke
- **Issue:** Turbopack reports „Encountered unexpected file in NFT list" tracing `next.config.ts → lib/mdx/reader.ts → lib/mdx/community.ts → app/community/page.tsx`. This is the standard pitfall §1108 in RESEARCH (root-layout `force-dynamic` + fs-glob in MDX reader).
- **Origin:** `lib/mdx/reader.ts` was added in Plan 26-01 commit `00c6c8b`. Not introduced by Plan 26-02.
- **Action taken:** None — out of Plan 26-02 scope (SCOPE BOUNDARY rule). Build still succeeds and `/community` renders correctly. Plan 26-01 SUMMARY or a future MDX-tuning ticket should track if this becomes a real problem.

### Yolo-Mode Auto-Approval (Task 3 Visual Checkpoint)

Task 3 in PLAN.md was a `checkpoint:human-verify` gate. Per orchestrator prompt instructing Yolo-Mode (no user pause), the visual checkpoint was replaced with automated smoke:
- production build (success),
- vitest run (16/16 pass),
- dev-server start + `curl /community` (HTTP 200),
- DOM-grep verifying every „how-to-verify" item from PLAN.md (title, OG, canonical, hero H1, external CTA target+rel, 4 pillars, carousel scroll-snap + a11y attrs + 4 cards in newest-first order, KI-News badge on exactly the ki-news card, final-CTA + `/join` link, dev-server console clean).
- Browser-side interaction (drag-scroll, finger-snap on mobile viewport, click-through navigation) was NOT exercised — those require Playwright-MCP which was not pre-loaded for this run. CSS scroll-snap behavior is browser-native + verified at the markup level (`snap-x snap-mandatory snap-start` classes present on container + each card).

## Known Stubs

None. The carousel reads real MDX data from `getAllArticles()` (4 articles from Plan 26-01 fixtures). Article detail pages (`/community/artikel/[slug]`) intentionally 404 until Plan 26-03 — that's a Plan-26-Wave-2-Block-A scope boundary, not a stub.

## Self-Check: PASSED

Files verified to exist:
- FOUND: apps/website/app/community/page.tsx
- FOUND: apps/website/app/community/community-client.tsx
- FOUND: apps/website/app/community/components/community-hero.tsx
- FOUND: apps/website/app/community/components/pillars-grid.tsx
- FOUND: apps/website/app/community/components/articles-carousel.tsx
- FOUND: apps/website/app/community/components/community-final-cta.tsx
- FOUND: .changeset/phase-26-community-page.md

Commits verified to exist on `feature/phase-26-community`:
- FOUND: `b49a596` feat(26-02): add /community page shell + Hero + Pillars + Final-CTA
- FOUND: `1685c0c` feat(26-02): add articles-carousel + wire into community-client
