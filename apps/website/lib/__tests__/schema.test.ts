import { describe, expect, it } from "vitest";
import {
  buildArticleSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/schema";
import type { ArticleFrontmatter } from "@/lib/mdx/frontmatter";

// Phase 26 Plan 03 Task 1 — Schema.org Article builder + XSS-escape regression.
// Builds on the existing Organization/WebSite builders in lib/schema.ts.

describe("buildArticleSchema", () => {
  it("builds valid JSON-LD Article object", () => {
    const fm: ArticleFrontmatter = {
      title: "Test",
      slug: "test-slug",
      date: "2026-04-20",
      readingTime: 5,
      kind: "artikel",
      circleUrl: "https://example.com",
      excerpt: "Hello",
    };
    const schema = buildArticleSchema(fm);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("Test");
    expect(schema.description).toBe("Hello");
    expect(schema.datePublished).toBe("2026-04-20");
    expect(schema.mainEntityOfPage["@id"]).toBe(
      "https://generation-ai.org/community/artikel/test-slug",
    );
    expect(schema.inLanguage).toBe("de-DE");
    expect(schema.author["@type"]).toBe("Organization");
    expect(schema.publisher.logo["@type"]).toBe("ImageObject");
  });

  it("XSS-safe when stringified + escaped (T-26-03-01)", () => {
    const fm: ArticleFrontmatter = {
      title: "Hello <script>alert(1)</script>",
      slug: "x",
      date: "2026-04-20",
      readingTime: 1,
      kind: "artikel",
      circleUrl: "https://x",
      excerpt: "y",
    };
    const json = JSON.stringify(buildArticleSchema(fm)).replace(/</g, "\\u003c");
    expect(json).not.toContain("<script>");
    expect(json).toContain("\\u003cscript\\u003e");
  });
});

describe("regression — existing builders", () => {
  it("buildOrganizationSchema still returns Organization type", () => {
    expect(buildOrganizationSchema()["@type"]).toBe("Organization");
  });

  it("buildWebSiteSchema still returns WebSite type", () => {
    expect(buildWebSiteSchema()["@type"]).toBe("WebSite");
  });
});
