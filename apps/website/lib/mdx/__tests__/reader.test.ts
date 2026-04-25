import { describe, it, expect, vi } from "vitest";
import { readAllFrontmatter } from "../reader";

const FIXTURES_DIR = "__fixtures__/community";

describe("readAllFrontmatter", () => {
  it("reads all .mdx files in contentDir and returns slug + frontmatter tuples", async () => {
    const items = await readAllFrontmatter<Record<string, unknown>>({
      contentDir: FIXTURES_DIR,
    });

    expect(items).toHaveLength(2);
    const slugs = items.map((i) => i.slug).sort();
    expect(slugs).toEqual(["sample-article", "sample-ki-news"]);
  });

  it("invokes validate callback for each item with (raw, fileSlug)", async () => {
    const validate = vi.fn(
      (raw: Record<string, unknown>, _slug: string) => raw,
    );

    await readAllFrontmatter({
      contentDir: FIXTURES_DIR,
      validate,
    });

    expect(validate).toHaveBeenCalledTimes(2);
    for (const call of validate.mock.calls) {
      // raw must be an object with a title string — validates gray-matter parsed
      expect(call[0]).toHaveProperty("title");
      expect(typeof call[0].title).toBe("string");
      // fileSlug must be the filename sans .mdx
      expect(["sample-article", "sample-ki-news"]).toContain(call[1]);
    }
  });

  it("returned items have slug matching filename without .mdx extension", async () => {
    const items = await readAllFrontmatter<Record<string, unknown>>({
      contentDir: FIXTURES_DIR,
    });

    for (const item of items) {
      expect(item.slug).not.toContain(".mdx");
      expect(item.slug).toMatch(/^sample-(article|ki-news)$/);
    }
  });
});
