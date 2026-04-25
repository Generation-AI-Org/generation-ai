import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MatchingWidget } from '@/components/test/widgets/matching-widget'
import type { MatchAnswer, MatchQuestion } from '@/lib/assessment/types'

// Force the touch branch (native <select> per task row).
vi.mock('@/hooks/use-is-touch', () => ({ useIsTouch: () => true }))

const mockQuestion: MatchQuestion = {
  id: 'qM',
  dimension: 'agents',
  prompt: 'Match tools to tasks',
  maxPoints: 3,
  type: 'match',
  tasks: [
    { id: 't1', label: 'Research' },
    { id: 't2', label: 'Summarize' },
    { id: 't3', label: 'Brainstorm' },
  ],
  tools: [
    { id: 'u1', label: 'Perplexity' },
    { id: 'u2', label: 'NotebookLM' },
    { id: 'u3', label: 'ChatGPT' },
  ],
  correctPairs: { t1: 'u1', t2: 'u2', t3: 'u3' },
  pointPerCorrect: 1,
}

describe('MatchingWidget (touch mode)', () => {
  it('renders one native <select> per task', () => {
    const { container } = render(
      <MatchingWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />,
    )
    const selects = container.querySelectorAll('select')
    expect(selects.length).toBe(3)
  })

  it('shows "n von m Zuordnungen" progress with aria-live', () => {
    render(<MatchingWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    const live = document.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live?.textContent).toContain('0 von 3')
  })

  it('calls onAnswer with merged pairs when a dropdown changes', async () => {
    const onAnswer = vi.fn<(a: MatchAnswer) => void>()
    const user = userEvent.setup()
    render(
      <MatchingWidget
        question={mockQuestion}
        answer={{
          questionId: 'qM',
          type: 'match',
          pairs: { t1: 'u1' },
        }}
        onAnswer={onAnswer}
      />,
    )
    const selectT2 = screen.getByLabelText(/Tool für Aufgabe: Summarize/i)
    await user.selectOptions(selectT2, 'u2')
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qM',
      type: 'match',
      pairs: { t1: 'u1', t2: 'u2' },
    })
  })
})
