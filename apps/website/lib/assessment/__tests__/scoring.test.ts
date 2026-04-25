// apps/website/lib/assessment/__tests__/scoring.test.ts
// Phase 24 — scoreAssessment() determinism + level-band fixtures.

import { describe, it, expect } from 'vitest'
import {
  scoreAssessment,
  scoreQuestion,
  LEVEL_THRESHOLDS,
} from '../scoring'
import type { RankQuestion, RankAnswer } from '../types'
import {
  FIXTURE_QUESTIONS,
  FIXTURE_ANSWERS_LOW,
  FIXTURE_ANSWERS_MID,
  FIXTURE_ANSWERS_HIGH,
} from './fixtures'

describe('scoreAssessment', () => {
  it('is deterministic: same input yields exact same output (ran twice)', () => {
    // Deep-freeze to prove no mutation happens during scoring.
    Object.freeze(FIXTURE_QUESTIONS)
    Object.freeze(FIXTURE_ANSWERS_MID)
    const r1 = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_MID)
    const r2 = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_MID)
    expect(r1).toEqual(r2)
  })

  it('low-score fixture lands in level 1 (neugieriger)', () => {
    const r = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_LOW)
    expect(r.totalPoints).toBeLessThanOrEqual(5)
    expect(r.level).toBe(1)
    expect(r.slug).toBe('neugieriger')
  })

  it('mid-score fixture lands in level 3 (fortgeschritten)', () => {
    const r = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_MID)
    expect(r.totalPoints).toBeGreaterThanOrEqual(13)
    expect(r.totalPoints).toBeLessThanOrEqual(19)
    expect(r.level).toBe(3)
    expect(r.slug).toBe('fortgeschritten')
  })

  it('high-score fixture lands in level 5 (expert)', () => {
    const r = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_HIGH)
    expect(r.totalPoints).toBeGreaterThanOrEqual(26)
    expect(r.level).toBe(5)
    expect(r.slug).toBe('expert')
  })

  it('skill scores are per-dimension percentages 0-100', () => {
    const r = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_MID)
    for (const d of ['tools', 'prompting', 'agents', 'application', 'literacy'] as const) {
      expect(Number.isInteger(r.skills[d])).toBe(true)
      expect(r.skills[d]).toBeGreaterThanOrEqual(0)
      expect(r.skills[d]).toBeLessThanOrEqual(100)
    }
  })

  it('levenshtein scoring: 0 distance = maxPoints, 1 distance = maxPoints-1', () => {
    const q: RankQuestion = {
      id: 'rq',
      dimension: 'prompting',
      prompt: 'rank',
      maxPoints: 4,
      type: 'rank',
      scoring: 'levenshtein',
      items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
      ],
      correctOrder: ['a', 'b', 'c', 'd'],
    }
    const perfect: RankAnswer = {
      questionId: 'rq',
      type: 'rank',
      order: ['a', 'b', 'c', 'd'],
    }
    // One adjacent swap 'a' <-> 'b' = Levenshtein distance 2
    // (delete a at pos 0, insert a at pos 1). So for a 1-diff test use distance-2 check.
    // To get actual distance 1: replace last element.
    const dist1: RankAnswer = {
      questionId: 'rq',
      type: 'rank',
      order: ['a', 'b', 'c', 'x'],
    }
    expect(scoreQuestion(q, perfect)).toBe(4)
    expect(scoreQuestion(q, dist1)).toBe(3)
  })

  it('LEVEL_THRESHOLDS are contiguous with no gaps', () => {
    for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
      expect(LEVEL_THRESHOLDS[i].max + 1).toBe(LEVEL_THRESHOLDS[i + 1].min)
    }
  })
})
