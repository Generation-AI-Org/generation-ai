"use client";

// Phase 22.6 Plan 03 Task 3 — EventsFinalCta section.
// Pattern: analog community-final-cta.tsx (Phase 26).
// UI-SPEC: max-w-2xl centered, py-24, H2 "Keine Events verpassen.", CTA to /join.

import Link from "next/link";

export function EventsFinalCta() {
  return (
    <section
      aria-labelledby="events-final-cta-heading"
      data-section="events-final-cta"
      className="mx-auto max-w-2xl px-6 py-24 text-center"
    >
      <h2
        id="events-final-cta-heading"
        className="font-sans font-bold text-text"
        style={{ fontSize: "var(--fs-h2)" }}
      >
        Keine Events verpassen.
      </h2>
      <p className="mt-4 text-lg leading-[1.5] text-text-muted">
        Werde Teil der Community und sei bei jedem Event dabei.
      </p>
      <Link
        href="/join"
        className="inline-block mt-8 bg-[var(--accent)] text-[var(--text-on-accent)] font-mono font-bold text-sm rounded-full px-6 py-3 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03] transition-all duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Jetzt beitreten
      </Link>
    </section>
  );
}
