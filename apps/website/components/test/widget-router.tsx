'use client'

// apps/website/components/test/widget-router.tsx
// Phase 24 — Dispatches Question to the correct widget component by type.
// Also exports isAnswerReady for "Nächste Aufgabe" gating.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardPickWidget } from './widgets/card-pick-widget'
import { MCWidget } from './widgets/mc-widget'
import { DragRankWidget } from './widgets/drag-rank-widget'
import { PromptBestPickWidget } from './widgets/prompt-best-pick-widget'
import { SideBySideWidget } from './widgets/side-by-side-widget'
import { FehlerspotWidget } from './widgets/fehlerspot-widget'
import { MatchingWidget } from './widgets/matching-widget'
import { ConfidenceSliderWidget } from './widgets/confidence-slider-widget'
import { FillInWidget } from './widgets/fill-in-widget'
import type { Answer, Question } from '@/lib/assessment/types'

export interface WidgetRouterProps {
  question: Question
  answer: Answer | undefined
  onAnswer: (a: Answer) => void
  disabled?: boolean
  /** For best-prompt questions: pre-rendered shiki HTML per option id. */
  highlightedCode?: Record<string, string>
}

export function WidgetRouter(props: WidgetRouterProps) {
  const { question, answer, onAnswer, disabled } = props
  const shared = { answer: answer as any, onAnswer: onAnswer as any, disabled }
  switch (question.type) {
    case 'pick':
      return <CardPickWidget question={question} {...(shared as any)} />
    case 'mc':
      return <MCWidget question={question} {...(shared as any)} />
    case 'rank':
      return <DragRankWidget question={question} {...(shared as any)} />
    case 'best-prompt':
      return (
        <PromptBestPickWidget
          question={question}
          highlightedCode={props.highlightedCode ?? {}}
          {...(shared as any)}
        />
      )
    case 'side-by-side':
      return <SideBySideWidget question={question} {...(shared as any)} />
    case 'spot':
      return <FehlerspotWidget question={question} {...(shared as any)} />
    case 'match':
      return <MatchingWidget question={question} {...(shared as any)} />
    case 'confidence':
      return <ConfidenceSliderWidget question={question} {...(shared as any)} />
    case 'fill':
      return <FillInWidget question={question} {...(shared as any)} />
  }
}

/**
 * Does the current answer satisfy the widget's "ready to advance" contract?
 * Gates the Nächste-Aufgabe button.
 */
export function isAnswerReady(question: Question, answer: Answer | undefined): boolean {
  // WR-06: confidence no longer gets a free pass. User must interact for the
  // answer to be considered ready.
  if (!answer) return false
  switch (question.type) {
    case 'pick':
    case 'mc':
    case 'best-prompt':
      return (answer as any).optionId != null
    case 'rank':
      return (
        Array.isArray((answer as any).order) &&
        (answer as any).order.length === question.items.length
      )
    case 'side-by-side':
      return (answer as any).choice != null
    case 'spot':
      return (answer as any).segmentId != null
    case 'match':
      return Object.keys((answer as any).pairs ?? {}).length === question.tasks.length
    case 'confidence':
      return (answer as any).step != null
    case 'fill':
      return question.blanks.every(
        (b) => (answer as any).selections?.[b.id] != null,
      )
  }
}
