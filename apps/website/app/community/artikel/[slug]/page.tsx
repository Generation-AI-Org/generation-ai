import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getArticleBySlug, getArticleSlugs } from "@/lib/mdx/community";
import { buildArticleSchema } from "@/lib/schema";
import { ArticleShell } from "./article-shell";

// Phase 26 Plan 03 Task 2 — Article-Detail Page `/community/artikel/[slug]`.
//
// Implements D-02 (echte Unterseite), D-04 (KI-News Badge), D-05 (CTA-am-Ende),
// D-09 (Schema.org Article JSON-LD), D-13 + D-22 (root OG inherits).
//
// Root layout has `force-dynamic` (Phase 13 CSP-Nonce). `generateStaticParams`
// still runs as type-check + dynamicParams gate so unknown slugs return 404
// without an FS hit (RESEARCH §1 Pitfall 1). All pages remain SSR — that's OK.

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Build-time slug whitelist for `dynamicParams = false` 404 gate (T-26-03-02). */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

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
      // No og:image override — root app/opengraph-image.tsx inherits (D-22).
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

  // Dynamic import — slug comes from generateStaticParams whitelist so
  // Webpack/Turbopack bundles all 4 MDX files at build (RESEARCH Pitfall 4).
  // Path-prefix `@/content/community/` is literal — no path-traversal vector.
  const { default: Content } = await import(`@/content/community/${slug}.mdx`);

  const jsonLd = buildArticleSchema(article.frontmatter);
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <ArticleShell nonce={nonce}>
      <article className="mx-auto max-w-2xl px-6 py-24 sm:py-32">
        {/* Schema.org Article JSON-LD (D-09).
            XSS-escape `<` → `\u003c` (T-26-03-01) per Next.js canonical doc. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {/* KI-News Badge (D-04) — only on `kind: "ki-news"`. */}
        {article.frontmatter.kind === "ki-news" && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
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

        {/* MDX body renders via mdx-components.tsx custom map (D-19). */}
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
    </ArticleShell>
  );
}
