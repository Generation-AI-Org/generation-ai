'use client'

import { useRef, useState } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  onStop?: () => void
  isLoading: boolean
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleStop() {
    onStop?.()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isLoading) {
        // Stop current request, then send new one
        onStop?.()
        // Small delay to let abort happen, then send
        setTimeout(() => {
          const trimmed = value.trim()
          if (trimmed) {
            onSend(trimmed)
            setValue('')
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto'
            }
          }
        }, 50)
      } else {
        handleSend()
      }
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  function handleButtonClick() {
    if (isLoading) {
      handleStop()
    } else {
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 md:p-4 border-t border-[var(--border)] bg-chat-bg relative z-10">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "Tippe weiter oder drücke Enter zum Abbrechen..." : "Schreib eine Frage…"}
        rows={1}
        aria-label="Nachricht eingeben"
        className="flex-1 resize-none bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 md:px-4 py-3 text-base md:text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--text)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] transition-[border-color,box-shadow]"
        style={{ maxHeight: '120px', minHeight: '48px', fontSize: '16px' }}
      />
      <button
        onClick={handleButtonClick}
        disabled={!isLoading && !value.trim()}
        aria-label={isLoading ? "Senden abbrechen" : "Nachricht senden"}
        className={`shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-[background-color,box-shadow,opacity,transform] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
          isLoading
            ? 'bg-[var(--status-error)]/80 hover:bg-[var(--status-error)] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--status-error)_40%,transparent)]'
            : 'bg-[var(--accent)] hover:scale-105 hover:shadow-[0_0_20px_var(--accent-glow)]'
        }`}
      >
        {isLoading ? (
          // Stop icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          // Send icon
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
        )}
      </button>
    </div>
  )
}
