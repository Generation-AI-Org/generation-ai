'use client'

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { SignalGrid } from "@/components/ui/signal-grid"

// Phase 20.5 Plan 03 — Hero: SignalGrid (DS Connection-Motif) +
// DS-aligned Typography + Primary-CTA Button-States.
//
// Background-History:
//   Phase 20.6 (UAT): AuroraBackground → GridBackground (Raycast/Vercel-Look).
//   Phase 20.5: GridBackground → SignalGrid, weil Design-System-Spezifikation
//   (brand/Generation AI Design System/README.md §Visual Foundations → Backgrounds)
//   explizit Nodes + Propagation-Ripple als Motif definiert. GridBackground
//   bleibt als @deprecated Component erhalten für evtl. andere Contexts.
//
// Reduced-motion-Verhalten:
//   - SignalGrid respektiert `prefers-reduced-motion: reduce` intern
//     (statischer Grid, keine Breathing, keine Cursor-Propagation, keine Linien).
//   - motion.div-Entry-Animation wird via useReducedMotion() ausgeschaltet.
//
// Typography (DS-konform):
//   - H1 Geist Mono 700, tracking -0.02em via `tracking-tight`, line-height 1.05
//   - Body/Subline Geist Sans (default)
//   - Eyebrow + Tagline Geist Mono uppercase tracked-out
//
// Button-States (DS §D Component-Defaults + §E Motion):
//   - Pill (`rounded-full`), Geist Mono 700 tracked +0.02em
//   - Hover: scale 1.03 + shadow-glow (--accent-glow)
//   - Active/Press: scale 0.98 (DS §C Interaction-States)
//   - Transition: 300ms cubic-bezier(0.16, 1, 0.3, 1) (≈ --dur-normal / --ease-out)
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
      <SignalGrid className="flex min-h-screen flex-col items-center justify-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center"
        >
          {/* Text-backdrop: subtle radial halo in theme-bg color so H1/subline/CTA
              stay readable over the animated Signal-Grid. Uses --bg-rgb triplet
              so opacity works in both themes. Sits behind content (-z-10) +
              inside the content wrapper so it tracks the actual text cluster
              (not the full hero rectangle). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-2rem] -z-10 rounded-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(var(--bg-rgb), 0.30) 0%, rgba(var(--bg-rgb), 0.12) 55%, transparent 85%)",
            }}
          />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary mb-6">
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
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-mono font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98]"
            >
              Jetzt beitreten
            </Link>
          </div>
          <p className="mt-6 text-xs font-mono text-text-muted">
            Kostenlos · gemeinnützig · für Studierende und Early-Career
          </p>
        </motion.div>
      </SignalGrid>
    </section>
  )
}
