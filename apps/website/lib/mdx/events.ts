// Phase 22.6 — Events MDX Adapter (mirrors community.ts, Decision A-14).
//
// Public API für /events + /events/[slug]:
//   getUpcomingEvents()  → events with date >= now, ascending (next event first).
//   getPastEvents()      → events from content/events/past/ + slipped upcoming, descending.
//   getEventBySlug()     → single event or null.
//   getEventSlugs()      → slug list for generateStaticParams.
//
// T-22.6-A-SLUG Mitigation: validateEventFrontmatter enforces raw.slug === fileSlug
// to prevent slug-shadowing where MDX file claims a different URL than its filename.
//
// T-22.6-A-MDX-DOS Mitigation: readAllFrontmatter is React-cache()-wrapped — re-reads
// only on cache invalidation. validateEventFrontmatter throws synchronously on bad
// shape, no runaway parsing.
//
// Authors only (no UGC). If UGC surfaces in future, add MDX-sanitization (Phase 28+).

import { cache } from "react";
import { readAllFrontmatter, type FrontmatterEntry } from "./reader";

/** Canonical content directories, relative to `process.cwd()`. */
export const EVENTS_DIR = "content/events";
export const PAST_EVENTS_DIR = "content/events/past";

export type EventFormat = "Workshop" | "Speaker Session" | "Masterclass";
export type EventLevel = "Einsteiger" | "Fortgeschritten" | "Expert";

export interface Speaker {
  name: string;
  role: string;
  avatar?: string;
}

export interface EventFrontmatter {
  title: string;
  date: string; // ISO-DateTime YYYY-MM-DDTHH:MM:SS
  format: EventFormat;
  level: EventLevel;
  location: string; // "Online" | "hybrid" | city name
  partner: string | null;
  ctaUrl: string;
  slug: string; // must equal fileSlug (Pitfall 4)
  speakers: Speaker[];
  recap?: string; // archive only, 2-sentence
  imageUrl?: string; // optional header
  example?: boolean; // BeispielBadge flag (A-10)
  description?: string; // SEO + standalone-page lede
}

export type EventEntry = FrontmatterEntry<EventFrontmatter>;

const VALID_FORMATS: ReadonlyArray<EventFormat> = [
  "Workshop",
  "Speaker Session",
  "Masterclass",
];
const VALID_LEVELS: ReadonlyArray<EventLevel> = [
  "Einsteiger",
  "Fortgeschritten",
  "Expert",
];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/**
 * Runtime validator + type-narrower for EventFrontmatter.
 * Throws informatively on bad shape — build-time fail > runtime undefined.
 * T-22.6-A-SLUG Mitigation: enforces raw.slug === fileSlug (Pitfall 4).
 */
export function validateEventFrontmatter(
  raw: unknown,
  fileSlug: string,
): EventFrontmatter {
  if (!raw || typeof raw !== "object") {
    throw new Error(
      `[events.ts] frontmatter must be an object (file: ${fileSlug})`,
    );
  }

  const r = raw as Record<string, unknown>;

  if (!isNonEmptyString(r.title)) {
    throw new Error(`[events.ts] missing title (${fileSlug})`);
  }
  if (!isNonEmptyString(r.date)) {
    throw new Error(`[events.ts] missing date (${fileSlug})`);
  }
  if (Number.isNaN(new Date(r.date as string).getTime())) {
    throw new Error(
      `[events.ts] invalid ISO date "${r.date}" (${fileSlug})`,
    );
  }
  if (
    !isNonEmptyString(r.format) ||
    !VALID_FORMATS.includes(r.format as EventFormat)
  ) {
    throw new Error(
      `[events.ts] format must be one of ${VALID_FORMATS.join("|")} (${fileSlug})`,
    );
  }
  if (
    !isNonEmptyString(r.level) ||
    !VALID_LEVELS.includes(r.level as EventLevel)
  ) {
    throw new Error(
      `[events.ts] level must be one of ${VALID_LEVELS.join("|")} (${fileSlug})`,
    );
  }
  if (!isNonEmptyString(r.location)) {
    throw new Error(`[events.ts] missing location (${fileSlug})`);
  }
  if (!isNonEmptyString(r.ctaUrl)) {
    throw new Error(`[events.ts] missing ctaUrl (${fileSlug})`);
  }
  if (!isNonEmptyString(r.slug)) {
    throw new Error(`[events.ts] missing slug (${fileSlug})`);
  }
  // T-22.6-A-SLUG Mitigation — Pitfall 4
  if (r.slug !== fileSlug) {
    throw new Error(
      `[events.ts] slug "${r.slug}" must match filename "${fileSlug}" (Pitfall 4)`,
    );
  }
  if (!Array.isArray(r.speakers)) {
    throw new Error(`[events.ts] speakers must be array (${fileSlug})`);
  }

  return {
    title: r.title as string,
    date: r.date as string,
    format: r.format as EventFormat,
    level: r.level as EventLevel,
    location: r.location as string,
    partner: (r.partner as string | null) ?? null,
    ctaUrl: r.ctaUrl as string,
    slug: r.slug as string,
    speakers: r.speakers as Speaker[],
    recap: typeof r.recap === "string" ? r.recap : undefined,
    imageUrl: typeof r.imageUrl === "string" ? r.imageUrl : undefined,
    example: r.example === true,
    description: typeof r.description === "string" ? r.description : undefined,
  };
}

/** Internal: loads + validates all events from any given dir. */
const getAllEventsFrom = cache(async (dir: string): Promise<EventEntry[]> => {
  return readAllFrontmatter<EventFrontmatter>({
    contentDir: dir,
    validate: validateEventFrontmatter,
  });
});

/**
 * Public: kommende Events (date >= now), aufsteigend sortiert (nächstes zuerst).
 * Reads from `content/events/` only — does not include past/ subdirectory.
 */
export const getUpcomingEvents = cache(async (): Promise<EventEntry[]> => {
  const now = new Date();
  const all = await getAllEventsFrom(EVENTS_DIR);
  return all
    .filter((e) => new Date(e.frontmatter.date) >= now)
    .sort(
      (a, b) =>
        new Date(a.frontmatter.date).getTime() -
        new Date(b.frontmatter.date).getTime(),
    );
});

/**
 * Public: vergangene Events, absteigend sortiert (aktuellstes zuerst).
 * Includes content/events/past/ + any upcoming events whose date has slipped into the past.
 */
export const getPastEvents = cache(async (): Promise<EventEntry[]> => {
  const now = new Date();
  const fromPastDir = await getAllEventsFrom(PAST_EVENTS_DIR);
  const fromUpcomingDir = await getAllEventsFrom(EVENTS_DIR);
  const slipped = fromUpcomingDir.filter(
    (e) => new Date(e.frontmatter.date) < now,
  );
  return [...fromPastDir, ...slipped].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
});

/** Public: 1 event by slug or null (searches both upcoming + past dirs). */
export const getEventBySlug = cache(
  async (slug: string): Promise<EventEntry | null> => {
    const upcoming = await getAllEventsFrom(EVENTS_DIR);
    const past = await getAllEventsFrom(PAST_EVENTS_DIR);
    const all = [...upcoming, ...past];
    return all.find((e) => e.slug === slug) ?? null;
  },
);

/** Public: all slugs (upcoming + past) — for generateStaticParams(). */
export const getEventSlugs = cache(async (): Promise<string[]> => {
  const upcoming = await getAllEventsFrom(EVENTS_DIR);
  const past = await getAllEventsFrom(PAST_EVENTS_DIR);
  return [...upcoming, ...past].map((e) => e.slug);
});
