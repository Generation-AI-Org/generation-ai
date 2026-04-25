---
phase: 26
slug: community-page-and-subdomain-integration
type: research
status: research-complete
created: 2026-04-25
researcher: gsd-phase-researcher
worktree: /Users/lucaschweigmann/projects/generation-ai-phase-26
branch: feature/phase-26-community
---

# Phase 26 — Research

> Implementation-Research für `/community`-Seite (Block A) + Featured-Tools-API + Community-Preview-Refresh (Block B). 16 Decisions in 26-CONTEXT.md sind locked. Diese Research liefert konkrete Code-Patterns, Stack-Versionen, File-Layouts und Pitfalls für den Planner.

**Confidence:** HIGH (Stack-Setup, MDX-Pipeline, Sitemap, Schema, API-Contract). MEDIUM (Tailwind-typography Notwendigkeit — siehe §1.5).

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01** — `/community` ist eigene Seite auf Hauptdomain, nicht nur Landing-Section.
- **D-02** — Blog-Teaser öffnen als **echte Unterseite** `/community/artikel/[slug]`, nicht Modal.
- **D-03** — MDX-Files im Repo als Content-Source. Parallel-Pipeline zu `/events` (Phase 22.5).
- **D-04** — KI-News-Beiträge laufen in gleicher Pipeline, unterschieden durch `kind: "ki-news"` Frontmatter.
- **D-05** — Artikel-Unterseiten: 2-3 Absätze + Link auf Original-Post in Circle. Teaser-Strategie.
- **D-06** — Start-Content: Placeholder-Artikel. Echte Content kommt sukzessive nach.
- **D-07** — Featured-Tools-API: Public ohne Auth, Vercel-Edge-Cache statt eigenes Rate-Limit.
- **D-08** — Community-Preview-Section auf Landing nutzt Option A (MDX-Teaser) für V1.
- **D-09** — Schema.org Article Markup auf Artikel-Unterseiten.
- **D-10** — MDX-Stack: `@next/mdx` + `gray-matter`. Kein Contentlayer, kein `next-mdx-remote`. Wiederverwendbar für `/events`.
- **D-11** — Start-Artikel: 3 + 1 = drei `kind: artikel` + ein `kind: ki-news` Placeholder.
- **D-12** — Pillar-Visualisierungen: Lucide-Icons + Bento-Grid-Pattern reused aus `offering-section.tsx`. Icons: `Users` / `BookOpen` / `Newspaper` / `Lock`.
- **D-13** — OG-Image pro Artikel: Statisches Default-OG-Image. Dynamisches `opengraph-image.tsx` deferred.
- **D-14** — `circleUrl`-Validation: Trust-the-author. Kein Build-Time-Fetch.
- **D-15** — Tool-Showcase-Migration: Upgrade in-place der existing `tool-showcase-section.tsx`. Datenquelle wechselt von hardcoded → API mit ISR `revalidate: 300`.
- **D-16** — Re-Deploy-Strategie für neue MDX-Artikel: Auto-Deploy via main-Push. Kein Webhook.

### Claude's Discretion

- Konkrete Library-Versionen (verifiziert in §1.1)
- Helper-Module-Layout (`apps/website/lib/mdx/*`)
- Carousel-Implementation (CSS-Snap vs. Lib — siehe §5)
- Tailwind-typography ja/nein (siehe §1.5)
- Schema.org Article Field-Selection (innerhalb Spec)
- API-Endpoint-Shape Tools-App `/api/public/featured-tools` (CORS-Header optional, da nur server-side fetched)
- Header-Nav „Community"-Link Behavior — siehe §10 Open Questions

### Deferred Ideas (OUT OF SCOPE)

- Content-Management-UI für Featured-Flag
- AI-Content-Agent für KI-News
- Circle-Posts-API live (Option B in Block B)
- Search auf /community-Artikel
- Artikel-Kategorien/Tags
- Kommentare/Reactions
- Dynamisches `opengraph-image.tsx` pro Artikel

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| Block A | `/community`-Seite mit 4 Pillars + Carousel + Artikel-Unterseiten | §1 (MDX-Stack), §2 (Pillars), §5 (Carousel), §6 (Schema), §7 (Sitemap) |
| Block B | Featured-Tools-API + Community-Preview MDX-Migration | §3 (Tools-App API), §4 (Server-Component-Fetch + ISR), §8 (Env-Vars) |

---

## Project Constraints (from CLAUDE.md / STATE.md)

- **Test before "fertig"** — UI-Änderungen im Browser testen, kein Push ohne OK, kein Prod-Deploy ohne OK.
- **Changeset bei jeder Änderung** — `pnpm changeset` interaktiv, Datei mit committen.
- **GSD-Workflow** — STATE.md ist Source of Truth.
- **Umlaute in user-facing Content** — echte ö/ä/ü/ß auf Website/Legal/Artikeln (Memory-Eintrag).
- **CSP-Nonce-Pattern intakt halten** — Layout `force-dynamic` muss bleiben (siehe LEARNINGS.md). Implikation für MDX → §1.4 (Pitfall 1).

---

## Summary

Phase 26 ist **zweischichtig**: Block A baut die `/community`-Seite mit MDX-Pipeline und vier Sektionen (Hero, Pillars, Article-Carousel, Final-CTA) + dynamische Artikel-Unterseiten. Block B migriert Tool-Showcase auf API-Daten und upgradet Community-Preview auf MDX-Datenquelle.

Der **technische Kern** ist die MDX-Pipeline. Sie ist NEU im Repo (kein bestehender Code, keine bestehenden Helper) und wird in Phase 22.5 (`/events`) wiederverwendet → die Helper unter `apps/website/lib/mdx/*` müssen domain-agnostisch gebaut werden (parametrisiertes Content-Directory + Frontmatter-Schema-Generic).

**Primary recommendation:** `@next/mdx` (file-routing-Loader) für MDX→React-Compilation + `gray-matter` für Frontmatter-Parsing als separater Pfad für Index/Sitemap. Zwei Read-Pfade — einer per `import()` für gerenderten Body (Server Component), einer per `fs + gray-matter` für Listing/Metadata. Das ist der Next.js-16-canonical Pattern, kein Contentlayer (Maintenance-Mode), kein `next-mdx-remote` (RSC-Friction laut D-10).

**Wichtigster Pitfall:** Root-Layout hat `export const dynamic = "force-dynamic"` (für CSP-Nonce per Request, locked seit Phase 13). Das **propagiert auf alle Children** und verhindert Static-Rendering. `generateStaticParams` läuft trotzdem zum Build-Zeitpunkt für Type-Check + Path-Discovery, aber Pages werden zur Request-Zeit gerendert. **Konsequenz:** MDX-File-Reads müssen via React `cache()` memoized werden, sonst pro Request neu vom FS gelesen. Akzeptabel für ~10 Artikel, aber dokumentieren.

---

## Standard Stack

### 1.1 Core (verified versions, npm registry, 2026-04-25)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@next/mdx` | `16.2.4` | MDX-Loader für Next.js (file-extension `.mdx` als Routes/Imports) | Offiziell Vercel-maintained, Next.js-16-aligned. [VERIFIED: npm view @next/mdx version → 16.2.4] |
| `@mdx-js/loader` | `3.1.1` | Webpack/Turbopack-Loader (peer von @next/mdx) | Pflicht-Peer laut Next.js-Docs. [VERIFIED: npm view @mdx-js/loader version → 3.1.1] |
| `@mdx-js/react` | `3.1.1` | React-Renderer für MDX-Output | Pflicht-Peer laut Next.js-Docs. [VERIFIED: npm view @mdx-js/react version → 3.1.1] |
| `@types/mdx` | `2.0.13` | TypeScript-Typings für MDX-Imports | Required für `MDXComponents`-Type. [VERIFIED: npm view @types/mdx version → 2.0.13] |
| `gray-matter` | `4.0.3` | Frontmatter-Parser (YAML→JS) | De-facto Standard im JS-Ökosystem, in Next.js-Docs ausdrücklich empfohlen. [VERIFIED: npm view gray-matter version → 4.0.3] |

### 1.2 Optional (Tailwind-typography — siehe Diskussion §1.5)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tailwindcss/typography` | `0.5.19` | `prose`-Klassen für Body-Text-Styling | [VERIFIED: npm view] |

### 1.3 Already Installed (kein Install nötig)

- `lucide-react` `^1.8.0` — für Pillar-Icons (`Users`, `BookOpen`, `Newspaper`, `Lock`) — D-12
- `motion` `^12.38.0` — für ggf. Carousel-Hover-Effekte (optional)
- `geist` — Mono+Sans (Body-Text-Font für Article-Body)

**Installation (verified):**

```bash
# Block A — MDX Stack (D-10)
pnpm --filter @genai/website add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter

# Optional (siehe §1.5):
pnpm --filter @genai/website add -D @tailwindcss/typography
```

### 1.4 Alternatives Considered (rejected per D-10)

