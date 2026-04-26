import { render } from '@testing-library/react'
import { beforeAll, describe, it, expect } from 'vitest'
import { SkillRadarChart } from '@/components/test/skill-radar-chart'

// recharts ResponsiveContainer needs ResizeObserver — stub in jsdom.
beforeAll(() => {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = RO
})

const skills = {
  tools: 80,
  prompting: 60,
  agents: 40,
  application: 70,
} as const

describe('SkillRadarChart', () => {
  it('renders a figure with data-testid="skill-radar"', () => {
    const { container } = render(
      <SkillRadarChart skills={skills} slug="fortgeschritten" />,
    )
    const fig = container.querySelector('[data-testid="skill-radar"]')
    expect(fig).not.toBeNull()
    expect(fig?.tagName.toLowerCase()).toBe('figure')
  })

  it('figcaption announces top-2 strengths and bottom dimension', () => {
    const { container } = render(
      <SkillRadarChart skills={skills} slug="fortgeschritten" />,
    )
    const caption = container.querySelector('figcaption')
    expect(caption).not.toBeNull()
    // Top-2 = tools (80), application (70). Bottom = agents (40).
    expect(caption?.textContent).toContain('Deine Stärken')
    expect(caption?.textContent).toContain('Tools')
    expect(caption?.textContent).toContain('Anwendung')
    expect(caption?.textContent).toContain('Ausbaufähig')
    expect(caption?.textContent).toContain('Agents')
  })

  it('chart container has aspect-square class', () => {
    const { container } = render(
      <SkillRadarChart skills={skills} slug="fortgeschritten" />,
    )
    const square = container.querySelector('.aspect-square')
    expect(square).not.toBeNull()
  })
})
