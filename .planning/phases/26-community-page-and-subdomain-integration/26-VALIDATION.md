---
phase: 26
slug: community-page-and-subdomain-integration
status: complete
nyquist_compliant: true
wave_4_complete: true
lighthouse_passed: true
uat_pending: false
uat_accepted_by: Luca
uat_accepted_at: 2026-04-26
created: 2026-04-25
last-updated: 2026-04-26
scope_note: "Block A (/community + 4 articles + sitemap + Schema.org) + Block B (live featured-tools API + MDX-driven landing preview) + Header-Nav-Renderer rewire (D-18). Lighthouse all ≥ 90 across mobile + desktop on /community + article. Manual UAT accepted by Luca on 2026-04-26."
---

# Phase 26 — Validation Report

> Phase-Validation gegen die 21 Success-Criteria (15 Block A + 6 Block B) aus `26-CONTEXT.md` plus Header-Navigation-Acceptance aus `26-06-PLAN.md`. Automated Gates (Build, Tests, Lighthouse) sind grün. Manual UAT wurde von Luca am 2026-04-26 akzeptiert.

---

## Lighthouse Results

**Setup:** `pnpm --filter @genai/website build && pnpm --filter @genai/website start` (port 3000), Lighthouse 13.1.0, headless Chrome, single run pro Konfiguration. Kategorien: Performance, Accessibility, Best Practices, SEO. Gate: ≥ 90 in jeder Kategorie.

### `/community`

| Preset  | Performance | Accessibility | Best Practices | SEO  | LCP    | TBT  | CLS  |
| ------- | ----------- | ------------- | -------------- | ---- | ------ | ---- | ---- |
| Desktop | **99**      | **100**       | **96**         | **100** | 778ms  | 0ms  | 0    |
| Mobile  | **91**      | **100**       | **100**        | **100** | 3557ms | 43ms | 0    |

### `/community/artikel/bachelorarbeit-mit-claude`

| Preset  | Performance | Accessibility | Best Practices | SEO  | LCP    | TBT  | CLS  |
| ------- | ----------- | ------------- | -------------- | ---- | ------ | ---- | ---- |
| Desktop | **100**     | **100**       | **96**         | **100** | 609ms  | 0ms  | 0    |
| Mobile  | **96**      | **100**       | **100**        | **100** | 2801ms | 34ms | 0    |

**Verdict:** Alle 4 Konfigurationen treffen das Gate ≥ 90 in jeder Kategorie. CLS = 0 auf allen Runs (Pitfall-7-Mitigation `min-h-[180px]` auf Marquee-Wrapper sowie Server-Component-Pattern in Plan 26-05 hat funktioniert). LCP auf Mobile gut unter Lighthouse-„Good"-Schwelle (≤ 4 s). Best-Practices 96 statt 100 auf Desktop ist ein Pre-existing-Item (CSP / mixed-content / sub-resource auf Logo-SVG) und nicht aus Phase 26 hinzugefügt — kein Regression-Signal.

JSON-Reports liegen unter `/tmp/lh-{community,article}-{desktop,mobile}.json` (lokal generiert während Phase-Validation, nicht committed; Re-Run via `lighthouse <url> --preset=desktop|--form-factor=mobile`).

---

## Automated Tests

| Suite                                 | Result            |
| ------------------------------------- | ----------------- |
| `pnpm --filter @genai/website test --run`   | 5 files / 23 tests pass |
| `pnpm --filter @genai/tools-app test --run` | 5 files / 19 tests pass |
| `pnpm --filter @genai/website build`        | Green — `ƒ /community` + `ƒ /community/artikel/[slug]` + `○ /sitemap.xml` + `○ /robots.txt` |
| TypeScript (`tsc --noEmit` via build) | Clean             |
| ESLint                                | Pre-existing warnings only (no new) |

Pre-existing Turbopack NFT-Warning auf `lib/mdx/reader.ts → next.config.ts → app/sitemap.ts` ist bekannt (siehe 26-02-SUMMARY und 26-03-SUMMARY). Build erfolgreich, Pages rendern korrekt — out-of-scope für Phase 26.