| Instead of | Could Use | Tradeoff | Why Rejected |
|------------|-----------|----------|--------------|
| `@next/mdx` + `gray-matter` (gewählt) | Contentlayer | Tighter typing, content collections | Maintenance-Mode seit 2024, Repo verwaist |
| `@next/mdx` + `gray-matter` (gewählt) | `next-mdx-remote` (`compileMDX`) | Runtime MDX-Compilation, kein Build-Time-Loader | RSC-Friction, läuft bei jedem Request neu (langsamer); D-10 explicit raus |
| `gray-matter` separat | `remark-frontmatter` + `remark-mdx-frontmatter` | Frontmatter im MDX-Pipeline integriert (kein separater Read) | Mehr Plugins, kein einheitlicher Pfad für Index-Listing — `gray-matter` reicht für unsere 2 Read-Pfade |
| `export const metadata` direkt im MDX (Alex-Chan-Pattern) | — | Kein YAML-Frontmatter | Decision D-10 explicit YAML-Frontmatter; einfacher für Non-Coder zu authoring |

### 1.5 `@tailwindcss/typography` — Diskussion

**Aktueller Code-Status:** Class `prose prose-invert` wird in `app/impressum/page.tsx` und `app/datenschutz/page.tsx` verwendet, aber das Plugin ist **nicht** in package.json [VERIFIED: grep packages/config/, apps/website/package.json]. Die Klassen sind also no-ops aktuell — Body-Styling auf Legal-Seiten kommt aus dem space-y-8-Wrapper, nicht aus Tailwind-prose. (Bedeutet: bestehende Seiten haben kein echtes Body-Typography-System.)

**Empfehlung für /community/artikel/[slug] Body:**

**Option A (empfohlen):** Custom Body-Styling via globalem CSS oder lokalem MDX-Components-Map.
- Keine zusätzliche Dependency
- Passt zum bestehenden Design-System (Geist-Font, brand-tokens)
- `mdx-components.tsx` mappt h1/h2/h3/p/ul/ol/code/blockquote auf brand-aware Tailwind-Klassen
- Konsistent mit „kein Hand-Roll" — die Custom-Components sind dünn und einmalig

**Option B:** Plugin installieren + `prose-invert` modifiziert mit brand-tokens.
- Schneller out-of-box
- Aber: Plugin ist Tailwind-v3-Roots, in v4 noch via JS-Plugin verfügbar aber Color-Customization erfordert komplexes `prose-headings:text-...` chaining
- Rolled-back: Existing `prose prose-invert` in Impressum/Datenschutz hat aktuell keinen Effekt (Plugin nicht installed) → Phase 26 sollte das nicht zementieren

→ **Empfehlung Plan: Option A** (custom MDX-Components-Map). Kosten: ~30-50 LOC in `mdx-components.tsx`. Win: kein Plugin, brand-aligned, eine Typography-Source-of-Truth.

---

## Architecture Patterns

### 2.0 Recommended File Layout (Block A)

```
apps/website/
├── content/
│   └── community/
│       ├── bachelorarbeit-mit-claude.mdx
│       ├── prompting-fuer-einsteiger.mdx
│       ├── 5-tools-bwl.mdx
│       └── ki-news-kw17-2026.mdx        # kind: ki-news
├── lib/
│   └── mdx/
│       ├── index.ts                      # public exports
│       ├── community.ts                  # community-spezifisch (slug, type)
│       ├── frontmatter.ts                # zod-schema oder Type-Definition
│       └── reader.ts                     # generic fs + gray-matter helper
├── mdx-components.tsx                    # PFLICHT @next/mdx, Project-Root, NICHT in app/
├── next.config.ts                        # withMDX wrapper hinzufügen
└── app/
    └── community/
        ├── page.tsx                      # /community Landing
        ├── artikel/
        │   └── [slug]/
        │       └── page.tsx              # /community/artikel/[slug]
        └── components/                   # community-spezifische Sections
            ├── community-hero.tsx
            ├── pillars-grid.tsx
            └── articles-carousel.tsx
```

### 2.1 Pattern 1: `next.config.ts` mit `withMDX`

Existing Config (apps/website/next.config.ts) hat security headers + env. Erweitern:

```typescript
// Source: https://nextjs.org/docs/app/guides/mdx (verified 2026-04-25)
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const securityHeaders = [/* unverändert */];

const nextConfig: NextConfig = {
  // mdx als gültiges Page-Extension neben tsx
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  env: {
    NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "",
    // NEU für Block B (siehe §8):
    NEXT_PUBLIC_TOOLS_APP_URL: process.env.NEXT_PUBLIC_TOOLS_APP_URL || "https://tools.generation-ai.org",
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withMDX = createMDX({
  // Optional: remark/rehype plugins. Für V1 leer — kein remark-gfm nötig
  // (deutsche Artikel mit kurzen 2-3 Absätzen brauchen keine Tabellen).
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
```

**Note:** Für Turbopack-Compat: Plugins als String + Options-Tuple, nicht als JS-Funktionen. V1 ist Plugin-Liste leer → kein Issue.

### 2.2 Pattern 2: `mdx-components.tsx` (PFLICHT, Project-Root)

```typescript
// apps/website/mdx-components.tsx
// Source: https://nextjs.org/docs/app/guides/mdx (file convention, REQUIRED)
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-mono text-3xl font-bold tracking-tight text-text mb-6">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-mono text-2xl font-bold tracking-tight text-text mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-mono text-lg font-bold text-text mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base leading-[1.7] text-text-secondary mb-5">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover,var(--accent))]"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-5 text-text-secondary space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-5 text-text-secondary space-y-2">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--accent)] pl-4 py-1 my-6 text-text italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-sm text-text">
      {children}
    </code>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

**Wichtig:** Diese Datei MUSS im **Project-Root** liegen (`apps/website/mdx-components.tsx`), NICHT in `app/`. @next/mdx scheitert sonst silent — Pages rendern als raw MDX-String. [CITED: nextjs.org/docs/app/guides/mdx, "Add an mdx-components.tsx file" — Required]

### 2.3 Pattern 3: Frontmatter Schema + Reader (`lib/mdx/`)

```typescript
// apps/website/lib/mdx/frontmatter.ts
// Source: 26-CONTEXT.md Frontmatter-Schema

export type ArticleKind = "artikel" | "ki-news";

export interface ArticleFrontmatter {
  title: string;
  slug: string;        // muss mit Filename matchen
  date: string;        // ISO-Date YYYY-MM-DD
  readingTime: number; // Minuten
  kind: ArticleKind;
  circleUrl: string;
  excerpt: string;     // Teaser + OG-Description
}

export interface Article {
  frontmatter: ArticleFrontmatter;
  /** Pfad relative zu content/community/, ohne .mdx-Extension. */
  slug: string;
}
```

```typescript
// apps/website/lib/mdx/reader.ts
// Generic helper — wird in Phase 22.5 (/events) ebenfalls genutzt.
import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";  // RSC memoization
import matter from "gray-matter";

export interface ReadAllOpts<T> {
  /** Absolute path or path relative to process.cwd() */
  contentDir: string;
  /** Optional validator/normalizer for raw frontmatter dict. */
  validate?: (raw: Record<string, unknown>, slug: string) => T;
}

/**
 * Liest alle .mdx-Files aus contentDir und parst Frontmatter via gray-matter.
 * Memoized via React cache() — gleicher Call innerhalb eines RSC-Render-Trees
 * trifft das FS nur einmal (mitigation für force-dynamic root layout).
 */
export const readAllFrontmatter = cache(async <T>(opts: ReadAllOpts<T>) => {
  const dir = path.isAbsolute(opts.contentDir)
    ? opts.contentDir
    : path.join(process.cwd(), opts.contentDir);
  const files = await fs.readdir(dir);
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

  const items = await Promise.all(
    mdxFiles.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      const frontmatter = opts.validate
        ? opts.validate(data, slug)
        : (data as T);
      return { slug, frontmatter };
    })
  );

  return items;
});
```

```typescript
// apps/website/lib/mdx/community.ts
import type { ArticleFrontmatter } from "./frontmatter";
import { readAllFrontmatter } from "./reader";

const COMMUNITY_DIR = "content/community";

function validateArticleFrontmatter(
  raw: Record<string, unknown>,
  fileSlug: string
): ArticleFrontmatter {
  // Defensive: throw informative if required field missing.
  // Build-time fail > runtime undefined.
  const required = ["title", "slug", "date", "readingTime", "kind", "circleUrl", "excerpt"];
  for (const k of required) {
    if (raw[k] === undefined || raw[k] === null) {
      throw new Error(
        `[mdx/community] Missing frontmatter field "${k}" in content/community/${fileSlug}.mdx`
      );
    }
  }
  if (raw.kind !== "artikel" && raw.kind !== "ki-news") {
    throw new Error(
      `[mdx/community] Invalid kind "${raw.kind}" in ${fileSlug}.mdx. Allowed: "artikel" | "ki-news".`
    );
  }
  if (raw.slug !== fileSlug) {
    throw new Error(
      `[mdx/community] Frontmatter slug "${raw.slug}" doesn't match filename ${fileSlug}.mdx`
    );
  }
  return raw as unknown as ArticleFrontmatter;
}

