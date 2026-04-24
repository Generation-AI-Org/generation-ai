'use client'

// apps/website/components/test/checkpoint-celebration.tsx
// Phase 24 — Brief mid-test "Halbzeit" celebration shown after Aufgabe 5.
// Lifecycle (timeout + dismissal) is owned by the parent (aufgabe-client.tsx).

import { motion, useReducedMotion } from 'motion/react'

export interface CheckpointProps {
  /** Kept for API compatibility — parent may still invoke this on manual dismiss. */
  onDismiss?: () => void
}

export function CheckpointCelebration(_props?: CheckpointProps) {
  // _props kept for API compatibility — parent currently owns dismiss lifecycle.
  void _props
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      // Header-strip scope: covers only the h-14 (56px) header area, not the full page.
      // Positioned relative to the root layout div (which now has `relative`).
      // UI-SPEC: "header strip background transitions from var(--bg) to var(--accent-soft)"
      className="pointer-events-none absolute top-0 right-0 left-0 z-20 flex h-14 items-center justify-center"
      initial={{ opacity: 0, backgroundColor: 'var(--bg)' }}
      animate={{ opacity: 1, backgroundColor: 'var(--accent-soft)' }}
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
