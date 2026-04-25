// Phase 26 — Frontmatter type schema for community articles (D-10, D-20).
//
// Hand-rolled TypeScript types; kein Zod (D-20). Validation läuft in
// community.ts → validateArticleFrontmatter als defensive Runtime-Checks.
// Wiederverwendbar für /events in Phase 22.5.

/** Unterscheidet normale Artikel von kuratierten KI-News (D-04). */
export type ArticleKind = "artikel" | "ki-news";

/** Pflicht-Felder für jeden /community/artikel/[slug] Eintrag. */
export interface ArticleFrontmatter {
  /** Display-Titel (deutsche Umlaute erlaubt). */
  title: string;
  /** Muss 1:1 mit Filename-Stem matchen (ohne `.mdx`). */
  slug: string;
  /** ISO-Date `YYYY-MM-DD`, genutzt für Sort + Sitemap lastModified. */
  date: string;
  /** Autoren-Schätzung in Minuten. */
  readingTime: number;
  kind: ArticleKind;
  /** Link zum Original-Post in Circle (D-14 — trust-the-author, kein Build-Validate). */
  circleUrl: string;
  /** Teaser + OG-Description. */
  excerpt: string;
}

/** Tuple aus Reader: Slug (von Filename) + validierte Frontmatter. */
export interface Article {
  slug: string;
  frontmatter: ArticleFrontmatter;
}