/** Sorted newest first per D-03 (chronologisch sortiert, neueste links). */
export async function getAllArticles() {
  const items = await readAllFrontmatter<ArticleFrontmatter>({
    contentDir: COMMUNITY_DIR,
    validate: validateArticleFrontmatter,
  });
  return items.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export async function getArticleBySlug(slug: string) {
  const items = await getAllArticles();
  return items.find((a) => a.slug === slug) ?? null;
}

export async function getArticleSlugs() {
  const items = await getAllArticles();
  return items.map((a) => a.slug);
}
```

### 2.4 Pattern 4: Article-Page mit dynamic import + generateStaticParams

```typescript
// apps/website/app/community/artikel/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getArticleBySlug, getArticleSlugs } from "@/lib/mdx/community";
import { buildArticleSchema } from "@/lib/schema";  // siehe §6

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Build-time list of valid slugs.
// NOTE: Root layout has `force-dynamic`, sodass Pages trotzdem zur Request-Zeit
// gerendert werden — generateStaticParams läuft aber als Type-Check und damit
// `dynamicParams: false` greift (404 für unbekannte Slugs ohne FS-Hit).
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;  // 404 für nicht-bekannte Slugs

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const url = `https://generation-ai.org/community/artikel/${slug}`;
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.frontmatter.title,
      description: article.frontmatter.excerpt,
      publishedTime: article.frontmatter.date,
      // OG-Image inherits from app/opengraph-image.tsx (D-13: statisches Default)
    },
    twitter: {
      card: "summary_large_image",
      title: article.frontmatter.title,
      description: article.frontmatter.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Dynamic import — @next/mdx-Loader compiliert zur Build-Zeit.
  // Achtung: import-Pfad muss statisch genug sein, damit Webpack/Turbopack
  // ihn auflösen kann. Template-String mit ${slug} funktioniert, da der
  // contentDir literal ist.
  const { default: Content } = await import(`@/content/community/${slug}.mdx`);

  const jsonLd = buildArticleSchema(article.frontmatter);

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* KI-News Badge per D-04 */}
      {article.frontmatter.kind === "ki-news" && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          KI-generiert · vom Team kuratiert
        </div>
      )}

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-text">
          {article.frontmatter.title}
        </h1>
        <p className="mt-3 font-mono text-sm text-text-muted">
          {new Date(article.frontmatter.date).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          {" · "}
          {article.frontmatter.readingTime} min Lesezeit
        </p>
      </header>

      <div className="space-y-5">
        <Content />
      </div>

      <div className="mt-16 pt-8 border-t border-border">
        <a
          href={article.frontmatter.circleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-hover,var(--accent))]"
        >
          Weiterlesen in der Community
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </article>
  );
}
```

### 2.5 Pattern 5: `/community` Landing-Page

```typescript
// apps/website/app/community/page.tsx
import { headers } from "next/headers";
import type { Metadata } from "next";
import { CommunityClient } from "./community-client";
import { getAllArticles } from "@/lib/mdx/community";

export const metadata: Metadata = {
  title: "Community — Mehr als eine Community",
  description: "Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis.",
  alternates: { canonical: "https://generation-ai.org/community" },
  openGraph: {
    type: "website",
    title: "Generation AI · Community",
    description: "Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis.",
    url: "https://generation-ai.org/community",
  },
};

export default async function CommunityPage() {
  const nonce = (await headers()).get("x-nonce") ?? "";
  const articles = await getAllArticles();
  return <CommunityClient nonce={nonce} articles={articles} />;
}
```

CommunityClient ist `'use client'` (analog zu `home-client.tsx` Pattern) und mountet Header + Sections + Footer. Sections selbst können Server-Components sein, wenn keine Interaktion nötig — Carousel ist client-side wegen Scroll-State.

### 2.6 Anti-Patterns to Avoid

- **❌ MDX-Files in `app/community/artikel/[slug]/page.mdx` direkt** — dynamic [slug] verträgt keine .mdx-Page-Files. (`page.mdx` als statische Route geht — siehe Alex-Chan-Pattern — aber das wäre route-explosion bei 10+ Artikeln.)
- **❌ `next-mdx-remote/rsc compileMDX` für jeden Request** — D-10 explicit raus.
- **❌ Body-Read direkt in `generateMetadata` UND in der Page-Component** — ohne `cache()` doppelter FS-Hit.
- **❌ `<Link>` aus next/link für externe URLs (circleUrl)** — Next-Link ist nur für Internal-Navigation. `<a href target="_blank" rel="noopener noreferrer">` für externe.
- **❌ Sitemap-Read mit `fs.readdirSync` ohne `cache()`** — sitemap.ts ist Route-Handler, force-dynamic könnte mehrfach hitten.
- **❌ JSON-LD ohne `\u003c`-Escape** — XSS-Risk via Frontmatter-Title. Pflicht laut Next.js-Doc.

---

## Block B — Tools-App Public API

### 3.1 Tools-App Architecture (verified codebase scan)

| Existing | Status |
|----------|--------|
| `apps/tools-app/app/api/` | Existiert: `account/`, `chat/`, `defuddle/`, `extract-url/`, `health/`, `voice/` |
| `apps/tools-app/lib/content.ts` | Existiert: `getPublishedTools()`, `getItemBySlug()` etc. |
| `apps/tools-app/proxy.ts` matcher | `/api/*` ist EXCLUDED — keine CSP/Auth/Session-Logic auf API-Routes ✓ |
| `content_items` Schema | Existiert in `apps/tools-app/supabase/schema.sql` — Spalten: `id, type, status, title, slug, summary, content, category, tags, use_cases, pricing_model, external_url, logo_domain, quick_win, updated_at, created_at` |
| `featured: boolean` Spalte | **Fehlt** (kein Spalte). Aktuell: hardcoded `FEATURED_TOOLS = ['chatgpt', 'claude', 'lovable', 'cursor', 'perplexity']` Array in `lib/content.ts:20` |

### 3.2 Decision: `featured`-Source — DB-Migration vs. Reuse Hardcoded Array

**Option A:** Schema-Migration `ALTER TABLE content_items ADD COLUMN featured boolean NOT NULL DEFAULT false;` + Backfill-SQL.
- Pro: Saubere Datenmodellierung, in Zukunft via Admin-UI änderbar
- Con: Schema-Migration in laufender Prod-DB, RLS-Implikationen, `update-april-2026.sql` als Pattern → neue Migration `update-phase26.sql`

**Option B:** Reuse das existing `FEATURED_TOOLS`-Array, exposed via neuem Endpoint.
- Pro: 0 Schema-Change, 0 DB-Migration. Schnellster Weg zu Block-B-Done
- Con: Featured-Status leben als Code-Konstante → Änderung = Re-Deploy

**Empfehlung:** **Option B für V1** (entspricht D-07: „Public-Endpoint ohne Auth, kein eigenes Rate-Limiting" → Implication: simple as possible). D-15 spricht von „Featured-Tools-API" und „Initial 3-5 Tools manuell als `featured: true` markieren" — das kann auch heißen „im Code-Array markiert" statt „im DB-Spalten markiert". Decision Log sollte das festhalten — siehe Open Questions §10.

Falls Option A gewünscht: separater Plan-Task für Migration. Das CONTEXT.md spricht in Block B von „Content-Schema-Migration: `featured: boolean` Flag" — Wording legt Option A nahe. **→ Klärung vor Plan-Erstellung nötig.**

### 3.3 Pattern: Public Route-Handler `/api/public/featured-tools`

Beide Optionen haben dieselbe Public-API-Shape:

```typescript
// apps/tools-app/app/api/public/featured-tools/route.ts
// Source: https://nextjs.org/docs/app/getting-started/route-handlers (verified)
import { createServerClient } from "@/lib/supabase";
import type { ContentItemMeta } from "@/lib/types";

// Wenn Option A (DB-Spalte):
//   Query mit .eq('featured', true).order('display_order')
// Wenn Option B (hardcoded):
const FEATURED_SLUGS = ["chatgpt", "claude", "lovable", "cursor", "perplexity"];

export interface FeaturedToolsResponse {
  tools: Array<{
    slug: string;
    title: string;
    summary: string;
    category: string;
    logo_domain: string | null;
    quick_win: string | null;
  }>;
  generated_at: string;
}

// CDN/Vercel-Edge cached. ISR-Pattern via Cache-Control header.
// `dynamic = "force-static"` würde das Caching auf Build-Time fixieren —
// wollen wir NICHT, weil Featured-Liste sich ändern kann ohne Re-Build.
// Stattdessen: stale-while-revalidate, 5min fresh, 30min SWR.
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("slug, title, summary, category, logo_domain, quick_win")
    .eq("status", "published")
    .eq("type", "tool")
    .in("slug", FEATURED_SLUGS);

  if (error) {
    return Response.json(
      { error: "Failed to load featured tools" },
      { status: 500 }
    );
  }

  // Sort by FEATURED_SLUGS order
  const sorted = (data ?? []).sort(
    (a, b) =>
      FEATURED_SLUGS.indexOf(a.slug) - FEATURED_SLUGS.indexOf(b.slug)
  );

  const body: FeaturedToolsResponse = {
    tools: sorted as FeaturedToolsResponse["tools"],
    generated_at: new Date().toISOString(),
  };

  return Response.json(body, {
    headers: {
      // CDN cache: 5min fresh, dann 30min stale-while-revalidate
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      // CORS: optional, da Server-Component-Fetch (server-to-server, kein CORS-Check).
      // Falls je Browser-Side: Access-Control-Allow-Origin: https://generation-ai.org
    },
  });
}
```

### 3.4 CORS-Notwendigkeit

**Verified:** Block B holt die Daten aus der Website **server-side** via Server-Component (D-15: "Server-Component fetch von tools-app `/api/public/featured-tools` mit ISR `revalidate: 300`"). Server-zu-Server-Fetch unterliegt **keinem Browser-CORS-Check**. CORS-Header sind also **nicht erforderlich für V1**.

Falls in Zukunft client-side fetched (z. B. dynamic SSR-Hydration auf der tools.generation-ai.org-Page selbst), Header explicit hinzufügen:

```typescript
"Access-Control-Allow-Origin": "https://generation-ai.org",
"Access-Control-Allow-Methods": "GET",
```

→ Nice-to-have für Block-B-V1, nicht Pflicht.

---

## Block B — Website Server-Component Fetch + ISR

### 4.1 Pattern: Tool-Showcase Server-Wrapper + Client-Carousel

D-15 sagt „Upgrade in-place" — `tool-showcase-section.tsx` bleibt vom Naming/Mount her. Aber: aktuell ist die Section `'use client'`, weil `useEffect`/`useRef` für Marquee-Animation nötig. Server-Component-Fetch mit ISR braucht Server-Component.

**Architektur-Split:**

```
apps/website/components/sections/
├── tool-showcase-section.tsx          ← bleibt, ist jetzt SERVER-Component, fetched API
└── tool-showcase-marquee.client.tsx   ← NEU, 'use client', enthält die useEffect-Marquee-Logic
```

```typescript
// apps/website/components/sections/tool-showcase-section.tsx
// Server Component — fetched API mit ISR.
// Existing 'use client' wird ENTFERNT, Marquee in separates Client-File extrahiert.
import { ArrowUpRight } from "lucide-react";
import { ToolShowcaseMarqueeClient } from "./tool-showcase-marquee.client";
import { BeispielBadge } from "@/components/ui/beispiel-badge"; // FALLS noch in tool-showcase-section.tsx → extract zu eigener File (Refactor)

const TOOLS_API = `${process.env.NEXT_PUBLIC_TOOLS_APP_URL ?? "https://tools.generation-ai.org"}/api/public/featured-tools`;
const TOOLS_BASE = process.env.NEXT_PUBLIC_TOOLS_APP_URL ?? "https://tools.generation-ai.org";

// Stub-Fallback (D-15: "Fallback auf bestehende Stub-Daten falls Fetch fehlschlägt")
const FALLBACK_TOOLS = [/* ...current hardcoded tools[] aus tool-showcase-section.tsx */];

