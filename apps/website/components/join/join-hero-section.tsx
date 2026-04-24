'use client'

import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { LabeledNodes } from '@/components/ui/labeled-nodes'

// Labels for /join Hero — conversion-focused (D-21, UI-SPEC verbatim)
const JOIN_LABELS = [
  'JOIN',
  'COMMUNITY',
  'KOSTENLOS',
  '2 MINUTEN',
  'KI-SKILLS',
  'DACH',
  'STUDIERENDE',
  'NETZWERK',
  'EVENTS',
  'TOOLS',
  'WISSEN',
  'FREEMIUM',
  'BEITRETEN',
  'TALENT',
  'ZUKUNFT',
]

export function JoinHeroSection() {
  const prefersReducedMotion = useReducedMotion()

  const textShadowSm =
    '0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)'
  const textShadowLg =
    '0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)'

  return (
    <section
      aria-labelledby="join-hero-heading"
      data-section="join-hero"
      className="relative isolate"
    >
      <LabeledNodes
        labels={JOIN_LABELS}
        className="flex min-h-[60vh] flex-col items-center justify-center"
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        >
          {/* Eyebrow: // jetzt beitreten (D-21) */}
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
            {'// jetzt beitreten'}
          </div>

          {/* H1 — "2 Minuten — dann bist du dabei." (D-11, D-21) */}
          {/* KEIN H2/Subline (D-21 explicit: kein scroll-heavy Marketing) */}
          <h1
            id="join-hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance"
            style={{
              fontSize: 'var(--fs-display)',
              textShadow: textShadowLg,
            }}
          >
            2 Minuten — dann bist du dabei.
          </h1>

          {/* Intro-Lede (D-21) */}
          <p
            className="mx-auto mt-6 max-w-2xl leading-[1.5] text-text-secondary text-pretty"
            style={{ fontSize: 'var(--fs-body)', textShadow: textShadowSm }}
          >
            Kostenlos. Für alle Fachrichtungen. Keine Haken.
          </p>

          {/* Benefit Row (D-21, UI-SPEC Component 1) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6">
            {(['Kostenlos', 'Keine Verpflichtung', 'In 2 Minuten'] as const).map(
              (label, i, arr) => (
                <React.Fragment key={label}>
                  <span
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
                    style={{ textShadow: textShadowSm }}
                  >
                    {label}
                  </span>
                  {i < arr.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full opacity-60"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </React.Fragment>
              ),
            )}
          </div>
        </motion.div>
      </LabeledNodes>
    </section>
  )
}
