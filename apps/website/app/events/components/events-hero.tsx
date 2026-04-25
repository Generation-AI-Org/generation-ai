"use client";

// Phase 22.6 Plan 03 — /events Hero.
// Pattern: mirrors community-hero.tsx (Phase 26) verbatim — swap copy only.
// LabeledNodes background, max-w-4xl, --fs-display H1, useReducedMotion guard.
// UI-SPEC: Hero eyebrow "// generation ai · events", H1 "Events, die dich weiterbringen."

import { motion, useReducedMotion } from "motion/react";
import { LabeledNodes } from "@/components/ui/labeled-nodes";

export function EventsHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="events-hero-heading"
      data-section="events-hero"
      className="relative isolate"
    >
      <LabeledNodes className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        >
          {/* Eyebrow */}
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
            {"// generation ai · events"}
          </div>

          {/* H1 — --fs-display token + class fallback per AGENTS.md Hero-Pattern */}
          <h1
            id="events-hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontSize: "var(--fs-display)",
              textShadow:
                "0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)",
            }}
          >
            Events, die dich weiterbringen.
          </h1>

          {/* Subhead */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-[1.5] text-text-muted text-pretty sm:text-xl"
            style={{
              textShadow:
                "0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)",
            }}
          >
            Workshops, Speaker Sessions und Masterclasses — exklusiv für unsere
            Community.
          </p>
        </motion.div>
      </LabeledNodes>
    </section>
  );
}
