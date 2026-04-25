"use client";

// Phase 22.6 Plan 04 Task 2 — EventsGrid with modal state (replaces Plan 03 stub).
// Holds Mehr-Anzeigen client state (Decision A-09: pure useState toggle, no re-fetch).
// Shows first 3 upcoming events initially; expands to show all when button clicked.
// NEW (Plan 04): manages selected-event state and renders EventModal at grid level,
// so all cards share a single modal instance.

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { EventEntry } from "@/lib/mdx/events";
import { EventCard } from "./event-card";
import { EventModal } from "./event-modal";

interface EventsGridProps {
  events: EventEntry[];
}

const INITIAL_VISIBLE = 3;

export function EventsGrid({ events }: EventsGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showAll, setShowAll] = useState(false);

  // Modal state — lifted to grid so all cards share one modal instance.
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (event: EventEntry) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    // Keep selectedEvent set during close-animation; it will be overwritten on next open.
  };

  const visibleEvents = showAll ? events : events.slice(0, INITIAL_VISIBLE);
  const hasMore = events.length > INITIAL_VISIBLE && !showAll;

  if (events.length === 0) {
    return (
      <section
        aria-labelledby="events-empty-heading"
        data-section="events-empty"
        className="mx-auto max-w-4xl px-6 py-16 text-center"
      >
        <h2
          id="events-empty-heading"
          className="font-sans font-bold text-text"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          Bald neue Events
        </h2>
        <p className="mt-4 text-base leading-[1.65] text-text-muted">
          Gerade keine Events in Planung — aber das ändert sich bald. Trag dich
          ein und bleib informiert.
        </p>
      </section>
    );
  }

  return (
    <>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleEvents.map((event, idx) => (
            <motion.div
              key={event.slug}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              data-event-card
            >
              <EventCard event={event} onOpenModal={handleOpenModal} />
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              data-action="show-more-events"
              className="bg-bg-elevated border border-border text-text font-mono text-sm rounded-full px-6 py-2.5 hover:border-border-accent transition-colors duration-[var(--dur-normal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Mehr anzeigen ↓
            </button>
          </div>
        )}
      </section>

      {/* Modal lives at grid level so all cards share one instance */}
      <EventModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={handleModalChange}
      />
    </>
  );
}
