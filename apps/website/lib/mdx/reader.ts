// Phase 26 — Generic MDX Frontmatter-Reader (wird in Phase 22.5 /events re-used).
//
// Liest alle .mdx-Files aus einem contentDir, parst Frontmatter via gray-matter,
// reicht optional an eine validate()-Callback durch. React `cache()` wrapped
// damit mehrere RSC-Sub-Trees im gleichen Request den FS-Hit nur einmal
// bezahlen (Mitigation für `force-dynamic` im Root-Layout, Phase 13).

import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";

export interface ReadAllOpts<T> {
  /** Absoluter Pfad ODER Pfad relativ zu `process.cwd()`. */
  contentDir: string;
  /** Optionaler Validator/Normalizer für das rohe Frontmatter-Dict. */
  validate?: (raw: Record<string, unknown>, slug: string) => T;
}

export interface FrontmatterEntry<T> {
  slug: string;
  frontmatter: T;
}

/**
 * Liest alle `.mdx` in `contentDir` und liefert `{ slug, frontmatter }[]`.
 *
 * - `slug` ist der Filename ohne `.mdx`-Extension.
 * - Wenn `validate` gesetzt ist, wird die rohe `gray-matter`-Data durch den
 *   Validator gereicht (Type-Narrowing + defensive Runtime-Checks).
 * - Memoized via React `cache()` pro RSC-Render-Tree.
 */
export const readAllFrontmatter = cache(async function readAllFrontmatter<T>(
  opts: ReadAllOpts<T>,
): Promise<FrontmatterEntry<T>[]> {
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
    }),
  );

  return items;
});
