'use client'

// AboutValuesSection — Werte-Section der /about-Seite (Plan 21-04).
//
// 4 Werte-Blöcke mit Claim (h3) + Body. Desktop: 2×2 Grid, Mobile: 1-col Stack.
//
// A11y: Section-Anker id="werte". Section-Head h2 (--fs-h3-Size), Value-Claims
// h3 (valide Hierarchie innerhalb H2-Section, im Unterschied zur Section-Heads-
// Regel aus Plan 21-02).
//
// Motion: fadeIn-Entry mit useReducedMotion-Gate.
//
// Tokens: DS-only.

import { motion, useReducedMotion } from "motion/react"

type ValueBlock = {
  claim: string
  body: string
}

const values: ValueBlock[] = [
  {
    claim: "Offen für alle.",
    body: "KI-Kompetenz ist keine Frage des Studiengangs. Von Medizin bis Maschinenbau, von Pädagogik bis Politik — jede Disziplin wird durch KI verändert, und jede Disziplin braucht Leute, die verstehen, wie sie funktioniert.",
  },
  {
    claim: "Anwenden statt auswendig lernen.",
    body: "Theorie alleine bringt nichts. Bei uns baust du in Workshops echte Dinge — vom ersten Chat-Agenten bis zur Mini-Automatisierung. Erfolg heißt: du hast am Ende einen Output, den du nutzen kannst.",
  },
  {
    claim: "Signal statt Noise.",
    body: "Das KI-Feld ist voll mit Gurus, Hype-Tools und Tutorial-Flut. Wir filtern. Was wir zeigen, haben wir selbst geprüft — oder wir sagen ehrlich, wenn wir's noch nicht wissen.",
  },
  {
    claim: "Voneinander lernen, zusammen wachsen.",
    body: "Community ist unser Kernangebot, nicht Content. Die besten Einsichten kommen aus der Gruppe — nicht von einem Dozenten vorne. Wer aktiv teilt, lernt am schnellsten.",
  },
]

export function AboutValuesSection() {
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
      id="werte"
      aria-labelledby="about-values-heading"
      data-section="about-values"
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
          {"// was uns antreibt"}
        </motion.div>

        {/* H2 Section-Head */}
        <motion.h2
          {...fadeIn}
          id="about-values-heading"
          className="text-center font-mono font-bold text-text text-balance"
          style={{ fontSize: "var(--fs-h3)", lineHeight: "var(--lh-sub)" }}
        >
          Worauf wir Wert legen.
        </motion.h2>

        {/* Werte-Grid: 2×2 Desktop, 1-col Mobile */}
        <motion.ul
          {...fadeIn}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-8"
        >
          {values.map((value) => (
            <li key={value.claim} className="flex flex-col gap-2">
              <h3
                className="font-sans font-bold text-text text-pretty"
                style={{ fontSize: "var(--fs-body)", lineHeight: 1.3 }}
              >
                {value.claim}
              </h3>
              <p
                className="text-text-secondary text-pretty"
                style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)" }}
              >
                {value.body}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
