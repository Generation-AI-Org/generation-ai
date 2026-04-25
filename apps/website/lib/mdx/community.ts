// Phase 26 — Community-Article Wrapper über reader.ts.
//
// Public API für /community + /community/artikel/[slug]:
//   getAllArticles()     → alle Artikel, newest-first (D-03 Sort).
//   getArticleBySlug()   → 1 Artikel oder null.
//   getArticleSlugs()    → nur Slugs, für generateStaticParams.
//
// `getAllArticlesFrom(dir)` + `getArticleBySlugFrom(slug, dir)` sind
// Test-Entry-Points mit injizierbarem contentDir — damit Vitest auf
// `__fixtures__/community/` arbeitet statt auf dem realen Launch-Content.

import type { Article, ArticleFrontmatter } from "./frontmatter";
import { readAllFrontmatter } from "./reader";

/** Canonical content directory, relativ zu `process.cwd()`. */
export const COMMUNITY_DIR = "content/community";

/**
 * Wirft informativ, wenn die Frontmatter des MDX-Files ungültig ist.
 * Build-time fail > runtime undefined (D-20 hand-rolled, kein Zod).
 * Threat T-26-01-01 + T-26-01-04 Mitigation.
 */
export function validateArticleFrontmatter(
  raw: Record<string, unknown>,
  fileSlug: string,
): ArticleFrontmatter {
  const required: Array<keyof ArticleFrontmatter> = [
    "title",
    "slug",
    "date",
    "readingTime",
    "kind",
    "circleUrl",
    "excerpt",
  ];

  for (const key of required) {
    if (raw[key] === undefined || raw[key] === null) {
      throw new Error(
        `[mdx/community] Missing frontmatter field "${key}" in content/community/${fileSlug}.mdx`,
      );
    }
  }

  if (raw.kind !== "artikel" && raw.kind !== "ki-news") {
    throw new Error(
      `[mdx/community] Invalid kind "${String(
        raw.kind,
      )}" in ${fileSlug}.mdx. Allowed: "artikel" | "ki-news".`,
    );
  }

  if (raw.slug !== fileSlug) {
    throw new Error(
      `[mdx/community] Frontmatter slug "${String(
        raw.slug,
      )}" doesn't match filename ${fileSlug}.mdx`,
    );
  }

  return raw as unknown as ArticleFrontmatter;
}

/**
 * Lädt alle Artikel aus `dir`, validiert jede Frontmatter, sortiert
 * newest-first. Generischer Entry-Point für Tests (Fixture-Dir) +
 * für `getAllArticles()` (Production-Dir).
 */
export async function getAllArticlesFrom(dir: string): Promise<Article[]> {
  const items = await readAllFrontmatter<ArticleFrontmatter>({
    contentDir: dir,
    validate: validateArticleFrontmatter,
  });
  return items.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
}

/** Testbarer by-Slug-Lookup. Liefert `null` bei Miss (kein Throw). */
export async function getArticleBySlugFrom(
  slug: string,
  dir: string,
): Promise<Article | null> {
  const articles = await getAllArticlesFrom(dir);
  return articles.find((a) => a.slug === slug) ?? null;
}

/** Public: Alle Community-Artikel, newest-first. */
export async function getAllArticles(): Promise<Article[]> {
  return getAllArticlesFrom(COMMUNITY_DIR);
}

/** Public: 1 Artikel by slug oder null. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getArticleBySlugFrom(slug, COMMUNITY_DIR);
}

/** Public: Nur Slugs — für `generateStaticParams()`. */
export async function getArticleSlugs(): Promise<string[]> {
  const articles = await getAllArticles();
  return articles.map((a) => a.slug);
}
