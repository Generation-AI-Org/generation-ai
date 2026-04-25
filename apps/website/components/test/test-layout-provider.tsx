'use client'

// apps/website/components/test/test-layout-provider.tsx
// Phase 24 — Client wrapper for the /test layout to host AssessmentProvider.
// Mounted by app/test/layout.tsx. Survives /test/aufgabe/[n] navigations.

import type { ReactNode } from 'react'
import { AssessmentProvider } from '@/lib/assessment/use-assessment'
import { loadQuestions } from '@/lib/assessment/load-questions'

// Load once at module level — questions.json is static.
const QUESTIONS = loadQuestions()

export function TestLayoutProvider({ children }: { children: ReactNode }) {
  return <AssessmentProvider questions={QUESTIONS}>{children}</AssessmentProvider>
}
