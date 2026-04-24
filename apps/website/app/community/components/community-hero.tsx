"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { LabeledNodes } from "@/components/ui/labeled-nodes";

// Phase 26 Plan 02 — `/community` Hero (D-01, D-18).
// Subpage-Hero-Pattern (Memory: hero_pattern_subpages):
//   - LabeledNodes background (constellation),
//   - max-w-4xl content container,
//   - --fs-display H1 token + class fallback for non-token environments.
// CTA „Direkt zur Community →" is the Member-Gateway link to Circle (external,
// target=_blank + rel=noopener noreferrer per T-26-02-01 mitigation).

export function CommunityHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="community-hero-heading"
      data-section="community-hero"
      className="relative isolate"
    >
      <LabeledNodes className="flex min-h-[calc(80vh-5rem)] flex-col items-center justify-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        >
          {/* Section-Header */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
            style={{
              textShadow:
                "0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)",
            }}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            {"// generation ai · community"}
          </div>

          {/* H1 — Hero-Pattern: --fs-display token + class fallback */}
          <h1
            id="community-hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontSize: "var(--fs-display)",
              textShadow:
                "0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)",
            }}
          >
            Mehr als eine Community.
          </h1>

          {/* Sub */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-[1.5] text-text-secondary text-pretty"
            style={{
              textShadow:
                "0 0 12px rgba(var(--bg-rgb), 1), 0 0 5px rgba(var(--bg-rgb), 1)",
            }}
          >
            Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis.
          </p>

          {/* CTA-Row — external link to Circle (Member-Gateway, D-18) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://community.generation-ai.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98]"
              style={{ background: "var(--accent)" }}
              aria-label="Direkt zur Community auf community.generation-ai.org"
            >
              Direkt zur Community
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              />
            </a>
          </div>
        </motion.div>
      </LabeledNodes>
    </section>
  );
}
