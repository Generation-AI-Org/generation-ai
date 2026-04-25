import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PromptBestPickWidget } from '@/components/test/widgets/prompt-best-pick-widget'
import type {
  BestPromptAnswer,
  BestPromptQuestion,
} from '@/lib/assessment/types'

const mockQuestion: BestPromptQuestion = {
  id: 'qB',
  dimension: 'prompting',
  prompt: 'Which prompt is best?',
  maxPoints: 3,
  type: 'best-prompt',
  options: [
    { id: 'p1', code: 'code one', language: 'plaintext', points: 3 },
    { id: 'p2', code: 'code two', language: 'plaintext', points: 0 },
    { id: 'p3', code: 'code three', language: 'plaintext', points: 1 },
    { id: 'p4', code: 'code four', language: 'plaintext', points: 0 },
  ],
}

const highlighted = {
  p1: '<pre><code>highlighted-p1</code></pre>',
  p2: '<pre><code>highlighted-p2</code></pre>',
  p3: '<pre><code>highlighted-p3</code></pre>',
  p4: '<pre><code>highlighted-p4</code></pre>',
}

describe('PromptBestPickWidget', () => {
  it('renders radiogroup with 4 options and injects highlighted HTML', () => {
    const { container } = render(
      <PromptBestPickWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={vi.fn()}
        highlightedCode={highlighted}
      />,
    )
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull()
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios.length).toBe(4)
    expect(container.innerHTML).toContain('highlighted-p1')
    expect(container.innerHTML).toContain('highlighted-p4')
  })

  it('calls onAnswer when an option is clicked', async () => {
    const onAnswer = vi.fn<(a: BestPromptAnswer) => void>()
    const user = userEvent.setup()
    const { container } = render(
      <PromptBestPickWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={onAnswer}
        highlightedCode={highlighted}
      />,
    )
    const radios = container.querySelectorAll('[role="radio"]')
    await user.click(radios[2] as Element)
    expect(onAnswer).toHaveBeenCalledWith({
      questionId: 'qB',
      type: 'best-prompt',
      optionId: 'p3',
    })
  })

  it('falls back to escaped raw code when highlightedCode is missing for an id', () => {
    const { container } = render(
      <PromptBestPickWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={vi.fn()}
        highlightedCode={{ p1: highlighted.p1 }}
      />,
    )
    // p2/p3/p4 fall back to `<pre><code>code two</code></pre>` etc
    expect(container.innerHTML).toContain('code two')
    expect(container.innerHTML).toContain('code three')
  })
})
