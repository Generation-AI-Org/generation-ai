'use client'

// apps/website/components/test/widgets/fill-in-widget.tsx
// Phase 24 — W8 FillInWidget: inline <select> dropdowns embedded in a code block.

import { useCallback, useMemo } from 'react'
import type { FillAnswer, FillQuestion } from '@/lib/assessment/types'
import { cn } from '@/lib/utils'
import type { WidgetProps } from './widget-types'

type Segment = { kind: 'text'; text: string } | { kind: 'blank'; id: string }

/**
 * Split `{{BLANK_ID}}` tokens out of the code template, preserving whitespace.
 * Alternates text and blank segments.
 */
function segmentize(codeTemplate: string, blankIds: ReadonlySet<string>): Segment[] {
  const parts = codeTemplate.split(/\{\{([A-Z_0-9]+)\}\}/g)
  const result: Segment[] = []
  parts.forEach((part, idx) => {
    if (idx % 2 === 0) {
      // text chunk
      if (part.length > 0) result.push({ kind: 'text', text: part })
    } else {
      // potential blank id
      if (blankIds.has(part)) {
        result.push({ kind: 'blank', id: part })
      } else {
        // Unknown token — keep as literal text (defensive).
        result.push({ kind: 'text', text: `{{${part}}}` })
      }
    }
  })
  return result
}

export function FillInWidget({
  question,
  answer,
  onAnswer,
  disabled,
}: WidgetProps<FillQuestion, FillAnswer>) {
  const selections = answer?.selections ?? {}
  const blankIds = useMemo(
    () => new Set(question.blanks.map((b) => b.id)),
    [question.blanks],
  )
  const segments = useMemo(
    () => segmentize(question.codeTemplate, blankIds),
    [question.codeTemplate, blankIds],
  )

  const updateSelection = useCallback(
    (blankId: string, value: string) => {
      onAnswer({
        questionId: question.id,
        type: 'fill',
        selections: { ...selections, [blankId]: value },
      })
    },
    [onAnswer, question.id, selections],
  )

  return (
    <pre
      data-widget-type="fill"
      className="mx-auto w-full max-w-2xl overflow-x-auto rounded-xl bg-[var(--slate-2)] p-4 font-mono text-sm leading-relaxed text-[var(--text)] whitespace-pre-wrap"
    >
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return <span key={`t-${idx}`}>{seg.text}</span>
        }
        const blank = question.blanks.find((b) => b.id === seg.id)
        if (!blank) return null
        return (
          <select
            key={`b-${seg.id}`}
            disabled={disabled}
            aria-label={`Parameter auswählen für ${seg.id}`}
            value={selections[blank.id] ?? ''}
            onChange={(e) => updateSelection(blank.id, e.target.value)}
            className={cn(
              'mx-1 inline-block rounded border border-[var(--slate-6)] bg-[var(--slate-3)] px-2 py-0.5 font-mono text-sm text-[var(--text)]',
              'focus:border-[var(--border-accent)] focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <option value="">— wählen —</option>
            {blank.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        )
      })}
    </pre>
  )
}
