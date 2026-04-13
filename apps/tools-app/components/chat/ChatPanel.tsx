'use client'

import { useState, useEffect } from 'react'
import QuickActions from './QuickActions'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import KiwiMascot from '@/components/ui/KiwiMascot'
import type { ChatMessage, ChatMode } from '@/lib/types'

const STORAGE_KEY = 'genai-chat-session'

interface ChatPanelProps {
  onHighlight: (slugs: string[]) => void
  mode: ChatMode
}

export default function ChatPanel({ onHighlight, mode }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.messages) setMessages(data.messages)
        if (data.sessionId) setSessionId(data.sessionId)
        // Restore highlights from last assistant message
        const lastAssistant = [...(data.messages || [])].reverse().find(m => m.role === 'assistant')
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

  async function send(text: string) {
    if (isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es nochmal.',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-chat-bg shadow-[-4px_0_20px_rgba(0,0,0,0.08)] relative overflow-hidden">
      {/* Kiwi Mascot - follows cursor, fades when chatting */}
      <KiwiMascot isActive={!isEmpty} />

      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-[var(--accent)]/20 shrink-0 flex items-center gap-3 bg-[var(--accent)]/5 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-text text-sm font-semibold leading-tight">
              GenAI Assistent {mode === 'member' ? 'Pro' : 'Lite'}
            </p>
            {mode === 'member' && (
              <span className="text-xs font-medium tracking-wide px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25">
                Member
              </span>
            )}
          </div>
          <p className="text-text-muted text-xs">Findet die richtigen Tools für dich</p>
        </div>
        {/* Login/Logout Button */}
        {mode === 'public' ? (
          <a
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-bg shadow-[0_0_12px_var(--accent-glow)] hover:opacity-90 transition-all"
          >
            Anmelden
          </a>
        ) : (
          <button
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase')
              await supabase.auth.signOut()
              window.location.reload()
            }}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--border)] text-text-muted hover:bg-[var(--accent)]/10 hover:text-text transition-all"
          >
            Abmelden
          </button>
        )}
      </div>

      {/* Messages or Welcome */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {isEmpty ? (
          <div className="flex flex-col p-4 gap-4 h-full">
            {/* Accent glow top */}
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 blur-xl mx-auto mt-4 mb-0" />
            <p className="text-text-muted text-xs text-center tracking-wide uppercase font-medium">
              KI-Tool Beratung
            </p>
            <p className="text-text-secondary text-sm leading-relaxed text-center px-2">
              Beschreib deinen Use Case — ich finde die passenden Tools aus der Bibliothek.
            </p>
            <QuickActions onPick={send} />

            {/* Login Teaser — only for public mode */}
            {mode === 'public' && (
              <div className="mt-auto px-4 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  {/* Lock icon */}
                  <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-[var(--text-secondary)] flex-1">
                    Als Member bekommst du Zugang zum erweiterten Assistenten.{' '}
                    <a
                      href="/login"
                      className="text-[var(--accent)] hover:underline font-medium"
                    >
                      Jetzt anmelden
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onSourceClick={(slug) => onHighlight([slug])}
          />
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={send} disabled={isLoading} />
    </div>
  )
}
