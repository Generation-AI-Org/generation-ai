import { describe, it, expect } from "vitest";
import {
  getAllArticlesFrom,
  getArticleBySlugFrom,
  validateArticleFrontmatter,
} from "../community";

const FIXTURES_DIR = "__fixtures__/community";

describe("getAllArticlesFrom", () => {
  it("returns articles sorted newest-first by frontmatter.date", async () => {
    const items = await getAllArticlesFrom(FIXTURES_DIR);

    expect(items).toHaveLength(2);
    // sample-ki-news has date 2026-04-22 (newer) → must be first
    expect(items[0].slug).toBe("sample-ki-news");
    expect(items[1].slug).toBe("sample-article");
  });

  it("returns typed frontmatter with all required fields", async () => {
    const items = await getAllArticlesFrom(FIXTURES_DIR);

    for (const { frontmatter } of items) {
      expect(frontmatter.title).toBeTruthy();
      expect(frontmatter.slug).toBeTruthy();
      expect(frontmatter.date).toBeTruthy();
      expect(typeof frontmatter.readingTime).toBe("number");
      expect(["artikel", "ki-news"]).toContain(frontmatter.kind);
      expect(frontmatter.circleUrl).toMatch(/^https?:\/\//);
      expect(frontmatter.excerpt).toBeTruthy();
    }
  });
});

describe("validateArticleFrontmatter", () => {
  const validRaw = {
    title: "Title",
    slug: "my-file",
    date: "2026-04-20",
    readingTime: 3,
    kind: "artikel",
    circleUrl: "https://community.generation-ai.org/c/community/my-file",
    excerpt: "Excerpt text.",
  };

  it("returns typed frontmatter when all fields valid + slug matches fileSlug", () => {
    const result = validateArticleFrontmatter({ ...validRaw }, "my-file");
    expect(result.title).toBe("Title");
    expect(result.kind).toBe("artikel");
  });

  it("throws when required field is missing", () => {
    const { readingTime: _omit, ...withoutReadingTime } = validRaw;
    void _omit;

    expect(() =>
      validateArticleFrontmatter(withoutReadingTime, "my-file"),
    ).toThrow(/Missing frontmatter field "readingTime"/);
  });

  it("throws when kind is neither 'artikel' nor 'ki-news'", () => {
    expect(() =>
      validateArticleFrontmatter({ ...validRaw, kind: "podcast" }, "my-file"),
    ).toThrow(/Invalid kind "podcast"/);
  });

  it("throws when frontmatter.slug does not match fileSlug", () => {
    expect(() =>
      validateArticleFrontmatter({ ...validRaw, slug: "bar" }, "foo"),
    ).toThrow(/Frontmatter slug "bar" doesn't match filename foo\.mdx/);
  });
});

describe("getArticleBySlugFrom", () => {
  it("returns the matching article", async () => {
    const article = await getArticleBySlugFrom("sample-article", FIXTURES_DIR);
    expect(article).not.toBeNull();
    expect(article?.slug).toBe("sample-article");
    expect(article?.frontmatter.kind).toBe("artikel");
  });

  it("returns null for a nonexistent slug instead of throwing", async () => {
    const article = await getArticleBySlugFrom("nonexistent", FIXTURES_DIR);
    expect(article).toBeNull();
  });
});
