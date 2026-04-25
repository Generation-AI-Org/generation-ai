'use client'

// apps/website/components/test/widget-router.tsx
// Phase 24 — Dispatches Question to the correct widget component by type.
// Also exports isAnswerReady for "Nächste Aufgabe" gating.

import { CardPickWidget } from './widgets/card-pick-widget'
import { MCWidget } from './widgets/mc-widget'
import { DragRankWidget } from './widgets/drag-rank-widget'
import { PromptBestPickWidget } from './widgets/prompt-best-pick-widget'
import { SideBySideWidget } from './widgets/side-by-side-widget'
import { FehlerspotWidget } from './widgets/fehlerspot-widget'
import { MatchingWidget } from './widgets/matching-widget'
import { ConfidenceSliderWidget } from './widgets/confidence-slider-widget'
import { FillInWidget } from './widgets/fill-in-widget'
import type {
  Answer,
  BestPromptAnswer,
  ConfidenceAnswer,
  FillAnswer,
  MatchAnswer,
  PickAnswer,
  Question,
  RankAnswer,
  SideBySideAnswer,
  SpotAnswer,
} from '@/lib/assessment/types'

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
  // Discriminated-union narrowing via `question.type`. Each branch asserts the
  // matching Answer variant by construction — Answer is keyed by the same
  // `type` discriminator, so the answer can only be the matching variant when
  // it exists for a given question. onAnswer is widened to the full Answer
  // union on the outside but each widget emits its variant, which satisfies it.
  switch (question.type) {
    case 'pick':
      return (
        <CardPickWidget
          question={question}
          answer={answer as PickAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'mc':
      return (
        <MCWidget
          question={question}
          answer={answer as PickAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'rank':
      return (
        <DragRankWidget
          question={question}
          answer={answer as RankAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'best-prompt':
      return (
        <PromptBestPickWidget
          question={question}
          answer={answer as BestPromptAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
          highlightedCode={props.highlightedCode ?? {}}
        />
      )
    case 'side-by-side':
      return (
        <SideBySideWidget
          question={question}
          answer={answer as SideBySideAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'spot':
      return (
        <FehlerspotWidget
          question={question}
          answer={answer as SpotAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'match':
      return (
        <MatchingWidget
          question={question}
          answer={answer as MatchAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'confidence':
      return (
        <ConfidenceSliderWidget
          question={question}
          answer={answer as ConfidenceAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    case 'fill':
      return (
        <FillInWidget
          question={question}
          answer={answer as FillAnswer | undefined}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )
    default: {
      // Exhaustiveness check — if a new question type is added without a case,
      // TypeScript will flag the right-hand side as non-never at compile time.
      const _exhaustive: never = question
      void _exhaustive
      return null
    }
  }
}

/**
 * Does the current answer satisfy the widget's "ready to advance" contract?
 * Gates the Nächste-Aufgabe button.
 *
 * WR-06: confidence no longer gets a free pass — user must interact first.
 */
export function isAnswerReady(question: Question, answer: Answer | undefined): boolean {
  if (!answer) return false
  // Both discriminants must match — guards against stale answers from a prior
  // question type leaking into readiness checks.
  if (answer.type !== question.type) return false
  switch (question.type) {
    case 'pick':
    case 'mc':
      return (answer as PickAnswer).optionId != null
    case 'best-prompt':
      return (answer as BestPromptAnswer).optionId != null
    case 'rank': {
      const a = answer as RankAnswer
      return Array.isArray(a.order) && a.order.length === question.items.length && a.confirmed === true
    }
    case 'side-by-side':
      return (answer as SideBySideAnswer).choice != null
    case 'spot':
      return (answer as SpotAnswer).segmentId != null
    case 'match': {
      const a = answer as MatchAnswer
      return Object.keys(a.pairs ?? {}).length === question.tasks.length
    }
    case 'confidence':
      return (answer as ConfidenceAnswer).step != null
    case 'fill': {
      const a = answer as FillAnswer
      return question.blanks.every((b) => a.selections?.[b.id] != null)
    }
    default: {
      const _exhaustive: never = question
      void _exhaustive
      return false
    }
  }
}
