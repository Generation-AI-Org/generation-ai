'use client'

// apps/website/components/test/widgets/fehlerspot-widget.tsx
// Phase 24 — W5 FehlerspotWidget: click a text span to flag the problem.

import { useCallback, useId } from 'react'
import { cn } from '@/lib/utils'
import type { SpotAnswer, SpotQuestion } from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'

export function FehlerspotWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<SpotQuestion, SpotAnswer>) {
  const selected = answer?.segmentId ?? null
  const liveId = useId()

  const handleSelect = useCallback(
    (id: string) => {
      onAnswer({ questionId: question.id, type: 'spot', segmentId: id })
    },
    [onAnswer, question.id],
  )

  const selectedIndex =
    selected !== null
      ? question.passageSegments.findIndex((s) => s.id === selected)
      : -1
  const liveMessage =
    selectedIndex >= 0 ? `Abschnitt ${selectedIndex + 1} ausgewählt` : ''

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <p className="text-base text-[var(--text)]">
        Klicke auf den problematischen Textabschnitt.
      </p>
      <div
        role="listbox"
        aria-label="Textabschnitte zum Auswählen"
        data-widget-type="spot"
        className="mx-auto max-w-xl text-base leading-[1.65] text-[var(--text)]"
      >
        {question.passageSegments.map((seg) => {
          const isSelected = selected === seg.id
          return (
            <span
              key={seg.id}
              role="option"
              tabIndex={disabled ? -1 : 0}
              aria-selected={isSelected}
              aria-disabled={disabled}
              onClick={() => !disabled && handleSelect(seg.id)}
              onKeyDown={(e) => {
                if (disabled) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(seg.id)
                }
              }}
              className={cn(
                'cursor-pointer rounded-md px-1 transition-colors',
                isSelected
                  ? 'bg-[var(--accent-soft)] text-[var(--text)] underline decoration-dotted decoration-[var(--accent)]'
                  : 'hover:bg-[var(--slate-4)]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {seg.text}
            </span>
          )
        })}
      </div>
      <span id={liveId} className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
    </div>
  )
}
