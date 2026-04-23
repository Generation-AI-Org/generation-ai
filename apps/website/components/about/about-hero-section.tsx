'use client'

// AboutHeroSection — Hero der /about-Seite (Plan 21-02).
//
// Layout: Eyebrow-Bullet + H1 + Display-Claim (Englisch, D-07) + Intro-Lede.
// Typografie-getrieben, kein Signal-Grid / kein Aurora.
//
// UI-SPEC-Flag-Fix: Display-Claim nutzt `--fs-h2`-Token (clamp 24-32px) statt
// neuer 28-36px-Size. Kein neuer Font-Size-Token.
//
// Motion: fadeIn-Entry via motion/react, `useReducedMotion`-Gate disablet.
// Easing [0.16, 1, 0.3, 1] (DS-Ease-Out), duration 0.6s.
//
// A11y: `<h1 id="about-hero-heading">` als Section-Label via aria-labelledby.
//
// Tokens: --fs-h1, --fs-h2, --fs-lede, --lh-tight, --lh-headline, --lh-lede,
// --accent, --accent-glow.

import { motion, useReducedMotion } from "motion/react"

export function AboutHeroSection() {
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
      aria-labelledby="about-hero-heading"
      data-section="about-hero"
      className="relative bg-bg py-28 sm:py-36 border-b border-border"
    >
      <div className="mx-auto max-w-3xl px-6">
        {/* Eyebrow: // Generation AI · Über uns */}
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
          {"// Generation AI · Über uns"}
        </motion.div>

        {/* H1 — Warum es uns gibt. */}
        <motion.h1
          {...fadeIn}
          id="about-hero-heading"
          className="text-center font-mono font-bold tracking-tight text-text text-balance"
          style={{
            fontSize: "var(--fs-h1)",
            lineHeight: "var(--lh-tight)",
          }}
        >
          Warum es uns gibt.
        </motion.h1>

        {/* Display-Claim (Englisch, D-07) — nutzt --fs-h2 (UI-SPEC-Flag-Fix) */}
        <motion.p
          {...fadeIn}
          className="mt-8 text-center font-mono font-bold tracking-tight text-text text-balance"
          style={{
            fontSize: "var(--fs-h2)",
            lineHeight: "var(--lh-headline)",
          }}
        >
          We shape talent for an AI-native future.
        </motion.p>

        {/* Intro-Lede */}
        <motion.p
          {...fadeIn}
          className="mt-8 text-center text-pretty text-text-secondary"
          style={{
            fontSize: "var(--fs-lede)",
            lineHeight: "var(--lh-lede)",
          }}
        >
          Wir bringen Studierenden die KI-Skills bei, die in Jobs heute schon erwartet werden. Kostenlos, praxisnah, für alle Fachrichtungen.
        </motion.p>
      </div>
    </section>
  )
}
