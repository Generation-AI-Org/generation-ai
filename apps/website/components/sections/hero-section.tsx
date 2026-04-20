'use client'

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { GridBackground } from "@/components/ui/grid-background"

// Plan 06 Task 1 (UAT) — Hero: GridBackground (Raycast/Vercel-style) +
// Claim-Placeholder + Primary-CTA → /join.
//
// UAT-Entscheidung 2026-04-20: AuroraBackground durch animated GridBackground
// ersetzt — Aurora war im aktuellen Theming-Kontext visuell gebrochen, Luca hat
// "geiles grid oder so" explizit freigegeben. Brand-Vibe: Terminal/hacker
// (siehe components/terminal-splash.tsx).
//
// Reduced-motion-Verhalten:
//   - Grid-Spotlight-Keyframe pausiert ueber globals.css @media
//     (prefers-reduced-motion) + zusaetzliches JS-Guard im GridBackground
//   - motion.div-Entry-Animation wird via useReducedMotion() ausgeschaltet
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
      <GridBackground className="min-h-[80vh]">
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
      </GridBackground>
    </section>
  )
}
