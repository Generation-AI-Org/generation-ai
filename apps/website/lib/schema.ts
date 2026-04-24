/**
 * Schema.org JSON-LD builders for SEO
 *
 * Used in layout.tsx to inject structured data for search engines.
 *
 * Phase 26 Plan 03: appended `buildArticleSchema` for /community/artikel/[slug]
 * (D-09 — Article markup for Rich Snippets). Existing Organization + WebSite
 * builders unchanged.
 */

import type { ArticleFrontmatter } from "./mdx/frontmatter";

interface JsonLdOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface JsonLdWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  inLanguage: string;
}

/**
 * Builds Organization schema for Generation AI
 */
export function buildOrganizationSchema(): JsonLdOrganization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Generation AI",
    url: "https://generation-ai.org",
    logo: "https://generation-ai.org/og-image.jpg",
    description:
      "Die erste kostenlose KI-Community für Studierende im DACH-Raum",
    sameAs: [],
  };
}

/**
 * Builds WebSite schema for Generation AI
 */
export function buildWebSiteSchema(): JsonLdWebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Generation AI",
    url: "https://generation-ai.org",
    description:
      "Die erste kostenlose KI-Community für Studierende im DACH-Raum",
    inLanguage: "de-DE",
  };
}

interface JsonLdArticle {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  datePublished: string; // ISO YYYY-MM-DD
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

/**
 * Builds Schema.org Article markup for /community/artikel/[slug] pages (D-09).
 *
 * Frontmatter is editor-controlled MDX, so the consumer MUST escape `<` to
 * `\u003c` when injecting via `dangerouslySetInnerHTML` (T-26-03-01).
 * See lib/__tests__/schema.test.ts XSS regression case.
 */
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