interface FeaturedToolsAPI {
  tools: Array<{
    slug: string;
    title: string;
    summary: string;
    category: string;
    logo_domain: string | null;
    quick_win: string | null;
  }>;
  generated_at: string;
}

async function fetchFeaturedTools() {
  try {
    const res = await fetch(TOOLS_API, {
      next: { revalidate: 300 },  // ISR per D-15
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as FeaturedToolsAPI;
    return data.tools;
  } catch (err) {
    console.warn("[tool-showcase] API fetch failed, using fallback:", err);
    return FALLBACK_TOOLS;
  }
}

export async function ToolShowcaseSection() {
  const tools = await fetchFeaturedTools();

  return (
    <section
      aria-labelledby="tool-showcase-heading"
      data-section="tool-showcase"
      className="bg-bg py-24 sm:py-32 border-b border-border overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header — unchanged (BeispielBadge wird entfernt sobald API live, aber für Preview-Phase noch drin) */}
        {/* ... */}
      </div>
      <ToolShowcaseMarqueeClient tools={tools} toolsBase={TOOLS_BASE} />
    </section>
  );
}
```

```typescript
// apps/website/components/sections/tool-showcase-marquee.client.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ToolIcon } from "@/components/ui/tool-icon";

interface Props {
  tools: Array<{ slug: string; title: string; summary: string; category: string }>;
  toolsBase: string;
}

export function ToolShowcaseMarqueeClient({ tools, toolsBase }: Props) {
  // existing useRef/useEffect-Marquee-Logic, jetzt mit `tools`-prop statt hardcoded.
  // ...
}
```

**Achtung Server/Client-Boundary:** Der bestehende `BeispielBadge`-Export in `tool-showcase-section.tsx` ist `useTheme`-abhängig (Client). Beim Server-Component-Refactor muss BeispielBadge in eine eigene Client-File (`components/ui/beispiel-badge.tsx`). Dort darf er bleiben — ist unkritischer Re-Export.

→ **Side-Effect-Task:** `community-preview-section.tsx` importiert `BeispielBadge` aus `tool-showcase-section.tsx` (Line 4). Bei Refactor muss dort der Import-Pfad mitgezogen werden.

### 4.2 Pattern: Community-Preview Server-Component + MDX-Fetch

```typescript
// apps/website/components/sections/community-preview-section.tsx
// Server-Component. Liest letzte 3 Artikel aus MDX-Pipeline.
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { getAllArticles } from "@/lib/mdx/community";

export async function CommunityPreviewSection() {
  const articles = (await getAllArticles()).slice(0, 3);

  return (
    <section
      aria-labelledby="community-preview-heading"
      data-section="community-preview"
      className="bg-bg-elevated py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header — Wording-Update: keine "Beispiel"-Badges mehr, ist jetzt echter Content */}
        {/* ... */}

        <ul className="grid gap-5 sm:grid-cols-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/community/artikel/${a.slug}`}
                className="group block bg-bg-card border border-border rounded-2xl p-5 hover:border-brand-neon-6 transition-colors"
              >
                {/* ... Title + readingTime + ArrowUpRight ... */}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Link href="/community" className="...">
            Alle Artikel ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Wichtig:** Aktueller Code hat 2-Spalten-Grid (Artikel + Events). D-08 (Option A) sagt nur „letzte 3 aus content/community/" — Events-Spalte ist NICHT mehr Phase-26-Scope (Events kommt aus Phase 22.5). Decision: **Events-Spalte entfernen** im Refactor, oder mit Stub-Events-Hinweis lassen? → Open Question §10.

---

## Carousel / Horizontal-Scroll (Block A)

### 5.1 Pattern: CSS scroll-snap (kein Lib)

D-12 / Hero-Pattern bereits etabliert. Article-Carousel auf `/community`:

```tsx
// apps/website/app/community/components/articles-carousel.tsx
"use client";

import Link from "next/link";
import type { Article } from "@/lib/mdx/frontmatter";

interface Props {
  articles: Array<{ slug: string; frontmatter: Article["frontmatter"] }>;
}

export function ArticlesCarousel({ articles }: Props) {
  return (
    <div
      role="region"
      aria-label="Community-Artikel"
      tabIndex={0}
      className="
        -mx-6 px-6 sm:mx-0 sm:px-0
        flex gap-5 overflow-x-auto
        snap-x snap-mandatory
        pb-6
        [scrollbar-width:thin]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
      "
      style={{ scrollbarColor: "var(--border) transparent" }}
    >
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/community/artikel/${article.slug}`}
          className="
            snap-start shrink-0
            w-[280px] sm:w-[320px]
            group block bg-bg-card border border-border rounded-2xl p-6
            transition-all hover:border-[var(--border-accent)] hover:shadow-[0_0_24px_var(--accent-glow)]
          "
        >
          {article.frontmatter.kind === "ki-news" && (
            <span className="inline-flex items-center gap-1 mb-3 rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
              KI-News
            </span>
          )}
          <h3 className="font-mono text-lg font-bold text-text leading-snug">
            {article.frontmatter.title}
          </h3>
          <p className="mt-3 text-sm text-text-secondary line-clamp-3">
            {article.frontmatter.excerpt}
          </p>
          <p className="mt-4 font-mono text-xs text-text-muted">
            {article.frontmatter.readingTime} min Lesezeit
          </p>
        </Link>
      ))}
    </div>
  );
}
```

Tailwind-Klassen `snap-x snap-mandatory snap-start` sind Tailwind-v4 builtin. Kein Plugin. [CITED: tailwindcss.com/docs/scroll-snap-type]

**A11y:**
- Container hat `tabIndex={0}` + `aria-label` → Keyboard-Tab kommt in den Container, dann Pfeiltasten scrollen
- Jede Card ist `<Link>` (focusable)
- Kein zusätzliches JS für Pfeil-Buttons in V1 (Roadmap)

**Reduced-Motion:** scroll-snap ist user-driven, nicht animation-driven → kein `prefers-reduced-motion`-Issue.

### 5.2 Existing Lib-Check

| Component | Use | Reusable? |
|-----------|-----|-----------|
| `infinite-moving-cards.tsx` | Auto-scroll Marquee (Tools, Trust) | NEIN — auto-scroll, nicht user-controlled |
| `marquee.tsx` | Auto-scroll | NEIN — gleicher Grund |
| `bento-grid.tsx` | Static grid (offering, etc.) | Ja, aber für 4-Pillar-Section, nicht Carousel |
| `signal-grid.tsx` | Hero canvas | Irrelevant |

→ Carousel ist **neuer Code**, ~50 LOC mit obigem Pattern. Kein Embla, kein Swiper, keine zusätzliche Dependency.

---

## Schema.org Article (D-09)

### 6.1 Pattern: Article Schema-Builder

```typescript
// apps/website/lib/schema.ts (extend existing file)
// Source: https://nextjs.org/docs/app/guides/json-ld + schema.org/Article spec
// Existing buildOrganizationSchema + buildWebSiteSchema bleiben unverändert.

