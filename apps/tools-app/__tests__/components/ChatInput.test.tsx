import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '../../components/chat/ChatInput'

describe('ChatInput', () => {
  it('renders without crashing', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isLoading={false} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isLoading={false} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello World')

    expect(textarea).toHaveValue('Hello World')
  })

  it('calls onSend when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isLoading={false} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test message{Enter}')

    expect(onSend).toHaveBeenCalledWith('Test message')
    expect(textarea).toHaveValue('')
  })

  it('calls onSend when button is clicked', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isLoading={false} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Button test')

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onSend).toHaveBeenCalledWith('Button test')
  })

  it('does not call onSend when input is empty', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isLoading={false} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '{Enter}')

    expect(onSend).not.toHaveBeenCalled()
  })

  it('shows different placeholder when loading', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isLoading={true} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute(
      'placeholder',
      'Tippe weiter oder drücke Enter zum Abbrechen...'
    )
  })
})
