/**
 * Unit tests for apps/website/lib/mdx/events.ts — MDX adapter
 *
 * Phase 22.6, Plan 01 (Wave 0): Stub file. All tests use it.todo() so the
 * suite is registered (shown as yellow "todo" in Vitest output) but never fails
 * the build.
 *
 * Plan 02 fills each it.todo() with real test bodies. DO NOT rename tests —
 * later plans grep these exact strings to find stubs to fill.
 *
 * What events.ts will provide (Plan 02):
 *   - getUpcomingEvents()       : events with date >= now, ascending
 *   - getPastEvents()           : events with date < now, descending
 *   - getEventBySlug(slug)      : single event by slug, null if missing
 *   - validateEventFrontmatter  : throws on invalid slug/format
 *
 * Requirement: A-req-7 — MDX adapter correctly filters upcoming vs. past events.
 *
 * Run:
 *   pnpm --filter @genai/website test lib/mdx/__tests__/events.test.ts --run
 */
import { describe, it } from 'vitest';

describe('lib/mdx/events — MDX adapter (Phase 22.6 Plan 02 fills bodies)', () => {
  // getUpcomingEvents: should filter to only events where date >= now
  it.todo('getUpcomingEvents() returns only events with date >= now (A-req-7)');

  // getUpcomingEvents: chronological order (soonest event first in grid)
  it.todo('getUpcomingEvents() sorts ascending (next event first) (A-req-7)');

  // getPastEvents: reads from content/events/past/ subdirectory
  it.todo('getPastEvents() returns events from content/events/past/');

  // getPastEvents: most recent archived event first (reverse-chrono)
  it.todo('getPastEvents() sorts descending (most recent first)');

  // validateEventFrontmatter: slug in frontmatter must match the filename stem
  // (RESEARCH.md Pitfall 4: slug drift between file rename and frontmatter)
  it.todo('validateEventFrontmatter throws when raw.slug !== fileSlug (Pitfall 4)');

  // validateEventFrontmatter: format field must be one of the three valid values
  it.todo('validateEventFrontmatter rejects unknown format value (not Workshop/Speaker Session/Masterclass)');

  // getEventBySlug: graceful null return for non-existent slug (no throw)
  it.todo('getEventBySlug returns null for unknown slug');
});
