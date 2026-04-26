'use client'

// AboutMitmachCTASection — Mitmach-CTA der /about-Seite (Plan 21-05).
//
// Layout: zentriert. H2 + Body + Primary-Pill zum Verein-Formular. Anker id="mitmach"
// ist load-bearing: Targets von Story-CTA, Abschluss-Secondary-Link,
// Kontaktbox-Mitmach-Link, FAQ-Inline-Link.
//
// Primary-Pill-Classes reused 1:1 aus final-cta-section.tsx (Hero-Parity,
// Plan 20.6-07 Baseline). Background über `style={{ background: var(--accent) }}`
// weil Tailwind `bg-[var(--accent)]`-Arbitrary sonst nicht mit Opacity-Utility
// kombiniert — gleiches Pattern wie in der Landing-CTA.
//
// Motion: fadeIn-Entry mit useReducedMotion-Gate. Reduced-Motion disablet auch
// hover:scale — Browser respektiert `prefers-reduced-motion: reduce` auf
// transition-all.
//
// Tokens: --fs-h2, --fs-lede, --lh-headline, --lh-lede, --accent, --accent-glow,
// --text-on-accent, --dur-fast, --ease-out, --bg, --text.

import { motion, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"

export function AboutMitmachCTASection() {
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
      id="mitmach"
      aria-labelledby="about-mitmach-heading"
      data-section="about-mitmach"
      className="relative bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* H2 — visuell groesser als Story/Team/Werte/Verein (--fs-h2 clamp 24-32) */}
        <motion.h2
          {...fadeIn}
          id="about-mitmach-heading"
          className="font-mono font-bold text-text text-balance"
          style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
        >
          Bock, mitzumachen?
        </motion.h2>

        {/* Body */}
        <motion.p
          {...fadeIn}
          className="mt-6 text-text-secondary text-pretty"
          style={{ fontSize: "var(--fs-lede)", lineHeight: "var(--lh-lede)" }}
        >
          Wir suchen Leute, die mit aufbauen wollen. Events, Content, Strategie, Tech — sag uns, wo du anpacken würdest.
        </motion.p>

        {/* Primary-CTA: Sprung zum Verein-Formular */}
        <motion.div {...fadeIn} className="mt-10 flex justify-center">
          <a
            href="#verein-form"
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            style={{ background: "var(--accent)" }}
          >
            Zum Formular
            <ArrowRight
              className="w-4 h-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
