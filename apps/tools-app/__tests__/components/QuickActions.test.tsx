import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickActions from '../../components/chat/QuickActions'

describe('QuickActions', () => {
  it('renders all four quick action buttons', () => {
    const onPick = vi.fn()
    render(<QuickActions onPick={onPick} />)

    expect(screen.getByText('Ich schreibe meine Thesis')).toBeInTheDocument()
    expect(screen.getByText('Ich will was automatisieren')).toBeInTheDocument()
    expect(screen.getByText('Ich fange gerade an mit AI')).toBeInTheDocument()
    expect(screen.getByText('Ohne Code was bauen')).toBeInTheDocument()
  })

  it('calls onPick with correct prompt when button is clicked', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<QuickActions onPick={onPick} />)

    const thesisButton = screen.getByText('Ich schreibe meine Thesis')
    await user.click(thesisButton)

    expect(onPick).toHaveBeenCalledWith(
      'Ich schreibe gerade meine Thesis. Welche KI-Tools helfen mir bei Recherche, Schreiben und Quellenmanagement?'
    )
  })

  it('buttons have correct hover styling classes for glow effect', () => {
    const onPick = vi.fn()
    render(<QuickActions onPick={onPick} />)

    const button = screen.getByText('Ich schreibe meine Thesis')

    // Check that the button has the accent glow hover class
    expect(button.className).toContain('hover:shadow-[0_0_12px_var(--accent-glow)]')
    expect(button.className).toContain('hover:border-[var(--accent)]')
    expect(button.className).toContain('hover:text-[var(--accent)]')
  })

  it('buttons have proper border and styling', () => {
    const onPick = vi.fn()
    render(<QuickActions onPick={onPick} />)

    const buttons = screen.getAllByRole('button')

    buttons.forEach(button => {
      expect(button.className).toContain('border')
      expect(button.className).toContain('rounded-xl')
      expect(button.className).toContain('min-h-[48px]')
    })
  })
})
