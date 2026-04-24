import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Phase 26 Plan 02 — Final-CTA „Wir sehen uns drinnen." (CONTEXT.md §7.6).
// Server Component — internal Link auf /join. Button-Styling matched
// final-cta-section.tsx pattern (filled accent, font-mono).

export function CommunityFinalCta() {
  return (
    <section
      aria-labelledby="community-final-cta-heading"
      data-section="community-final-cta"
      className="bg-bg-elevated py-24 sm:py-32"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2
          id="community-final-cta-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-text text-balance"
        >
          Wir sehen uns drinnen.
        </h2>
        <p className="mt-4 text-base text-text-secondary text-pretty">
          Kostenlos, keine Haken, kein Spam. Einfach beitreten und loslegen.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/join"
            prefetch={false}
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm font-bold text-[var(--text-on-accent)] transition-all duration-300 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03]"
            style={{ background: "var(--accent)" }}
          >
            Kostenlos beitreten
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