---

## Block A — Success Criteria Coverage

> 15 Items aus `26-CONTEXT.md` Success Criteria → Block A. Each row maps the criterion to the artifact that satisfies it.

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| A1  | `/community` Route existiert und rendert alle 4 Sektionen | ✅ | Build-Output `ƒ /community`; section-order Hero → Pillars → Carousel → Final-CTA via `data-section`-attrs (26-02-SUMMARY) |
| A2  | 4 Content-Pillar-Kacheln mit Mockup-Visualisierungen, kein Circle-Screenshot | ✅ | `pillars-grid.tsx` BentoGrid 2×2 mit Lucide `Users` / `BookOpen` / `Newspaper` / `Lock` (D-12) |
| A3  | Blog-Teaser-Carousel: mindestens 3 Placeholder-Artikel chronologisch | ✅ | 4 MDX-Artikel in `apps/website/content/community/`, sort newest-first via `getAllArticles()` (Plan 26-01) |
| A4  | Horizontales Scroll auf Mobile funktioniert | ✅ | CSS `snap-x snap-mandatory` + `snap-start` auf Cards; manuelle Verifikation via 26-UAT |
| A5  | Klick auf Kachel öffnet `/community/artikel/[slug]` (echte Unterseite, nicht Modal) | ✅ | Carousel-Cards = `<Link href={\`/community/artikel/\${slug}\`}>`, Build zeigt `ƒ /community/artikel/[slug]` (Plan 26-03 D-02) |
| A6  | Artikel-Unterseite rendert Title + Body + „Weiterlesen in der Community →" CTA | ✅ | `[slug]/page.tsx`, h1+date+readingTime+MDX-body+`<a target=_blank rel=noopener noreferrer>` (Plan 26-03 D-05) |
| A7  | Meta-Tags (OG, Twitter) korrekt | ✅ | `generateMetadata` mit `title`, `description=excerpt`, `alternates.canonical`, `openGraph.type=article` + `publishedTime`, `twitter.card=summary_large_image`. **No** `openGraph.images`-override pro Artikel (D-22 — root inheritance). |
| A8  | Schema.org Article markup vorhanden | ✅ | `<script type="application/ld+json">` mit `buildArticleSchema(fm)`, `<` → `\u003c` escape (T-26-03-01); 4 vitest-Tests inkl. XSS-regression |
| A9  | Sitemap.xml enthält alle Artikel-URLs | ✅ | `app/sitemap.ts` listet root + `/community` + 4 articles (6 Einträge, `lastModified` aus frontmatter.date); 3 vitest-Tests |
| A10 | Robots.txt erlaubt Crawl | ✅ | `app/robots.ts` unverändert (PLAN-CHECK Warning #4): `allow=/`, `disallow=[/api/]`, `sitemap=https://generation-ai.org/sitemap.xml` |
| A11 | KI-News-Badge auf Artikeln mit `kind: "ki-news"` sichtbar | ✅ | `[slug]/page.tsx` rendert Badge `KI-generiert · vom Team kuratiert` nur wenn `kind === "ki-news"` (Plan 26-03 D-04); 1 von 4 Artikeln (`ki-news-kw17-2026.mdx`) |
| A12 | Direktlink „Direkt zur Community →" im Hero führt auf `community.generation-ai.org` | ✅ | `community-hero.tsx` external `<a target=_blank rel=noopener noreferrer href=https://community.generation-ai.org>` (Plan 26-02). DOM-grep confirms 2× external link auf Page (Hero + Final-Footer-CTA), 1× internal `/community` (Header). |
| A13 | Abschluss-CTA führt auf `/join` | ✅ | `community-final-cta.tsx` `<Link href="/join">Kostenlos beitreten</Link>` (Plan 26-02) |
| A14 | Lighthouse `/community` und `/community/artikel/[slug]` > 90 | ✅ | Siehe **Lighthouse Results** Sektion oben — alle 4 Konfigurationen ≥ 90. |
| A15 | Mobile responsive, A11y korrekt | ✅ | A11y Score 100/100 in allen 4 Lighthouse-Runs. Mobile-Layout via Tailwind responsive utilities + scroll-snap. Manueller Mobile-Check in 26-UAT. |

**Block A: 15/15 covered.**

---

## Block B — Success Criteria Coverage

> 6 Items aus `26-CONTEXT.md` Success Criteria → Block B.

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| B1 | tools-app `/api/public/featured-tools` Endpoint liefert JSON mit 3-5 Featured-Tools | ✅ | Plan 26-04: Route in `apps/tools-app/app/api/public/featured-tools/route.ts`; 4 vitest-Tests in `route.test.ts`; `featured: boolean` flag in 5 Tool-MDX (chatgpt, claude, lovable, cursor, perplexity) |
| B2 | Website Landing Tool-Showcase-Section konsumiert API via Server-Component | ✅ | Plan 26-05: `tool-showcase-section.tsx` ist async Server-Component mit `fetch(${NEXT_PUBLIC_TOOLS_APP_URL}/api/public/featured-tools, { next: { revalidate: 300 } })` und 5s `AbortController`-Timeout (D-15) |
| B3 | ISR-Cache funktioniert (`revalidate: 300` gesetzt) | ✅ | Plan 26-05 + 26-04: Response `Cache-Control: public, s-maxage=300, stale-while-revalidate=1800` (Plan 26-04 contract); `next: { revalidate: 300 }` auf fetch (Plan 26-05) |
| B4 | Fallback-UI falls API down (Placeholder-Cards) | ✅ | `tool-showcase-section.tsx` `FALLBACK_TOOLS` Array mit allen 12 Tools aus dem alten Hardcoded-Array. Bei 4xx/5xx/Timeout/Empty-Response → fallback ohne Crash + `console.warn`. Live-verifiziert während 26-05-Smoke (API hatte HTTP 404, Fallback rendert 12 Tools im DOM). |
| B5 | Community-Preview-Section auf Landing zeigt 3 letzte MDX-Artikel | ✅ | `community-preview-section.tsx` async Server-Component mit `(await getAllArticles()).slice(0, 3)` → 3-up Grid mit internen `<Link>`-Cards auf `/community/artikel/[slug]` (D-08 Option A). Footer-Link „Alle Artikel ansehen →" → internal `/community`. |
| B6 | Keine Layout-Shift beim Data-Swap | ✅ | CLS = 0 auf allen 4 Lighthouse-Runs (Pitfall-7-Mitigation: Server-Component Pattern liefert HTML komplett bei SSR, kein Client-Skeleton-to-Data-Swap; `min-h-[180px]` auf Marquee-Wrapper) |

**Block B: 6/6 covered.**

---

## Header-Nav-Acceptance (Plan 26-06)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| H1 | Header „Community"-Link zeigt auf `/community` (D-18) | ✅ | `header.tsx:30` `{ label: "Community", href: "/community", external: false }` |
| H2 | Desktop-Nav-Renderer rewritten to honor `link.external` flag | ✅ | `header.tsx:61-81` conditional `link.external ? <a target=_blank> : <Link>`. `grep -c "link.external ?"` = 1. Test via DOM-grep: 1× `<a href="/community">` (no target=_blank) auf rendered `/community` (Header) + 2× `<a href="https://community.generation-ai.org">` auf der Page (Hero + Final-CTA, intentional). |
| H3 | Mobile-Nav-Renderer continues to honor `external` flag (no regression) | ✅ | `header.tsx:192` Mobile-items list updated: `{ type: "link", label: "Community", href: "/community", external: false }`. Mobile-Renderer Lines 215-216 already conditional auf `item.external` (no code-change required, was already correct per Fix-Pass-Notes). |
| H4 | Internal links use next/link client-side routing | ✅ | Desktop: `<Link>` for `external: false`. `import Link from "next/link"` confirmed line 4. |
| H5 | External links keep `target=_blank rel=noopener noreferrer` | ✅ | Desktop: `<a target="_blank" rel="noopener noreferrer">` for `external: true` (Tools-Subdomain-Link). |
| H6 | Direct Circle link remains on /community Hero (members gateway) | ✅ | `community-hero.tsx` unchanged in Plan 26-06; external CTA „Direkt zur Community →" still points to `https://community.generation-ai.org` with target=_blank. |
| H7 | No leftover external Circle hrefs in header.tsx | ✅ | `grep -c 'href: "https://community.generation-ai.org"' header.tsx` = 0 |
| H8 | Changeset committed | ✅ | `.changeset/phase-26-nav-update.md` (`@genai/website: patch`) committed in `23b0fc3` |

**Header-Nav: 8/8 covered.**

---

## Threat-Model Coverage Across Phase 26

Mitigations across all six plans, surfaced from `<threat_model>` registers:

| Threat ID | Plan  | Disposition | Status |
| --------- | ----- | ----------- | ------ |
| T-26-01-01 (path traversal in slug) | 26-01 | mitigate | DONE — slug-allowlist via `getArticleSlugs()` (Plan 26-01 SUMMARY) |
| T-26-02-01 (external CTA on hero needs `rel=noopener`) | 26-02 | mitigate | DONE — verified in 26-02 smoke |
| T-26-02-02 (CSP nonce for motion injected styles) | 26-02 | mitigate | DONE — `MotionConfig nonce={nonce}` in community-client.tsx |
| T-26-03-01 (XSS via title `<` in JSON-LD) | 26-03 | mitigate | DONE — `replace(/</g, "\u003c")` + vitest XSS regression |
| T-26-03-02 (slug path-traversal in dynamic `import()`) | 26-03 | mitigate | DONE — `dynamicParams = false` + `generateStaticParams` whitelist |
| T-26-03-03 (500 leaks fs path) | 26-03 | mitigate | DONE — Plan 26-01 throw-with-context + Next.js 500-handler wraps |
| T-26-03-04 (open-redirect via circleUrl) | 26-03 | accept | accepted per D-14 (trust-the-author) |
| T-26-03-05 (sitemap fs-DoS) | 26-03 | accept | accepted; cache()-memoized reader |
| T-26-04-* (featured-tools route auth-bypass / cache-stuffing) | 26-04 | mitigate | DONE — public-only data, ISR cache, no auth-leakage |
| T-26-05-01 (DoS via API-Hang) | 26-05 | mitigate | DONE — AbortController 5s-Timeout, live-verified |
| T-26-05-02 (URL-Disclosure via console.warn) | 26-05 | accept | accepted (lokal/Vercel-private) |
| T-26-05-03 (XSS via API-Response) | 26-05 | mitigate | DONE — pure text rendering, no `dangerouslySetInnerHTML` |
| T-26-05-04 (stale 5-min ISR) | 26-05 | accept | accepted per D-07/D-16 |
| T-26-06-01 (nav link mistake routes users to wrong domain) | 26-06 | mitigate | DONE — internal `/community` Link, no domain-bridge possible |
| T-26-06-02 (external-flag bypass on internal hrefs) | 26-06 | mitigate | DONE — Desktop-Renderer rewritten zu `link.external ? <a target=_blank> : <Link>` |

Keine neuen Threat-Surfaces über die in den Plans registrierten hinaus — keine `threat_flag`s required.

---

## Per-Plan Verification Map

| Plan | Wave | Status | Summary File |
| ---- | ---- | ------ | ------------ |
| 26-01 (MDX-Stack + content fixtures) | Wave 1 | ✅ complete | `26-01-SUMMARY.md` |
| 26-02 (/community page) | Wave 2 (Block A) | ✅ complete | `26-02-SUMMARY.md` |
| 26-03 (Article-page + Schema.org + Sitemap) | Wave 3 (Block A) | ✅ complete | `26-03-SUMMARY.md` |
| 26-04 (Featured-Tools API + featured flag) | Wave 2 (Block B) | ✅ complete | `26-04-SUMMARY.md` |
| 26-05 (Server-Component refactor + MDX-driven preview) | Wave 3 (Block B) | ✅ complete | `26-05-SUMMARY.md` |
| 26-06 (Header-Nav rewire + Lighthouse + UAT) | Wave 4 | ✅ code-done, UAT accepted by Luca 2026-04-26 | `26-06-SUMMARY.md` |

---

## Decisions Implemented (23 from CONTEXT.md)

D-01 through D-23 alle implementiert. Verbindung zwischen Decision und Plan-Artefakt dokumentiert in den Plan-Summaries:

- D-01 Eigene Seite (Plan 26-02)
- D-02 Echte Subroute statt Modal (Plan 26-02 + 26-03)
- D-03 MDX im Repo (Plan 26-01)
- D-04 KI-News-Badge in same Pipeline (Plan 26-03)
- D-05 Body + „Weiterlesen" CTA (Plan 26-03)
- D-06 Placeholder-Content (Plan 26-01)
- D-07 Public Featured-Tools-Endpoint ohne Auth (Plan 26-04)
- D-08 Option A (MDX-Teaser) für Community-Preview (Plan 26-05)
- D-09 Schema.org Article Markup (Plan 26-03)
- D-10 `@next/mdx` + `gray-matter` Stack (Plan 26-01)
- D-11 3 articles + 1 ki-news (Plan 26-01)
- D-12 Lucide-Icons + Bento-Grid (Plan 26-02)
- D-13 Statisches Default-OG-Image (Plan 26-03)
- D-14 Trust-the-author circleUrl (Plan 26-03)
- D-15 Tool-Showcase upgrade in-place (Plan 26-05)
- D-16 Auto-Deploy via main-Push (Plan 26-04 + 26-05)
- D-17 ... D-23 (gemäß CONTEXT-Erweiterungen während Planning + Plan-Annotations)

---

## Open Issues / Deferred

Keine blockierenden Issues. Pre-existing items, die nicht in Phase-26-Scope fallen:

1. **Pre-existing JSON-LD escape gap in `app/layout.tsx`** (RESEARCH §6.2 finding): Layout-level Org+WebSite JSON-LD nutzen `JSON.stringify(...)` ohne `replace(/</g, "\u003c")`. Praktischer XSS-Risk = 0 (frontmatter hardcoded), aber Pattern sollte für Future-Proofing konsistent sein. → Follow-up-Cleanup-Plan.
2. **Turbopack NFT warning** auf `lib/mdx/reader.ts` Tracing-Chain — bekannt seit Plan 26-01, dokumentiert in 26-02-SUMMARY und 26-03-SUMMARY. Build erfolgreich, kein Funktions-Impact.
3. **`gray-matter` parses unquoted YAML date as `Date` object, not string** — Type-vs-runtime drift in `ArticleFrontmatter.date`. Funktional kein Break (ISO-Strings + `new Date(...)` akzeptiert beides). Follow-up: YAML-Dates als Strings quoten oder Type erweitern. Nicht blockierend.

---

## Validation Sign-Off

- [x] Alle 21 Success-Criteria (15 Block A + 6 Block B) covered
- [x] Header-Nav-Acceptance (8 Items) covered
- [x] Lighthouse ≥ 90 in allen 4 Konfigurationen (Performance/A11y/BP/SEO)
- [x] Build green, alle Tests grün (23 + 19)
- [x] 23 Decisions aus CONTEXT.md implementiert
- [x] Threat-Mitigations alle DONE oder explizit accepted
- [x] Self-Check pro Plan PASSED (siehe individual SUMMARIES)
- [x] Manual UAT signed-off durch Luca → siehe `26-UAT.md`

**Gate Status:** Automated alles grün. Phase 26 Code-complete. UAT accepted by Luca on 2026-04-26.
