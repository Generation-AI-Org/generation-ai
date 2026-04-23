'use client'

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

// Final-CTA Section (Simon §4.9 "Sei dabei, bevor der Rest aufholt.") — DS-polished.
//
// Plan 20.6-07: Hero-Level Polish. Lamp-Effect (Aceternity) wurde bewusst
// ersetzt durch ein DS-natives Closing-Motif. Rationale:
//   - LampContainer hatte mehrfach hardcoded `ease: "easeInOut"` +
//     `delay: 0.3, duration: 0.8` statt DS-Motion-Tokens (--ease-out,
//     --dur-slow).
//   - Scale-y/translate-y magic numbers statt Spacing-Grid.
//   - Conic-Gradient + 4-stack motion.div + blur-3xl = Ad-hoc-Animation
//     ohne DS-Rückbindung — verletzt CONTEXT.md D-02.
//   - `min-h-screen` / `min-h-[70vh]` override zwang Mobile in längere Scroll-
//     Distanzen ohne Content-Justification.
//
// Ersatz: "Signal-Beam Closer" — narrative-echo zum Hero LabeledNodes.
//   - Vertikaler Accent-Strich wächst von unten als growing-line (roter
//     Faden Motif).
//   - Subtle radial-gradient backdrop (--accent low-alpha) evoziert Hero-
//     Constellation-Stimmung, ohne Glassmorphism oder Blur-Orgie.
//   - Horizontaler Accent-Line-Separator oben (echo zum Signal-Grid).
//   - Tokens only: --accent, --accent-glow, --bg, --bg-rgb, --text,
//     --text-secondary, --text-muted, --border, --border-accent,
//     --dur-fast, --dur-normal, --dur-slow, --ease-out.
//
// Primary-CTA exakte Hero-Parity: `rounded-full px-7 py-4 font-mono
// text-[15px] font-bold tracking-[0.02em]`, scale-[1.03], shadow-glow,
// cubic-bezier(0.16,1,0.3,1), active:scale-[0.98], identisches Arrow-SVG
// mit translate-x-[3px] on hover.
//
// Secondary: tools.generation-ai.org als DS-Pill-Outline-Button (wie Hero
// "Mehr erfahren"), mit ArrowUpRight für external target. Vorher Small-
// Textlink — zu dezent für den narrativen Closer-Peak.
//
// Section-Header: "// jetzt" slash-prefix konsistent mit Trust + Kurz-FAQ
// + Community-Preview.
//
// Reduced-motion: useReducedMotion gated alle Entry-Motions + die vertikale
// Beam-Growth-Animation. Focus-Ring + statisches Layout bleiben erhalten.

export function FinalCTASection() {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }

  const beamIn = prefersReducedMotion
    ? { initial: { scaleY: 1, opacity: 1 } }
    : {
        initial: { scaleY: 0, opacity: 0 },
        whileInView: { scaleY: 1, opacity: 1 },
        viewport: { once: true, margin: "-20% 0px" },
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <section
      aria-labelledby="final-cta-heading"
      data-section="final-cta"
      className="relative isolate bg-bg py-32 sm:py-40"
    >
      {/* Halo entfernt (Luca UAT 2026-04-23): Hard-Cut an Section-Bottom
          ist konzeptionell unlösbar. Stattdessen: Connection-Item —
          vertikaler Beam überquert die Section-Grenze als "roter Faden"
          in die Kurz-FAQ rein. Section hat kein overflow-hidden mehr,
          damit der Beam über die Grenze ragen darf. Kurz-FAQ hat
          gleichen bg, also kein visueller Bruch durch den Übergang. */}

      {/* Horizontaler Accent-Hairline oben — echo zum Signal-Grid "roter Faden" */}
      <motion.div
        aria-hidden="true"
        initial={prefersReducedMotion ? undefined : { scaleX: 0, opacity: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="absolute left-1/2 top-0 z-0 h-px w-[min(80%,640px)] -translate-x-1/2 origin-left"
        style={{
          background: `linear-gradient(90deg, transparent, var(--accent) 50%, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Connection-Beam — vertikaler "roter Faden" der die Section-Grenze
          überquert. Symmetrischer Fade (transparent → accent → transparent),
          zentriert auf der Section-Bottom-Linie (120px oberhalb bis 120px
          unterhalb). Verbindet Final-CTA visuell mit Kurz-FAQ. */}
      <motion.div
        aria-hidden="true"
        {...beamIn}
        className="absolute left-1/2 z-0 w-px origin-center -translate-x-1/2"
        style={{
          bottom: "-120px",
          height: "240px",
          background: `linear-gradient(to top, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)`,
          boxShadow: "0 0 16px var(--accent-glow)",
          opacity: 0.75,
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Section-Header — konsistent mit Trust + Kurz-FAQ */}
        <motion.div
          {...fadeIn}
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent-glow)",
            }}
          />
          {"// jetzt"}
        </motion.div>

        {/* H2 — Hero-scale clamp(32-52), Geist Mono 700, tracking tight */}
        <motion.h2
          {...fadeIn}
          id="final-cta-heading"
          className="mt-5 font-mono font-bold leading-[1.05] tracking-[-0.025em] text-text text-balance"
          style={{ fontSize: "clamp(32px, 5.5vw, 56px)" }}
        >
          Sei <span style={{ color: "var(--accent)" }}>dabei</span>,
          <br />
          bevor der Rest aufholt.
        </motion.h2>

        {/* Subline */}
        <motion.p
          {...fadeIn}
          className="mx-auto mt-6 max-w-xl text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl"
        >
          Komm in die Community. Kostenlos, ohne Bullshit — in 2 Minuten dabei.
        </motion.p>

        {/* CTAs — Hero-parity */}
        <motion.div
          {...fadeIn}
          className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/join"
            prefetch={false}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            style={{ background: "var(--accent)" }}
          >
            Jetzt beitreten
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[3px]"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>

          <a
            href="https://tools.generation-ai.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full border px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-text transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            style={{ borderColor: "var(--border)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            Erst mal umschauen
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
            >
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </motion.div>

        {/* Meta-Row: sekundäre URL-Anzeige (sichtbar aber dezent, da CTA-Label
            jetzt "Erst mal umschauen" ist statt vollem URL-Text) */}
        <motion.p
          {...fadeIn}
          className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted"
        >
          tools.generation-ai.org
        </motion.p>
      </div>
    </section>
  )
}
