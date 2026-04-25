---
phase: 26
type: plan-check
status: pass-with-notes
created: 2026-04-25
checker: gsd-plan-checker
worktree: /Users/lucaschweigmann/projects/generation-ai-phase-26
branch: feature/phase-26-community
---

# Phase 26 — Plan Check Report

> Goal-backward Verification der 6 Plans gegen Block A + Block B Success-Criteria
> aus 26-CONTEXT.md, plus Decision-Coverage (D-01..D-23) und Risk-Validation.

---

## Verdict

**PASS-WITH-NOTES** — Plans erreichen das Phase-Goal vollständig. Eine **konfigurations-blockierende Lücke** (vitest include-pattern) muss VOR Execution gefixt werden, sonst schlagen alle automated-verify-Steps in 26-01/26-03/26-04 fehl. Vier weitere Schwächen sind warning-level mit konkreten Fix-Vorschlägen.

**Blocker count:** 1 (vitest config, alle Wave-Tests betroffen)
**Warnings:** 4 (Header-Renderer-Logik, FALLBACK_TOOLS-Liste, HomeClient-Splash-Erhalt, robots.txt-Check)
**Info:** 2 (D-17..D-23 nicht in CONTEXT.md persistiert, Hero-Pattern-Reference ungenau)

---

## 1. Goal-Coverage Tabelle (Block A — 15 Bullets)

