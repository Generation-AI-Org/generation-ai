/**
 * Unit tests for apps/website/lib/mdx/events.ts — MDX adapter
 *
 * Phase 22.6, Plan 02 (Task 3): fills all 7 it.todo() stubs from Plan 01.
 * Uses the 5 placeholder MDX files in content/events/ + content/events/past/
 * as live fixtures — no separate __fixtures__/ directory needed.
 *
 * Tests read the real content files from process.cwd() (= apps/website/ in
 * vitest runs started via `pnpm --filter @genai/website test`).
 *
 * Requirement: A-req-7 — MDX adapter correctly filters upcoming vs. past events.
 *
 * Run:
 *   pnpm --filter @genai/website test lib/mdx/__tests__/events.test.ts --run
 */
import { describe, it, expect } from "vitest";
import {
  getUpcomingEvents,
  getPastEvents,
  getEventBySlug,
  validateEventFrontmatter,
} from "../events";

describe("lib/mdx/events — MDX adapter (A-req-7)", () => {
  // getUpcomingEvents: should filter to only events where date >= now
  it("getUpcomingEvents() returns only events with date >= now (A-req-7)", async () => {
    const events = await getUpcomingEvents();
    const now = Date.now();
    for (const e of events) {
      expect(new Date(e.frontmatter.date).getTime()).toBeGreaterThanOrEqual(now);
    }
  });

  // getUpcomingEvents: chronological order (soonest event first in grid)
  it("getUpcomingEvents() sorts ascending (next event first) (A-req-7)", async () => {
    const events = await getUpcomingEvents();
    if (events.length < 2) {
      // With our 3 placeholder upcoming events this should always run
      return;
    }
    for (let i = 1; i < events.length; i++) {
      expect(
        new Date(events[i].frontmatter.date).getTime(),
      ).toBeGreaterThanOrEqual(
        new Date(events[i - 1].frontmatter.date).getTime(),
      );
    }
  });

  // getPastEvents: reads from content/events/past/ subdirectory
  it("getPastEvents() returns events from content/events/past/", async () => {
    const past = await getPastEvents();
    expect(past.length).toBeGreaterThanOrEqual(2);
    // Both placeholder past events should be present
    const slugs = past.map((p) => p.slug);
    expect(slugs).toContain("2026-03-10-launch-event");
    expect(slugs).toContain("2026-04-01-prompt-workshop");
  });

  // getPastEvents: most recent archived event first (reverse-chrono)
  it("getPastEvents() sorts descending (most recent first)", async () => {
    const past = await getPastEvents();
    if (past.length < 2) return;
    for (let i = 1; i < past.length; i++) {
      expect(
        new Date(past[i].frontmatter.date).getTime(),
      ).toBeLessThanOrEqual(
        new Date(past[i - 1].frontmatter.date).getTime(),
      );
    }
  });

  // validateEventFrontmatter: slug in frontmatter must match the filename stem
  // (RESEARCH.md Pitfall 4: slug drift between file rename and frontmatter)
  it("validateEventFrontmatter throws when raw.slug !== fileSlug (Pitfall 4)", () => {
    const raw = {
      title: "X",
      date: "2026-12-01T18:00:00",
      format: "Workshop",
      level: "Einsteiger",
      location: "Online",
      ctaUrl: "https://example.com",
      slug: "wrong-slug",
      speakers: [],
    };
    expect(() => validateEventFrontmatter(raw, "actual-file-slug")).toThrow(
      /slug/i,
    );
  });

  // validateEventFrontmatter: format field must be one of the three valid values
  it("validateEventFrontmatter rejects unknown format value (not Workshop/Speaker Session/Masterclass)", () => {
    const raw = {
      title: "X",
      date: "2026-12-01T18:00:00",
      format: "Webinar", // not in enum
      level: "Einsteiger",
      location: "Online",
      ctaUrl: "https://example.com",
      slug: "matches",
      speakers: [],
    };
    expect(() => validateEventFrontmatter(raw, "matches")).toThrow(/format/i);
  });

  // getEventBySlug: graceful null return for non-existent slug (no throw)
  it("getEventBySlug returns null for unknown slug", async () => {
    const found = await getEventBySlug("this-slug-does-not-exist");
    expect(found).toBeNull();
  });
});
