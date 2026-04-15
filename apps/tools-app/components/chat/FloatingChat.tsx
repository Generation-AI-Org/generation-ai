'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Mic, Link, Send, Info } from 'lucide-react'
import QuickActions from './QuickActions'
import MessageList from './MessageList'
import type { ChatMessage, ChatMode } from '@/lib/types'

const STORAGE_KEY = 'genai-chat-session'

interface FloatingChatProps {
  onHighlight: (slugs: string[]) => void
  mode: ChatMode
}

export default function FloatingChat({ onHighlight, mode }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isHydrated, setIsHydrated] = useState(false)
  const [message, setMessage] = useState('')
  const [charCount, setCharCount] = useState(0)
  const maxChars = 2000

  const chatRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Eye tracking state
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.messages) setMessages(data.messages)
        if (data.sessionId) setSessionId(data.sessionId)
        const lastAssistant = [...(data.messages || [])].reverse().find((m: ChatMessage) => m.role === 'assistant')
        if (lastAssistant?.recommendedSlugs?.length > 0) {
          onHighlight(lastAssistant.recommendedSlugs)
        }
      }
    } catch {}
    setIsHydrated(true)
  }, [onHighlight])

  // Save to sessionStorage on changes
  useEffect(() => {
    if (!isHydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, sessionId }))
    } catch {}
  }, [messages, sessionId, isHydrated])

  // Eye tracking for Kiwi face
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const maxOffset = 3
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 100, 1) * maxOffset : 0
      const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 100, 1) * maxOffset : 0
      setEyeOffset({ x: normalizedX, y: normalizedY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  function stopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  async function send(text: string) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setMessage('')
    setCharCount(0)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          sessionId,
          mode,
          history: newMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unbekannter Fehler')

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text,
        recommendedSlugs: data.recommendedSlugs,
        sources: data.sources,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setSessionId(data.sessionId)

      if (data.recommendedSlugs?.length > 0) {
        onHighlight(data.recommendedSlugs)
      } else {
        onHighlight([])
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es nochmal.',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setMessage(value)
    setCharCount(value.length)
  }

  function handleSend() {
    if (message.trim()) {
      send(message.trim())
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isLoading) {
        stopGeneration()
        setTimeout(() => {
          if (message.trim()) send(message.trim())
        }, 50)
      } else {
        handleSend()
      }
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {/* Floating Kiwi Button */}
      <button
        ref={buttonRef}
        className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 transform ${
          isOpen ? 'rotate-0 scale-95' : 'rotate-0 scale-100 hover:scale-110'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Chat schließen' : 'Chat öffnen'}
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--bg-header) 100%)',
          boxShadow: `0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow), 0 4px 12px rgba(0,0,0,0.3)`,
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30" />

        {/* Kiwi Face or X */}
        <div className="relative z-10">
          {isOpen ? (
            <X className="w-7 h-7 md:w-8 md:h-8 text-[var(--text-on-accent)]" />
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" className="md:w-9 md:h-9">
              {/* Kiwi skin */}
              <ellipse cx="16" cy="16" rx="14" ry="13" fill="#7A5C14" />
              <ellipse cx="13" cy="13" rx="6" ry="5" fill="#9B7924" opacity="0.4" />
              {/* Kiwi flesh */}
              <ellipse cx="16" cy="16" rx="10" ry="9" fill="#8BC34A" />
              {/* Eyes */}
              <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
                <ellipse cx="12" cy="14" rx="3" ry="3.5" fill="white" />
                <ellipse cx="20" cy="14" rx="3" ry="3.5" fill="white" />
                <circle cx="12" cy="14" r="1.5" fill="#111" />
                <circle cx="20" cy="14" r="1.5" fill="#111" />
              </g>
              {/* Seeds */}
              <circle cx="16" cy="20" r="0.8" fill="#2A2A2A" />
              <circle cx="13" cy="19" r="0.6" fill="#2A2A2A" />
              <circle cx="19" cy="19" r="0.6" fill="#2A2A2A" />
            </svg>
          )}
        </div>

        {/* Pulsing ring */}
        {!isOpen && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: 'var(--accent)' }}
          />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-16 md:bottom-20 right-0 w-[calc(100vw-2rem)] md:w-[420px] max-w-[420px] transition-all duration-300 origin-bottom-right"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          <div
            className="relative flex flex-col rounded-2xl md:rounded-3xl border shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
              borderColor: 'var(--border)',
              maxHeight: 'calc(100vh - 120px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--accent)' }}
                />
                <span className="text-xs font-medium text-[var(--text-muted)]">GenAI Assistent</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    mode === 'member'
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/25'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  }`}
                >
                  {mode === 'member' ? 'Pro' : 'Lite'}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
                  aria-label="Chat schließen"
                >
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            {/* Messages or Welcome */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ maxHeight: '300px', minHeight: '150px' }}
            >
              {isEmpty ? (
                <div className="flex flex-col p-4 gap-3">
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed text-center">
                    Beschreib deinen Use Case — ich finde die passenden Tools.
                  </p>
                  <QuickActions onPick={(text) => { send(text); }} />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  onSourceClick={(slug) => onHighlight([slug])}
                />
              )}
            </div>

            {/* Input Section */}
            <div className="border-t border-[var(--border)]">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={maxChars}
                className="w-full px-4 md:px-5 py-3 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-[var(--text)] placeholder-[var(--text-muted)]"
                placeholder={isLoading ? "Tippe weiter oder Enter zum Abbrechen..." : "Was möchtest du wissen?"}
                style={{ scrollbarWidth: 'none' }}
              />

              {/* Controls */}
              <div className="px-3 md:px-4 pb-3 md:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Voice Button */}
                    <button
                      className="group relative p-2 rounded-lg transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--border)]"
                      title="Voice Input (coming soon)"
                      disabled
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Link Button */}
                    <button
                      className="group relative p-2 rounded-lg transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--border)]"
                      title="Web Link (coming soon)"
                      disabled
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Character Counter */}
                    <span className="text-xs text-[var(--text-muted)]">
                      {charCount}/{maxChars}
                    </span>

                    {/* Send Button */}
                    <button
                      onClick={isLoading ? stopGeneration : handleSend}
                      disabled={!isLoading && !message.trim()}
                      className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isLoading
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-[var(--accent)] hover:scale-105 text-[var(--text-on-accent)]'
                      }`}
                      style={{
                        boxShadow: isLoading ? undefined : '0 0 12px var(--accent-glow)',
                      }}
                      aria-label={isLoading ? 'Abbrechen' : 'Senden'}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-muted)]">
                  <Info className="w-3 h-3" />
                  <span>
                    <kbd className="px-1 py-0.5 bg-[var(--border)] rounded text-[9px] font-mono">Shift+Enter</kbd> für neue Zeile
                  </span>
                </div>
              </div>
            </div>

            {/* Overlay gradient */}
            <div
              className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, var(--accent-soft), transparent, var(--accent-soft))'
              }}
            />
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
