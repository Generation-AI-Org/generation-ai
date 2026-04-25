---
phase: 26
plan: 01
subsystem: mdx-foundation
tags: [mdx, content-pipeline, vitest, foundation]
status: complete
completed: 2026-04-25
branch: feature/phase-26-community
wave: 1
depends_on: []
requirements: [R7.1, R7.2, R7.3]
dependency-graph:
  requires: []
  provides:
    - "@next/mdx pipeline (pageExtensions + withMDX)"
    - "apps/website/mdx-components.tsx (D-19 component map)"
    - "lib/mdx/{frontmatter,reader,community,index}.ts"
    - "lib/mdx/__tests__/* (TDD-verified)"
    - "apps/website/content/community/*.mdx (3 artikel + 1 ki-news)"
    - "vitest co-located test-discovery (PLAN-CHECK Blocker #1 fix)"
  affects:
    - "apps/website/next.config.ts"
    - "apps/website/vitest.config.mts"
    - "apps/website/package.json"
tech-stack:
  added:
    - "@next/mdx@16.2.4"
    - "@mdx-js/loader@3.1.1"
    - "@mdx-js/react@3.1.1"
    - "gray-matter@4.0.3"
    - "@types/mdx@2.0.13 (dev)"
  patterns:
    - "React cache() around fs.readdir/readFile (RSC memoization, force-dynamic mitigation)"
    - "Hand-rolled TS types + runtime validator (D-20, kein Zod)"
    - "Fixture-based Vitest (decouple tests from launch content)"
    - "Dependency-injected contentDir (getAllArticlesFrom vs getAllArticles)"
key-files:
  created:
    - "apps/website/mdx-components.tsx"
    - "apps/website/lib/mdx/frontmatter.ts"
    - "apps/website/lib/mdx/reader.ts"
    - "apps/website/lib/mdx/community.ts"
    - "apps/website/lib/mdx/index.ts"
    - "apps/website/lib/mdx/__tests__/reader.test.ts"
    - "apps/website/lib/mdx/__tests__/community.test.ts"
    - "apps/website/__fixtures__/community/sample-article.mdx"
    - "apps/website/__fixtures__/community/sample-ki-news.mdx"
    - "apps/website/content/community/bachelorarbeit-mit-claude.mdx"
    - "apps/website/content/community/prompting-fuer-einsteiger.mdx"
    - "apps/website/content/community/5-tools-bwl.mdx"
    - "apps/website/content/community/ki-news-kw17-2026.mdx"
    - "apps/website/content/community/README.md"
    - ".changeset/phase-26-mdx-stack.md"
  modified:
    - "apps/website/next.config.ts"
    - "apps/website/vitest.config.mts"
    - "apps/website/package.json"
    - "pnpm-lock.yaml"
decisions:
  - "Filename 5-tools-bwl.mdx (per PLAN body) statt 5-ki-tools-fuer-bwl-studis.mdx (executor-prompt hatte abweichenden Namen) — Plan-Body ist source-of-truth, slug muss Filename matchen."
  - "Fixture-Dir __fixtures__/community/ getrennt von content/community/ — Tests brechen nicht wenn Launch-Content sich ändert."
  - "*From-Varianten als Test-Entry-Points: getAllArticlesFrom(dir), getArticleBySlugFrom(slug,dir). Public API ohne dir-Arg nutzt COMMUNITY_DIR-Const."
metrics:
  duration-minutes: 14
  tasks-completed: 3
  files-created: 15
  files-modified: 4
  tests-added: 11
  commits: 4
---

# Phase 26 Plan 01: MDX Foundation Summary

Bootstrap der MDX→React-Pipeline für Phase 26 Block A — `@next/mdx`-Integration, canonical `mdx-components.tsx` mit Brand-Token-Map (D-19, ohne Typography-Plugin), generic `readAllFrontmatter`-Helper (RSC-memoized), hand-rolled Frontmatter-Validator (D-20), 4 deutsche Placeholder-Artikel mit echten Umlauten + Content-README. Blocker-Fix: vitest `include`-Pattern erweitert auf `**/__tests__/**` damit alle folgenden Phase-26-Plans ihre co-located Tests überhaupt ausführen können.

