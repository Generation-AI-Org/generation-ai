'use client'

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { LampContainer } from "@/components/ui/lamp"

// Plan 20-05 Task 3 — R1.9 / D-15 (Wow-Peak 3)
// LampContainer provides the Aceternity lamp-effect background (motion whileInView
// + conic-gradient). Our own motion.div for the content layer honors useReducedMotion().
// Final wording is explicit Deferred per CONTEXT.md — substantive placeholder so preview
// reads as a real landing.
export function FinalCTASection() {
  const prefersReducedMotion = useReducedMotion()

  const finalSubline = "Komm in die Community. Kostenlos, ohne Bullshit."

  return (
    <section
      aria-labelledby="final-cta-heading"
      data-section="final-cta"
      className="relative isolate"
    >
      <LampContainer className="min-h-[70vh] bg-bg">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-3xl mx-auto px-6"
        >
          <h2
            id="final-cta-heading"
            className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text text-balance"
          >
            Sei <span style={{ color: "var(--accent)" }}>dabei</span>, bevor der Rest aufholt.
          </h2>
          <p className="mt-6 text-lg text-text-secondary">
            {finalSubline}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              prefetch={false}
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] px-6 py-3 rounded-full text-sm font-mono font-bold transition-all duration-300 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03]"
            >
              Jetzt beitreten
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="https://tools.generation-ai.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-mono text-text-muted hover:text-text transition-colors"
            >
              Erst mal umschauen → tools.generation-ai.org
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </LampContainer>
    </section>
  )
}
