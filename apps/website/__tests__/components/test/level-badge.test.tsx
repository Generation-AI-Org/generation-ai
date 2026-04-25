import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LevelBadge } from '@/components/test/level-badge'
import type { LevelSlug } from '@/lib/assessment/types'

const CASES: Array<{ slug: LevelSlug; level: number; name: string }> = [
  { slug: 'neugieriger', level: 1, name: 'Neugieriger' },
  { slug: 'einsteiger', level: 2, name: 'Einsteiger' },
  { slug: 'fortgeschritten', level: 3, name: 'Fortgeschritten' },
  { slug: 'pro', level: 4, name: 'Pro' },
  { slug: 'expert', level: 5, name: 'Expert' },
]

describe('LevelBadge', () => {
  it.each(CASES)('renders level and name for slug=$slug', ({ slug, level, name }) => {
    const { container } = render(<LevelBadge slug={slug} />)
    expect(container.textContent).toContain(String(level))
    expect(container.textContent).toContain(name)
  })

  it('aria-label includes level and name', () => {
    render(<LevelBadge slug="fortgeschritten" />)
    const el = screen.getByLabelText(/Level 3: Fortgeschritten/)
    expect(el).toBeInTheDocument()
  })

  it('renders a headline with the level name', () => {
    const { container } = render(<LevelBadge slug="expert" />)
    const headlines = container.querySelectorAll('h1')
    expect(headlines.length).toBeGreaterThanOrEqual(1)
    expect(headlines[0].textContent).toContain('Expert')
  })
})
