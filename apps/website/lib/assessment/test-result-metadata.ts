// apps/website/lib/assessment/test-result-metadata.ts
// Server-safe parser for carrying anonymous /test results into signup metadata.

import { z } from 'zod'
import type { Dimension, Level, LevelSlug, SkillScores } from './types'
import { DIMENSIONS } from './types'

const levelSlugSchema = z.enum([
  'neugieriger',
  'einsteiger',
  'fortgeschritten',
  'pro',
  'expert',
])

const levelBySlug: Record<LevelSlug, Level> = {
  neugieriger: 1,
  einsteiger: 2,
  fortgeschritten: 3,
  pro: 4,
  expert: 5,
}

const skillScoresSchema = z.object({
  tools: z.number().int().min(0).max(100),
  prompting: z.number().int().min(0).max(100),
  agents: z.number().int().min(0).max(100),
  application: z.number().int().min(0).max(100),
})

const storedResultSchema = z.object({
  version: z.literal(1),
  source: z.literal('test'),
  completedAt: z.string().max(64),
  result: z.object({
    totalPoints: z.number().min(0).max(100),
    maxPoints: z.number().min(1).max(100),
    level: z.number().int().min(1).max(5),
    slug: levelSlugSchema,
    skills: skillScoresSchema,
  }),
  skillsParam: z.string().max(200),
})

export interface TestResultMetadata {
  source: 'test'
  completed_at: string | null
  level: Level
  slug: LevelSlug
  skills: SkillScores
  total_points: number | null
  max_points: number | null
}

function parseSkillsParam(value: string | undefined): SkillScores | null {
  if (!value) return null
  const entries = value.split(',').map((part) => part.split(':'))
  const map = new Map<Dimension, number>()
  for (const [rawDimension, rawScore] of entries) {
    if (!DIMENSIONS.includes(rawDimension as Dimension)) return null
    const score = Number(rawScore)
    if (!Number.isInteger(score) || score < 0 || score > 100) return null
    map.set(rawDimension as Dimension, score)
  }
  if (!DIMENSIONS.every((dimension) => map.has(dimension))) return null
  return {
    tools: map.get('tools')!,
    prompting: map.get('prompting')!,
    agents: map.get('agents')!,
    application: map.get('application')!,
  }
}

export function parseTestResultMetadata(input: {
  source?: string
  pre?: string
  skills?: string
  testResult?: string
}): TestResultMetadata | null {
  if (input.testResult) {
    try {
      const parsedJson = JSON.parse(input.testResult) as unknown
      const parsed = storedResultSchema.safeParse(parsedJson)
      if (!parsed.success) return null
      const { result, completedAt } = parsed.data
      if (result.level !== levelBySlug[result.slug]) return null
      return {
        source: 'test',
        completed_at: completedAt,
        level: result.level as Level,
        slug: result.slug,
        skills: result.skills,
        total_points: result.totalPoints,
        max_points: result.maxPoints,
      }
    } catch {
      return null
    }
  }

  if (input.source !== 'test') return null
  const slug = levelSlugSchema.safeParse(input.pre)
  if (!slug.success) return null
  const skills = parseSkillsParam(input.skills)
  if (!skills) return null

  return {
    source: 'test',
    completed_at: null,
    level: levelBySlug[slug.data],
    slug: slug.data,
    skills,
    total_points: null,
    max_points: null,
  }
}
