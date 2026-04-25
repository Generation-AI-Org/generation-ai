"use client";

// Phase 22.6 Plan 03 — EventsGrid (Task 2 implementation).
// See events-grid.tsx — filled by Task 2 execution below.
// Temporary stub so Task 1 build check resolves imports.

import type { EventEntry } from "@/lib/mdx/events";

export function EventsGrid({ events: _events }: { events: EventEntry[] }) {
  return (
    <section
      aria-labelledby="events-grid-heading"
      data-section="events-grid"
      className="mx-auto max-w-6xl px-6 py-16"
    >
      <h2
        id="events-grid-heading"
        className="font-sans font-bold text-text mb-8"
        style={{ fontSize: "var(--fs-h2)" }}
      >
        Kommende Events
      </h2>
    </section>
  );
}