import type { ArticleFrontmatter } from "./mdx/frontmatter";

interface JsonLdArticle {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  datePublished: string;        // ISO-Date
  dateModified?: string;        // optional
  author: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  inLanguage: string;
}

export function buildArticleSchema(fm: ArticleFrontmatter): JsonLdArticle {
  const url = `https://generation-ai.org/community/artikel/${fm.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    author: {
      "@type": "Organization",
      name: "Generation AI",
      url: "https://generation-ai.org",
    },
    publisher: {
      "@type": "Organization",
      name: "Generation AI",
      url: "https://generation-ai.org",
      logo: {
        "@type": "ImageObject",
        url: "https://generation-ai.org/og-image.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "de-DE",
  };
}
```

### 6.2 XSS-Escaping (Pflicht laut Next.js-Doc)

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
```

**Beobachtung:** Bestehender Code in `app/layout.tsx:88-98` injectet bereits `buildOrganizationSchema()` und `buildWebSiteSchema()` OHNE das `\u003c`-Escape. Das ist ein Pre-Existing Finding, **außerhalb Phase-26-Scope**. Phase 26 nutzt das Escape im neuen Article-Schema und sollte beim Code-Review-Pass auf das fehlende Escape im Layout hinweisen.

### 6.3 CSP-Vereinbarkeit

`buildCspDirectives` (lib/csp.ts) hat: `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`. JSON-LD-Tag ist `<script type="application/ld+json">` — **nicht executable**, browsers behandeln das als Data-Block, kein CSP-Block. Bestehende Org/WebSite-Schemata in layout.tsx funktionieren ohne Nonce in Prod → empirisch verifiziert. [VERIFIED: STATE.md "Site Status: ✅ Live"]

---

## Sitemap & Robots (D-09 + Block-A-Success-Criterion)

### 7.1 Pattern: Dynamic sitemap.ts mit MDX-Read

Existing `apps/website/app/sitemap.ts` (15 Zeilen) hat NUR den Root-URL-Eintrag. Erweitern:

```typescript
// apps/website/app/sitemap.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/mdx/community";

const BASE = "https://generation-ai.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/community/artikel/${a.slug}`,
    lastModified: new Date(a.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articleEntries,
    // (Other pages — about, partner, etc — werden in jeweiligen Phasen ergänzt)
  ];
}
```

**Achtung:** sitemap.ts ist Special-Route-Handler, läuft im Build separately. `getAllArticles()` mit `cache()`-wrap memoized über RSC-Tree, aber sitemap.ts hat eigenen Render-Tree → cache greift unabhängig pro Sitemap-Build. OK.

### 7.2 Robots.txt — Update minimal

Existing robots.ts allow alles außer /api → kein Update nötig. Sitemap-URL ist bereits gesetzt: `https://generation-ai.org/sitemap.xml`. ✓

---

## Environment Variables

| Var | Required | Default | Purpose | New? |
|-----|----------|---------|---------|------|
| `NEXT_PUBLIC_TOOLS_APP_URL` | optional | `https://tools.generation-ai.org` | Block B fetch-target | **NEU** |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | optional | "" | Existing (Phase 12 auth) | bestehend |

**Verified:** [GREP: keine Existenz-Hits für `NEXT_PUBLIC_TOOLS_APP_URL` in apps/, packages/, .env*]. Aktuell wird `https://tools.generation-ai.org` als String-Literal in `tool-showcase-section.tsx:51` hardcodiert.

**Empfehlung:** Default-Fallback in `next.config.ts.env`-Block (siehe §2.1). Vercel-Env-Var `NEXT_PUBLIC_TOOLS_APP_URL=https://tools.generation-ai.org` für Production setzen. Für Preview-Builds ggf. `https://tools-app-git-feature-X.vercel.app` — flexible.

→ **Manual-Step im Plan:** „Vercel-Env-Var `NEXT_PUBLIC_TOOLS_APP_URL` in Production + Preview setzen."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter-Parsing | Custom YAML-Parser oder regex | `gray-matter` | YAML-Edge-Cases (dates, multiline, escape), 5M weekly downloads |
| MDX→React-Compile | `compile-from-string` Hook | `@next/mdx` Loader | Build-Time-Compilation, RSC-friendly, Next.js-canonical |
| Carousel | Custom-IntersectionObserver-Logic + JS-Snap | CSS `scroll-snap-type: x mandatory` + Tailwind utilities | Browser-native, keyboard-A11y free, 0 JS |
| Schema.org JSON-LD | Hand-typed objects per page | Builder-Function in `lib/schema.ts` (existing pattern) | Reusable, tested, type-safe |
| Sitemap-XML-Generation | `<urlset>`-Strings stringen | `MetadataRoute.Sitemap` typed export | Next.js handles XML-Encoding + escaping |
| OG-Images | `opengraph-image.tsx` per Article | Statisches Default-OG (D-13) | D-13 deferred → Roadmap |
| API-Rate-Limit für Public-Endpoint | Custom Upstash-Logic für `/api/public/featured-tools` | Vercel-Edge-Cache via `Cache-Control` | D-07 explicit |

**Key insight:** MDX-Pipeline ist die einzige neue Tech-Komponente. Alles andere (Carousel, Schema, Sitemap, API-Route) sind bekannte Next.js-Patterns ohne neue Dependencies.

---

## Common Pitfalls

### Pitfall 1: Root-Layout `force-dynamic` propagiert auf MDX-Routes

**Was geht schief:** `apps/website/app/layout.tsx:7` exportiert `export const dynamic = "force-dynamic"` — locked seit Phase 13 für CSP-Nonce-Pattern. Das **propagiert auf alle Children**. `generateStaticParams` läuft trotzdem (Type-Check + dynamicParams-Gate), ABER `next build` rendert die Pages NICHT statisch. Pages sind alle SSR-on-Request.

**Warum es passiert:** CSP-Nonce muss per-Request neu generiert werden, sonst greift `strict-dynamic` nicht (Phase 13 LEARNINGS).

**Wie vermeiden / mitigieren:**
- **NICHT versuchen** den force-dynamic auf MDX-Routes zu kontern — bricht CSP.
- React `cache()` aroundDateien-Reads (siehe §2.3 reader.ts) → pro Render-Tree nur 1 FS-Hit.
- `dynamicParams = false` auf Article-Page → nicht-existing Slugs wachen 404 ohne FS-Touch.
- ISR auf API-Routes (`revalidate: 300`) ist davon UNABHÄNGIG — Route-Handler haben eigene Cache-Semantik.

**Warning signs:** Build-Output zeigt `ƒ /community/artikel/[slug]` (dynamic) statt `● /community/artikel/[slug]` (static). Das ist **erwartet**, nicht Bug.

### Pitfall 2: `mdx-components.tsx` im falschen Ordner

**Was geht schief:** `mdx-components.tsx` in `app/` statt im Project-Root → @next/mdx findet die File nicht, Pages rendern als rohe MDX-Strings im DOM oder Build wirft Error "useMDXComponents not found".

**Wie vermeiden:** Datei MUSS in `apps/website/mdx-components.tsx` liegen (parallel zu next.config.ts, package.json). [CITED: nextjs.org/docs/app/guides/mdx — "Add an mdx-components.tsx file"]

### Pitfall 3: BeispielBadge Server/Client Boundary beim Tool-Showcase Refactor

**Was geht schief:** `tool-showcase-section.tsx` ist aktuell `'use client'` (Marquee) und exportiert dort `BeispielBadge` (theme-aware via useTheme). Bei Refactor zu Server-Component für API-Fetch (§4.1) muss BeispielBadge migriert werden.

