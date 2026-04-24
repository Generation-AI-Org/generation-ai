'use client'

// apps/website/components/test/widgets/side-by-side-widget.tsx
// Phase 24 — W4 SideBySideWidget: two-phase A/B choice + reason multi-select.

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  SideBySideAnswer,
  SideBySideQuestion,
} from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'
import { useRadioGroupKeyboard } from '@/hooks/use-radio-group-keyboard'

export function SideBySideWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<SideBySideQuestion, SideBySideAnswer>) {
  const reducedMotion = useReducedMotion()
  const choice = answer?.choice ?? null
  const reasonIds = answer?.reasonIds ?? []
  // WR-03: roving tabindex + arrow-key nav for the A/B radiogroup.
  const CHOICES = ['a', 'b'] as const
  const checkedIndex = choice === null ? -1 : CHOICES.indexOf(choice)
  const { containerRef, tabIndexFor, onKeyDown, onOptionFocus } = useRadioGroupKeyboard(
    CHOICES.length,
    checkedIndex,
  )

  const [phaseBAnnounced, setPhaseBAnnounced] = useState(false)
  useEffect(() => {
    if (choice !== null && !phaseBAnnounced) {
      setPhaseBAnnounced(true)
    }
  }, [choice, phaseBAnnounced])

  const emit = useCallback(
    (nextChoice: 'a' | 'b' | null, nextReasons: string[]) => {
      onAnswer({
        questionId: question.id,
        type: 'side-by-side',
        choice: nextChoice,
        reasonIds: nextReasons,
      })
    },
    [onAnswer, question.id],
  )

  const handleChoose = useCallback(
    (c: 'a' | 'b') => {
      emit(c, reasonIds)
    },
    [emit, reasonIds],
  )

  const handleToggleReason = useCallback(
    (id: string) => {
      const next = reasonIds.includes(id)
        ? reasonIds.filter((x) => x !== id)
        : [...reasonIds, id]
      emit(choice, next)
    },
    [choice, emit, reasonIds],
  )

  return (
    <div
      data-widget-type="side-by-side"
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
    >
      {/* Phase A */}
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label="Welcher Output ist besser?"
        onKeyDown={onKeyDown}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {CHOICES.map((key, index) => {
          const isSelected = choice === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              tabIndex={tabIndexFor(index)}
              onFocus={() => onOptionFocus(index)}
              onClick={() => handleChoose(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleChoose(key)
                }
              }}
              className={cn(
                'relative rounded-2xl border p-4 text-left transition-all duration-150',
                'bg-[var(--bg-card)]',
                'hover:border-[var(--slate-7)] hover:bg-[var(--bg-elevated)]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
                isSelected
                  ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
                  : 'border-[var(--border)]',
              )}
            >
              <span className="mb-2 inline-block rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-xs uppercase tracking-wide text-[var(--text-muted)]">
                {isSelected ? 'Gewählt' : `Output ${key.toUpperCase()}`}
              </span>
              {isSelected && (
                <Check
                  className="absolute top-3 right-3 h-4 w-4 text-[var(--accent)]"
                  aria-hidden
                />
              )}
              <p className="max-h-48 overflow-y-auto text-sm leading-[1.6] text-[var(--text)] whitespace-pre-wrap">
                {question.outputs[key]}
              </p>
            </button>
          )
        })}
      </div>

      {/* Phase B — reasons */}
      <AnimatePresence initial={false}>
        {choice !== null && (
          <motion.div
            key="phase-b"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.3 }}
            className="overflow-hidden"
          >
            <div
              role="group"
              aria-label="Warum ist dieser Output besser?"
              className="flex flex-wrap gap-2"
            >
              {question.reasons.map((r) => {
                const isChecked = reasonIds.includes(r.id)
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    disabled={disabled}
                    onClick={() => handleToggleReason(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleToggleReason(r.id)
                      }
                    }}
                    className={cn(
                      'min-h-[48px] rounded-full border px-3 py-1 text-sm transition-colors',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                      isChecked
                        ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)] text-[var(--text)]'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)]',
                    )}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {phaseBAnnounced ? 'Phase B geöffnet: Wähle Gründe aus' : ''}
      </span>
    </div>
  )
}
