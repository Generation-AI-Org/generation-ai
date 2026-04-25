// apps/website/lib/assessment/load-questions.ts
// Phase 24 — Question loader (static import from JSON).
// Runtime shape is validated by the content integrity test (24-03-05).

import type { Question } from './types'
import questionsData from '@/content/assessment/questions.json'

export function loadQuestions(): Question[] {
  return questionsData as unknown as Question[]
}
