'use client'

import React from 'react'
import type { ReactNode } from 'react'
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

export function JoinHeroSection({ formSlot }: { formSlot?: ReactNode }) {
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
      <LabeledNodes labels={JOIN_LABELS} className="min-h-[calc(100vh-5rem)]">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={
            formSlot
              ? 'relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl content-center items-center gap-4 px-5 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)] lg:gap-10 lg:py-6'
              : 'relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center'
          }
        >
          <div
            className={
              formSlot
                ? 'pt-4 text-left sm:pt-10 lg:self-center lg:pt-0 lg:pr-4'
                : 'text-center'
            }
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
              className="mt-5 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance sm:mt-6"
              style={{
                fontSize: 'var(--fs-display)',
                textShadow: textShadowLg,
              }}
            >
              2 Minuten — dann bist du dabei.
            </h1>

            {/* Intro-Lede (D-21) */}
            <p
              className="mt-4 max-w-2xl leading-[1.5] text-text-secondary text-pretty sm:mt-6"
              style={{ fontSize: 'var(--fs-body)', textShadow: textShadowSm }}
            >
              Kostenlos. Für alle Fachrichtungen. Keine Haken.
            </p>

            {/* Benefit Row (D-21, UI-SPEC Component 1) */}
            <div
              className={
                formSlot
                  ? 'mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 sm:mt-8 sm:gap-x-6'
                  : 'mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6'
              }
            >
              {(['Kostenlos', 'Keine Verpflichtung', 'In 2 Minuten'] as const).map(
                (label, i, arr) => (
                  <React.Fragment key={label}>
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted sm:text-[11px] sm:tracking-[0.2em]"
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
          </div>

          {formSlot && (
            <div className="-mt-1 flex w-full justify-self-center sm:mt-0 lg:min-h-[min(680px,calc(100vh-7rem))] lg:items-center lg:justify-self-end">
              {formSlot}
            </div>
          )}
        </motion.div>
      </LabeledNodes>
    </section>
  )
}
