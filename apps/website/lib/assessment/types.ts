// apps/website/lib/assessment/types.ts
// Phase 24 — Assessment type system.
// Discriminated-union shapes for all 9 widget question/answer variants.
// No runtime code — types + interfaces + a single readonly constant.

export type Dimension = 'tools' | 'prompting' | 'agents' | 'application' | 'literacy'

export type Level = 1 | 2 | 3 | 4 | 5

export type LevelSlug = 'neugieriger' | 'einsteiger' | 'fortgeschritten' | 'pro' | 'expert'

export type WidgetType =
  | 'pick'
  | 'mc'
  | 'rank'
  | 'best-prompt'
  | 'side-by-side'
  | 'spot'
  | 'match'
  | 'confidence'
  | 'fill'

export const DIMENSIONS: readonly Dimension[] = [
  'tools',
  'prompting',
  'agents',
  'application',
  'literacy',
] as const

// ---------------------------------------------------------------------------
// Question shapes (discriminated union on `type`)
// ---------------------------------------------------------------------------

export interface BaseQuestion {
  id: string
  dimension: Dimension
  prompt: string
  helpText?: string
  maxPoints: number
}

export interface PickQuestion extends BaseQuestion {
  type: 'pick' | 'mc'
  options: Array<{ id: string; label: string; points: number }>
}

export interface RankQuestion extends BaseQuestion {
  type: 'rank'
  items: Array<{ id: string; label: string }>
  correctOrder: string[]
  scoring: 'levenshtein' | 'exact'
}

export interface BestPromptQuestion extends BaseQuestion {
  type: 'best-prompt'
  options: Array<{ id: string; code: string; language: string; points: number }>
}

export interface SideBySideQuestion extends BaseQuestion {
  type: 'side-by-side'
  outputs: { a: string; b: string }
  correctChoice: 'a' | 'b'
  reasons: Array<{ id: string; label: string; isCorrect: boolean }>
  choicePoints: number
  reasonPointPerCorrect: number
}

export interface SpotQuestion extends BaseQuestion {
  type: 'spot'
  passageSegments: Array<{ id: string; text: string; isCorrect: boolean }>
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match'
  tasks: Array<{ id: string; label: string }>
  tools: Array<{ id: string; label: string }>
  correctPairs: Record<string, string>
  pointPerCorrect: number
}

export interface ConfidenceQuestion extends BaseQuestion {
  type: 'confidence'
  outputText: string
  groundTruthStep: 0 | 1 | 2 | 3 | 4
  pointByDistance: [number, number, number, number, number]
}

export interface FillQuestion extends BaseQuestion {
  type: 'fill'
  codeTemplate: string
  blanks: Array<{
    id: string
    options: Array<{ value: string; isCorrect: boolean }>
    pointsIfCorrect: number
  }>
}

export type Question =
  | PickQuestion
  | RankQuestion
  | BestPromptQuestion
  | SideBySideQuestion
  | SpotQuestion
  | MatchQuestion
  | ConfidenceQuestion
  | FillQuestion

// ---------------------------------------------------------------------------
// Answer shapes (discriminated union, one variant per Question type)
// ---------------------------------------------------------------------------

export interface PickAnswer {
  questionId: string
  type: 'pick' | 'mc'
  optionId: string | null
}

export interface RankAnswer {
  questionId: string
  type: 'rank'
  order: string[]
}

export interface BestPromptAnswer {
  questionId: string
  type: 'best-prompt'
  optionId: string | null
}

export interface SideBySideAnswer {
  questionId: string
  type: 'side-by-side'
  choice: 'a' | 'b' | null
  reasonIds: string[]
}

export interface SpotAnswer {
  questionId: string
  type: 'spot'
  segmentId: string | null
}

export interface MatchAnswer {
  questionId: string
  type: 'match'
  pairs: Record<string, string>
}

export interface ConfidenceAnswer {
  questionId: string
  type: 'confidence'
  step: 0 | 1 | 2 | 3 | 4 | null
}

export interface FillAnswer {
  questionId: string
  type: 'fill'
  selections: Record<string, string>
}

export type Answer =
  | PickAnswer
  | RankAnswer
  | BestPromptAnswer
  | SideBySideAnswer
  | SpotAnswer
  | MatchAnswer
  | ConfidenceAnswer
  | FillAnswer

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

export interface SkillScores {
  tools: number
  prompting: number
  agents: number
  application: number
  literacy: number
}

export interface AssessmentResult {
  totalPoints: number
  maxPoints: number
  level: Level
  slug: LevelSlug
  skills: SkillScores
}
