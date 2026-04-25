'use client'

// apps/website/components/test/widgets/confidence-slider-widget.tsx
// Phase 24 — W7 ConfidenceSliderWidget: 5-step discrete slider (0-4).

import { useCallback, useId } from 'react'
import type { ConfidenceAnswer, ConfidenceQuestion } from '@/lib/assessment/types'
import { Slider } from '@/components/ui/slider'
import type { WidgetProps } from './widget-types'

const SEMANTIC_LABELS = [
  'Sicher nicht',
  'Eher nicht',
  'Unsicher',
  'Eher ja',
  'Sicher ja',
] as const

const PERCENT_LABELS = ['0%', '25%', '50%', '75%', '100%'] as const

type Step = 0 | 1 | 2 | 3 | 4

function toStep(n: number): Step {
  const clamped = Math.round(Math.min(4, Math.max(0, n)))
  return clamped as Step
}

export function ConfidenceSliderWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<ConfidenceQuestion, ConfidenceAnswer>) {
  // WR-06: do NOT default to step=2 — user must interact before the answer is
  // considered "ready". The visual thumb still sits at the middle (mid position)
  // as an affordance, but scoring/readiness is gated by a non-null answer.step.
  const hasInteracted = answer?.step != null
  const step: Step = (answer?.step ?? 2) as Step
  const liveRegionId = useId()

  const emit = useCallback(
    (next: Step) => {
      onAnswer({
        questionId: question.id,
        type: 'confidence',
        step: next,
      })
    },
    [onAnswer, question.id],
  )

  const handleValueChange = useCallback(
    (value: number | readonly number[]) => {
      const raw = typeof value === 'number' ? value : value[0]
      emit(toStep(raw))
    },
    [emit],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Number keys 1-5 jump directly to that step.
      const digit = Number.parseInt(e.key, 10)
      if (Number.isInteger(digit) && digit >= 1 && digit <= 5) {
        e.preventDefault()
        emit(toStep(digit - 1))
      }
    },
    [emit],
  )

  return (
    <div
      data-widget-type="confidence"
      className="mx-auto w-full max-w-2xl space-y-6"
      onKeyDown={handleKeyDown}
    >
      {/* Output to evaluate */}
      <div className="rounded-xl bg-[var(--slate-2)] p-4 font-mono text-sm leading-relaxed text-[var(--text)]">
        {question.outputText}
      </div>

      {/* Semantic labels (desktop only) */}
      <div className="hidden justify-between px-1 text-xs text-[var(--text-muted)] md:flex">
        {SEMANTIC_LABELS.map((label) => (
          <span key={label} className="w-[4rem] text-center">
            {label}
          </span>
        ))}
      </div>

      {/* The slider — visually dimmed until user first interacts (WR-06). */}
      <Slider
        min={0}
        max={4}
        step={1}
        value={step}
        disabled={disabled}
        aria-label={`Confidence: ${question.prompt}`}
        aria-describedby={liveRegionId}
        data-unset={hasInteracted ? undefined : 'true'}
        className={hasInteracted ? undefined : 'opacity-60'}
        onValueChange={handleValueChange}
      />

      {/* Percent ticks (always visible) */}
      <div className="flex justify-between px-1 text-xs text-[var(--text-muted)]">
        {PERCENT_LABELS.map((label) => (
          <span key={label} className="w-[3rem] text-center">
            {label}
          </span>
        ))}
      </div>

      {/* Screen-reader live region */}
      <span id={liveRegionId} className="sr-only" aria-live="polite">
        {hasInteracted
          ? `Confidence: ${SEMANTIC_LABELS[step]} (${step * 25}%)`
          : 'Confidence: noch nicht gesetzt'}
      </span>
    </div>
  )
}
