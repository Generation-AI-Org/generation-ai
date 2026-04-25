---
phase: 26
slug: community-page-and-subdomain-integration
type: index
status: planned
created: 2026-04-25
worktree: /Users/lucaschweigmann/projects/generation-ai-phase-26
branch: feature/phase-26-community
---

# Phase 26 — Plan Index

Six plans across four execution waves. Block A (`/community` page + MDX pipeline)
and Block B (Featured-Tools API + landing refactor) are **parallelizable** after
the shared MDX-Stack foundation in Plan 01.

## Wave Map

| Wave | Plan | Block | Title | Depends on | Parallel siblings |
|------|------|-------|-------|------------|-------------------|
| 1 | 26-01 | A (foundation) | MDX Stack + Test Infra + Placeholder Articles | — | — |
| 2 | 26-02 | A | `/community` Landing Page (Hero, Pillars, Carousel, Final-CTA) | 26-01 | 26-04 |
| 2 | 26-04 | B | Block B Part 1 — `/api/public/featured-tools` + BeispielBadge Extract | — (no shared files with 26-01) | 26-02 |
| 3 | 26-03 | A | Article Detail Page + Schema.org + Sitemap | 26-01 | 26-05 |
| 3 | 26-05 | B | Block B Part 2 — Tool-Showcase + Community-Preview Server-Component Refactor | 26-01, 26-04 | 26-03 |
| 4 | 26-06 | A+B | Header-Nav Update + Lighthouse + Phase UAT | 26-02, 26-03, 26-05 | — |

**Note on Wave 2:** `26-04` has zero file overlap with `26-01` and lives in a
different package (`apps/tools-app/`), so it can start as soon as the user
commits to Phase 26 — even **before** `26-01` finishes. Marked Wave 2 because
its sibling `26-05` depends on `26-04`.

## Dependency Graph

```
                     ┌─── 26-02 (Block A — /community page) ───┐
                     │                                          │
26-01 (MDX-Stack) ───┤                                          │
                     │                                          ├─── 26-06 (Nav + Lighthouse + UAT)
                     └─── 26-03 (Article + Sitemap) ───────────┤
                                                                │
26-04 (Block B API + Badge extract) ─── 26-05 (Showcase + Prev) ┘
```

## Decision Coverage Matrix

| D-XX | Plan | Notes |
|------|------|-------|
| D-01 (own page) | 26-02 | `/community` route + 4 sections |
| D-02 (real subpages, no modals) | 26-03 | `/community/artikel/[slug]` |
| D-03 (MDX in repo) | 26-01 | `apps/website/content/community/` |
| D-04 (KI-news same pipeline + badge) | 26-01, 26-03 | `kind` enum + badge in article page |
| D-05 (2-3 paragraphs + Circle CTA) | 26-01 (placeholder content), 26-03 (CTA in article-page) |
| D-06 (placeholder articles at launch) | 26-01 | 3 + 1 Placeholder MDX |
| D-07 (public API, edge-cache) | 26-04 | `Cache-Control: s-maxage=300, swr=1800` |
| D-08 (Option A — MDX teaser) | 26-05 | Community-Preview reads MDX |
| D-09 (Schema.org Article) | 26-03 | `buildArticleSchema()` |
| D-10 (`@next/mdx` + `gray-matter`) | 26-01 | install + next.config.ts + mdx-components.tsx |
| D-11 (3 + 1 placeholder articles) | 26-01 | 4 MDX files committed |
| D-12 (Lucide icons + Bento) | 26-02 | `PillarsGrid` reuses BentoGrid |
| D-13 (static OG, root inherit) | 26-03 | OG inherits from `app/opengraph-image.tsx` |
| D-14 (trust the author for circleUrl) | 26-01 | no validation, README note |
| D-15 (in-place tool-showcase upgrade + ISR) | 26-05 | server wrapper + client marquee |
| D-16 (auto-deploy via main push) | n/a | implicit (no webhook setup) |
| D-17 (hardcoded FEATURED_TOOLS array reuse) | 26-04 | reads `lib/content.ts` constant |
| D-18 (Header-Nav `/community` internal) | 26-06 | `header.tsx` link change |
| D-19 (custom MDX components, no typography plugin) | 26-01 | `mdx-components.tsx` map |
| D-20 (hand-rolled frontmatter validation) | 26-01 | `validateArticleFrontmatter()` |
| D-21 (Events column stays as stub) | 26-05 | only article column refactored |
| D-22 (root OG suffices) | 26-03 | no `/community/opengraph-image.tsx` |
| D-23 (file-naming `ki-news-kw{NN}-{YYYY}.mdx`) | 26-01 | KI-News placeholder filename |

All 23 decisions covered, none silently reduced.

## Estimated Effort (Claude execution time)

| Plan | Tasks | Effort | Notes |
|------|-------|--------|-------|
| 26-01 | 3 | ~50min | install + helpers + 4 MDX files |
| 26-02 | 3 | ~45min | page + 4 components |
| 26-03 | 2 | ~35min | article-page + sitemap |
| 26-04 | 2 | ~25min | API route + badge extract |
| 26-05 | 2 | ~50min | server-component split + page.tsx refactor |
| 26-06 | 3 | ~40min | nav + Lighthouse + UAT checkpoint |

Total: ~4 hours executor time, parallelizable into ~2 wall-clock hours.

## Critical Dependencies / Risks

1. **`force-dynamic` propagation** (Pitfall §1 RESEARCH) — Article pages render
   per-request despite `generateStaticParams`. Mitigated by `cache()` wrapper in
   `lib/mdx/reader.ts` (Plan 26-01).
2. **Server/Client boundary refactor** (Pitfall §3 RESEARCH) — `BeispielBadge`
   currently exported from `tool-showcase-section.tsx` (`'use client'`). Plan
   26-04 extracts it to `components/ui/beispiel-badge.tsx` so Plans 26-05 +
   26-02 can import without forcing client boundary.
3. **`home-client.tsx` boundary** — `ToolShowcaseSection` and
   `CommunityPreviewSection` become **Server Components** in Plan 26-05. They
   cannot be imported by `home-client.tsx` (which is `'use client'`).
   Plan 26-05 refactors `app/page.tsx` to render them server-side and pass them
   as children/props to `HomeClient`.
4. **Vercel env-var** `NEXT_PUBLIC_TOOLS_APP_URL` — Plan 26-04 includes a
   manual user-action to set it for Production + Preview. Default fallback
   covers if missing.
5. **Wave-3 file conflicts** — `app/sitemap.ts` only touched by 26-03;
   `home-client.tsx` + `app/page.tsx` only touched by 26-05. Verified no overlap.

## Phase Verification (Checkpoint in 26-06)

- [ ] `pnpm --filter @genai/website build` green
- [ ] Lighthouse `/community` and `/community/artikel/{slug}` ≥ 90 (Performance, A11y, SEO, BP)
- [ ] Mobile carousel scroll works (Playwright UAT)
- [ ] Sitemap.xml contains all article URLs
- [ ] Schema.org Article markup present in DOM (`view-source` test)
- [ ] KI-news badge visible on `kind: "ki-news"` article
- [ ] Tool-Showcase renders API data or fallback stub (network-off test)
- [ ] Community-Preview shows latest 3 MDX articles chronologically
- [ ] Header-Nav „Community" → `/community` (internal route)
- [ ] `pnpm --filter @genai/tools-app test app/api/public/featured-tools` green
- [ ] `pnpm --filter @genai/website test lib/mdx app/sitemap` green
