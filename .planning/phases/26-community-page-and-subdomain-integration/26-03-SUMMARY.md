---
phase: 26
plan: 03
subsystem: community-article-seo
tags: [community, mdx, schema-org, sitemap, seo, json-ld]
status: complete
completed: 2026-04-25
branch: feature/phase-26-community
wave: 3
depends_on:
  - 26-01
requirements: [R7.2, R7.3]
dependency-graph:
  requires:
    - "lib/mdx/community.ts (getAllArticles, getArticleBySlug, getArticleSlugs) from 26-01"
    - "lib/mdx/frontmatter.ts (ArticleFrontmatter type) from 26-01"
    - "mdx-components.tsx custom map from 26-01"
    - "content/community/*.mdx (4 placeholder articles) from 26-01"
    - "vitest co-located test-discovery from 26-01 (Plan 26-01 Task 1 step 4)"
  provides:
    - "lib/schema.ts buildArticleSchema(fm) — Schema.org Article JSON-LD builder"
    - "app/community/artikel/[slug]/page.tsx — dynamic article detail page (D-02, D-04, D-05, D-09, D-13, D-22)"
    - "app/community/artikel/[slug]/article-shell.tsx — client wrapper (Path α decision, mirrors community-client)"
    - "app/sitemap.ts — dynamic sitemap with /community + all article URLs"
    - "app/sitemap.test.ts (3 tests)"
    - "lib/__tests__/schema.test.ts (4 tests including XSS-escape regression)"
  affects:
    - "(none — all changes additive; robots.ts intentionally untouched per PLAN-CHECK Warning #4)"
tech-stack:
  added:
    - "(no new deps — uses existing lucide-react@1.8, motion@12.38, Next 16 metadata API)"
  patterns:
    - "JSON-LD XSS escape: JSON.stringify(...).replace(/</g, '\\u003c') (canonical Next.js doc pattern)"
    - "generateStaticParams + dynamicParams=false → 404 without fs hit (T-26-03-02 mitigation)"
    - "Dynamic MDX import with literal path-prefix: await import(`@/content/community/${slug}.mdx`) — Webpack bundles all 4 at build-time"
    - "Server-component data-fetch + client wrapper for Header/Footer (mirrors community-client.tsx, Path α)"
    - "force-dynamic SSR (Phase 13 CSP-Nonce) — Article-Page rendered as ƒ in build output, expected per Pitfall 1"
key-files:
  created:
    - "apps/website/lib/__tests__/schema.test.ts"
    - "apps/website/app/community/artikel/[slug]/page.tsx"
    - "apps/website/app/community/artikel/[slug]/article-shell.tsx"
    - "apps/website/app/sitemap.test.ts"
    - ".changeset/phase-26-articles-and-sitemap.md"
  modified:
    - "apps/website/lib/schema.ts (appended JsonLdArticle interface + buildArticleSchema; existing builders untouched)"
    - "apps/website/app/sitemap.ts (replaced 1-entry stub with dynamic 6-entry reader)"
decisions:
  - "ArticleShell decision: Path α (client wrapper mirroring community-client.tsx). Read-First-Check confirmed Header/Footer are NOT in app/layout.tsx — they are mounted via the per-page client wrapper pattern (HomeClient, CommunityClient). Without ArticleShell the article would render naked. MotionConfig nonce propagation kept consistent with LEARNINGS.md CSP incident pattern."
  - "XSS-test assertion fixed (Rule 1): Plan-spec asserted `\\u003cscript\\u003e` (both `<` and `>` escaped) but the canonical Next.js pattern only escapes `<`. Corrected test to assert `\\u003cscript>` and `\\u003c/script>` — semantically the same XSS protection (no `<` ⇒ no tag boundary), just with the doc-aligned pattern."
  - "robots.ts untouched per PLAN-CHECK Warning #4 — existing config (allow=/, disallow=[/api/], sitemap URL set) already satisfies Block A success-criterion A10. Confirmed: zero diff across all 26-03 commits."
  - "Pre-existing layout.tsx Org+WebSite JSON-LD lacks the `\\u003c` escape (RESEARCH §6.2 finding). NOT fixed in this plan per scope-boundary; documented for follow-up."
metrics:
  duration-minutes: 5
  tasks-completed: 3
  files-created: 5
  files-modified: 2
  tests-added: 7
  commits: 5
---

# Phase 26 Plan 03: Article-Page + Schema.org + Sitemap Summary

Wires the SEO loop for /community Block A — every MDX article gets a crawlable subpage at `/community/artikel/[slug]` with Schema.org Article JSON-LD, KI-News badge, "Weiterlesen in der Community" CTA, and the sitemap now lists `/community` plus all 4 articles. `dynamicParams=false` returns 404 for unknown slugs without touching fs. Implements D-02, D-04, D-05, D-09, D-13, D-22.

