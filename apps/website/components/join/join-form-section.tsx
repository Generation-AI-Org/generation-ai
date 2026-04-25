'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { JoinFormCard } from './join-form-card'
import { JoinSuccessCard } from './join-success-card'

// AnimatePresence wrapper for the Form ↔ Success inline-swap (D-22).
//
// State lives here (not in individual cards) so both cards are siblings
// within the same AnimatePresence context — clean exit-before-enter.
export function JoinFormSection() {
  const prefersReducedMotion = useReducedMotion()
  const [submittedName, setSubmittedName] = useState<string | null>(null)

  return (
    <section
      aria-label="Beitrittsformular"
      data-section="join-form"
      className="relative py-16 px-6"
    >
      <div className="mx-auto max-w-lg">
        <AnimatePresence mode="wait">
          {submittedName === null ? (
            <motion.div
              key="form"
              initial={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -12 }
              }
              transition={{ duration: 0.2, ease: 'easeIn' }}
            >
              <JoinFormCard onSuccess={(name) => setSubmittedName(name)} />
            </motion.div>
          ) : (
            <JoinSuccessCard key="success" name={submittedName} />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
