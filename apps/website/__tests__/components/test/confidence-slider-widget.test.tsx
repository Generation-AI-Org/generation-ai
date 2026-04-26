import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ConfidenceSliderWidget } from '@/components/test/widgets/confidence-slider-widget'
import type { ConfidenceQuestion } from '@/lib/assessment/types'

const mockQuestion: ConfidenceQuestion = {
  id: 'qC',
  dimension: 'application',
  prompt: 'How confident are you?',
  maxPoints: 3,
  type: 'confidence',
  outputText: 'Some output to evaluate.',
  groundTruthStep: 2,
  pointByDistance: [3, 2, 1, 0, 0],
}

describe('ConfidenceSliderWidget', () => {
  it('renders a slider role', () => {
    const { container } = render(
      <ConfidenceSliderWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={vi.fn()}
      />,
    )
    // base-ui slider uses data-slot="slider" on the root
    expect(container.querySelector('[data-widget-type="confidence"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="slider"]')).toBeInTheDocument()
  })

  it('renders exactly one thumb for scalar value (CR-01 regression guard)', () => {
    const { container } = render(
      <ConfidenceSliderWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={vi.fn()}
      />,
    )
    // CR-01: scalar `value` must produce a single-thumb slider, not [min,max] two-thumb range.
    expect(container.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(1)
  })

  it('aria-live region announces "noch nicht gesetzt" before user interaction (WR-06)', () => {
    render(
      <ConfidenceSliderWidget
        question={mockQuestion}
        answer={undefined}
        onAnswer={vi.fn()}
      />,
    )
    // WR-06: without an explicit answer, confidence is NOT considered set.
    // The visual thumb sits at mid position, but scoring treats it as unset.
    const live = document.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live?.textContent).toContain('noch nicht gesetzt')
  })

  it('aria-live region announces semantic label once user sets step', () => {
    render(
      <ConfidenceSliderWidget
        question={mockQuestion}
        answer={{ questionId: 'qC', type: 'confidence', step: 2 }}
        onAnswer={vi.fn()}
      />,
    )
    // step = 2 -> "Unsicher" (50%)
    const live = document.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toContain('Unsicher')
    expect(live?.textContent).toContain('50%')
  })

  it('aria-live region reflects answer.step when controlled', () => {
    render(
      <ConfidenceSliderWidget
        question={mockQuestion}
        answer={{ questionId: 'qC', type: 'confidence', step: 4 }}
        onAnswer={vi.fn()}
      />,
    )
    const live = document.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toContain('Sicher ja')
    expect(live?.textContent).toContain('100%')
  })
})
