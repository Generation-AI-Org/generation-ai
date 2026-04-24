import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FillInWidget } from '@/components/test/widgets/fill-in-widget'
import type { FillAnswer, FillQuestion } from '@/lib/assessment/types'

const mockQuestion: FillQuestion = {
  id: 'qF',
  dimension: 'application',
  prompt: 'Fill the blanks',
  maxPoints: 3,
  type: 'fill',
  codeTemplate: 'x = {{A}} y = {{B}}',
  blanks: [
    {
      id: 'A',
      pointsIfCorrect: 1,
      options: [
        { value: '0.1', isCorrect: false },
        { value: '0.9', isCorrect: true },
      ],
    },
    {
      id: 'B',
      pointsIfCorrect: 1,
      options: [
        { value: 'true', isCorrect: true },
        { value: 'false', isCorrect: false },
      ],
    },
  ],
}

describe('FillInWidget', () => {
  it('renders one <select> per blank in codeTemplate', () => {
    const { container } = render(
      <FillInWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />,
    )
    const selects = container.querySelectorAll('select')
    expect(selects.length).toBe(2)
  })

  it('each select has the placeholder — wählen — as first option', () => {
    render(<FillInWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    const placeholders = screen.getAllByRole('option', { name: /wählen/i })
    expect(placeholders.length).toBe(2)
  })

  it('calls onAnswer with merged selections when user changes a dropdown', async () => {
    const onAnswer = vi.fn<(answer: FillAnswer) => void>()
    const user = userEvent.setup()
    render(
      <FillInWidget
        question={mockQuestion}
        answer={{
          questionId: 'qF',
          type: 'fill',
          selections: { A: '0.1' },
        }}
        onAnswer={onAnswer}
      />,
    )
    // Select the second blank's dropdown and pick "true"
    const selectB = screen.getByLabelText(/Parameter auswählen für B/i)
    await user.selectOptions(selectB, 'true')
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qF',
      type: 'fill',
      selections: { A: '0.1', B: 'true' },
    })
  })
})
