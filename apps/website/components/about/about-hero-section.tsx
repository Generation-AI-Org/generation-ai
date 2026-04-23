'use client'

import { motion, useReducedMotion } from "motion/react"
import { LabeledNodes } from "@/components/ui/labeled-nodes"

export function AboutHeroSection() {
  const prefersReducedMotion = useReducedMotion()

  const textShadowSm =
    "0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)"
  const textShadowLg =
    "0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)"

  return (
    <section
      aria-labelledby="about-hero-heading"
      data-section="about-hero"
      className="relative isolate"
    >
      <LabeledNodes className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        >
          {/* Eyebrow: // Generation AI · Über uns */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
            style={{ textShadow: textShadowSm }}
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
          </div>

          {/* H1 — Warum es uns gibt. (Landing-Hero-Parity: --fs-display) */}
          <h1
            id="about-hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance"
            style={{
              fontSize: "var(--fs-display)",
              textShadow: textShadowLg,
            }}
          >
            Warum es uns gibt.
          </h1>

          {/* Display-Claim (Englisch, D-07) — dezenter Subhead unter H1 */}
          <p
            className="mx-auto mt-6 max-w-3xl font-mono font-bold tracking-tight text-text text-balance"
            style={{
              fontSize: "var(--fs-h2)",
              lineHeight: "var(--lh-headline)",
              textShadow: textShadowLg,
            }}
          >
            We shape talent for an AI-native future.
          </p>

          {/* Intro-Lede — Landing-Subline-Stil */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl"
            style={{ textShadow: textShadowSm }}
          >
            Wir bringen Studierenden die KI-Skills bei, die in Jobs heute schon erwartet werden. Kostenlos, praxisnah, für alle Fachrichtungen.
          </p>
        </motion.div>
      </LabeledNodes>
    </section>
  )
}
