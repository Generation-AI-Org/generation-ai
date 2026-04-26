'use client'

// AboutVereinSection — Verein-Section der /about-Seite (Plan 21-04).
//
// Hervorgehobene Card mit 3 Absätzen zu Gemeinnützigkeit + Finanzierung.
// Accent-Hairline oben (2px, var(--accent), opacity 0.6) — echo zu
// final-cta-section.tsx.
//
// A11y: Section-Anker id="verein" (D-09, load-bearing — Phase 22 Partner-Page
// verlinkt hierhin). Heading semantisch h2, visuell --fs-h3.
//
// Motion: fadeIn-Entry mit useReducedMotion-Gate.
//
// Tokens: DS-only.

import { motion, useReducedMotion } from "motion/react"
import { AboutVereinForm } from "@/components/about/about-verein-form"

export function AboutVereinSection() {
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
      id="verein"
      aria-labelledby="about-verein-heading"
      data-section="about-verein"
      className="relative bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl px-6">
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
          {"// verein"}
        </motion.div>

        {/* H2 */}
        <motion.h2
          {...fadeIn}
          id="about-verein-heading"
          className="text-center font-mono font-bold text-text text-balance"
          style={{ fontSize: "var(--fs-h3)", lineHeight: "var(--lh-sub)" }}
        >
          Gemeinnützig. Transparent. Offen.
        </motion.h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          {/* Verein-Card mit Accent-Hairline oben */}
          <motion.div
            {...fadeIn}
            className="relative overflow-hidden rounded-2xl border border-border bg-bg-card px-8 py-10"
          >
            {/* Accent-Hairline oben — echo zu final-cta-section.tsx */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{
                background: "var(--accent)",
                opacity: 0.6,
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />

            <div
              className="flex flex-col gap-6 text-pretty text-text-secondary"
              style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)" }}
            >
              <p>
                Generation AI ist ein gemeinnütziger Verein in Gründung (e.V. i.G.). Gewinnorientiert sind wir nicht — alles, was reinkommt, geht in die Community zurück.
              </p>
              <p>
                Finanziert durch Fördermittel, Sachleistungen und Partnerschaften mit Unternehmen, Stiftungen und Hochschulen. Keine Paywall, keine versteckten Kosten für Mitglieder.
              </p>
              <p>
                Mitgliedschaft ist kostenlos und in 2 Minuten erledigt. Wenn du Bock hast, mit einem starken Team etwas zu verändern: Events, Content, Strategie und Tech brauchen Leute, die anpacken.
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeIn}>
            <AboutVereinForm />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
