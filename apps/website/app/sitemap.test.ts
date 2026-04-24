import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

// Phase 26 Plan 03 Task 3 — Sitemap-Reader emitting /community + 4 articles.
// Discovered via top-level **/*.test.{ts,tsx} include from Plan 26-01 fix.

describe("sitemap", () => {
  it("includes root, /community, and every article URL", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain("https://generation-ai.org");
    expect(urls).toContain("https://generation-ai.org/community");

    // 4 placeholder articles from Plan 26-01.
    expect(urls).toContain(
      "https://generation-ai.org/community/artikel/bachelorarbeit-mit-claude",
    );
    expect(urls).toContain(
      "https://generation-ai.org/community/artikel/prompting-fuer-einsteiger",
    );
    expect(urls).toContain(
      "https://generation-ai.org/community/artikel/5-tools-bwl",
    );
    expect(urls).toContain(
      "https://generation-ai.org/community/artikel/ki-news-kw17-2026",
    );
  });

  it("article entries use frontmatter date as lastModified", async () => {
    const entries = await sitemap();
    const ki = entries.find((e) => e.url.endsWith("/ki-news-kw17-2026"));
    expect(ki).toBeTruthy();
    expect(ki!.lastModified).toBeInstanceOf(Date);
    // ki-news-kw17-2026 frontmatter date is 2026-04-22 (Plan 26-01).
    expect((ki!.lastModified as Date).toISOString().slice(0, 10)).toBe(
      "2026-04-22",
    );
  });

  it("contains exactly 6 entries (root + /community + 4 articles)", async () => {
    const entries = await sitemap();
    expect(entries.length).toBe(6);
  });
});
