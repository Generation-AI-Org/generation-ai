'use client'

// AboutKontaktSection — abschließende Kontakt-Section der /about-Seite (Plan 21-07).
//
// Single-Card mit 3 Kontaktzeilen (divide-y Trenner):
//   1. Allgemeine Anfragen → mailto:info@generation-ai.org (OHNE Subject-Präfix,
//      siehe UI-SPEC Zeile 353; unterscheidet sich vom Mitmach-CTA-Mailto mit
//      `?subject=Mitmachen`)
//   2. Partnerschaften → /partner (Phase 22)
//   3. Aktiv mitmachen → #mitmach (same-page Anker)
//
// Responsive: Mobile stack (label above value), Desktop side-by-side.
//
// A11y: id="kontakt"-Anker. Section-Head semantisch h2, visuell --fs-h3.
//
// Keine Section-Border-Bottom — letzte Section vor Footer.

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

export function AboutKontaktSection() {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <section
      id="kontakt"
      aria-labelledby="about-kontakt-heading"
      data-section="about-kontakt"
      className="relative bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-6">
        {/* Eyebrow */}
        <motion.div
          {...fadeIn}
          className="mx-auto mb-5 flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent-glow)",
            }}
          />
          {"// kontakt"}
        </motion.div>

        {/* H2 */}
        <motion.h2
          {...fadeIn}
          id="about-kontakt-heading"
          className="text-center font-mono font-bold text-text text-balance"
          style={{ fontSize: "var(--fs-h3)", lineHeight: "var(--lh-sub)" }}
        >
          Hier erreichst du uns.
        </motion.h2>

        {/* Kontakt-Card: 3 Zeilen, divide-y Trenner */}
        <motion.div
          {...fadeIn}
          className="mt-12 rounded-2xl border border-border bg-bg-card divide-y divide-border overflow-hidden"
        >
          {/* Zeile 1 — Allgemeine Anfragen (Mailto, subject-frei) */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 px-6 py-6">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Allgemeine Anfragen
            </div>
            <a
              href="mailto:info@generation-ai.org"
              className="font-sans text-base font-normal text-text hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:text-[var(--accent)] underline-offset-4 hover:underline"
            >
              info@generation-ai.org
            </a>
          </div>

          {/* Zeile 2 — Partnerschaften (Route /partner) */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 px-6 py-6">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Partnerschaften
            </div>
            <Link
              href="/partner"
              prefetch={false}
              className="font-sans text-base font-normal text-text hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Zur Partner-Seite →
            </Link>
          </div>

          {/* Zeile 3 — Aktiv mitmachen (same-page Anker) */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 px-6 py-6">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Aktiv mitmachen
            </div>
            <Link
              href="#mitmach"
              className="font-sans text-base font-normal text-text hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Zum Mitmach-Aufruf →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