## Commits

| Commit  | Type | Description |
| ------- | ---- | ----------- |
| 4d71ba9 | test | RED: failing tests for buildArticleSchema (Task 1) |
| b22a6a0 | feat | GREEN: implement buildArticleSchema in lib/schema.ts (Task 1) |
| a133eb9 | feat | Article-detail page with JSON-LD + KI-News badge + Circle CTA (Task 2) |
| e69adfb | test | RED: failing sitemap tests (Task 3) |
| ca7cd65 | feat | GREEN: dynamic sitemap with /community + 4 articles + changeset (Task 3) |

## Tasks Completed

### Task 1 — buildArticleSchema + Vitest (commits 4d71ba9, b22a6a0)

**TDD RED → GREEN, no REFACTOR needed.**

- Appended `JsonLdArticle` interface + `buildArticleSchema(fm: ArticleFrontmatter)` to `lib/schema.ts`. Builds Schema.org Article with author/publisher (Organization with logo as ImageObject), `mainEntityOfPage` (WebPage with `@id` = canonical URL), `inLanguage: "de-DE"`, `datePublished` from frontmatter, `headline`/`description` from `title`/`excerpt`. Existing `buildOrganizationSchema` + `buildWebSiteSchema` untouched.
- 4 vitest tests in `lib/__tests__/schema.test.ts`:
  1. shape assertions on the Article object
  2. XSS-escape regression (T-26-03-01) — verifies `JSON.stringify(...).replace(/</g, "\u003c")` neutralises `<script>...</script>` payload in title
  3. + 4. regression smokes for the existing Organization + WebSite builders
- All 15 lib tests green after GREEN.

### Task 2 — `[slug]/page.tsx` + ArticleShell (commit a133eb9)

- `app/community/artikel/[slug]/page.tsx` (Server Component):
  - `generateStaticParams()` returns `[{slug}, ...]` from `getArticleSlugs()` (4 slugs)
  - `export const dynamicParams = false` — 404 for unknown slugs without fs hit (T-26-03-02)
  - `generateMetadata()`: `title`, `description=excerpt`, `alternates.canonical`, OG `type=article` + `publishedTime`, Twitter `summary_large_image`. **No `openGraph.images` override** — root `app/opengraph-image.tsx` inherits per D-22.
  - Default async ArticlePage:
    - `await getArticleBySlug(slug)` → `notFound()` on null (cache()-wrapped reader from 26-01, single fs hit)
    - `await import(\`@/content/community/${slug}.mdx\`)` — literal path-prefix so Webpack bundles all 4 MDX at build (RESEARCH Pitfall 4)
    - JSON-LD `<script type="application/ld+json">` with `replace(/</g, "\\u003c")` XSS escape (D-09 + T-26-03-01)
    - KI-News badge (D-04) — only when `kind === "ki-news"`: bordered pill + accent dot + "KI-generiert · vom Team kuratiert"
    - `<header>` with title h1 + German-formatted date + readingTime
    - `<Content />` rendered through automatic `mdx-components.tsx` map (D-19) — no `prose` class
    - Bottom CTA: `<a href={circleUrl} target="_blank" rel="noopener noreferrer">` "Weiterlesen in der Community" + `ArrowUpRight` icon (D-05)
  - Wrapped in `<ArticleShell nonce={...}>` for Header/Footer/MotionConfig.
- `app/community/artikel/[slug]/article-shell.tsx` ('use client'):
  - Mirrors `community-client.tsx` pattern: `MotionConfig nonce={...}` + `Header` + `<main pt-20>{children}</main>` + `Footer`
  - Path α confirmed by reading `app/layout.tsx`: root layout only mounts `ThemeProvider` + JSON-LD scripts. No Header/Footer at root → article needs the shell.
