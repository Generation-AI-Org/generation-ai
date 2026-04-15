'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Mic, Link, Send, Info, Maximize2, Minimize2 } from 'lucide-react'
import QuickActions from './QuickActions'
import MessageList from './MessageList'
import type { ChatMessage, ChatMode } from '@/lib/types'

const STORAGE_KEY = 'genai-chat-session'

interface FloatingChatProps {
  onHighlight: (slugs: string[]) => void
  onExpandChange?: (expanded: boolean) => void
  mode: ChatMode
}

export default function FloatingChat({ onHighlight, onExpandChange, mode }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isHydrated, setIsHydrated] = useState(false)
  const [message, setMessage] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
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

  // Notify parent about expand changes
  useEffect(() => {
    onExpandChange?.(isExpanded && isOpen)
  }, [isExpanded, isOpen, onExpandChange])

  // Eye tracking for Kiwi face (throttled with RAF, disabled when expanded)
  useEffect(() => {
    if (isExpanded && isOpen) return // No eye tracking needed when expanded

    let rafId: number
    let lastX = 0
    let lastY = 0

    function handleMouseMove(e: MouseEvent) {
      // Skip if position barely changed (threshold of 5px)
      if (Math.abs(e.clientX - lastX) < 5 && Math.abs(e.clientY - lastY) < 5) return
      lastX = e.clientX
      lastY = e.clientY

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
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
      })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [isExpanded, isOpen])

  // Close on click outside (only in popup mode)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isExpanded) return // Don't close in expanded mode
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
  }, [isExpanded])

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

  function toggleExpand() {
    setIsExpanded(!isExpanded)
  }

  const isEmpty = messages.length === 0

  // In expanded mode, render as a fixed sidebar panel (below header + filterbar)
  // Header: py-4(16) + h-11(44) + py-4(16) + border(1) = 77px
  // FilterBar: py-3(12) + min-h-44(44) + py-3(12) + border(1) = 69px
  // Total: ~146px, use 148px to align exactly with FilterBar bottom edge
  if (isExpanded && isOpen) {
    return (
      <div
        ref={chatRef}
        className="fixed right-0 top-[148px] bottom-0 w-full md:w-[35%] flex flex-col rounded-l-2xl border-l border-t border-[var(--border)] bg-[var(--bg-card)] z-40 shadow-2xl"
        style={{ animation: 'slideIn 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--accent)' }}
            />
            <span className="text-xs font-medium text-[var(--text-muted)]">GenAI Assistent</span>
          </div>
          <div className="flex items-center gap-1.5">
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
              onClick={toggleExpand}
              className="p-1.5 rounded-full hover:bg-[var(--border)] transition-all duration-200 hover:scale-110"
              aria-label="Minimieren"
            >
              <Minimize2 className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            <button
              onClick={() => { setIsOpen(false); setIsExpanded(false); }}
              className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
              aria-label="Chat schließen"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col p-4 gap-3">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed text-center">
                Beschreib deinen Use Case — ich finde die passenden Tools.
              </p>
              <QuickActions onPick={(text) => send(text)} />
            </div>
          ) : (
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onSourceClick={(slug) => onHighlight([slug])}
            />
          )}
        </div>

        {/* Input Section - styled like example */}
        <div className="shrink-0 p-4">
          <div className="relative overflow-hidden rounded-xl bg-[var(--border)]/20">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={3}
              maxLength={maxChars}
              className="chat-textarea w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-[var(--text)] placeholder-[var(--text-muted)]"
              placeholder={isLoading ? "Tippe weiter oder Enter zum Abbrechen..." : "Was möchtest du wissen?"}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/10 to-transparent pointer-events-none rounded-xl" />
          </div>

          {/* Controls */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 bg-[var(--border)]/40 rounded-xl">
                {/* Voice Button with cool hover */}
                <button
                  className="group relative p-2.5 rounded-lg transition-all duration-300 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)] hover:scale-105 hover:rotate-[-3deg] disabled:opacity-70"
                  title="Voice Input (coming soon)"
                  disabled
                >
                  <Mic className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-[-12deg]" />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-[var(--bg-card)] text-[var(--text)] text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-[var(--border)]">
                    Voice input
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border)]" />
                  </div>
                </button>

                {/* Link Button with cool hover */}
                <button
                  className="group relative p-2.5 rounded-lg transition-all duration-300 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)] hover:scale-105 hover:rotate-6 disabled:opacity-70"
                  title="Web Link (coming soon)"
                  disabled
                >
                  <Link className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-[var(--bg-card)] text-[var(--text)] text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-[var(--border)]">
                    Web link
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border)]" />
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)]">
                  {charCount}/{maxChars}
                </span>

                {/* Send Button with glow */}
                <button
                  onClick={isLoading ? stopGeneration : handleSend}
                  disabled={!isLoading && !message.trim()}
                  className={`group relative p-3 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
                    isLoading
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-110 hover:-rotate-2'
                  }`}
                  style={{
                    boxShadow: isLoading ? undefined : '0 0 15px var(--accent-glow)',
                  }}
                  aria-label={isLoading ? 'Abbrechen' : 'Senden'}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 group-hover:scale-110" />
                  )}
                  {/* Glow effect on hover */}
                  {!isLoading && (
                    <div className="absolute inset-0 rounded-xl bg-[var(--accent)] opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg scale-110" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]/50 text-xs text-[var(--text-secondary)]">
              <Info className="w-4 h-4" />
              <span>
                <kbd className="px-1.5 py-1 bg-[var(--border)] rounded text-[11px] font-mono">Shift+Enter</kbd> für neue Zeile
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Floating bubble mode
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {/* Floating Kiwi Button */}
      <button
        ref={buttonRef}
        className={`floating-ai-button relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 transform bg-transparent border-none ${
          isOpen ? 'rotate-90 scale-95' : 'rotate-0 scale-100'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Chat schließen' : 'Chat öffnen'}
        style={{
          boxShadow: isOpen ? 'none' : `0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow), 0 4px 12px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Full Kiwi SVG or X */}
        {isOpen ? (
          <div className="w-full h-full rounded-full bg-[var(--border)] flex items-center justify-center">
            <X className="w-8 h-8 md:w-10 md:h-10 text-[var(--text)]" />
          </div>
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Outer brown fuzzy skin */}
            <circle cx="50" cy="50" r="48" fill="#8B6914" />
            <circle cx="50" cy="50" r="46" fill="#7A5C14" />
            {/* Fuzzy texture dots */}
            <circle cx="15" cy="40" r="2" fill="#5A4410" opacity="0.5" />
            <circle cx="85" cy="45" r="2" fill="#5A4410" opacity="0.5" />
            <circle cx="20" cy="70" r="1.5" fill="#5A4410" opacity="0.4" />
            <circle cx="80" cy="65" r="1.5" fill="#5A4410" opacity="0.4" />
            <circle cx="30" cy="85" r="1.5" fill="#5A4410" opacity="0.4" />
            <circle cx="70" cy="80" r="1.5" fill="#5A4410" opacity="0.4" />
            {/* Green flesh */}
            <circle cx="50" cy="50" r="38" fill="#8BC34A" />
            <circle cx="50" cy="50" r="34" fill="#9CCC65" />
            {/* White center */}
            <ellipse cx="50" cy="50" rx="6" ry="8" fill="#E8F5E9" />
            {/* Seeds radiating from center */}
            <g fill="#2E2E2E">
              <ellipse cx="50" cy="62" rx="1.5" ry="2.5" />
              <ellipse cx="42" cy="60" rx="1.3" ry="2" transform="rotate(-20 42 60)" />
              <ellipse cx="58" cy="60" rx="1.3" ry="2" transform="rotate(20 58 60)" />
              <ellipse cx="36" cy="54" rx="1.2" ry="1.8" transform="rotate(-40 36 54)" />
              <ellipse cx="64" cy="54" rx="1.2" ry="1.8" transform="rotate(40 64 54)" />
              <ellipse cx="34" cy="46" rx="1" ry="1.5" transform="rotate(-60 34 46)" />
              <ellipse cx="66" cy="46" rx="1" ry="1.5" transform="rotate(60 66 46)" />
              <ellipse cx="38" cy="38" rx="0.8" ry="1.2" transform="rotate(-80 38 38)" />
              <ellipse cx="62" cy="38" rx="0.8" ry="1.2" transform="rotate(80 62 38)" />
            </g>
            {/* Cute eyes with tracking */}
            <g transform={`translate(${eyeOffset.x * 2}, ${eyeOffset.y * 2})`}>
              <ellipse cx="38" cy="42" rx="8" ry="9" fill="white" />
              <ellipse cx="62" cy="42" rx="8" ry="9" fill="white" />
              <circle cx="38" cy="42" r="4" fill="#111" />
              <circle cx="62" cy="42" r="4" fill="#111" />
              {/* Eye shine */}
              <circle cx="40" cy="40" r="1.5" fill="white" />
              <circle cx="64" cy="40" r="1.5" fill="white" />
            </g>
          </svg>
        )}

        {/* Pulsing ring */}
        {!isOpen && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: 'var(--accent)' }}
          />
        )}
      </button>

      {/* Chat Window Popup - always fills from FilterBar line to Kiwi button */}
      {/* Top: 148px (header + filterbar), Bottom: 104px (kiwi button area) */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed top-[148px] bottom-[104px] right-4 md:right-6 w-[calc(100vw-2rem)] md:w-[420px] max-w-[420px] transition-all duration-300 origin-bottom-right"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          <div
            className="relative flex flex-col h-full rounded-2xl md:rounded-3xl border shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--accent)' }}
                />
                <span className="text-xs font-medium text-[var(--text-muted)]">GenAI Assistent</span>
              </div>
              <div className="flex items-center gap-1.5">
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
                  onClick={toggleExpand}
                  className="p-1.5 rounded-full hover:bg-[var(--border)] transition-all duration-200 hover:scale-110"
                  aria-label="Maximieren"
                >
                  <Maximize2 className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
                  aria-label="Chat schließen"
                >
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            {/* Messages or Welcome - fills available space */}
            <div className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <div className="flex flex-col p-4 gap-3">
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed text-center">
                    Beschreib deinen Use Case — ich finde die passenden Tools.
                  </p>
                  <QuickActions onPick={(text) => send(text)} />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  onSourceClick={(slug) => onHighlight([slug])}
                />
              )}
            </div>

            {/* Input Section - styled like example component */}
            <div className="relative overflow-hidden rounded-xl mx-4 mb-2 bg-[var(--border)]/20">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={3}
                maxLength={maxChars}
                className="chat-textarea w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-[var(--text)] placeholder-[var(--text-muted)]"
                placeholder={isLoading ? "Tippe weiter oder Enter zum Abbrechen..." : "Was möchtest du wissen?"}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/10 to-transparent pointer-events-none rounded-xl"
              />
            </div>

            {/* Controls Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Attachment Group */}
                  <div className="flex items-center gap-1 p-1 bg-[var(--border)]/40 rounded-xl">
                    {/* Voice Button */}
                    <button
                      className="group relative p-2.5 rounded-lg transition-all duration-300 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)] hover:scale-105 hover:rotate-[-3deg] disabled:opacity-70"
                      disabled
                    >
                      <Mic className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-[-12deg]" />
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-[var(--bg-card)] text-[var(--text)] text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-[var(--border)]">
                        Voice input
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border)]" />
                      </div>
                    </button>

                    {/* Link Button */}
                    <button
                      className="group relative p-2.5 rounded-lg transition-all duration-300 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)] hover:scale-105 hover:rotate-6 disabled:opacity-70"
                      disabled
                    >
                      <Link className="w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-[var(--bg-card)] text-[var(--text)] text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-[var(--border)]">
                        Web link
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border)]" />
                      </div>
                    </button>
                  </div>
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
                    className={`group relative p-3 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 ${
                      isLoading
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-110 hover:-rotate-2'
                    }`}
                    style={{
                      boxShadow: isLoading ? undefined : '0 10px 15px -3px rgba(0,0,0,0.1), 0 0 0 0 var(--accent-glow)',
                    }}
                    aria-label={isLoading ? 'Abbrechen' : 'Senden'}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 group-hover:scale-110" />
                    )}
                    {/* Glow effect */}
                    {!isLoading && (
                      <div className="absolute inset-0 rounded-xl bg-[var(--accent)] opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg scale-110" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]/50 text-xs text-[var(--text-secondary)]">
                <Info className="w-4 h-4" />
                <span>
                  <kbd className="px-1.5 py-1 bg-[var(--border)] rounded text-[11px] font-mono">Shift+Enter</kbd> für neue Zeile
                </span>
              </div>
            </div>

            {/* Subtle overlay */}
            <div
              className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.03), transparent, rgba(var(--accent-rgb), 0.02))'
              }}
            />
          </div>
        </div>
      )}

      {/* CSS for animations */}
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

        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px var(--accent-glow), 0 0 50px var(--accent-glow);
        }
      `}</style>
    </div>
  )
}
