// apps/website/lib/assessment/scoring.ts
// Phase 24 — Deterministic, client-safe scoring module (D-01).
// Pure functions, no I/O, no randomness. Same (questions, answers) -> same result.

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

// ---------------------------------------------------------------------------
// Level thresholds — tuned for 10 questions x 3 maxPoints each = 30 total
// Plan 24-03 finalizes maxPoints distribution. Contiguity is unit-tested.
// ---------------------------------------------------------------------------

export const LEVEL_THRESHOLDS: Array<{
  min: number
  max: number
  level: Level
  slug: LevelSlug
  name: string
}> = [
  { min: 0, max: 5, level: 1, slug: 'neugieriger', name: 'Neugieriger' },
  { min: 6, max: 12, level: 2, slug: 'einsteiger', name: 'Einsteiger' },
  { min: 13, max: 19, level: 3, slug: 'fortgeschritten', name: 'Fortgeschritten' },
  { min: 20, max: 25, level: 4, slug: 'pro', name: 'Pro' },
  { min: 26, max: 30, level: 5, slug: 'expert', name: 'Expert' },
]

// ---------------------------------------------------------------------------
// Levenshtein over arrays of strings (for rank-widget scoring)
// ---------------------------------------------------------------------------

function levenshteinArr<T>(a: T[], b: T[]): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) return lo
  if (value > hi) return hi
  return value
}

// ---------------------------------------------------------------------------
// Per-question scoring — returns earned points, bounded by question.maxPoints
// ---------------------------------------------------------------------------

export function scoreQuestion(question: Question, answer: Answer | undefined): number {
  if (!answer) return 0

  switch (question.type) {
    case 'pick':
    case 'mc': {
      if (answer.type !== 'pick' && answer.type !== 'mc') return 0
      if (!answer.optionId) return 0
      const option = question.options.find((o) => o.id === answer.optionId)
      const earned = option?.points ?? 0
      return clamp(earned, 0, question.maxPoints)
    }

    case 'rank': {
      if (answer.type !== 'rank') return 0
      if (question.scoring === 'exact') {
        const eq =
          answer.order.length === question.correctOrder.length &&
          answer.order.every((id, i) => id === question.correctOrder[i])
        return eq ? question.maxPoints : 0
      }
      const distance = levenshteinArr(answer.order, question.correctOrder)
      return clamp(question.maxPoints - distance, 0, question.maxPoints)
    }

    case 'best-prompt': {
      if (answer.type !== 'best-prompt') return 0
      if (!answer.optionId) return 0
      const option = question.options.find((o) => o.id === answer.optionId)
      const earned = option?.points ?? 0
      return clamp(earned, 0, question.maxPoints)
    }

    case 'side-by-side': {
      if (answer.type !== 'side-by-side') return 0
      const choicePoints =
        answer.choice && answer.choice === question.correctChoice ? question.choicePoints : 0
      const reasonPoints = answer.reasonIds.reduce((acc, rid) => {
        const reason = question.reasons.find((r) => r.id === rid)
        return acc + (reason?.isCorrect ? question.reasonPointPerCorrect : 0)
      }, 0)
      return clamp(choicePoints + reasonPoints, 0, question.maxPoints)
    }

    case 'spot': {
      if (answer.type !== 'spot') return 0
      if (!answer.segmentId) return 0
      const segment = question.passageSegments.find((s) => s.id === answer.segmentId)
      return segment?.isCorrect ? question.maxPoints : 0
    }

    case 'match': {
      if (answer.type !== 'match') return 0
      const correctCount = Object.entries(answer.pairs).filter(
        ([taskId, toolId]) => question.correctPairs[taskId] === toolId,
      ).length
      return clamp(correctCount * question.pointPerCorrect, 0, question.maxPoints)
    }

    case 'confidence': {
      if (answer.type !== 'confidence') return 0
      if (answer.step === null) return 0
      const dist = Math.abs(answer.step - question.groundTruthStep)
      const dIdx = clamp(dist, 0, 4)
      const earned = question.pointByDistance[dIdx] ?? 0
      return clamp(earned, 0, question.maxPoints)
    }

    case 'fill': {
      if (answer.type !== 'fill') return 0
      const earned = question.blanks.reduce((acc, blank) => {
        const chosen = answer.selections[blank.id]
        const match = blank.options.find((o) => o.value === chosen)
        return acc + (match?.isCorrect ? blank.pointsIfCorrect : 0)
      }, 0)
      return clamp(earned, 0, question.maxPoints)
    }
  }
}

// ---------------------------------------------------------------------------
// Level lookup helpers
// ---------------------------------------------------------------------------

export function getLevelByPoints(points: number): {
  level: Level
  slug: LevelSlug
  name: string
} {
  const match = LEVEL_THRESHOLDS.find((t) => points >= t.min && points <= t.max)
  if (match) return { level: match.level, slug: match.slug, name: match.name }
  // Above highest max (content shift) -> cap at highest level.
  if (points > LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].max) {
    const top = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    return { level: top.level, slug: top.slug, name: top.name }
  }
  // Below 0 (defensive) -> lowest level.
  const bottom = LEVEL_THRESHOLDS[0]
  return { level: bottom.level, slug: bottom.slug, name: bottom.name }
}

// ---------------------------------------------------------------------------
// Top-level scorer
// ---------------------------------------------------------------------------

export function scoreAssessment(
  questions: Question[],
  answers: Record<string, Answer>,
): AssessmentResult {
  let totalPoints = 0
  let maxPoints = 0

  const dimEarned: Record<Dimension, number> = {
    tools: 0,
    prompting: 0,
    agents: 0,
    application: 0,
    literacy: 0,
  }
  const dimMax: Record<Dimension, number> = {
    tools: 0,
    prompting: 0,
    agents: 0,
    application: 0,
    literacy: 0,
  }

  for (const question of questions) {
    const ans = answers[question.id]
    const earned = scoreQuestion(question, ans)
    totalPoints += earned
    maxPoints += question.maxPoints
    dimEarned[question.dimension] += earned
    dimMax[question.dimension] += question.maxPoints
  }

  const skills: SkillScores = {
    tools: 0,
    prompting: 0,
    agents: 0,
    application: 0,
    literacy: 0,
  }
  for (const d of DIMENSIONS) {
    const max = dimMax[d]
    skills[d] = max === 0 ? 0 : Math.round((dimEarned[d] / max) * 100)
  }

  const { level, slug } = getLevelByPoints(totalPoints)

  return {
    totalPoints,
    maxPoints,
    level,
    slug,
    skills,
  }
}
