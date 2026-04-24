import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SideBySideWidget } from '@/components/test/widgets/side-by-side-widget'
import type {
  SideBySideAnswer,
  SideBySideQuestion,
} from '@/lib/assessment/types'

const mockQuestion: SideBySideQuestion = {
  id: 'qS',
  dimension: 'agents',
  prompt: 'A or B?',
  maxPoints: 3,
  type: 'side-by-side',
  outputs: { a: 'Output A content', b: 'Output B content' },
  correctChoice: 'a',
  reasons: [
    { id: 'r1', label: 'Reason 1', isCorrect: true },
    { id: 'r2', label: 'Reason 2', isCorrect: false },
  ],
  choicePoints: 1,
  reasonPointPerCorrect: 1,
}

describe('SideBySideWidget', () => {
  it('renders A and B radio cards; reason chips absent when choice is null', () => {
    const { container } = render(
      <SideBySideWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={vi.fn()}
      />,
    )
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios.length).toBe(2)
    expect(container.querySelector('[role="checkbox"]')).toBeNull()
  })

  it('reveals reason chips after a choice is made', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn<(a: SideBySideAnswer) => void>()
    const { container, rerender } = render(
      <SideBySideWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={onAnswer}
      />,
    )
    const radios = container.querySelectorAll('[role="radio"]')
    await user.click(radios[0] as Element)
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qS',
      type: 'side-by-side',
      choice: 'a',
      reasonIds: [],
    })
    // Controlled: parent would feed new answer back. Simulate.
    rerender(
      <SideBySideWidget
        question={mockQuestion}
        answer={{
          questionId: 'qS',
          type: 'side-by-side',
          choice: 'a',
          reasonIds: [],
        }}
        onAnswer={onAnswer}
      />,
    )
    await waitFor(() => {
      expect(container.querySelectorAll('[role="checkbox"]').length).toBeGreaterThan(0)
    })
  })

  it('toggles a reason chip and calls onAnswer with merged reasonIds', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn<(a: SideBySideAnswer) => void>()
    render(
      <SideBySideWidget
        question={mockQuestion}
        answer={{
          questionId: 'qS',
          type: 'side-by-side',
          choice: 'b',
          reasonIds: ['r1'],
        }}
        onAnswer={onAnswer}
      />,
    )
    const reason2 = screen.getByRole('checkbox', { name: /Reason 2/i })
    await user.click(reason2)
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qS',
      type: 'side-by-side',
      choice: 'b',
      reasonIds: ['r1', 'r2'],
    })
  })
})
