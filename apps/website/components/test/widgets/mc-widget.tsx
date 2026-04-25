'use client'

// apps/website/components/test/widgets/mc-widget.tsx
// Phase 24 — W9 MCWidget: single-column multiple-choice, single-select.
// Shares OptionCard with CardPickWidget.

import type { PickQuestion, PickAnswer } from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'
import { OptionCard } from './option-card'
import { useRadioGroupKeyboard } from '@/hooks/use-radio-group-keyboard'

export function MCWidget({
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
      data-widget-type="mc"
      onKeyDown={onKeyDown}
      className="mx-auto flex w-full max-w-2xl flex-col gap-3"
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
