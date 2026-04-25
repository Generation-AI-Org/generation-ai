import { describe, it } from 'vitest';

describe('lib/mdx/events — MDX adapter (Phase 22.6 Plan 02 fills bodies)', () => {
  it.todo('getUpcomingEvents() returns only events with date >= now (A-req-7)');
  it.todo('getUpcomingEvents() sorts ascending (next event first) (A-req-7)');
  it.todo('getPastEvents() returns events from content/events/past/');
  it.todo('getPastEvents() sorts descending (most recent first)');
  it.todo('validateEventFrontmatter throws when raw.slug !== fileSlug (Pitfall 4)');
  it.todo('validateEventFrontmatter rejects unknown format value (not Workshop/Speaker Session/Masterclass)');
  it.todo('getEventBySlug returns null for unknown slug');
});
