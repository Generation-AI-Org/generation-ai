import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DragRankWidget } from '@/components/test/widgets/drag-rank-widget'
import type { RankQuestion } from '@/lib/assessment/types'

// Force desktop branch (pointer: fine) for deterministic tests.
vi.mock('@/hooks/use-is-touch', () => ({ useIsTouch: () => false }))

const mockQuestion: RankQuestion = {
  id: 'qR',
  dimension: 'prompting',
  prompt: 'Rank these',
  maxPoints: 3,
  type: 'rank',
  scoring: 'levenshtein',
  items: [
    { id: 'a', label: 'Item A' },
    { id: 'b', label: 'Item B' },
    { id: 'c', label: 'Item C' },
    { id: 'd', label: 'Item D' },
  ],
  correctOrder: ['a', 'b', 'c', 'd'],
}

describe('DragRankWidget', () => {
  it('renders all items in their initial order', () => {
    render(<DragRankWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    const options = screen.getAllByRole('option')
    expect(options.length).toBe(4)
    expect(options[0]).toHaveTextContent('Item A')
    expect(options[3]).toHaveTextContent('Item D')
  })

  it('renders a drag-handle button with aria-label per item', () => {
    render(<DragRankWidget question={mockQuestion} answer={undefined} onAnswer={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Drag Item A/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Drag Item D/i })).toBeInTheDocument()
  })

  it('renders items in answer.order when controlled', () => {
    render(
      <DragRankWidget
        question={mockQuestion}
        answer={{ questionId: 'qR', type: 'rank', order: ['c', 'a', 'd', 'b'] }}
        onAnswer={vi.fn()}
      />,
    )
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('Item C')
    expect(options[1]).toHaveTextContent('Item A')
    expect(options[2]).toHaveTextContent('Item D')
    expect(options[3]).toHaveTextContent('Item B')
  })
})
