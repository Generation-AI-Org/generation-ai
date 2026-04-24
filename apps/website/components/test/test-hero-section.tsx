'use client'

// apps/website/components/test/test-hero-section.tsx
// Phase 24 — /test hero with LabeledNodes bg, matching AboutHero blueprint.

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { LabeledNodes } from '@/components/ui/labeled-nodes'

const BADGES = ['Kostenlos', 'Keine Anmeldung', 'Anonym', 'Max 15 Min'] as const

export function TestHeroSection() {
  const prefersReducedMotion = useReducedMotion()
  const textShadowSm =
    '0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)'
  const textShadowLg =
    '0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)'

  return (
    <section
      aria-labelledby="test-hero-heading"
      data-section="test-hero"
      className="relative isolate"
    >
      <LabeledNodes className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
            style={{ textShadow: textShadowSm }}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent-glow)',
              }}
            />
            {'// Generation AI · AI Literacy Test'}
          </div>

          {/* H1 */}
          <h1
            id="test-hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance"
            style={{
              fontSize: 'var(--fs-display)',
              textShadow: textShadowLg,
            }}
          >
            Wo stehst du wirklich mit KI?
          </h1>

          {/* Subline */}
          <p
            className="mx-auto mt-6 max-w-3xl font-mono font-bold tracking-tight text-text text-balance"
            style={{
              fontSize: 'var(--fs-h2)',
              lineHeight: 'var(--lh-headline)',
              textShadow: textShadowLg,
            }}
          >
            15 Minuten. 10 Aufgaben. Ehrliches Ergebnis.
          </p>

          {/* Intro lede */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl"
            style={{ textShadow: textShadowSm }}
          >
            Kein Selbsteinschätzungs-Quiz — wir fragen ab, was du kannst.
          </p>

          {/* Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {BADGES.map((b) => (
              <span
                key={b}
                className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 font-mono text-sm text-[var(--text-muted)]"
                style={{ textShadow: textShadowSm }}
              >
                {b}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10">
            <Link
              href="/test/aufgabe/1"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 font-mono text-sm font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_0_20px_var(--accent-glow)]"
            >
              Test starten
            </Link>
          </div>

          {/* Trust line */}
          <p
            className="mx-auto mt-4 max-w-lg text-sm text-[var(--text-muted)]"
            style={{ textShadow: textShadowSm }}
          >
            Kein Self-Assessment — wir fragen ab, was du kannst, nicht was du
            glaubst zu können.
          </p>
        </motion.div>
      </LabeledNodes>
    </section>
  )
}
