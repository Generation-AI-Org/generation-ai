import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CardPickWidget } from '@/components/test/widgets/card-pick-widget'
import type { PickQuestion, PickAnswer } from '@/lib/assessment/types'

const mockQuestion: PickQuestion = {
  id: 'qTest',
  dimension: 'tools',
  prompt: 'Test prompt',
  maxPoints: 3,
  type: 'pick',
  options: [
    { id: 'a', label: 'Option A', points: 3 },
    { id: 'b', label: 'Option B', points: 1 },
    { id: 'c', label: 'Option C', points: 0 },
  ],
}

describe('CardPickWidget', () => {
  it('renders all options from question.options', () => {
    render(<CardPickWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('calls onAnswer with correct optionId when user clicks an option', async () => {
    const onAnswer = vi.fn<(answer: PickAnswer) => void>()
    const user = userEvent.setup()
    render(<CardPickWidget question={mockQuestion} answer={undefined} onAnswer={onAnswer} />)
    await user.click(screen.getByRole('radio', { name: /Option B/i }))
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qTest',
      type: 'pick',
      optionId: 'b',
    })
  })

  it('calls onAnswer when user presses Space/Enter on a focused option', async () => {
    const onAnswer = vi.fn<(answer: PickAnswer) => void>()
    const user = userEvent.setup()
    render(<CardPickWidget question={mockQuestion} answer={undefined} onAnswer={onAnswer} />)
    const optA = screen.getByRole('radio', { name: /Option A/i })
    optA.focus()
    await user.keyboard('{Enter}')
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qTest',
      type: 'pick',
      optionId: 'a',
    })
  })

  it('shows aria-checked=true on the currently-selected option', () => {
    const answer: PickAnswer = { questionId: 'qTest', type: 'pick', optionId: 'b' }
    render(<CardPickWidget question={mockQuestion} answer={answer} onAnswer={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Option A/i })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByRole('radio', { name: /Option B/i })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('WR-03: only one option is tabbable at a time (roving tabindex)', () => {
    render(<CardPickWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    const radios = screen.getAllByRole('radio')
    const tabbable = radios.filter((r) => r.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    // First option is tabbable when nothing is checked.
    expect(tabbable[0]).toHaveAccessibleName(/Option A/i)
  })

  it('WR-03: ArrowDown moves focus to the next option', async () => {
    const user = userEvent.setup()
    render(<CardPickWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    const optA = screen.getByRole('radio', { name: /Option A/i })
    optA.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: /Option B/i })).toHaveFocus()
  })

  it('WR-03: ArrowUp from first option wraps to last', async () => {
    const user = userEvent.setup()
    render(<CardPickWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    const optA = screen.getByRole('radio', { name: /Option A/i })
    optA.focus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('radio', { name: /Option C/i })).toHaveFocus()
  })
})
