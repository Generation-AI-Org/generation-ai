// Phase 22.6 Plan 05 Task 1 — EventsArchive — replaces Plan 03 stub.
//
// Decision A-06: Archive = simple cards (Foto + Titel + Datum + 2-Satz-Recap).
// NO modal trigger. NO CTA button. Pure social-proof section.
//
// UI-SPEC contract:
//   - Section heading: "Vergangene Events" (H2, var(--fs-h2), Geist Sans, weight 700)
//   - Layout: grid 1-col (mobile) / 2-col (desktop)
//   - Card: bg-bg-elevated, border, rounded-xl, overflow-hidden
//   - Image: h-32 object-cover, fallback muted bg
//   - Title: 16px weight 600 (smaller than upcoming cards — signals "past")
//   - Date + location: 13px text-text-muted
//   - Recap: 14px, max 2 sentences
//   - BeispielBadge if frontmatter.example === true
//
// a11y: <article> semantic, no interactive elements inside = no keyboard-trap concern.

"use client";

import { CalendarDays, MapPin } from "lucide-react";
import type { EventEntry } from "@/lib/mdx/events";
import { BeispielBadge } from "@/components/ui/beispiel-badge";

interface EventsArchiveProps {
  events: EventEntry[];
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function EventsArchive({ events }: EventsArchiveProps) {
  if (events.length === 0) return null;

  return (
    <section
      aria-labelledby="events-archive-heading"
      data-section="events-archive"
      className="mx-auto max-w-6xl px-6 py-16"
    >
      <h2
        id="events-archive-heading"
        className="font-sans font-bold text-text mb-8"
        style={{ fontSize: "var(--fs-h2)" }}
      >
        Vergangene Events
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const fm = event.frontmatter;
          return (
            <article
              key={event.slug}
              className="bg-bg-elevated border border-border rounded-xl overflow-hidden"
              data-archive-card
            >
              {/* Image — h-32, object-cover. Fallback: single muted color (A-06 minimal). */}
              <div className="relative h-32 bg-bg overflow-hidden">
                {fm.imageUrl ? (
                  <img
                    src={fm.imageUrl}
                    alt={`${fm.title} — Vorschaubild`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="h-full w-full bg-bg-elevated"
                  />
                )}
                {fm.example && (
                  <div className="absolute top-3 right-3">
                    <BeispielBadge />
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Title: 16px weight 600 — intentionally smaller than upcoming cards */}
                <h3 className="font-sans font-semibold text-text leading-[1.3] text-base">
                  {fm.title}
                </h3>

                {/* Meta: date + location */}
                <div className="flex flex-wrap gap-3 mt-2 text-[13px] text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatShortDate(fm.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {fm.location}
                  </span>
                </div>

                {/* Recap: max 2 sentences. Only shown when present in frontmatter. */}
                {fm.recap && (
                  <p className="mt-3 text-sm leading-[1.6] text-text-muted">
                    {fm.recap}
                  </p>
                )}

                {/* NO CTA button. NO modal trigger. (A-06: archive is social-proof only) */}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
