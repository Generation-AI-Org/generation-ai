'use client'

// apps/website/components/test/widgets/card-pick-widget.tsx
// Phase 24 — W1 CardPickWidget: 2-column card grid, single-select.

import type { PickQuestion, PickAnswer } from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'
import { OptionCard } from './option-card'

export function CardPickWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<PickQuestion, PickAnswer>) {
  const selected = answer?.optionId ?? null

  return (
    <div
      role="radiogroup"
      aria-label={question.prompt}
      data-widget-type="pick"
      className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {question.options.map((opt) => (
        <OptionCard
          key={opt.id}
          id={`opt-${question.id}-${opt.id}`}
          label={opt.label}
          selected={selected === opt.id}
          disabled={disabled}
          onSelect={() =>
            onAnswer({
              questionId: question.id,
              type: question.type,
              optionId: opt.id,
            })
          }
        />
      ))}
    </div>
  )
}
