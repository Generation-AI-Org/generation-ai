'use client'

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { AuroraBackground } from "@/components/ui/aurora-background"

// Plan 03 Task 1 — Hero: Aurora-Background + Claim-Placeholder + Primary-CTA → /join.
// Claim-Wording ist explizit Deferred (CONTEXT.md "Deferred Ideas" —
// "Hero-Claim finales Wording" kommt mit Marketing-Pass, nicht Phase 20).
// Wir setzen einen sprechenden Platzhalter, der die Section-Funktion erfuellt.
//
// Reduced-motion-Verhalten:
//   - Aurora-CSS-Keyframe pausiert ueber globals.css @media (prefers-reduced-motion)
//   - motion.div-Entry-Animation wird via useReducedMotion() ausgeschaltet
//
// Hinweis: AuroraBackground rendert intern ein <main>-Wrapper (Aceternity-Upstream).
// Das home-client.tsx <main id="main-content"> umschliesst diese Section — das
// erzeugt ein verschachteltes <main>. Bekannter Pre-existing-Issue aus Plan 01
// (Aceternity-Copy), nicht Teil dieses Plans (siehe deferred-items.md).
export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  const heroClaim = "KI-Skills, die im Studium fehlen."
  const heroSubline =
    "Die Community für Studierende, die KI nicht nur benutzen, sondern verstehen wollen."

  return (
    <section
      aria-labelledby="hero-heading"
      data-section="hero"
      className="relative isolate"
    >
      <AuroraBackground className="min-h-[80vh]">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-6">
            Generation AI · DACH-Community
          </p>
          <h1
            id="hero-heading"
            className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-text"
          >
            {heroClaim}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
            {heroSubline}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="inline-flex items-center justify-center bg-[var(--accent)] text-[var(--text-on-accent)] px-6 py-3 rounded-full text-sm font-mono font-bold transition-all duration-300 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03]"
            >
              Jetzt beitreten
            </Link>
          </div>
          <p className="mt-6 text-xs font-mono text-text-muted">
            Kostenlos · gemeinnützig · für Studierende und Early-Career
          </p>
        </motion.div>
      </AuroraBackground>
    </section>
  )
}
