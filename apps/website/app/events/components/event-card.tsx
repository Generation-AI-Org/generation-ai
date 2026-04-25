"use client";

// Phase 22.6 Plan 04 Task 2 — EventCard (updated from Plan 03).
// Card click now calls onOpenModal (required) to open the EventModal with full event details.
// Decision A-12: When imageUrl is missing, uses brand-pattern gradient fallback (no stock photos).
// BeispielBadge rendered top-right when frontmatter.example === true (Decision A-10).

import { CalendarDays, MapPin } from "lucide-react";
import type { EventEntry } from "@/lib/mdx/events";
import { BeispielBadge } from "@/components/ui/beispiel-badge";

interface EventCardProps {
  event: EventEntry;
  // Plan 04 wires the real modal + auth flow — onOpenModal is now required.
  onOpenModal: (event: EventEntry) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function EventCard({ event, onOpenModal }: EventCardProps) {
  const fm = event.frontmatter;

  const handleClick = () => {
    onOpenModal(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Event-Details öffnen: ${fm.title}`}
      className="group bg-bg-elevated border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-border-accent transition-colors duration-[var(--dur-normal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] flex flex-col"
    >
      {/* Header image / brand-pattern fallback (Decision A-12: no stock photos) */}
      <div className="relative h-40 bg-bg overflow-hidden">
        {fm.imageUrl ? (
          <img
            src={fm.imageUrl}
            alt={`${fm.title} — Vorschaubild`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg) 60%, var(--bg-elevated) 100%)",
            }}
          />
        )}
        {fm.example && (
          <div className="absolute top-3 right-3">
            <BeispielBadge />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Tag row: Format + Level + Partner (Masterclasses only) */}
        <div className="flex flex-wrap gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] bg-bg border border-border rounded-full px-2 py-0.5 text-text-muted">
            {fm.format}
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] bg-bg border border-border rounded-full px-2 py-0.5 text-text-muted">
            {fm.level}
          </span>
          {fm.partner && (
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] rounded-full px-2 py-0.5 text-[var(--accent)] border border-[var(--accent)]/40">
              mit {fm.partner}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-sans font-semibold text-text leading-[1.3] mt-1"
          style={{ fontSize: "var(--fs-h3)" }}
        >
          {fm.title}
        </h3>

        {/* Meta: date + location */}
        <div className="flex flex-col gap-1.5 mt-2 text-[13px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {formatDate(fm.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {fm.location}
          </span>
        </div>

        {/* CTA button — opens modal (Plan 04 wired) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="mt-auto bg-[var(--accent)] text-[var(--text-on-accent)] font-mono font-bold text-sm rounded-full px-4 py-2.5 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03] transition-all duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Zum Event anmelden
        </button>
      </div>
    </article>
  );
}
