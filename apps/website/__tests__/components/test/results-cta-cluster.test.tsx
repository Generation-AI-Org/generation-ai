import { describe, it, expect } from 'vitest'
import { buildJoinHref } from '@/components/test/results-cta-cluster'
import type { LevelSlug } from '@/lib/assessment/types'

const ALL_SLUGS: LevelSlug[] = [
  'neugieriger',
  'einsteiger',
  'fortgeschritten',
  'pro',
  'expert',
]

describe('buildJoinHref', () => {
  it('encodes slug, source=test, and skills in the correct order', () => {
    const href = buildJoinHref('fortgeschritten', {
      tools: 80,
      prompting: 60,
      agents: 40,
      application: 70,
    })
    expect(href).toContain('pre=fortgeschritten')
    expect(href).toContain('source=test')
    // URLSearchParams percent-encodes `:` and `,` inside values.
    expect(href).toContain('tools%3A80')
    expect(href).toContain('prompting%3A60')
    expect(href).toMatch(/^\/join\?/)
  })

  it('produces a href starting with /join? for every LevelSlug', () => {
    for (const slug of ALL_SLUGS) {
      const href = buildJoinHref(slug, {
        tools: 10,
        prompting: 10,
        agents: 10,
        application: 10,
      })
      expect(href.startsWith('/join?')).toBe(true)
      expect(href).toContain(`pre=${slug}`)
    }
  })

  it('keeps skills in canonical dimension order (tools, prompting, agents, application)', () => {
    const href = buildJoinHref('pro', {
      tools: 1,
      prompting: 2,
      agents: 3,
      application: 4,
    })
    // The `skills=` param, decoded, should be exactly:
    //   tools:1,prompting:2,agents:3,application:4
    const url = new URL(`http://example.com${href}`)
    const skills = url.searchParams.get('skills')
    expect(skills).toBe('tools:1,prompting:2,agents:3,application:4')
  })

  it('buildJoinHref is a pure function — same input yields same output', () => {
    const a = buildJoinHref('expert', {
      tools: 99,
      prompting: 88,
      agents: 77,
      application: 66,
    })
    const b = buildJoinHref('expert', {
      tools: 99,
      prompting: 88,
      agents: 77,
      application: 66,
    })
    expect(a).toBe(b)
  })
})
