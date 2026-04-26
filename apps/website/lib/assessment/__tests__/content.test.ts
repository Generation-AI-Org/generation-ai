// apps/website/lib/assessment/__tests__/content.test.ts
// Phase 24 — Assessment content integrity tests.
// Verifies questions.json + community-index.json meet the phase contracts.

import { describe, it, expect } from 'vitest'
import type { LevelSlug } from '../types'
import { loadQuestions } from '../load-questions'
import { loadRecommendations, type CommunityRec } from '../load-community'
import communityData from '@/content/assessment/community-index.json'

const ALL_LEVELS: LevelSlug[] = [
  'neugieriger',
  'einsteiger',
  'fortgeschritten',
  'pro',
  'expert',
]

describe('Assessment content', () => {
  it('questions.json has exactly 10 items', () => {
    const qs = loadQuestions()
    expect(qs).toHaveLength(10)
  })

  it('questions cover the four 22.8 launch widget types', () => {
    const qs = loadQuestions()
    const types = new Set(qs.map((q) => q.type))
    expect(types).toEqual(new Set(['mc', 'rank', 'match', 'confidence']))
  })

  it('every 22.8 spider-chart dimension appears in 2-3 questions', () => {
    const qs = loadQuestions()
    const counts: Record<string, number> = {}
    for (const q of qs) {
      counts[q.dimension] = (counts[q.dimension] ?? 0) + 1
    }
    expect(Object.keys(counts).sort()).toEqual(['agents', 'application', 'prompting', 'tools'])
    for (const dim of ['tools', 'prompting', 'agents', 'application']) {
      expect(counts[dim]).toBeGreaterThanOrEqual(2)
      expect(counts[dim]).toBeLessThanOrEqual(3)
    }
  })

  it('total maxPoints sums to 30', () => {
    const qs = loadQuestions()
    const total = qs.reduce((s, q) => s + q.maxPoints, 0)
    expect(total).toBe(30)
  })

  it('community-index has 10-20 entries', () => {
    const all = communityData as CommunityRec[]
    expect(all.length).toBeGreaterThanOrEqual(10)
    expect(all.length).toBeLessThanOrEqual(20)
  })

  it('every level has at least 3 recommendations', () => {
    const all = communityData as CommunityRec[]
    for (const level of ALL_LEVELS) {
      const matches = all.filter((r) => r.levels.includes(level))
      expect(matches.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('loadRecommendations filters by level and respects limit', () => {
    // Use a level we know has ≥3 recs from the previous invariant.
    const recs = loadRecommendations('fortgeschritten', 3)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.length).toBeLessThanOrEqual(3)
    for (const r of recs) {
      expect(r.levels).toContain('fortgeschritten')
    }
  })
})