**Side-Effect:** `community-preview-section.tsx:4` importiert BeispielBadge aus tool-showcase-section. Wenn jetzt Community-Preview ebenfalls Server-Component wird (§4.2 für MDX-Fetch), brauchen beide einen sauberen Pfad.

**Wie vermeiden:**
1. `BeispielBadge` extract → `apps/website/components/ui/beispiel-badge.tsx` als eigene `'use client'`-Komponente
2. Alle Imports (tool-showcase + community-preview) auf neuen Pfad
3. ABER: nach Block-B-Migration ist BeispielBadge gar nicht mehr in tool-showcase nötig (echte Daten statt Stubs). Trotzdem extract als Cleanup-Win.

### Pitfall 4: `import()` mit dynamic slug — Webpack/Turbopack-Compat

**Was geht schief:** `await import(\`@/content/community/${slug}.mdx\`)` — Webpack/Turbopack analysiert den Import statisch zur Build-Zeit, um zu wissen welche MDX-Files gebundled werden müssen. Wenn `slug` zur Build-Zeit unbekannt ist (z. B. von User-Input), bricht es.

**Hier OK:** `slug` kommt aus `generateStaticParams()` → Webpack sieht alle möglichen Werte zur Build-Zeit, alle MDX-Files werden gebundled. ✓

**Wie vermeiden:** Den Pfad-Prefix `@/content/community/` literal halten, nicht über Variable parametrisieren. **Niemals** User-Input direkt in `import()` → Path-Traversal-Risk + Build-Brechen.

### Pitfall 5: Sitemap nicht aktuell nach neuem Artikel

**Was geht schief:** Neuer MDX-File pushed, deployed, ABER: `/sitemap.xml` zeigt alten Stand.

**Warum:** Vercel-Edge-Cache cached sitemap.xml standard 1h. Nach `git push main` ist Build-Output frisch, aber Edge serviert noch alten.

**Wie vermeiden / akzeptieren:**
- **Akzeptieren:** Pro D-16 (Auto-Deploy via main-Push). Cache ist 1h, neuer Artikel taucht im Sitemap mit max. 1h Delay auf. Kein Blocker — Google crawlt Sitemap-Updates ohnehin nicht innerhalb von Minuten.
- Falls dringend: `revalidatePath("/sitemap.xml")` von einem Webhook → D-16 explicit raus.

### Pitfall 6: Fehlende Frontmatter-Felder fail silent

**Was geht schief:** Author committed neue MDX ohne `readingTime` → Page rendert mit `undefined min Lesezeit`.

**Wie vermeiden:** Validation in `validateArticleFrontmatter` (§2.3) wirft hard zur Read-Zeit. Build bricht. Better fail-loud than fail-silent. Das passt zu Karpathy-Prinzip „Goal-Driven" (CLAUDE.md): klare Success-Criteria.

### Pitfall 7: Layout-Shift bei Server-Component-Fetch (Block B)

**Was geht schief:** Tool-Showcase-Section streamt durch RSC. Erste Render-Pass = Skeleton, dann Content. Layout shifted.

**Wie vermeiden:**
- ToolShowcase-Section ist Async-Server-Component → Streaming ist explicit
- Setze `min-height` auf den Marquee-Container (z. B. `min-h-[180px]`) um CLS zu vermeiden
- Optional: `<Suspense fallback={<ToolShowcaseSkeleton />}>` Wrapper im home-client.tsx — aber das macht Section client-coupled. Weglassen für V1, wenn min-height reicht.

### Pitfall 8: API-Fetch zur Build-Zeit → Build-Timeout

**Was geht schief:** Server-Component fetched `/api/public/featured-tools` zur Build-Zeit. Wenn API down (Vercel-Cold-Boot, Supabase-Slow), Build-Step hängt oder bricht.

**Wie vermeiden:**
- `fetch(URL, { next: { revalidate: 300 } })` — Next.js cached den Fetch, aber bei initial Build ist's ein Hit
- Try/catch + Fallback (D-15: "Fallback auf bestehende Stub-Daten") → Build kann nie wegen API-Failure brechen
- Hartes Timeout setzen via `AbortController` (~5s) für defensive Build

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
try {
  const res = await fetch(TOOLS_API, { signal: controller.signal, next: { revalidate: 300 } });
  // ...
} catch {
  return FALLBACK_TOOLS;
} finally {
  clearTimeout(timeout);
}
```

### Pitfall 9: Header-Nav „Community" weiterhin auf Circle

**Was geht schief:** D-01 sagt /community ist Landingpage. Aber `header.tsx:30` linkt aktuell „Community" auf `https://community.generation-ai.org`. Nach Phase 26 Live wäre das inkonsistent — Non-Members landen direkt im login-walled Circle.

**Wie vermeiden:** Nav-Link ändern auf `/community` (intern). Der Direkt-Circle-Link gehört in den Hero von /community ("Direkt zur Community →" für Members).

→ **Open Question §10** — wäre Plan-Task in Block A.

### Pitfall 10: Tools-App API-Route + Sentry/Auth-Middleware

**Was geht schief:** tools-app hat Sentry + Supabase-Auth-Middleware. Wenn Public-Route fälschlich getroffen wird (z. B. Matcher-Update), Auth-Cookie-Logic blockt anonymous-Calls.

**Verified:** `apps/tools-app/proxy.ts:32` matcher excludiert `api/*` ✓. Public-Route ist sicher.

**Wie vermeiden:** Bei Plan-Task „API-Endpoint anlegen" prüfen ob Matcher noch `api`-Exclusion enthält. Regression-Test: `curl https://tools.generation-ai.org/api/public/featured-tools` ohne Cookie → 200.

---

## State of the Art

| Old Approach | Current Approach (2026) | Why |
|--------------|-------------------------|-----|
| Contentlayer | `@next/mdx` + `gray-matter` | Contentlayer maintenance-mode, no Next.js 16 testing |
| `next-mdx-remote` runtime compile | `@next/mdx` build-time loader for static MDX | RSC-Friction, Performance |
| `@tailwindcss/typography` `prose` | Custom MDX-Components-Map | Tailwind-v4 + brand-tokens better mapped via per-element overrides |
| Per-page-Imports of schema-dts | Lightweight typed builder-functions | schema-dts adds ~200KB to types, builders sind 50 LOC |
| Static `sitemap.xml` file | Dynamic `sitemap.ts` reading content/ at build | Auto-update on new MDX |
| Embla/Swiper/Slick | CSS scroll-snap | Native browser support seit Chrome 69 / Safari 11.1, 0 JS |
| OG-Images via static SVGs | `opengraph-image.tsx` (Next.js 14+) | Per-page dynamic OG — DEFERRED in D-13 |

**Deprecated/outdated to avoid:**
- `getStaticProps` / `getStaticPaths` (Pages-Router) — App Router uses `generateStaticParams` + RSC.
- `next/image-loader` für MDX-Images — Stand 2026 funktioniert `<Image>` direkt im MDX-Components-Map.

---

## Code Examples (Verified Patterns)

### Example 1: Initial MDX-File mit Frontmatter

```mdx
---
title: "Wie ich Claude für meine Bachelorarbeit genutzt habe"
slug: "bachelorarbeit-mit-claude"
date: 2026-04-20
readingTime: 6
kind: "artikel"
circleUrl: "https://community.generation-ai.org/c/community/example-post"
excerpt: "Ein Werkstattbericht: Wie Claude beim Strukturieren, Recherchieren und Polieren der Bachelorarbeit geholfen hat — und wo es gefährlich wurde."
---

Die Bachelorarbeit ist das größte Schreibprojekt der meisten Studis. KI kann
massiv helfen, aber nur wenn man weiß wo. Hier sind drei konkrete Stellen, an
denen Claude den Unterschied gemacht hat.

## 1. Struktur finden

Vor dem ersten Wort kam der erste Prompt: "Hier ist mein Thema. Welche
sinnvollen Gliederungen siehst du, und welche Logik steckt dahinter?"
Claude lieferte vier Varianten, ich konnte vergleichen, ein Hybrid bauen.

## 2. Recherche-Sparring

Statt Stunden in Google Scholar: erst mit Claude Hypothesen schärfen, dann
gezielt nach Quellen suchen. Das ersetzt keine Quellen, beschleunigt aber
das Sortieren.

## 3. Korrektur-Loop

Letzte Woche vor Abgabe: Absatz für Absatz durch Claude. "Wo ist der Bruch in
meiner Argumentation?" — manchmal nichts, manchmal eine Lücke die ich übersehen
hatte.

[Ganzen Erfahrungsbericht in der Community lesen →](https://community.generation-ai.org/c/community/example-post)
```

### Example 2: KI-News MDX-File

