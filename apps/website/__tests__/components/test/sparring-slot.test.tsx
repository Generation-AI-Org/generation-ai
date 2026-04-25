import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SparringSlot } from '@/components/test/sparring-slot'

const skills = {
  tools: 50,
  prompting: 50,
  agents: 50,
  application: 50,
  literacy: 50,
} as const

describe('SparringSlot (placeholder)', () => {
  it('renders "PRISMA" header + "Kommt bald" badge', () => {
    const { container } = render(
      <SparringSlot level={3} skills={skills} mode="placeholder" />,
    )
    expect(container.textContent).toContain('PRISMA')
    expect(container.textContent).toContain('Kommt bald')
  })

  it('input is disabled + aria-disabled + button is disabled', () => {
    const { container } = render(
      <SparringSlot level={3} skills={skills} mode="placeholder" />,
    )
    const input = container.querySelector('input')
    expect(input).not.toBeNull()
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-disabled', 'true')
    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button).toBeDisabled()
  })

  it('contains "Jetzt beitreten" link to /join with source=test-sparring', () => {
    render(<SparringSlot level={3} skills={skills} mode="placeholder" />)
    const link = screen.getByRole('link', { name: /Jetzt beitreten/ })
    expect(link).toHaveAttribute('href', '/join?source=test-sparring')
  })

  it('mode="live" falls back to placeholder until backend is wired', () => {
    const { container } = render(
      <SparringSlot level={3} skills={skills} mode="live" />,
    )
    expect(container.textContent).toContain('PRISMA')
    expect(container.textContent).toContain('Kommt bald')
  })
})
