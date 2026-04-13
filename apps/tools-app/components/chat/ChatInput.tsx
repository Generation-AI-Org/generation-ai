'use client'

import { useRef, useState } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="flex items-end gap-2 p-3 md:p-4 border-t border-[var(--border)] bg-chat-bg relative z-10">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Schreib eine Frage…"
        rows={1}
        className="flex-1 resize-none bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 md:px-4 py-3 text-base md:text-sm text-text placeholder-text-muted focus:outline-none focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/10 transition-all disabled:opacity-40"
        style={{ maxHeight: '120px', minHeight: '48px', fontSize: '16px' }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center transition-all hover:scale-105 hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-bg"
          />
        </svg>
      </button>
    </div>
  )
}
