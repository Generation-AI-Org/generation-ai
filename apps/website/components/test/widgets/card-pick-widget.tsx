'use client'

// apps/website/components/test/widgets/card-pick-widget.tsx
// Phase 24 — W1 CardPickWidget: 2-column card grid, single-select.

import type { PickQuestion, PickAnswer } from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'
import { OptionCard } from './option-card'
import { useRadioGroupKeyboard } from '@/hooks/use-radio-group-keyboard'

export function CardPickWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<PickQuestion, PickAnswer>) {
  const selected = answer?.optionId ?? null
  const checkedIndex = question.options.findIndex((o) => o.id === selected)
  const { containerRef, tabIndexFor, onKeyDown, onOptionFocus } = useRadioGroupKeyboard(
    question.options.length,
    checkedIndex,
  )

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={question.prompt}
      data-widget-type="pick"
      onKeyDown={onKeyDown}
      className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {question.options.map((opt, index) => (
        <OptionCard
          key={opt.id}
          id={`opt-${question.id}-${opt.id}`}
          label={opt.label}
          selected={selected === opt.id}
          disabled={disabled}
          tabIndex={tabIndexFor(index)}
          onFocus={() => onOptionFocus(index)}
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
