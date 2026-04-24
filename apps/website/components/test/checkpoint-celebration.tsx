'use client'

// apps/website/components/test/checkpoint-celebration.tsx
// Phase 24 — Brief mid-test "Halbzeit" celebration shown after Aufgabe 5.

import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'

export interface CheckpointProps {
  onDismiss: () => void
  /** ms; default 1500 */
  duration?: number
}

export function CheckpointCelebration({
  onDismiss,
  duration = 1500,
}: CheckpointProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [onDismiss, duration])

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
      role="status"
      aria-live="polite"
      aria-label="Halbzeit"
    >
      <span className="text-sm text-[var(--text)]">Halbzeit! Weiter so.</span>
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-[var(--accent)]"
              style={{
                animation: `confetti-burst-${i} 1.2s ease-out forwards`,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
