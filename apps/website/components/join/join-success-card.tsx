'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

// Success card shown after successful signup submit (D-22, Inline-Swap).
// Phase 25: copy updated from waitlist-V1 to real-signup confirmation.
// Animates in while form animates out (AnimatePresence mode="wait" in JoinFormSection).

export interface JoinSuccessCardProps {
  name: string
}

export function JoinSuccessCard({ name }: JoinSuccessCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // A11y: focus headline programmatically on mount (WCAG 2.4.3 Focus Order, D-22)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // Extract first name for the headline.
  const firstName = name.trim().split(/\s+/)[0] ?? name

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
      className="rounded-2xl border border-[var(--border)]/60 bg-bg-card shadow-sm px-6 py-8 sm:px-8 sm:py-10"
      role="status"
      aria-live="polite"
    >
      {/* Headline */}
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-bold text-text text-balance focus-visible:outline-none"
        style={{
          fontSize: 'var(--fs-h2)',
          lineHeight: 'var(--lh-headline)',
        }}
      >
        Willkommen, {firstName}! Du bist gleich drin.
      </h2>

      {/* Body */}
      <p
        className="mt-4 leading-[1.65] text-text-secondary text-pretty"
        style={{ fontSize: 'var(--fs-body)' }}
      >
        Wir haben dir eine Bestätigungs-E-Mail geschickt. Klicke den Link
        darin — danach bist du eingeloggt und in der Community.
      </p>

      {/* Primary CTA — Assessment (D-15): "Jetzt Level testen (2 min)" → /test */}
      <a
        href="/test"
        className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono font-bold text-[14px] tracking-[0.02em] transition-all duration-300"
        style={{
          background: 'var(--accent)',
          color: 'var(--text-on-accent)',
          minHeight: '44px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'
          e.currentTarget.style.transform = 'scale(1.03)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = ''
          e.currentTarget.style.transform = ''
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)'
        }}
      >
        Jetzt Level testen (2 min)
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>

      {/* Secondary Link (D-15): "Später im Dashboard" */}
      <a
        href="#"
        className="mt-4 block text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-text transition-colors py-3"
      >
        Später im Dashboard
      </a>
    </motion.div>
  )
}