```mdx
---
title: "KI-News KW17/2026 — Anthropic Claude 4 Opus, Google Gemini 3, OpenAI o3-mini"
slug: "ki-news-kw17-2026"
date: 2026-04-22
readingTime: 4
kind: "ki-news"
circleUrl: "https://community.generation-ai.org/c/news/kw17-2026"
excerpt: "Die wichtigsten KI-Releases dieser Woche: Claude 4 Opus mit 1M-Context, Gemini 3 als neuer Default, o3-mini als günstige Reasoning-Option."
---

Diese Woche viel passiert. Die wichtigsten drei Releases im Schnellüberblick.

## Anthropic — Claude 4 Opus

[…]

## Google — Gemini 3 als neuer Default

[…]

[Vollständiges Briefing mit Tool-Empfehlungen in der Community →](https://community.generation-ai.org/c/news/kw17-2026)
```

### Example 3: 4-Pillar-Bento-Grid (D-12)

```typescript
// apps/website/app/community/components/pillars-grid.tsx
import { Users, BookOpen, Newspaper, Lock } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const pillars = [
  {
    title: "Austausch",
    description: "Peer-to-Peer, Fragen, Sparring. Andere Studis, gleiche Probleme.",
    icon: <Users className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
  {
    title: "Lernpfade & Kurse",
    description: "Strukturiert, im eigenen Tempo. Vom KI-Einstieg bis zur Spezialisierung.",
    icon: <BookOpen className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
  {
    title: "News & Insights",
    description: "Kuratiert. Signal statt Noise. Die wichtigsten Releases pro Woche.",
    icon: <Newspaper className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
  {
    title: "Exklusive Inhalte",
    description: "Prompt-Bibliotheken, Tool-Tiefgänge, Masterclass-Materialien.",
    icon: <Lock className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
];

export function PillarsGrid() {
  return (
    <section
      aria-labelledby="pillars-heading"
      className="bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
            // was dich drinnen erwartet
          </p>
          <h2 id="pillars-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Vier Räume, ein Ziel.
          </h2>
        </div>

        <BentoGrid className="md:grid-cols-2 md:auto-rows-[14rem]">
          {pillars.map((p) => (
            <BentoGridItem
              key={p.title}
              title={p.title}
              description={p.description}
              icon={p.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
```

`BentoGrid` ist already-built reusable component. 4-Item-Grid mit `md:grid-cols-2` (2x2). Reused statt neu gebaut.

---

## Open Questions (vor Plan-Erstellung klären mit Luca)

1. **Featured-Tools Source: DB-Migration vs. Hardcoded-Array** (§3.2)
   - Was wir wissen: D-15 sagt „Initial 3-5 Tools manuell als `featured: true` markieren". CONTEXT.md erwähnt „Content-Schema-Migration: `featured: boolean` Flag in tools-app Content-Package". Hardcoded `FEATURED_TOOLS`-Array in `lib/content.ts:20` existiert.
   - Was unklar: Spalte hinzufügen + Backfill, oder reuse Array?
   - Empfehlung: V1 mit Array (Option B) — kürzester Weg, D-07 spirit (simple). Plan-Aufwand 0. Falls Schema-Migration gewünscht: separater Plan-Task ~30 LOC SQL + RLS.

2. **Header-Nav „Community"-Link** (Pitfall 9)
   - Was wir wissen: D-01 sagt /community = Landing für Non-Members. Aktuell: header.tsx:30 linkt auf community.generation-ai.org direkt.
   - Was unklar: Ändern auf `/community` (intern)? Wo bleibt der Direkt-Circle-Link für Members?
   - Empfehlung: Header → `/community`. Direkt-Circle-Link in /community-Hero. Optional: später Member-aware Nav (Phase 25 dependency).