| # | Success-Criterion | Plan | Task | Status |
|---|-------------------|------|------|--------|
| A1 | `/community` Route + alle 4 Sektionen | 26-02 | T1, T2 | COVERED |
| A2 | 4 Pillar-Kacheln mit Mockup-Visu (D-12 Lucide+Bento) | 26-02 | T1 (pillars-grid.tsx) | COVERED |
| A3 | Blog-Teaser Carousel mit min. 3 Placeholder | 26-01 (Content) + 26-02 (T2) | T2 + T3 | COVERED |
| A4 | Mobile horizontal scroll | 26-02 | T2 (snap-x) + T3 (UAT) | COVERED |
| A5 | Klick → `/community/artikel/[slug]` echte Unterseite | 26-02 (T2 link) + 26-03 (T2 page) | beide | COVERED |
| A6 | Artikel-Body + „Weiterlesen" CTA | 26-03 | T2 + 26-01 Content | COVERED |
| A7 | Meta-Tags OG/Twitter | 26-02 (page.tsx) + 26-03 (generateMetadata) | beide | COVERED |
| A8 | Schema.org Article markup | 26-03 | T1 + T2 (JSON-LD inject) | COVERED |
| A9 | Sitemap.xml mit Article-URLs | 26-03 | T3 | COVERED |
| A10 | Robots.txt allow | bestehend (`apps/website/app/robots.ts`) | — | **NOT EXPLICITLY VERIFIED** (siehe Warning #4) |
| A11 | KI-News Badge auf `kind: ki-news` | 26-02 (T2 carousel) + 26-03 (T2 article page) | beide | COVERED |
| A12 | „Direkt zur Community →" Hero-Link | 26-02 | T1 (community-hero.tsx) | COVERED |
| A13 | Abschluss-CTA → `/join` | 26-02 | T1 (community-final-cta.tsx) | COVERED |
| A14 | Lighthouse > 90 | 26-06 | T2 | COVERED (manual gate) |
| A15 | Mobile/A11y | 26-02 (T3 visual checkpoint) + 26-06 (T3 UAT) | mehrere | COVERED |

## 2. Goal-Coverage Tabelle (Block B — 6 Bullets)

| # | Success-Criterion | Plan | Task | Status |
|---|-------------------|------|------|--------|
| B1 | tools-app `/api/public/featured-tools` liefert 3-5 Tools JSON | 26-04 | T1 | COVERED |
| B2 | Website konsumiert via Server-Component | 26-05 | T1 (tool-showcase-section.tsx) | COVERED |
| B3 | ISR cache `revalidate: 300` | 26-05 | T1 (`next: { revalidate: 300 }`) | COVERED |
| B4 | Fallback-UI bei API down | 26-05 | T1 (FALLBACK_TOOLS + try/catch) | COVERED (siehe Warning #2) |
| B5 | Community-Preview zeigt 3 letzte MDX-Artikel | 26-05 | T2 | COVERED |
| B6 | No Layout-Shift | 26-05 (Pitfall 7 mention) + 26-06 (UAT) | T1 + T3 | COVERED (warning-level — keine konkrete `min-h`-Vorgabe in Plan T2 für CommunityPreview) |

---

## 3. Decision-Coverage Tabelle (D-01 .. D-23)

| D-XX | Plan(s) | Coverage Notes | Status |
|------|---------|----------------|--------|
| D-01 (own page) | 26-02 | Plan baut komplette /community Route | COVERED |
| D-02 (real subpages, no modals) | 26-03 | `[slug]/page.tsx` als echte Route | COVERED |
| D-03 (MDX in repo) | 26-01 | `apps/website/content/community/` + 4 MDX | COVERED |
| D-04 (KI-news same pipeline + badge) | 26-01 (kind enum) + 26-02 (carousel badge) + 26-03 (article badge) | 3 Plans | COVERED |
| D-05 (2-3 Absätze + Circle CTA) | 26-01 (Content) + 26-03 (CTA in article page) | Bottom-CTA explicit | COVERED |
| D-06 (Placeholder articles at launch) | 26-01 | T3 erstellt 4 MDX-Files | COVERED |
| D-07 (public API + edge-cache) | 26-04 | `Cache-Control: s-maxage=300, swr=1800` | COVERED |
| D-08 (Option A — MDX teaser) | 26-05 | T2 ersetzt stubArticles durch getAllArticles | COVERED |
| D-09 (Schema.org Article) | 26-03 | T1 buildArticleSchema + T2 inject | COVERED |
| D-10 (`@next/mdx` + `gray-matter`) | 26-01 | T1 install, kein Contentlayer | COVERED |
| D-11 (3+1 placeholder articles) | 26-01 | T3 erstellt genau diese Verteilung | COVERED |
| D-12 (Lucide + Bento) | 26-02 | T1 mit Users/BookOpen/Newspaper/Lock | COVERED |
| D-13 (static Default-OG) | 26-03 | T2 generateMetadata ohne `images:` Override | COVERED |
| D-14 (trust the author) | 26-01 | README + keine Build-Validation | COVERED |
| D-15 (in-place upgrade + ISR + Fallback) | 26-05 | T1 inkl. AbortController + FALLBACK | COVERED |
| D-16 (Auto-Deploy via main-Push) | implicit (kein Webhook) | n/a | COVERED |
| D-17 (hardcoded FEATURED_TOOLS reuse) | 26-04 | T1 step 1 exportiert const | COVERED |
| D-18 (Header-Nav internal) | 26-06 | T1 | COVERED (warning-level, siehe Warning #1) |
| D-19 (custom MDX-Components, no typography) | 26-01 | T1 step 3 + RESEARCH §2.2 | COVERED |
| D-20 (hand-rolled validation) | 26-01 | T2 validateArticleFrontmatter | COVERED |
| D-21 (Events column stays as stub) | 26-05 | T2 KEEPS stubEvents | COVERED |
| D-22 (root OG suffices) | 26-03 | T2 erläutert „no per-article OG override" | COVERED |
| D-23 (file-naming `ki-news-kw{NN}-{YYYY}.mdx`) | 26-01 | T3 nutzt diese Naming-Convention | COVERED |

**100% Decision-Coverage.** Keine Decision wird "silent reduced" oder ignoriert.

**Info #1:** D-17..D-23 sind in PLAN-INDEX dokumentiert, aber NICHT in 26-CONTEXT.md persistiert. Für Audit-Trail wäre ein CONTEXT.md-Update mit den 7 Detail-Defaults sauberer (keine blocking issue, der User hat sie offensichtlich approved durch Yolo-Discuss).

---

## 4. Risk-Validation

### Risk 1 — Wave 2 Parallelism (26-02 ‖ 26-04)

**Status:** OK

- 26-02 modified files: `apps/website/app/community/*` (alles neu)
- 26-04 modified files: `apps/tools-app/*` + 3 website-Files (`components/ui/beispiel-badge.tsx` neu, `tool-showcase-section.tsx` + `community-preview-section.tsx` minimal touched)

**Kein File-Konflikt.** Die 3 website-Files in 26-04 werden in 26-05 wieder umgeschrieben — die "extract+keep behavior unchanged"-Vorgabe in 26-04 T2 ist sauber formuliert.

### Risk 2 — Wave 3 Parallelism (26-03 ‖ 26-05)

**Status:** OK

- 26-03 modified: `lib/schema.ts`, `app/community/artikel/[slug]/page.tsx`, `app/sitemap.ts`, plus 2 Test-Files
- 26-05 modified: `app/page.tsx`, `home-client.tsx`, `components/sections/tool-showcase-section.tsx` (neu), `tool-showcase-marquee.client.tsx` (neu), `community-preview-section.tsx`

**Kein File-Konflikt.** Logical dependency: 26-05 nutzt `getAllArticles()` aus 26-01, nicht aus 26-03. 26-03 nutzt `getAllArticles()` für sitemap, nicht aus 26-05. Beide independent.

### Risk 3 — BeispielBadge Extract-Order

**Status:** OK

- Plan 26-04 (Wave 2) extrahiert nach `components/ui/beispiel-badge.tsx` und passt beide Importer (`tool-showcase-section.tsx` + `community-preview-section.tsx`) an.
- Plan 26-05 (Wave 3) deps_on: [26-01, 26-04] — Reihenfolge garantiert.
- 26-05 importiert nicht direkt aus `components/sections/tool-showcase-section.tsx`, sondern in `tool-showcase-section.tsx` (Server-Component) JSX `<BeispielBadge />` über `@/components/ui/beispiel-badge` — UND laut 26-05 T1 Decision **wird BeispielBadge in tool-showcase removed** (data ist real). Das ist sauber.
- `community-preview-section.tsx` behält BeispielBadge auf Events-Spalte (D-21).

**Reihenfolge OK.**

### Risk 4 — force-dynamic-Issue (Phase-13 Locked CSP-Nonce)

**Status:** OK

- Plan 26-01 T1 step 2 erwähnt explicit "PRESERVE existing securityHeaders and headers() block exactly — do not touch CSP".
- Plan 26-01 + 26-03 wrappen reader.ts in React `cache()` (mitigiert FS-Hits pro Request).
- Plan 26-03 T2 setzt `dynamicParams = false` → 404 für unknown slugs ohne FS-Touch.
- Build-Output-Erwartung dokumentiert (`ƒ` statt `●` — als expected behavior gekennzeichnet).
- generateStaticParams läuft trotzdem zur Build-Zeit für Type-Check + Path-Discovery.

**Plan trifft alle Mitigation-Punkte aus RESEARCH §Pitfall 1.**

### Risk 5 — Tool-Showcase Refactor + Fallback

**Status:** WARNING — Fallback-Liste unvollständig im Plan

- Plan 26-05 T1 dokumentiert AbortController(5s), try/catch, `FALLBACK_TOOLS`-Konstante.
- Visual checkpoint testet expliziten env-var swap zur Fallback-Verifikation.

**Aber:** Plan 26-05 listet im FALLBACK_TOOLS nur 5 Beispiel-Einträge mit `// ... include the remaining 7 tools from the original array`. Der Executor muss aus dem existing tool-showcase-section.tsx die volle 12-Tool-Liste nach API-Shape mappen. Das ist machbar (sehr expliziter shape-mapping in T1 step 1) aber kein konkreter Action-Step. Risiko: Executor nimmt nur 5 Tools, Stub wird visuell ärmer als heute.

**Fix-Hint:** In 26-05 T1 action step 1 expliziter werden: „Map ALL 12 entries from the current `tools` array to the API shape — do NOT truncate to 5."

### Risk 6 — Header-Nav D-18 (Pflege)

**Status:** WARNING — Renderer-Logik nicht abgedeckt

**Befund:** Plan 26-06 T1 setzt voraus, dass das `external: false`-Feld vom Renderer respektiert wird. Im **aktuellen Code** ist das aber NICHT der Fall:

```tsx
// header.tsx:60-71 — Desktop nav-Renderer
{navLinks.map((link) => (
  <a
    key={link.href}
    href={link.href}
    target="_blank"          // ← HARDCODED, ignoriert link.external
    rel="noopener noreferrer"
    ...
```

`navLinks` ist `const` mit `external: true` Field, das aber nicht ausgelesen wird. Plan 26-06 T1 step 5 erwähnt diese Möglichkeit als „If for some reason both nav variants force the same render…" — aber das ist KEINE Eventualität, das ist der DOKUMENTIERTE Status.

Die Desktop-Renderer muss umgeschrieben werden auf konditional `<a>` vs `<Link>`. Mobile-Renderer respektiert `external` bereits (Zeilen 200-213).

**Fix-Hint:** In 26-06 T1 explicit als step machen:
> Step X: Update Desktop-Nav-Renderer (Zeilen 60-71) auf konditionales Rendering:
> ```tsx
> {navLinks.map((link) => link.external ? (
>   <a href={link.href} target="_blank" rel="noopener noreferrer" ...>{link.label}</a>
> ) : (
>   <Link href={link.href} ...>{link.label}</Link>
> ))}
> ```
> Plus `Link` import hinzufügen (existiert bereits in header.tsx, OK).

**Severity:** Warning (ohne Fix wird Community-Link-Klick einen Full-Page-Reload auslösen statt next/link client navigation; UAT würde es als Issue catchen).

### Risk 7 — Sitemap Dynamic Generation

**Status:** OK

- `apps/website/app/sitemap.ts` ist eine Next.js File-Convention-Route, ist NICHT vom `force-dynamic` aus app/layout.tsx betroffen (sitemap rendert aus eigenem Context).
- Plan 26-03 T3 nutzt `getAllArticles()` (fs+gray-matter via reader.ts).
- Build-time read funktioniert: Server-side Node-Runtime, MDX-Files sind im Build-Output committed.
- Plus React `cache()` in reader.ts memoizes per build/request tree.

**Plan adressiert alles korrekt.**

---

## 5. Lücken / Schwächen / Empfehlungen

### Blocker #1 (BLOCKING) — Vitest `include` Pattern matched die geplanten Test-Pfade nicht

**Befund (verifiziert via cat vitest.config.mts):**
```ts
// apps/website/vitest.config.mts:11
include: ["__tests__/**/*.test.{ts,tsx}"]

// apps/tools-app/vitest.config.mts:11
include: ['__tests__/**/*.test.{ts,tsx}']
```

Das Pattern matched **ohne `**`-Prefix** nur Pfade, die **literally mit `__tests__/`** beginnen (relativ zum Vitest-Root = app-Verzeichnis).

**Bestätigung:** Existing test ist `apps/website/__tests__/components/Button.test.tsx`. Das matched.

**Geplante Test-Pfade — alle MISSEN das Pattern:**

| Plan | File | Wird gematcht? |
|------|------|---------------|
| 26-01 | `apps/website/lib/mdx/__tests__/community.test.ts` | NEIN |
| 26-01 | `apps/website/lib/mdx/__tests__/reader.test.ts` | NEIN |
| 26-03 | `apps/website/lib/__tests__/schema.test.ts` | NEIN |
| 26-03 | `apps/website/app/sitemap.test.ts` | NEIN (kein `__tests__/` Segment) |
| 26-04 | `apps/tools-app/app/api/public/featured-tools/__tests__/route.test.ts` | NEIN |

**Konsequenz:** Alle automated-verify-Steps in 26-01 T2/T3, 26-03 T1/T3, 26-04 T1 schlagen fehl mit "No test files found" (Vitest exit code != 0). Die TDD-Loop bricht beim ersten Test-Run.

**Fix (Option A — empfohlen):** Plan 26-01 T1 erweitern um vitest.config.mts-Update:

```ts
// apps/website/vitest.config.mts
include: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"]
```

Plus selber Fix in `apps/tools-app/vitest.config.mts` als Teil von 26-04 T1.

**Fix (Option B):** Tests ALLE in `apps/website/__tests__/` zentralisieren mit Pfaden wie `__tests__/lib/mdx/community.test.ts`. Funktioniert auch, aber widerspricht Co-Location-Pattern (Tests neben Source-Code).

**Empfohlene Action:** Plan 26-01 T1 muss um expliziten Step ergänzt werden, BEVOR Wave 1 startet:
> Step 5 (NEU): Update `apps/website/vitest.config.mts` include zu `["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"]`. Verify: existing `__tests__/components/Button.test.tsx` läuft weiterhin grün (`pnpm test --run` zeigt das eine bestehende Test).

Plan 26-04 T1 step 5 (vor changeset-create) needs identical step für `apps/tools-app/vitest.config.mts`.

### Warning #2 — FALLBACK_TOOLS-Liste unvollständig (Plan 26-05 T1)

Siehe Risk 5. Plan listet nur 5 Stub-Einträge mit `// ...` Auslassungspunkten. Konkret im action-Text präzisieren: „Map ALL 12 tools from the existing `tools` array (Claude, ChatGPT, Gemini, Perplexity, NotebookLM, Midjourney, ElevenLabs, Gamma, Runway, GitHub Copilot, Notion AI, Make) to the new `{slug, title, summary, category, logo_domain, quick_win}` shape. Map: name→title, cat→category, desc→summary, logo_domain=null, quick_win=null."

### Warning #3 — Header-Renderer (Plan 26-06 T1)

Siehe Risk 6. Renderer-Update muss explicit sein, nicht "if some reason..." conditional.

### Warning #4 — robots.txt nicht explicit verified (A10)

Block A Success-Criterion „Robots.txt erlaubt Crawl" hat keinen expliziten Check in den Plans. Existing `apps/website/app/robots.ts` (verifiziert):

```ts
{
  rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
  sitemap: "https://generation-ai.org/sitemap.xml",
}
```

Das **ist** allow-all + Sitemap-Reference — passt schon. Aber kein Plan verifiziert das explicit. Plan 26-06 T3 UAT-Item „Robots.txt: visit /robots.txt — allow all, sitemap URL present" deckt es ab → **OK retrospektiv**, aber der Plan dokumentiert nicht, dass robots.ts NICHT geändert werden muss.

**Fix-Hint:** In 26-03 T3 als info-Note ergänzen: „robots.ts existiert bereits mit allow-all + Sitemap-URL — keine Änderung nötig."

### Warning #5 — HomeClient-Splash-Logic-Erhalt (Plan 26-05 T3)

**Befund:** `apps/website/components/home-client.tsx` hat zusätzlich zu MotionConfig + Header + main + Footer:
- `useState(showContent, splashDone)`
- `<TerminalSplash onComplete={handleSplashComplete} skipIfSeen={true} />`
- `transition-all duration-700` wrapper auf den main-Content
- `<main id="main-content" className="min-h-screen pt-20">`

Plan 26-05 T3 (HomeClient-Refactor) sagt nur: "Update HomeClientProps … Replace `<ToolShowcaseSection />` JSX with `{toolShowcase}`". Die Splash-Logic + transition-Wrapper + main-Element-classes werden NICHT explicit erwähnt — Risiko: Executor refactored zu "minimal" und entfernt sie versehentlich.

**Fix-Hint:** In 26-05 T3 explicit notieren:
> NICHT entfernen: TerminalSplash + showContent/splashDone state + transition-all wrapper + `<main id="main-content" className="min-h-screen pt-20">`. Nur die ToolShowcase-Import + JSX-Position ersetzen, Rest bleibt 1:1.

### Info #2 — Hero-Pattern-Reference ungenau (Plan 26-02 T1)

Plan 26-02 T1 sagt: „Match the scale used by /about + /partner if they exist; else use the research §2.5 community-hero shape." Diese Subpages **existieren NICHT** (verifiziert via `ls app/`). Der Executor wird auf Path B fallen (research §2.5). Das ist OK, aber die Formulierung ist unnötig conditional.

**Fix-Hint:** Vereinfachen zu „Use research §2.5 community-hero shape (LabeledNodes BG + max-w-4xl + --fs-display) — matches Memory:hero_pattern_subpages."

---

## 6. Cross-Plan Data Contract Check

| Data Entity | Producer Plan | Consumer Plan | Compatible? |
|-------------|---------------|---------------|-------------|
| `Article` type / `ArticleFrontmatter` | 26-01 (frontmatter.ts) | 26-02 (carousel), 26-03 (article page), 26-05 (community-preview) | YES — single source, exported type |
| `getAllArticles()` | 26-01 | 26-02, 26-03 (sitemap), 26-05 | YES — same return shape, sorted newest-first |
| `getArticleBySlug()` | 26-01 | 26-03 | YES |
| `FeaturedToolsResponse` | 26-04 | 26-05 | YES — defined in 26-04, imported via type-only fetch in 26-05 |
| `BeispielBadge` | 26-04 (extract) | 26-05 (community-preview events column), 26-04 (tool-showcase removes after) | YES |
| `FEATURED_TOOLS` const | 26-04 (export) | 26-04 internal | YES |
| MDX file body (rendered Content) | 26-01 (mdx-components.tsx + content/community/*) | 26-03 (`import()` slug → MDX module) | YES — generateStaticParams whitelists slugs |

**Keine Daten-Inkompatibilitäten.**

---

## 7. CLAUDE.md Compliance Check

CLAUDE.md key rules:
- Umlaute echte ä/ö/ü/ß — Plan 26-01 T3 explicit „Use real German umlauts (ä, ö, ü, ß) per Memory rule, NOT ae/oe/ue/ss" → COMPLIANT
- Changesets pro Änderung — alle 6 Plans haben changeset-creation steps → COMPLIANT
- GSD-Workflow STATE.md update — 26-06 T-output: "update STATE.md with Phase 26 done" → COMPLIANT
- Test before "fertig" — alle Wave-2/3 Plans haben pnpm test + manueller checkpoint → COMPLIANT
- CSP/force-dynamic intakt — explicit dokumentiert in 26-01, 26-03 → COMPLIANT
- Kein Push ohne OK — autonomous flag heißt local execute, nicht push → COMPLIANT

---

## 8. Recommended Next Steps

**Vor Execution:**

1. **(BLOCKER)** Plan 26-01 T1 ergänzen: `vitest.config.mts` include-Pattern updaten auf `["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"]` (oder gleichwertig). Identischer Step in Plan 26-04 T1 für `apps/tools-app/vitest.config.mts`.
2. **(WARNING)** Plan 26-05 T1: FALLBACK_TOOLS-Liste auf alle 12 Tools spezifizieren mit explicit shape-mapping rule.
3. **(WARNING)** Plan 26-06 T1: Desktop-Nav-Renderer-Update als konkreter Step (konditional `<a>` vs `<Link>`).
4. **(WARNING)** Plan 26-05 T3: Explicit „NICHT entfernen"-Note für TerminalSplash + main-classes + transition-wrapper.
5. **(WARNING)** Plan 26-03 T3: Info-Note „robots.ts ist bereits korrekt — kein Change nötig".
6. **(INFO)** Plan 26-02 T1: Hero-Pattern-Reference zu „research §2.5" vereinfachen.

**Optional vor Execution:**

7. **(INFO)** 26-CONTEXT.md updaten: D-17..D-23 als „Detail Defaults (post-discuss)" Sektion ergänzen, sodass die 23 Decisions in einer Source-of-Truth dokumentiert sind. Plan-Index hat sie bereits — Persistenz nur fürs Audit.

**Execution-Strategie nach Fixes:**

- Wave 1 starten (26-01) → vitest-include + alle 4 MDX + Helper + Tests
- Wave 2 parallel (26-02 ‖ 26-04) → /community Page + Featured-Tools-API + Badge-Extract
- Wave 3 parallel (26-03 ‖ 26-05) → Article-Page + Showcase-Refactor (jeweils mit Visual-Checkpoint)
- Wave 4 (26-06) → Header-Nav + Lighthouse + UAT

Total estimated context-budget: 6 plans × ~50min = ~5h Executor-Zeit, parallelisiert ~2.5h Wall-Clock. **Innerhalb Phase-Budget.**

---

## Summary

**Verdict:** PASS-WITH-NOTES. Plans erreichen das Phase-26-Goal vollständig (15/15 Block-A + 6/6 Block-B Success-Criteria adressiert, 23/23 Decisions implementiert). Ein konfigurations-blockierendes Problem (vitest include-Pattern) **muss** vor Execution gefixt werden, da sonst alle Test-Verify-Steps durchfallen. 4 Warning-Level-Schwächen sind beheblich mit kleinen Edit-Steps in den jeweiligen Plans.

**Blocker count:** 1
**Warning count:** 4
**Info count:** 2

**Recommended next step:** Plan-Edit-Pass (geschätzt ~15min) zur Adresssierung der 1 Blocker + 4 Warnings, dann Execution starten mit Wave 1 (26-01).

---

## Fix-Pass Update — 2026-04-25

**Fix-Pass applied 2026-04-25, Blocker resolved, Warnings addressed.**

Edits in-place, keine Re-Numbering:

| Item | Status | Plan/Task | Concrete Edit |
|------|--------|-----------|---------------|
| Blocker #1 (vitest include website) | RESOLVED | 26-01 T1 step 4 (NEW) | `apps/website/vitest.config.mts` include broadened to `["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"]`; verify-step prüft Button.test bleibt entdeckt; frontmatter `files_modified` + `must_haves` + `success_criteria` aktualisiert |
| Blocker #1 (vitest include tools-app) | RESOLVED | 26-04 T1 step 4 (NEW) | `apps/tools-app/vitest.config.mts` selber Fix; frontmatter `files_modified` + `must_haves` + `success_criteria` aktualisiert |
| Warning #2 (FALLBACK_TOOLS truncation) | RESOLVED | 26-05 T1 step 2 | FALLBACK_TOOLS jetzt mit allen 12 Slugs explizit gelistet (Claude, ChatGPT, Gemini, Perplexity, NotebookLM, Midjourney, ElevenLabs, Gamma, Runway, GitHub Copilot, Notion AI, Make), Shape-Mapping dokumentiert, automated-verify zählt `slug:`-Vorkommen ≥ 12, Visual-Checkpoint zählt 12 Tools im Fallback |
| Warning #3 (Header Desktop-Renderer) | RESOLVED | 26-06 T1 step 2 (NEW) | Conditional `link.external ? <a target=_blank> : <Link>` als verpflichtender Step; Link-Import-Check; automated-verify prüft `link.external ?` + `import Link from "next/link"` patterns |
| Warning #5 (HomeClient preserve) | RESOLVED | 26-05 T3 | Explicit NICHT-entfernen-Block für TerminalSplash + showContent/splashDone state + transition wrapper + `<main id="main-content" className="min-h-screen pt-20">` + MotionConfig nonce; automated-verify enthält grep-guards für TerminalSplash, main-content id, showContent state |
| Warning #4 (robots.ts info-note) | RESOLVED | 26-03 T3 (info-note) + 26-03 objective + frontmatter | Plan dokumentiert robots.ts als bereits konform, KEIN Code-Edit; Plan 26-06 UAT updated zu "No code change in this phase"; success_criteria enthält `robots.ts NOT modified` checkbox |
| Info #2 (Hero-Pattern-Reference 26-02) | NOT TOUCHED | — | Per User-Auftrag nicht im Scope dieses Fix-Passes |
| Info #1 (D-17..D-23 in CONTEXT.md) | NOT TOUCHED | — | Per User-Auftrag nicht im Scope dieses Fix-Passes |

**Files edited:**
- `26-01-PLAN.md` — Task 1 erweitert, frontmatter ergänzt
- `26-03-PLAN.md` — Task 3 info-note + objective + frontmatter ergänzt
- `26-04-PLAN.md` — Task 1 vitest-fix-step + frontmatter ergänzt
- `26-05-PLAN.md` — Task 1 FALLBACK_TOOLS-12 + Task 3 preserve-block, must_haves + success_criteria ergänzt
- `26-06-PLAN.md` — Task 1 Renderer-Rewrite-Step + interfaces-Block + must_haves ergänzt

**Wave-Zuordnung unverändert.** Plan-Struktur unverändert. Keine neuen Plans, keine Re-Numbering.

**Status nach Fix-Pass:** Ready for execution. Next: `/gsd-execute-phase 26` mit Wave 1 = 26-01.
