'use client'

// apps/website/components/test/widgets/prompt-best-pick-widget.tsx
// Phase 24 — W3 PromptBestPickWidget: 4-card grid of shiki-highlighted code options.
// The server wrapper (Plan 24-07) runs shiki and hands in `highlightedCode: Record<id, html>`.

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  BestPromptAnswer,
  BestPromptQuestion,
} from '@/lib/assessment/types'
import type { WidgetProps } from './widget-types'

export interface PromptBestPickWidgetProps
  extends WidgetProps<BestPromptQuestion, BestPromptAnswer> {
  /** Pre-rendered (server-side) shiki HTML per option id. */
  highlightedCode: Record<string, string>
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function fallbackPre(code: string): string {
  return `<pre><code>${escapeHtml(code)}</code></pre>`
}

export function PromptBestPickWidget({
  question,
  answer,
  onAnswer,
  disabled,
  highlightedCode,
}: PromptBestPickWidgetProps) {
  const selected = answer?.optionId ?? null

  return (
    <div
      role="radiogroup"
      aria-label={question.prompt}
      data-widget-type="best-prompt"
      className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {question.options.map((opt) => {
        const isSelected = selected === opt.id
        const html = highlightedCode[opt.id] ?? fallbackPre(opt.code)
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() =>
              onAnswer({
                questionId: question.id,
                type: 'best-prompt',
                optionId: opt.id,
              })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onAnswer({
                  questionId: question.id,
                  type: 'best-prompt',
                  optionId: opt.id,
                })
              }
            }}
            className={cn(
              'relative rounded-2xl border p-3 text-left transition-all duration-150',
              'bg-[var(--bg-card)]',
              'hover:border-[var(--slate-7)] hover:bg-[var(--bg-elevated)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
              isSelected
                ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
                : 'border-[var(--border)]',
            )}
          >
            {isSelected && (
              <Check
                className="absolute top-3 right-3 h-4 w-4 text-[var(--accent)]"
                aria-hidden
              />
            )}
            <div
              className="shiki-wrapper max-h-48 overflow-x-auto rounded-lg bg-[var(--slate-2)] p-3 font-mono text-sm"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </button>
        )
      })}
    </div>
  )
}