## Commits

| Commit   | Type    | Description                                                                         |
| -------- | ------- | ----------------------------------------------------------------------------------- |
| dfb00ff  | feat    | Install MDX stack + wire next.config + fix vitest include-pattern (Task 1)          |
| 4aaf1e1  | test    | Add failing tests for lib/mdx reader + community (Task 2 RED)                       |
| 00c6c8b  | feat    | Implement lib/mdx helpers — all 11 tests green (Task 2 GREEN)                       |
| 5be0b6b  | feat    | Add 4 placeholder MDX articles + authoring README (Task 3)                          |

## Tasks Completed

### Task 1 — MDX stack + config (commit `dfb00ff`)

- Installed `@next/mdx@16.2.4`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `gray-matter@4.0.3`, `@types/mdx@2.0.13` (dev). Versions per RESEARCH §1.1.
- `next.config.ts`: `pageExtensions: ["js","jsx","md","mdx","ts","tsx"]`, `withMDX` wrapper mit leeren remark/rehype-Plugin-Arrays (T-26-01-03 Mitigation — kein untrusted-content Weg über GFM-Erweiterungen). `NEXT_PUBLIC_TOOLS_APP_URL` als env-var deklariert für Plan-26-05-Cohesion. Security-Headers 1:1 erhalten.
- `apps/website/mdx-components.tsx` im **Project-Root** (nicht in `app/`) — sonst renderen @next/mdx-Pages als raw String. Custom-Map für `h1..h3`, `p`, `a`, `ul`, `ol`, `blockquote`, `code` mit Brand-Tokens (`text-text`, `text-text-secondary`, `var(--accent)`, `bg-bg-elevated`, `font-mono`). Externe Links kriegen `target="_blank" + rel="noopener noreferrer"`.
- **PLAN-CHECK Blocker #1 Fix:** `vitest.config.mts` `include`-Pattern auf `["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"]` erweitert. Regression-safe: Button-Test läuft weiter (verified).
- Changeset `.changeset/phase-26-mdx-stack.md` (minor bump).

### Task 2 — lib/mdx helpers + TDD (commits `4aaf1e1`, `00c6c8b`)

**TDD RED → GREEN, keine REFACTOR-Iteration nötig.**

- `frontmatter.ts`: `ArticleKind` union (`"artikel" | "ki-news"`) + `ArticleFrontmatter`-Interface mit 7 Pflichtfeldern + `Article`-Tuple-Typ.
- `reader.ts`: Generic `readAllFrontmatter<T>({ contentDir, validate? })`. Wraps `fs.readdir + fs.readFile + matter()` in `cache()` aus `react` — memoization pro RSC-Render-Tree. Abs/relativer Pfad supported. Domain-agnostic — in Phase 22.5 `/events` wiederverwendbar.
- `community.ts`:
  - `validateArticleFrontmatter(raw, fileSlug)` — hard-throws mit 3 spezifischen Messages (missing field / invalid kind / slug mismatch). Threat-Mitigation T-26-01-01 + T-26-01-04.
  - `COMMUNITY_DIR = "content/community"` const.
  - `getAllArticlesFrom(dir)` / `getArticleBySlugFrom(slug, dir)` — **Test-Entry-Points** mit injiziertem Dir. Public `getAllArticles()` / `getArticleBySlug(slug)` / `getArticleSlugs()` nutzen COMMUNITY_DIR.
  - Sort: newest-first per `new Date(date).getTime()` desc.
- `index.ts`: Barrel-Export für Konsumer-Plans (26-02, 26-03, 26-05).
- `__fixtures__/community/` mit 2 MDX-Files (sample-article `date=2026-04-20` + sample-ki-news `date=2026-04-22`). Bewusst separater Dir von `content/community/` damit Test-Assertions (Sort-Order, Slug-Set) stabil bleiben wenn Launch-Content wächst.
- **11 Tests** green:
  - reader (3): list fixtures, validate callback invoked, slug-naming-invariant.
  - community (8): sort newest-first, typed-frontmatter-roundtrip, validator throws on missing-field + invalid-kind + slug-mismatch, validator returns on valid input, bySlug-hit, bySlug-null.

