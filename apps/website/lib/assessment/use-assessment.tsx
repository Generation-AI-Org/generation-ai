'use client'

// apps/website/lib/assessment/use-assessment.tsx
// Phase 24 — Client-only assessment state (D-05: no persistence, no Supabase).
// Lives at /test layout level so answers survive /test/aufgabe/[n] navigations.

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { Answer, AssessmentResult, Question } from './types'
import { scoreAssessment } from './scoring'

interface State {
  questions: Question[]
  answers: Record<string, Answer>
  startedAt: number
}

type Action = { type: 'ANSWER'; answer: Answer } | { type: 'RESET' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.answer.questionId]: action.answer },
      }
    case 'RESET':
      return { questions: state.questions, answers: {}, startedAt: Date.now() }
  }
}

interface Ctx extends State {
  answerQuestion: (a: Answer) => void
  resetAssessment: () => void
  /** Computed only when every question has an answer. */
  result: AssessmentResult | null
  isComplete: boolean
}

const AssessmentCtx = createContext<Ctx | null>(null)

export function AssessmentProvider({
  questions,
  children,
}: {
  questions: Question[]
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, {
    questions,
    answers: {},
    startedAt: Date.now(),
  })
  const answeredCount = Object.keys(state.answers).length
  const isComplete = answeredCount === questions.length
  const result = isComplete ? scoreAssessment(state.questions, state.answers) : null
  const value = useMemo<Ctx>(
    () => ({
      ...state,
      answerQuestion: (a: Answer) => dispatch({ type: 'ANSWER', answer: a }),
      resetAssessment: () => dispatch({ type: 'RESET' }),
      result,
      isComplete,
    }),
    [state, result, isComplete],
  )
  return <AssessmentCtx.Provider value={value}>{children}</AssessmentCtx.Provider>
}

export function useAssessment() {
  const ctx = useContext(AssessmentCtx)
  if (!ctx) throw new Error('useAssessment must be used inside <AssessmentProvider>')
  return ctx
}
