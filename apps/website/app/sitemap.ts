import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/mdx/community";

// Phase 26 Plan 03 Task 3 — Dynamic sitemap reading content/community/*.mdx
// at build/revalidate. RESEARCH §7.1. Block A success-criterion: sitemap lists
// /community + every article URL.
//
// `getAllArticles()` is React-cache()-wrapped in lib/mdx/reader.ts so the
// fs.readdir runs once per render-tree. sitemap.ts has its own render-tree
// (separate from page renders) — fine, still 1 hit per sitemap-build.
//
// robots.ts is intentionally NOT touched in this plan: existing config already
// emits `allow: "/"` + `disallow: ["/api/"]` + sitemap URL (Block A A10 ✓).

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
  ];
}
