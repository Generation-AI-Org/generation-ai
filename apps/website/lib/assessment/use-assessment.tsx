'use client'

// apps/website/lib/assessment/use-assessment.tsx
// Client-only assessment state. Lives at /test layout level so answers survive
// /test/aufgabe/[n] navigations, then persists anonymous progress/result for
// the public conversion flow.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Answer, AssessmentResult, Question } from './types'
import { scoreAssessment } from './scoring'
import {
  clearStoredAssessment,
  readStoredAssessmentProgress,
  readStoredAssessmentResult,
  writeStoredAssessmentProgress,
  writeStoredAssessmentResult,
} from './storage'

interface State {
  questions: Question[]
  answers: Record<string, Answer>
  startedAt: number
  hydrated: boolean
  storedResult: AssessmentResult | null
}

type Action =
  | { type: 'ANSWER'; answer: Answer }
  | { type: 'HYDRATE'; answers: Record<string, Answer>; startedAt: number; storedResult: AssessmentResult | null }
  | { type: 'RESET' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.answer.questionId]: action.answer },
        storedResult: null,
      }
    case 'HYDRATE':
      return {
        ...state,
        answers: action.answers,
        startedAt: action.startedAt,
        hydrated: true,
        storedResult: action.storedResult,
      }
    case 'RESET':
      clearStoredAssessment()
      return {
        questions: state.questions,
        answers: {},
        startedAt: Date.now(),
        hydrated: true,
        storedResult: null,
      }
  }
}

function initState(questions: Question[]): State {
  return {
    questions,
    answers: {},
    startedAt: Date.now(),
    hydrated: false,
    storedResult: null,
  }
}

interface Ctx extends State {
  answerQuestion: (a: Answer) => void
  resetAssessment: () => void
  /** Computed only when every question has an answer. */
  result: AssessmentResult | null
  isComplete: boolean
  answeredCount: number
}

const AssessmentCtx = createContext<Ctx | null>(null)

export function AssessmentProvider({
  questions,
  children,
}: {
  questions: Question[]
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, questions, initState)
  const answeredCount = Object.keys(state.answers).length
  const answersComplete = answeredCount === questions.length
  const scoredResult = answersComplete
    ? scoreAssessment(state.questions, state.answers)
    : null
  const result = scoredResult ?? state.storedResult
  const isComplete = result !== null

  useEffect(() => {
    const progress = readStoredAssessmentProgress(questions)
    const storedResult = readStoredAssessmentResult()?.result ?? null
    dispatch({
      type: 'HYDRATE',
      answers: progress?.answers ?? {},
      startedAt: progress?.startedAt ?? Date.now(),
      storedResult,
    })
  }, [questions])

  useEffect(() => {
    if (!state.hydrated) return
    writeStoredAssessmentProgress(state.questions, state.answers, state.startedAt)
  }, [state.answers, state.hydrated, state.questions, state.startedAt])

  useEffect(() => {
    if (!state.hydrated || !scoredResult) return
    writeStoredAssessmentResult(scoredResult)
  }, [scoredResult, state.hydrated])

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      answerQuestion: (a: Answer) => dispatch({ type: 'ANSWER', answer: a }),
      resetAssessment: () => dispatch({ type: 'RESET' }),
      result,
      isComplete,
      answeredCount,
    }),
    [state, result, isComplete, answeredCount],
  )
  return <AssessmentCtx.Provider value={value}>{children}</AssessmentCtx.Provider>
}

export function useAssessment() {
  const ctx = useContext(AssessmentCtx)
  if (!ctx) throw new Error('useAssessment must be used inside <AssessmentProvider>')
  return ctx
}