- Verification:
  - `pnpm tsc --noEmit` clean
  - `pnpm build` green; route output shows `ƒ /community/artikel/[slug]` (dynamic, expected per Pitfall 1)
  - Dev smoke at `localhost:3000`:
    - `/community/artikel/bachelorarbeit-mit-claude` → 200, German title in DOM, h1 + date "20. April 2026 · 6 min Lesezeit"
    - `/community/artikel/ki-news-kw17-2026` → 200, KI-News badge text "KI-generiert · vom Team kuratiert" present
    - `/community/artikel/nonexistent` → 404
    - JSON-LD `"@type":"Article"` present in DOM (3rd JSON-LD script after layout's Org+WebSite)
    - `target="_blank" rel="noopener noreferrer"` on Weiterlesen anchor
  - Plan-spec automated grep checks all PASS: `dynamicParams = false`, `buildArticleSchema`, `replace(/</g`

### Task 3 — Sitemap update + Vitest + changeset (commits e69adfb, ca7cd65)

**TDD RED → GREEN.**

- `app/sitemap.ts`: replaced 1-entry stub with dynamic reader. Six entries:
  - root (priority 1, changeFrequency=weekly)
  - `/community` (priority 0.9, weekly)
  - 4 articles via `await getAllArticles()` mapped to `/community/artikel/${slug}` (priority 0.7, monthly, `lastModified=new Date(frontmatter.date)`)
- `app/sitemap.test.ts`: 3 tests — URLs present, ki-news lastModified=2026-04-22, exactly 6 entries.
- `.changeset/phase-26-articles-and-sitemap.md` (minor bump on `@genai/website`).
- robots.ts intentionally NOT touched — confirmed via `git diff HEAD~5 -- apps/website/app/robots.ts` returns empty.
- Verification:
  - `pnpm test app/sitemap lib --run` → 18/18 green (4 schema + 11 mdx + 3 sitemap)
  - `pnpm build` green; `/sitemap.xml` listed as `○` (static, built once)
  - Dev: `curl localhost:3000/sitemap.xml` returns valid XML with all 6 entries, articles ordered newest-first by frontmatter.date

## Deviations from Plan

### Rule 1 — Bug: XSS-test assertion mismatch with canonical pattern

- **Found during:** Task 1 GREEN (vitest run after implementing `buildArticleSchema`).
- **Issue:** Plan-spec test (Task 1, body line 178) asserts `expect(json).toContain("\\u003cscript\\u003e")` — i.e., both `<` AND `>` escaped to `\u003c` / `\u003e`. But the canonical Next.js JSON-LD XSS pattern (RESEARCH §6.2 + Plan code-snippet line 488-491) is `replace(/</g, "\\u003c")` — escapes ONLY `<`. With this canonical pattern, `<script>alert(1)</script>` becomes `\u003cscript>alert(1)\u003c/script>` (`>` stays literal). The test as Plan-spec'd was internally inconsistent: it would only pass if the regex also matched `>`, which would deviate from the doc-canonical pattern.
- **Fix:** Adjusted the test assertions to match the canonical pattern — assert `\u003cscript>` and `\u003c/script>` are present, and confirm raw `<script>` and `</script>` are absent. Semantically identical XSS protection: parser cannot find a tag boundary without `<`, so escaping just `<` is sufficient.
- **Files modified:** `apps/website/lib/__tests__/schema.test.ts` (XSS-test block).
- **Commit:** Folded into b22a6a0 (GREEN step).

### Architectural decision (not a deviation, but Plan-required choice)

- **ArticleShell — Path α:** Plan Task 2 explicitly required reading `app/layout.tsx` first to choose between Path α (client shell) or Path β (defer to layout). Read-result: root layout exclusively mounts `<ThemeProvider>` and JSON-LD scripts — Header and Footer are NOT in layout. Both `home-client.tsx` and `community-client.tsx` mount Header/Footer themselves inside a `MotionConfig` wrapper. Path α chosen, ArticleShell created mirroring that pattern.

## Out-of-Scope Discoveries (deferred — Scope Boundary)

- **Pre-existing JSON-LD escape gap in `app/layout.tsx`:** The layout-level Organization + WebSite JSON-LD scripts (lines 87-98) inject `JSON.stringify(buildOrganizationSchema())` and `JSON.stringify(buildWebSiteSchema())` WITHOUT the `replace(/</g, "\\u003c")` XSS-escape. RESEARCH §6.2 already flagged this as an out-of-scope finding. The new Article-Schema in this plan implements the escape correctly. Recommendation for a future cleanup-plan: add `.replace(/</g, "\\u003c")` to the two layout-level scripts (frontmatter for Org+WebSite is hardcoded today, so the practical XSS risk is zero, but the pattern should be consistent for future-proofing).
- **`gray-matter` parses unquoted YAML date as `Date` object, not string:** `ArticleFrontmatter.date` is typed `string` but `bachelorarbeit-mit-claude.mdx` (and the other 3) have `date: 2026-04-20` unquoted, which gray-matter parses to a JS Date. Effects: `JSON.stringify(jsonLd)` emits `datePublished: "2026-04-20T00:00:00.000Z"` (still ISO-8601, Schema.org-valid); sitemap's `new Date(...)` accepts both Date and string; on-page `toLocaleDateString` accepts both. So functionally no break in this plan. Type-vs-runtime drift is a 26-01 follow-up — either quote the YAML dates as strings, or update the frontmatter type to `string | Date`. Not blocking.

## Verification Evidence

| Check | Result |
| ----- | ------ |
| `pnpm --filter @genai/website tsc --noEmit` | Clean (zero output) |
| `pnpm --filter @genai/website test app/sitemap lib --run` | 18/18 green (4 schema + 11 mdx-26-01 + 3 sitemap) |
| `pnpm --filter @genai/website build` | Green; `ƒ /community/artikel/[slug]` (dynamic), `○ /sitemap.xml` (static), `○ /robots.txt` (static) |
| Dev `/community/artikel/bachelorarbeit-mit-claude` | 200, h1 + date + body + JSON-LD + Weiterlesen anchor |
| Dev `/community/artikel/ki-news-kw17-2026` | 200, "KI-generiert · vom Team kuratiert" badge in DOM |
| Dev `/community/artikel/nonexistent` | 404 |
| Article DOM JSON-LD `"@type":"Article"` | Present (3rd of 3 JSON-LD scripts) |
| Article CTA `target="_blank"` + `rel="noopener noreferrer"` | Both attributes present, twice (canonical + button instance) |
| Dev `/sitemap.xml` | 6 entries: root + /community + 4 articles, articles newest-first |
| Sitemap ki-news lastmod | `2026-04-22T00:00:00.000Z` (matches frontmatter) |
| robots.ts diff across 26-03 commits | Empty (file untouched per PLAN-CHECK Warning #4) |
| Plan-spec automated grep checks (`dynamicParams = false`, `buildArticleSchema`, `replace(/</g`) | All 3 PASS |
| Changeset committed | `.changeset/phase-26-articles-and-sitemap.md` |

## Threat Mitigation Status

| Threat ID | Disposition | Status |
| --------- | ----------- | ------ |
| T-26-03-01 (XSS via title `<`) | mitigate | DONE — `.replace(/</g, "\\u003c")` in page.tsx; vitest XSS regression covers it |
| T-26-03-02 (slug path-traversal in `import()`) | mitigate | DONE — `dynamicParams=false` + `generateStaticParams` whitelist; 404 verified |
| T-26-03-03 (500 leaks fs path) | mitigate | DONE — Plan 26-01 throw-with-context; Next.js 500-handler wraps to generic |
| T-26-03-04 (open-redirect via circleUrl) | accept | accepted per D-14 (trust-the-author); README documents |
| T-26-03-05 (sitemap fs-DoS) | accept | accepted; cache()-memoized reader, 4 articles today |

No new surfaces introduced beyond the plan's threat model. No `threat_flag` needed.

## Known Stubs

None. All UI elements wire to real data:
- Article body comes from real MDX files (Plan 26-01)
- KI-News badge driven by real frontmatter `kind`
- circleUrl from real frontmatter (placeholder URLs per D-06 — author commits real ones over time, not a code stub)
- Sitemap entries computed from `getAllArticles()`

## Success Criteria Check

- [x] `buildArticleSchema(fm)` exported from lib/schema.ts, returns valid Schema.org Article
- [x] schema.test.ts has 4 green tests including XSS-escape regression
- [x] `app/community/artikel/[slug]/page.tsx` renders all 4 placeholder articles in dev
- [x] `dynamicParams = false` → /community/artikel/nonexistent returns 404 without fs hit
- [x] JSON-LD `<script>` tag in article DOM with `<` escaped as `\u003c`
- [x] KI-News badge visible only on `kind: "ki-news"` (D-04)
- [x] „Weiterlesen in der Community →" CTA has target=_blank rel=noopener noreferrer (D-05)
- [x] OG metadata uses excerpt as description, no per-article OG image override (D-22)
- [x] sitemap.ts emits 6 entries (root + /community + 4 articles), tests cover URLs
- [x] Article date in sitemap uses frontmatter.date (lastModified)
- [x] robots.ts NOT modified (PLAN-CHECK Warning #4)
- [x] `pnpm build` green
- [x] Changeset committed

## Next Plan

**26-04** — wire Header-Nav „Community" link from `community.generation-ai.org` to internal `/community` (RESEARCH Pitfall 9 + Open Question §10). Or, if Block A locked, move to **Block B (26-05)** — Featured-Tools public API + landing tool-showcase migration.

## Self-Check: PASSED

Files verified present:

- `apps/website/lib/__tests__/schema.test.ts` → FOUND
- `apps/website/app/community/artikel/[slug]/page.tsx` → FOUND
- `apps/website/app/community/artikel/[slug]/article-shell.tsx` → FOUND
- `apps/website/app/sitemap.test.ts` → FOUND
- `.changeset/phase-26-articles-and-sitemap.md` → FOUND
- `apps/website/lib/schema.ts` (modified, contains `buildArticleSchema`) → FOUND
- `apps/website/app/sitemap.ts` (modified to 6-entry reader) → FOUND

Commits verified present:

- `4d71ba9` (test RED schema) → FOUND
- `b22a6a0` (feat GREEN schema) → FOUND
- `a133eb9` (feat article page) → FOUND
- `e69adfb` (test RED sitemap) → FOUND
- `ca7cd65` (feat GREEN sitemap + changeset) → FOUND

robots.ts unchanged across 26-03 → CONFIRMED (empty diff)
