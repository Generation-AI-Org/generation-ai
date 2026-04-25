"use client";

// Phase 22.6 Plan 03 Task 3 — EventsMembersOnly section.
// Members-only hinweis with lock icon + CTA to /join.
// UI-SPEC: border-l-2 border-[var(--accent)] accent stripe, max-w-2xl centered.

import Link from "next/link";
import { Lock } from "lucide-react";

export function EventsMembersOnly() {
  return (
    <section
      aria-labelledby="events-members-only-heading"
      data-section="events-members-only"
      className="mx-auto max-w-4xl px-6 py-12"
    >
      <div className="bg-bg-elevated border-l-2 border-[var(--accent)] rounded-r-xl p-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <Lock
            className="h-5 w-5 text-[var(--accent)] mt-1 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h2
              id="events-members-only-heading"
              className="font-sans font-semibold text-text leading-[1.3]"
              style={{ fontSize: "var(--fs-h3)" }}
            >
              Events nur für Mitglieder
            </h2>
            <p className="mt-2 text-base leading-[1.65] text-text-muted">
              Unsere Events sind exklusiv für die Generation AI Community. Die
              Mitgliedschaft ist kostenlos — in 2 Minuten dabei.
            </p>
            <Link
              href="/join"
              className="inline-block mt-3 text-[var(--accent)] font-mono font-bold text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Jetzt kostenlos registrieren →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