### Task 3 — 4 Placeholder Articles + README (commit `5be0b6b`)

- **bachelorarbeit-mit-claude.mdx** (artikel, 2026-04-20, 6 Min) — 3 Absätze Werkstattbericht: „Struktur finden / Recherche-Sparring / Korrektur-Loop" per RESEARCH §Example 1.
- **prompting-fuer-einsteiger.mdx** (artikel, 2026-04-15, 5 Min) — 3 Absätze: „Kontext / Beispiele / Iteration".
- **5-tools-bwl.mdx** (artikel, 2026-04-10, 4 Min) — 5 kurze Tool-Absätze (Claude / Perplexity / Notion AI / Deep Research / Gamma).
- **ki-news-kw17-2026.mdx** (ki-news, 2026-04-22, 4 Min) — 3 Vendor-Absätze: Anthropic / Google / OpenAI. D-23 Naming `ki-news-kw{NN}-{YYYY}.mdx`.
- Alle Bodies: echte deutsche Prosa, Umlaute ö/ä/ü/ß (nicht ae/oe/ue/ss), 2-3 Absätze, jeder Artikel endet mit „Weiterlesen in der Community →"-Link auf circleUrl.
- `content/community/README.md` — Authoring-Guide mit Frontmatter-Schema-Tabelle, Naming-Convention (inkl. D-23), Body-Regeln, Auto-Deploy-Note (D-16), D-14 Trust-the-Author-Hinweis, Validation-Error-Beispiel.

## Deviations from Plan

### Filename Deviation (informativ, kein Rule 1/2/3-Eingriff)

- **Context:** Executor-Prompt nannte als 3. Artikel-Filename `5-ki-tools-fuer-bwl-studis.mdx`, das PLAN-File (Frontmatter `files_modified` + Task-3-Body Zeile 280-286) spezifiziert `5-tools-bwl.mdx` mit `slug: "5-tools-bwl"`.
- **Resolution:** PLAN ist source-of-truth (Plan-Body + files_modified konsistent). Filename/Slug müssen by-Validator 1:1 matchen — jede andere Wahl wäre ein Runtime-Fehler. Gewählt: `5-tools-bwl.mdx`.
- Keine Rule-1/2/3-Deviation, nur Disambiguierung zweier widersprüchlicher Quellen zugunsten des autoritativen Plan-Files.

### Test-Signature-Fix (Rule 1 — Bug)

- **Found during:** Task 2 (erste `tsc --noEmit` nach Reader-Test-Create).
- **Issue:** `vi.fn((raw: Record<string, unknown>) => raw)` — 1-arg-Inferenz kollidierte mit dem 2-arg-Signatur-Contract von `ReadAllOpts.validate`. `TS2493: Tuple type '[raw: Record<string, unknown>]' of length '1' has no element at index '1'`.
- **Fix:** Explicit 2-arg callback `vi.fn((raw: Record<string, unknown>, _slug: string) => raw)` damit TypeScript den Typ korrekt propagiert.
- **Files modified:** `apps/website/lib/mdx/__tests__/reader.test.ts`.
- **Commit:** Eingebaut in `00c6c8b` (GREEN step).

## Verification Evidence

| Check                                                 | Result                                                   |
| ----------------------------------------------------- | -------------------------------------------------------- |
| `pnpm --filter @genai/website tsc --noEmit`           | Clean (zero output)                                      |
| `pnpm --filter @genai/website test --run`             | 16/16 tests green (3 Files: Button + reader + community) |
| `pnpm --filter @genai/website build`                  | ✓ Next.js 16.2.3 (Turbopack), 8 static pages generated   |
| Button-Regression nach vitest-include-Fix             | Still discovered + passed                                |
| 4 MDX-Files kompilieren + Frontmatter parsebar        | All 4 via in-line gray-matter-smoke validated            |
| Umlaut-Check `grep -l 'ä\|ö\|ü\|ß' content/community` | 4/4 files                                                |
| `next.config.ts` exports `withMDX(nextConfig)`        | Verified                                                 |
| `mdx-components.tsx` im Project-Root                  | Verified `apps/website/mdx-components.tsx`               |
| Changeset existiert                                   | `.changeset/phase-26-mdx-stack.md` present               |

