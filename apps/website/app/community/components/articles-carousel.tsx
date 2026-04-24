"use client";

import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/mdx/frontmatter";

// Phase 26 Plan 02 — Article-Carousel (D-02, D-04, RESEARCH §5.1).
// CSS scroll-snap (Tailwind v4 builtin), kein Embla / kein JS-Animation.
// Reduced-Motion ist no-op weil scroll-snap user-driven ist.
// Section-Header lebt inline hier (Plan-Notiz: minimize file count).
//
// A11y:
//   - Container: role="region" + aria-label + tabIndex={0}
//   - Tab focus → Pfeiltasten scrollen (browser-native)
//   - Cards sind <Link> (focusable + keyboard-aktivierbar)
//
// KI-News badge erscheint nur bei kind === "ki-news" (D-04).
// Cards verlinken intern auf /community/artikel/[slug] (Plan 26-03 wires the route).

interface Props {
  articles: Array<{ slug: string; frontmatter: ArticleFrontmatter }>;
}

export function ArticlesCarousel({ articles }: Props) {
  return (
    <section
      aria-labelledby="community-articles-heading"
      data-section="community-articles"
      className="bg-bg-elevated py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
              {"// aus der community"}
            </p>
            <h2
              id="community-articles-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-text"
            >
              Was wir gerade teilen.
            </h2>
          </div>
        </div>

        {/* Carousel — full bleed on mobile via -mx-6 */}
        <div
          role="region"
          aria-label="Community-Artikel"
          tabIndex={0}
          className="-mx-6 px-6 sm:mx-0 sm:px-0 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ scrollbarColor: "var(--border) transparent" }}
        >
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/community/artikel/${article.slug}`}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] group block bg-bg-card border border-border rounded-2xl p-6 transition-all hover:border-brand-neon-6 hover:shadow-[0_0_24px_var(--accent-glow)]"
            >
              {article.frontmatter.kind === "ki-news" && (
                <span
                  className="inline-flex items-center gap-1 mb-3 rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted"
                  aria-label="KI-News"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
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
      </div>
    </section>
  );
}
