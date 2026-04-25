// apps/website/components/test/widgets/widget-types.ts
// Phase 24 — Shared widget props contract.
// Every widget is controlled: parent owns the Answer state, widget lifts via onAnswer.

import type { Answer, Question } from '@/lib/assessment/types'

export interface WidgetProps<Q extends Question, A extends Answer> {
  question: Q
  answer: A | undefined
  onAnswer: (answer: A) => void
  /** true once user confirms via "Nächste Aufgabe" and the question is transitioning out */
  disabled?: boolean
}
