'use client'

// AboutFinalCTASection — Abschluss-CTA am Ende der /about-Seite (Plan 21-05).
//
// Layout: zentriert. H2 + Body + Primary-CTA (→ /join) + Secondary-Zeile mit
// 2 Text-Links ("→ Partner werden" · "→ Aktiv mitmachen"). Middle-Dot als
// Trenner. KEIN Popover, KEINE Card-UI für Secondary (UI-SPEC Zeile 255).
//
// Primary-Pill reuse 1:1 aus final-cta-section.tsx (Hero-Parity).
//
// Motion: fadeIn-Entry mit useReducedMotion-Gate.
//
// Tokens: DS-only.

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

export function AboutFinalCTASection() {
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
      aria-labelledby="about-final-cta-heading"
      data-section="about-final-cta"
      className="relative bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* H2 — visueller Peak */}
        <motion.h2
          {...fadeIn}
          id="about-final-cta-heading"
          className="font-sans font-bold text-text text-balance"
          style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
        >
          Wir freuen uns auf dich.
        </motion.h2>

        {/* Body */}
        <motion.p
          {...fadeIn}
          className="mt-6 text-text-secondary text-pretty"
          style={{ fontSize: "var(--fs-lede)", lineHeight: "var(--lh-lede)" }}
        >
          Mitgliedschaft ist kostenlos und in 2 Minuten erledigt.
        </motion.p>

        {/* Primary-CTA: /join */}
        <motion.div {...fadeIn} className="mt-10 flex justify-center">
          <Link
            href="/join"
            prefetch={false}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            style={{ background: "var(--accent)" }}
          >
            Kostenlos Mitglied werden
            <ArrowRight
              className="w-4 h-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>

        {/* Secondary-Zeile: 2 Text-Links + Middle-Dot-Trenner */}
        <motion.div
          {...fadeIn}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-sm text-text-muted"
        >
          <Link
            href="/partner"
            prefetch={false}
            className="hover:text-[var(--accent)] hover:underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
          >
            → Partner werden
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="#mitmach"
            className="hover:text-[var(--accent)] hover:underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
          >
            → Aktiv mitmachen
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