## Threat Flags

Keine neuen Surfaces außerhalb des bestehenden `<threat_model>`-Scopes. All Mitigations umgesetzt:

- T-26-01-01 (Missing-Field Tampering) — `validateArticleFrontmatter` hard-throws.
- T-26-01-02 (Info-Disclosure via Error) — Error-Messages enthalten File-Path-Context aber keinen fs-Stack. Throws server-side, Render-Output bleibt generic.
- T-26-01-03 (MDX `<script>`-Injection) — @next/mdx default HTML-escape, remark/rehype-Plugin-Arrays bleiben leer.
- T-26-01-04 (Filename↔Slug-Mismatch) — Validator-Throw verhindert Sitemap-Drift.
- T-26-01-05 (circleUrl open-redirect) — D-14 accepted, im README dokumentiert.

## Known Stubs

Keine. Plan 26-01 ist eine Foundation-Layer ohne UI-Renderer — Stubs würden erst in Plan 26-02 entstehen. Die 4 MDX-Bodies sind `kind=placeholder-content` per Plan (D-06), nicht Code-Stubs.

## Success Criteria Check

- [x] MDX-Deps installiert (`@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `gray-matter`)
- [x] `next.config.ts` wraps `withMDX`, `pageExtensions` + `NEXT_PUBLIC_TOOLS_APP_URL` set
- [x] `vitest.config.mts` `include` broadened (Blocker #1 fix)
- [x] `mdx-components.tsx` at project root mit D-19 Custom-Map (kein Typography-Plugin)
- [x] `lib/mdx/{index,frontmatter,reader,community}.ts` mit public API per RESEARCH §2.3
- [x] Vitest ≥6 Tests — 11 Tests grün
- [x] Button-Test ohne Regression grün (include-Fix safe)
- [x] 4 MDX-Placeholder committed (3 artikel + 1 ki-news, D-11)
- [x] `content/community/README.md` dokumentiert D-23 + D-14
- [x] Changeset `phase-26-mdx-stack.md` committed

## Next Plan

**26-02** — `/community` Landing-Page mit Hero + 4-Pillar-Bento + Blog-Teaser-Carousel. Konsumiert `getAllArticles()` aus Plan 26-01 für Carousel. Wave 2.

## Self-Check: PASSED

Files verified present:

- `apps/website/mdx-components.tsx` → FOUND
- `apps/website/lib/mdx/frontmatter.ts` → FOUND
- `apps/website/lib/mdx/reader.ts` → FOUND
- `apps/website/lib/mdx/community.ts` → FOUND
- `apps/website/lib/mdx/index.ts` → FOUND
- `apps/website/lib/mdx/__tests__/reader.test.ts` → FOUND
- `apps/website/lib/mdx/__tests__/community.test.ts` → FOUND
- `apps/website/__fixtures__/community/sample-article.mdx` → FOUND
- `apps/website/__fixtures__/community/sample-ki-news.mdx` → FOUND
- `apps/website/content/community/bachelorarbeit-mit-claude.mdx` → FOUND
- `apps/website/content/community/prompting-fuer-einsteiger.mdx` → FOUND
- `apps/website/content/community/5-tools-bwl.mdx` → FOUND
- `apps/website/content/community/ki-news-kw17-2026.mdx` → FOUND
- `apps/website/content/community/README.md` → FOUND
- `.changeset/phase-26-mdx-stack.md` → FOUND

Commits verified present:

- `dfb00ff` → FOUND
- `4aaf1e1` → FOUND
- `00c6c8b` → FOUND
- `5be0b6b` → FOUND
