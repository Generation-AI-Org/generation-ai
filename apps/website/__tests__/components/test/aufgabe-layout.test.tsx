import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AufgabeLayout } from '@/components/test/aufgabe-layout'

describe('AufgabeLayout', () => {
  it('renders children in the main content area', () => {
    render(
      <AufgabeLayout
        questionIndex={0}
        totalQuestions={10}
        onNext={vi.fn()}
        nextDisabled={false}
      >
        <p>Question body here</p>
      </AufgabeLayout>,
    )
    const main = screen.getByRole('main')
    expect(main).toHaveTextContent('Question body here')
  })

  it('shows "Aufgabe N/M" label with the provided values', () => {
    render(
      <AufgabeLayout
        questionIndex={4}
        totalQuestions={10}
        onNext={vi.fn()}
        nextDisabled={false}
      >
        <p>x</p>
      </AufgabeLayout>,
    )
    // `visual` label shows "Aufgabe 5/10" (index+1 is human-readable)
    expect(screen.getByText('Aufgabe 5/10')).toBeInTheDocument()
  })

  it('progress bar aria-label reflects current question number', () => {
    const { container } = render(
      <AufgabeLayout
        questionIndex={2}
        totalQuestions={10}
        onNext={vi.fn()}
        nextDisabled={false}
      >
        <p>x</p>
      </AufgabeLayout>,
    )
    const progress = container.querySelector('[data-slot="progress"]')
    expect(progress).toHaveAttribute('aria-label', 'Aufgabe 3 von 10')
  })

  it('Nächste button is disabled when nextDisabled=true; enabled + clickable when false', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(
      <AufgabeLayout
        questionIndex={0}
        totalQuestions={10}
        onNext={onNext}
        nextDisabled
      >
        <p>x</p>
      </AufgabeLayout>,
    )
    const btn = screen.getByRole('button', { name: /Nächste Aufgabe/i })
    expect(btn).toBeDisabled()

    rerender(
      <AufgabeLayout
        questionIndex={0}
        totalQuestions={10}
        onNext={onNext}
        nextDisabled={false}
      >
        <p>x</p>
      </AufgabeLayout>,
    )
    const enabled = screen.getByRole('button', { name: /Nächste Aufgabe/i })
    expect(enabled).not.toBeDisabled()
    await user.click(enabled)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
