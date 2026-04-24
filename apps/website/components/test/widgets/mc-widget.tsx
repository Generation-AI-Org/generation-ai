'use client'

// apps/website/components/test/widgets/mc-widget.tsx
// Phase 24 — W9 MCWidget: single-column multiple-choice, single-select.
// Shares OptionCard with CardPickWidget.

import type { PickQuestion, PickAnswer } from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'
import { OptionCard } from './option-card'

export function MCWidget({
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
      data-widget-type="mc"
      className="mx-auto flex w-full max-w-2xl flex-col gap-3"
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
