"use client";

import { motion, useReducedMotion } from "motion/react";

// Phase 22.6 Plan 08 — tools-app Hero (Decision B-09).
// Text-only V1 per CONTEXT.md §B.2 — no big visual, no Signal-Grid-Echo BG.
//
// Placement: inside HomeLayout's `overflow-y-auto` scroll container, BEFORE FilterBar
// (Pitfall 2 in 22.6-RESEARCH.md — tools-app uses h-screen overflow-hidden outer +
// overflow-y-auto inner; hero must scroll WITH content, not outside the scroll box).
//
// DS-Compliance:
//   - Geist Mono on H1 (font-mono class + global h1 { font-family: var(--font-mono) } in base.css)
//   - --fs-h1 token (clamp 32→48px) — inline hero, not full-viewport, so --fs-h1 not --fs-display
//   - Eyebrow label: 11px Geist Mono uppercase tracking-[0.2em] text-text-muted
//   - Body: 16px Geist Sans, text-text-secondary
//   - Reduced-motion guard via useReducedMotion (LEARNINGS.md mandate)
//
// Umlaute mandatory per CLAUDE.md memory: "für" not "fuer", "Über" not "Ueber".

export function ToolsHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="tools-hero-heading"
      data-section="tools-hero"
      className="relative isolate"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-16"
      >
        {/* Eyebrow label */}
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
          {"// deine ki-tool-bibliothek"}
        </div>

        {/* H1 — Geist Mono, --fs-h1 token */}
        <h1
          id="tools-hero-heading"
          className="mt-4 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance"
          style={{ fontSize: "var(--fs-h1)" }}
        >
          KI-Tools, kuratiert für dich.
        </h1>

        {/* Body — Geist Sans (default), text-text-secondary */}
        <p className="mx-auto mt-3 max-w-xl text-base leading-[1.65] text-text-secondary">
          Über 100 Tools, sortiert nach Anwendungsfall. Finde schneller das
          richtige Setup für Recherche, Lernen, Schreiben und Bauen — oder frag
          direkt unseren Agenten.
        </p>
      </motion.div>
    </section>
  );
}
