'use client'

// apps/website/components/test/aufgabe-client.tsx
// Phase 24 — Client shell for /test/aufgabe/[n].
// AssessmentProvider lives in the /test layout (TestLayoutProvider) so answers
// survive navigations inside the layout segment. This file only handles
// MotionConfig nonce + transition UI + routing.

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { useAssessment } from '@/lib/assessment/use-assessment'
import { AufgabeLayout } from '@/components/test/aufgabe-layout'
import { WidgetRouter, isAnswerReady } from '@/components/test/widget-router'
import { CheckpointCelebration } from '@/components/test/checkpoint-celebration'
import type { Question } from '@/lib/assessment/types'

export interface AufgabeClientProps {
  nonce: string
  questions: Question[]
  currentIndex: number
  /** Pre-rendered shiki HTML, keyed by question id then option id. */
  highlightedCode: Record<string, Record<string, string>>
}

export function AufgabeClient(props: AufgabeClientProps) {
  return (
    <MotionConfig nonce={props.nonce}>
      <AufgabeInner {...props} />
    </MotionConfig>
  )
}

function AufgabeInner({ questions, currentIndex, highlightedCode }: AufgabeClientProps) {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const { answers, answerQuestion } = useAssessment()
  const [showCheckpoint, setShowCheckpoint] = useState(false)

  const question = questions[currentIndex]
  const answer = answers[question.id]
  const ready = isAnswerReady(question, answer)

  // URL-state guard (CONTEXT D-11): if user deep-links into aufgabe/3 without
  // having answered 1-2, redirect to /test. Run once on mount / index change.
  useEffect(() => {
    for (let i = 0; i < currentIndex; i++) {
      const prev = questions[i]
      if (!answers[prev.id]) {
        router.replace('/test')
        return
      }
    }
    // Only run when index changes — not on every answer update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  const handleNext = useCallback(() => {
    const isLast = currentIndex === questions.length - 1
    const willCrossCheckpoint = currentIndex === 4 && !isLast
    if (willCrossCheckpoint) {
      setShowCheckpoint(true)
      setTimeout(() => {
        setShowCheckpoint(false)
        router.push(`/test/aufgabe/${currentIndex + 2}`)
      }, 1500)
      return
    }
    if (isLast) {
      router.push('/test/ergebnis')
      return
    }
    router.push(`/test/aufgabe/${currentIndex + 2}`)
  }, [currentIndex, questions.length, router])

  return (
    <AufgabeLayout
      questionIndex={currentIndex}
      totalQuestions={questions.length}
      onNext={handleNext}
      nextDisabled={!ready}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.3, ease: 'easeOut' }}
          className="flex w-full flex-col gap-6"
        >
          <h2
            tabIndex={-1}
            className="mx-auto max-w-2xl px-4 text-xl font-semibold text-[var(--text)] sm:text-2xl"
          >
            {question.prompt}
          </h2>
          {question.helpText && (
            <p className="mx-auto max-w-2xl px-4 text-sm text-[var(--text-muted)]">
              {question.helpText}
            </p>
          )}
          <WidgetRouter
            question={question}
            answer={answer}
            onAnswer={answerQuestion}
            highlightedCode={highlightedCode[question.id]}
          />
        </motion.div>
      </AnimatePresence>
      {showCheckpoint && (
        <CheckpointCelebration onDismiss={() => setShowCheckpoint(false)} />
      )}
    </AufgabeLayout>
  )
}