3. **Community-Preview-Section: Events-Spalte behalten oder entfernen?** (§4.2)
   - Was wir wissen: Aktuell 2-Spalten (Artikel + Events) mit Stub-Daten. D-08 (Option A) sagt nur „letzte 3 aus content/community/" — Events-Spalte nicht erwähnt.
   - Was unklar: Phase 22.5 (`/events`) noch nicht durch. Events-Spalte entfernen jetzt? Oder Stubs lassen bis Phase 22.5 echte Daten liefert?
   - Empfehlung: **Entfernen jetzt**. Reduce Stubs auf Landing („Beispiel"-Badges sind Lego, sollen weg). Events-Spalte kommt zurück in Phase 22.5 mit echten MDX-Events.

4. **Tailwind-typography-Plugin: installieren oder Custom-Components?** (§1.5)
   - Was wir wissen: Plugin nicht installed. `prose`-Klassen in Legal-Pages aktuell no-ops.
   - Was unklar: Plugin nachinstallieren als brand-konformes Body-System, oder Custom MDX-Components-Map?
   - Empfehlung: **Custom Map**. ~50 LOC, brand-aligned, eine Source-of-Truth.

5. **OG-Image für /community + Artikel-Pages** (D-13)
   - Was wir wissen: D-13 sagt statisches Default-OG. apps/website/app/opengraph-image.tsx existiert (root).
   - Was unklar: Reicht Root-OG für alle Articles? Oder eigenes für /community-Section?
   - Empfehlung: **Root-OG reicht** für V1. Wenn Branding-Request kommt: separates `app/community/opengraph-image.tsx` als Override.

6. **MDX-File-Naming-Konvention für KI-News**
   - Was wir wissen: D-04 unterscheidet via `kind: "ki-news"` Frontmatter, nicht Folder.
   - Was unklar: Filename-Prefix? `ki-news-kw17-2026.mdx` lesbar, aber bei 50+ Artikeln chaotisch.
   - Empfehlung: V1 keine Subfolder, alle in `content/community/*.mdx`. Roadmap: bei 30+ Artikeln Migration zu `community/artikel/*.mdx` + `community/ki-news/*.mdx`.

7. **Build-Time Frontmatter-Validation: zod oder simple checks?** (§2.3)
   - Was wir wissen: zod ist nicht im website-package.json (nur tools-app).
   - Was unklar: Hand-rolled checks (~10 LOC) vs. zod-installation für eine Validation?
   - Empfehlung: **Hand-rolled** für V1. Wenn `/events` kommt und Schema komplexer wird (`speakers`-Array, `partner` optional etc.), in Phase 22.5 zu zod refactoren.

---

## Environment Availability

> Block A ist code+content-only. Block B fügt einen API-Endpoint + Server-Side-Fetch hinzu.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node 20+ | Next.js 16 build | ✓ | per existing build | — |
| pnpm 9+ | Workspace install | ✓ | existing | — |
| Vercel Edge / CDN | Block B Cache-Control SWR | ✓ | Live | — |
| Supabase (tools-app) | Block B API queries content_items | ✓ | Live, project `wbohulnuwqrhystaamjc` | — |
| Tools-App live URL | Block B fetch target | ✓ | https://tools.generation-ai.org | Stub-Fallback (D-15) |

**Missing dependencies:** None.

**Manual config needed:**
- Vercel Env-Var `NEXT_PUBLIC_TOOLS_APP_URL` setzen (Production + Preview).

---

## Validation Architecture

> nyquist_validation status: kein `.planning/config.json` mit explicit-false-Eintrag gefunden — treat as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (existing) |
| Config file | `apps/website/vitest.config.mts` (vitest config) — exists per package.json scripts |
| Quick run command | `pnpm --filter @genai/website test` |
| Full suite command | `pnpm test` (turbo across packages) |
| Type-Check | `pnpm --filter @genai/website tsc --noEmit` (via build) |
| E2E | `packages/e2e-tools` Playwright suite (existing) |

### Phase Requirements → Test Map

| Req | Behavior | Test Type | Automated Command | File Exists? |
|-----|----------|-----------|-------------------|--------------|
| Block A | Frontmatter-Validation throws on missing fields | unit | `pnpm --filter @genai/website test lib/mdx/` | ❌ Wave 0 |
| Block A | `getAllArticles` sortiert newest-first | unit | siehe oben | ❌ Wave 0 |
| Block A | Sitemap enthält alle Article-URLs | unit (snapshot) | `pnpm --filter @genai/website test app/sitemap` | ❌ Wave 0 |
| Block A | Article-Page rendert + Schema.org JSON-LD im DOM | integration | Playwright `e2e/community.spec.ts` (NEU) | ❌ Wave 0 |
| Block A | `/community/artikel/unknown-slug` → 404 | smoke | Playwright | ❌ Wave 0 |
| Block A | Carousel keyboard-scrollable | manual | Manual UAT | manual |
| Block A | Lighthouse `/community` > 90 | manual / CI | Lighthouse CI (existing) | partial |
| Block B | API-Route returns expected JSON shape | unit | `pnpm --filter @genai/tools-app test app/api/public/featured-tools` | ❌ Wave 0 |
| Block B | Website-Section uses fallback when API down | manual | Sentry/log inspection during preview | manual |

### Sampling Rate

- **Per task commit:** `pnpm --filter @genai/website test` (~5s)
- **Per wave merge:** `pnpm test` + `pnpm build` (~30s)
- **Phase gate:** Full suite + Playwright smoke + Lighthouse run

### Wave 0 Gaps

- [ ] `apps/website/lib/mdx/__tests__/community.test.ts` — covers frontmatter validation, getAllArticles ordering
- [ ] `apps/website/lib/mdx/__tests__/reader.test.ts` — covers fs-mock + gray-matter parsing
- [ ] `apps/website/app/sitemap.test.ts` — snapshot test that all expected URLs present
- [ ] `apps/tools-app/app/api/public/featured-tools/__tests__/route.test.ts` — covers GET response shape + cache headers
- [ ] `packages/e2e-tools/specs/community.spec.ts` — Playwright: /community renders, click on article opens article page, JSON-LD script present, fallback behavior
- [ ] Test-Content-Dir: `apps/website/__fixtures__/community/` — Mock-MDX-Files für unit tests (oder use real content/community/ if D-06 placeholders are stable)

*(Existing test infrastructure (Vitest setup + Playwright e2e package) deckt das Framework — keine neuen Frameworks nötig)*

---

## Security Domain

> security_enforcement: kein explicit `false` gefunden, treat as enabled

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | nein | Public Article-Pages, public API. Auth scope unverändert. |
| V3 Session Management | nein | Phase 26 berührt keine Session/Cookie-Logic. |
| V4 Access Control | minimal | Public-API: Vercel-Edge-Rate-Limiting reicht (D-07). Tools-App-API-Route ohne Auth — `proxy.ts` matcher excludiert `api/*` ✓. |
| V5 Input Validation | yes | Frontmatter-Validation (build-time). `slug`-Param via `dynamicParams: false` → keine User-Input direkt in `import()`. |
| V6 Cryptography | nein | Keine neuen Crypto-Operationen. |
| V14 Configuration | yes | CSP intakt halten. JSON-LD-Scripts via `application/ld+json` umgehen Nonce-Requirement legitim. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via MDX-Frontmatter (Title, Excerpt) in JSON-LD | Tampering | `JSON.stringify(json).replace(/</g, "\\u003c")` — Pflicht laut Next.js-Doc |
| Path-Traversal via `slug`-Param in `import()` | Tampering | `dynamicParams: false` + `generateStaticParams` whitelist |
| MDX-injizierter `<script>`-Tag im Body | Injection | MDX-Compiler escaped HTML by default. **Custom remark/rehype plugins** könnten das aufweichen — keine Plugins in V1 ✓ |
| Open-Redirect via `circleUrl` | Tampering | D-14 trust-the-author. Gestoppt: alle `circleUrl`-Werte sind editor-controlled MDX-Frontmatter, kein User-Input. |
| Public-API DDoS via `/api/public/featured-tools` | DoS | D-07: Vercel-Edge-Cache + `s-maxage=300, stale-while-revalidate=1800` reduziert Origin-Hits dramatisch |
| API-Failure leakt Stack-Trace | Information Disclosure | Try/Catch in Route-Handler, Generic-Error-Response (siehe §3.3 code) |

### Verification Steps

- [ ] Build-Output zeigt keine MDX-Compile-Errors
- [ ] `curl -s https://tools.generation-ai.org/api/public/featured-tools | jq` ohne Cookie → 200 + JSON shape
- [ ] `curl -I https://tools.generation-ai.org/api/public/featured-tools` zeigt `Cache-Control: public, s-maxage=300, stale-while-revalidate=1800`
- [ ] View-Source `/community/artikel/[slug]`: JSON-LD-Script vorhanden, `<` korrekt escaped als `\u003c`
- [ ] `/community/artikel/non-existent-slug` → 404, kein 500
- [ ] Lighthouse SEO 100 auf `/community` und einer Artikel-Page

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel-Edge-Cache greift für `Cache-Control: s-maxage=300, stale-while-revalidate=1800` ohne zusätzliche Config | §3.3 | Origin-Hits zu häufig — D-07 Rate-Limit-Logik kompromittiert |
| A2 | Root-Layout `force-dynamic` propagiert auf MDX-Routes, lässt aber `generateStaticParams` build-time laufen | §1.4 Pitfall 1 | Build könnte mit "static-dynamic conflict" fehlen |
| A3 | `<script type="application/ld+json">` ohne Nonce passt CSP `script-src 'nonce-X' 'strict-dynamic'` (Browser behandelt als data, nicht executable) | §6.3 | JSON-LD wird CSP-blocked → kein structured data → SEO-Verlust |
| A4 | `BeispielBadge` extract → eigene Datei bricht keine bestehenden Imports anderswo | §4.1 Pitfall 3 | Build-Error bei Refactor — leicht zu fixen |
| A5 | tools-app-API-Route benötigt keine eigene CORS-Header für V1 (server-to-server fetch) | §3.4 | Browser-side fetch auf der API würde CORS blocken — nur relevant wenn Pattern wechselt |
| A6 | Phase 22.5 (`/events`) wird die MDX-Helper aus `apps/website/lib/mdx/*` reusen wie geplant | §1.4 / §2.0 | Wenn 22.5 anders implementiert: kein Reuse-Win, Phase 26 hat trotzdem funktionierende Pipeline |

**A1 verifizieren via:** Vercel-Docs / Vercel-Preview-Deploy + `curl -I` auf API-Route mit cache-Inspect.
**A2 verifizieren via:** `pnpm --filter @genai/website build` nach Implementation, Build-Output checken.
**A3 verifizieren via:** Live-Site-Inspect — bestehende JSON-LD-Tags in layout.tsx funktionieren ohne Nonce in Production [STATE.md "Site Status: ✅ Live"]. Empirisch bestätigt für gleichen Pattern.
**A6 verifizieren via:** 22.5-CONTEXT.md sagt explicit „Parallel-Pipeline zu /community-Artikel (Phase 26), gleiche Mechanik" — A6 hat HIGH-confidence per CONTEXT-Lektüre.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 MDX Guide](https://nextjs.org/docs/app/guides/mdx) — verified 2026-04-25, lastUpdated 2026-04-23
- [Next.js 16 generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — verified 2026-04-25
- [Next.js 16 Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) — verified 2026-04-25
- [Next.js 16 sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — verified 2026-04-25
- [Next.js 16 JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — verified 2026-04-25, official `\u003c`-escape
- [Next.js 16 Metadata + OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — verified 2026-04-25
- npm registry version checks (`@next/mdx 16.2.4`, `@mdx-js/loader 3.1.1`, `gray-matter 4.0.3`, `@tailwindcss/typography 0.5.19`) — verified 2026-04-25 via `npm view`
- Codebase scan: `apps/website/`, `apps/tools-app/`, `packages/config/` — verified 2026-04-25 file reads

### Secondary (MEDIUM confidence)
- [Tailwind CSS scroll-snap-type docs](https://tailwindcss.com/docs/scroll-snap-type) — utility-class verification
- [Building a blog with Next + MDX (Alex Chan)](https://www.alexchantastic.com/building-a-blog-with-next-and-mdx) — alternative-pattern-Vergleich (Route Groups + page.mdx-direkt), nicht der gewählte Pfad

### Tertiary (LOW confidence — not used as authority)
- WebSearch findings on schema.org Article — generic, used only for STRIDE-mapping

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions, install): **HIGH** — alle Versions npm-verified, alle MDX-Patterns Next.js-doc-verified
- Architecture (file-layout, helper-design): **HIGH** — folgt Next.js-canonical Pattern, mit lokalem Codebase-Adaption
- Pitfalls (force-dynamic, mdx-components-location, BeispielBadge-extract): **HIGH** — alle aus Code-Read + Doc-Cross-Check verifiziert
- Tailwind-typography-Empfehlung: **MEDIUM** — basiert auf Doku-Lektüre + Codebase-State, nicht empirisch ausprobiert
- Vercel-Edge-Cache-Verhalten (A1): **MEDIUM** — Standard-Vercel-Behavior, aber nicht in dieser Phase verifiziert
- DB-Migration-vs-Hardcoded-Empfehlung: **MEDIUM** — Decision-Sache mit Luca, nicht technisch eindeutig

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (Stack ist stable, Next.js 16 minor-Bumps möglich aber unkritisch). Bei Phase 22.5 Re-Research, da MDX-Pipeline dann live + getestet ist.

**Research input für Planner:**
Plan kann mit folgenden Wave-Strukturen anfangen:
- **Wave 0:** Test-Infra + Stub-MDX-Fixtures (parallel zu Wave 1)
- **Wave 1:** MDX-Stack-Setup (D-10) — install deps, next.config.ts, mdx-components.tsx, lib/mdx/*
- **Wave 2:** /community Page + Components (Hero, Pillars, Carousel, Final-CTA)
- **Wave 3:** Article-Page + Schema.org + Sitemap-Update + 4 Placeholder-Artikel (D-11)
- **Wave 4:** Block B (parallelisierbar mit Wave 2/3 nach Wave 1):
  - 4a: tools-app Route-Handler `/api/public/featured-tools`
  - 4b: Tool-Showcase-Section Refactor zu Server-Component (D-15)
  - 4c: Community-Preview-Section Refactor zu MDX-Datenquelle (D-08 Option A)
- **Wave 5:** Header-Nav-Update (Pitfall 9) + Cleanup BeispielBadge + Lighthouse-Pass + UAT
