// apps/website/lib/assessment/storage.ts
// Browser-side persistence contract for the public /test conversion flow.

import type {
  Answer,
  AssessmentResult,
  Dimension,
  Level,
  LevelSlug,
  Question,
  SkillScores,
} from './types'
import { DIMENSIONS } from './types'

export const ASSESSMENT_PROGRESS_STORAGE_KEY = 'genai:assessment:progress:v1'
export const ASSESSMENT_RESULT_STORAGE_KEY = 'genai:assessment:result:v1'

export interface StoredAssessmentProgress {
  version: 1
  startedAt: number
  questionIds: string[]
  answers: Record<string, Answer>
}

export interface StoredAssessmentResult {
  version: 1
  source: 'test'
  completedAt: string
  result: AssessmentResult
  skillsParam: string
}

const LEVEL_BY_SLUG: Record<LevelSlug, Level> = {
  neugieriger: 1,
  einsteiger: 2,
  fortgeschritten: 3,
  pro: 4,
  expert: 5,
}

const SLUGS = new Set<LevelSlug>([
  'neugieriger',
  'einsteiger',
  'fortgeschritten',
  'pro',
  'expert',
])

function isLevelSlug(value: unknown): value is LevelSlug {
  return typeof value === 'string' && SLUGS.has(value as LevelSlug)
}

function isSkillScores(value: unknown): value is SkillScores {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return DIMENSIONS.every((dimension) => {
    const score = candidate[dimension]
    return (
      typeof score === 'number' &&
      Number.isFinite(score) &&
      score >= 0 &&
      score <= 100
    )
  })
}

function isAssessmentResult(value: unknown): value is AssessmentResult {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AssessmentResult>
  if (!isLevelSlug(candidate.slug)) return false
  if (candidate.level !== LEVEL_BY_SLUG[candidate.slug]) return false
  if (typeof candidate.totalPoints !== 'number') return false
  if (typeof candidate.maxPoints !== 'number') return false
  return isSkillScores(candidate.skills)
}

export function buildSkillsParam(skills: Record<Dimension, number>): string {
  return DIMENSIONS.map((dimension) => `${dimension}:${skills[dimension]}`).join(',')
}

export function createStoredAssessmentResult(
  result: AssessmentResult,
  completedAt = new Date().toISOString(),
): StoredAssessmentResult {
  return {
    version: 1,
    source: 'test',
    completedAt,
    result,
    skillsParam: buildSkillsParam(result.skills),
  }
}

export function readStoredAssessmentResult(): StoredAssessmentResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ASSESSMENT_RESULT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredAssessmentResult>
    if (
      parsed.version !== 1 ||
      parsed.source !== 'test' ||
      typeof parsed.completedAt !== 'string' ||
      typeof parsed.skillsParam !== 'string' ||
      !isAssessmentResult(parsed.result)
    ) {
      return null
    }
    return parsed as StoredAssessmentResult
  } catch {
    return null
  }
}

export function writeStoredAssessmentResult(result: AssessmentResult): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      ASSESSMENT_RESULT_STORAGE_KEY,
      JSON.stringify(createStoredAssessmentResult(result)),
    )
  } catch {
    // Private mode / quota errors should never block the result page.
  }
}

function isAnswerForQuestion(question: Question, answer: unknown): answer is Answer {
  if (!answer || typeof answer !== 'object') return false
  const candidate = answer as Partial<Answer>
  if (candidate.questionId !== question.id) return false
  if (question.type === 'pick' || question.type === 'mc') {
    return candidate.type === 'pick' || candidate.type === 'mc'
  }
  return candidate.type === question.type
}

export function readStoredAssessmentProgress(
  questions: Question[],
): StoredAssessmentProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(ASSESSMENT_PROGRESS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredAssessmentProgress>
    if (
      parsed.version !== 1 ||
      typeof parsed.startedAt !== 'number' ||
      !Array.isArray(parsed.questionIds) ||
      !parsed.answers ||
      typeof parsed.answers !== 'object'
    ) {
      return null
    }

    const currentQuestionIds = questions.map((question) => question.id)
    if (parsed.questionIds.join('|') !== currentQuestionIds.join('|')) {
      return null
    }

    const answers: Record<string, Answer> = {}
    for (const question of questions) {
      const answer = parsed.answers[question.id]
      if (isAnswerForQuestion(question, answer)) {
        answers[question.id] = answer
      }
    }

    return {
      version: 1,
      startedAt: parsed.startedAt,
      questionIds: currentQuestionIds,
      answers,
    }
  } catch {
    return null
  }
}

export function writeStoredAssessmentProgress(
  questions: Question[],
  answers: Record<string, Answer>,
  startedAt: number,
): void {
  if (typeof window === 'undefined') return
  try {
    const payload: StoredAssessmentProgress = {
      version: 1,
      startedAt,
      questionIds: questions.map((question) => question.id),
      answers,
    }
    window.sessionStorage.setItem(
      ASSESSMENT_PROGRESS_STORAGE_KEY,
      JSON.stringify(payload),
    )
  } catch {
    // Persistence is a conversion aid, not a hard dependency.
  }
}

export function clearStoredAssessment(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(ASSESSMENT_PROGRESS_STORAGE_KEY)
    window.localStorage.removeItem(ASSESSMENT_RESULT_STORAGE_KEY)
  } catch {
    // noop
  }
}
