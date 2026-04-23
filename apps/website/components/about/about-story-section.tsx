'use client'

// AboutStorySection — Story-Section der /about-Seite (Plan 21-02).
//
// Layout: Eyebrow-Bullet + H2 (visuell H3-Size) + 3 Absätze + Inline-CTA zum
// #mitmach-Anker. Gründungs-Narrative, Copy 1:1 aus UI-SPEC.
//
// A11y: Section-Anker id="story" für Deep-Linking. Semantisch `<h2>` mit
// visueller `--fs-h3`-Size (Heading-Hierarchie: H1 Hero → H2 alle Section-Heads).
// KEIN h3-Tag im DOM.
//
// Motion: fadeIn-Entry, useReducedMotion-Gate. Pattern reused aus
// AboutHeroSection / kurz-faq-section.
//
// Tokens: --fs-h3, --fs-body, --lh-sub, --lh-body, --accent, --accent-glow,
// --dur-fast, --ease-out.

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

export function AboutStorySection() {
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
      id="story"
      aria-labelledby="about-story-heading"
      data-section="about-story"
      className="relative bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-3xl px-6">
        {/* Eyebrow: // unsere story */}
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
          {"// unsere story"}
        </motion.div>

        {/* Semantisch H2, visuell H3-Size via --fs-h3 Token */}
        <motion.h2
          {...fadeIn}
          id="about-story-heading"
          className="text-center font-sans font-bold text-text text-balance"
          style={{
            fontSize: "var(--fs-h3)",
            lineHeight: "var(--lh-sub)",
          }}
        >
          Warum wir das machen.
        </motion.h2>

        {/* 3 Absätze — Gründungs-Narrative */}
        <motion.div
          {...fadeIn}
          className="mt-12 flex flex-col gap-6 text-text-secondary text-pretty"
          style={{
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
          }}
        >
          <p>
            Janna und Simon haben Generation AI im Februar 2026 gegründet. Beide haben selbst studiert, als KI in der Mitte der Gesellschaft ankam — und gemerkt, wie schnell der Abstand wächst zwischen dem, was Unis lehren, und dem, was in Jobs heute erwartet wird.
          </p>
          <p>
            Aus einem Workshop-Versuch zu zweit ist ein Team von zehn Leuten geworden. Studierende, Early-Careers, ehrenamtlich. Wir bauen die Community auf, die wir selbst gebraucht hätten.
          </p>
          <p>
            Ziel: eine Generation, die KI nicht erleidet, sondern gestaltet. Offen für alle Fachrichtungen, kostenlos, unabhängig.
          </p>
        </motion.div>

        {/* Inline-CTA zum #mitmach-Anker */}
        <motion.div {...fadeIn} className="mt-10 flex justify-center">
          <Link
            href="#mitmach"
            className="group inline-flex items-center gap-2 font-mono text-sm font-bold text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
          >
            Werde Teil davon
            <ArrowRight
              className="w-4 h-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
