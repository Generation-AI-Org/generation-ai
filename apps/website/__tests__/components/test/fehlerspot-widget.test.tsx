import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FehlerspotWidget } from '@/components/test/widgets/fehlerspot-widget'
import type { SpotAnswer, SpotQuestion } from '@/lib/assessment/types'

const mockQuestion: SpotQuestion = {
  id: 'qSpot',
  dimension: 'application',
  prompt: 'Find the hallucination',
  maxPoints: 3,
  type: 'spot',
  passageSegments: [
    { id: 's1', text: 'This is segment one. ', isCorrect: false },
    { id: 's2', text: 'This is the hallucinated segment. ', isCorrect: true },
    { id: 's3', text: 'This is segment three.', isCorrect: false },
  ],
}

describe('FehlerspotWidget', () => {
  it('renders one option span per segment inside a listbox', () => {
    const { container } = render(
      <FehlerspotWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />,
    )
    expect(container.querySelector('[role="listbox"]')).not.toBeNull()
    const options = container.querySelectorAll('[role="option"]')
    expect(options.length).toBe(3)
  })

  it('clicking a segment calls onAnswer and updates aria-selected', async () => {
    const onAnswer = vi.fn<(a: SpotAnswer) => void>()
    const user = userEvent.setup()
    const { container, rerender } = render(
      <FehlerspotWidget question={mockQuestion} answer={undefined} onAnswer={onAnswer} />,
    )
    const options = container.querySelectorAll('[role="option"]')
    await user.click(options[1] as Element)
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qSpot',
      type: 'spot',
      segmentId: 's2',
    })
    rerender(
      <FehlerspotWidget
        question={mockQuestion}
        answer={{ questionId: 'qSpot', type: 'spot', segmentId: 's2' }}
        onAnswer={onAnswer}
      />,
    )
    const updated = container.querySelectorAll('[role="option"]')
    expect(updated[0]).toHaveAttribute('aria-selected', 'false')
    expect(updated[1]).toHaveAttribute('aria-selected', 'true')
    expect(updated[2]).toHaveAttribute('aria-selected', 'false')
  })

  it('aria-live region announces the selected segment index', () => {
    render(
      <FehlerspotWidget
        question={mockQuestion}
        answer={{ questionId: 'qSpot', type: 'spot', segmentId: 's2' }}
        onAnswer={vi.fn()}
      />,
    )
    const live = document.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toContain('Abschnitt 2')
  })
})
