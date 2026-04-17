'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Square, Info, Maximize2, Minimize2, Paperclip } from 'lucide-react'
import { VoiceInputButton } from '@/components/ui/VoiceInputButton'
import QuickActions from './QuickActions'
import MessageList from './MessageList'
import UrlInputModal from './UrlInputModal'
import { type Attachment } from './AttachmentsPanel'
import { useDeepgramVoice } from '@/hooks/useDeepgramVoice'
import { useCallback } from 'react'
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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showAttachments, setShowAttachments] = useState(false)
  const [inlineUrlInput, setInlineUrlInput] = useState('')
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const maxChars = 2000

  const chatRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Single source of truth for textarea auto-resize (DRY): invoked by both
  // onChange and the [message, isExpanded] useEffect so voice/programmatic
  // updates grow the textarea just like manual typing.
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const maxHeight = 120
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  // Voice input hook (Deepgram API)
  const {
    isRecording,
    isProcessing,
    isSupported: isVoiceSupported,
    startRecording,
    stopRecording,
    transcript,
    audioLevels,
    error: voiceError,
    clearError,
    clearTranscript,
  } = useDeepgramVoice()

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // When transcript changes, append to message
  useEffect(() => {
    if (transcript) {
      setMessage((prev) => {
        const newMessage = prev ? `${prev} ${transcript}` : transcript
        setCharCount(newMessage.length)
        return newMessage
      })
      textareaRef.current?.focus()
    }
  }, [transcript])

  // Clear voice error after 5 seconds
  useEffect(() => {
    if (voiceError) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [voiceError, clearError])

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
        if (data.draft) {
          setMessage(data.draft)
          setCharCount(data.draft.length)
        }
        // Highlights are transient — only shown right after a fresh response,
        // never re-applied from persisted history (refresh, back-navigation, etc.).
      }
    } catch {}
    setIsHydrated(true)
  }, [])

  // Save to sessionStorage on changes
  useEffect(() => {
    if (!isHydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, sessionId, draft: message }))
    } catch {}
  }, [messages, sessionId, message, isHydrated])

  // Notify parent about expand changes
  useEffect(() => {
    onExpandChange?.(isExpanded && isOpen)
  }, [isExpanded, isOpen, onExpandChange])

  // Reset inline URL editing when dropdown closes
  useEffect(() => {
    if (!showAttachments) {
      setIsEditingUrl(false)
      setInlineUrlInput('')
    }
  }, [showAttachments])

  // Close attachment dropdown on click outside or Escape
  useEffect(() => {
    if (!showAttachments) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      // Check if click is inside the dropdown or the trigger button
      if (!target.closest('[data-attachment-dropdown]')) {
        setShowAttachments(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowAttachments(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showAttachments])

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

  // Auto-resize textarea when message changes (voice input, paste, programmatic
  // clears after send). isExpanded in deps: re-runs after mount of the other
  // render path so the freshly mounted textarea gets the correct height.
  useEffect(() => {
    resizeTextarea()
  }, [message, isExpanded, resizeTextarea])

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

    // Build message with optional URL contexts
    let fullMessage = text
    if (attachments.length > 0) {
      const contexts = attachments.map(a => `[Kontext von ${a.url}]\n${a.content}`).join('\n\n')
      fullMessage = `${contexts}\n\n[Frage]\n${text}`
    }

    // Display version shows attachment count
    const displayContent = attachments.length > 0
      ? `${text}\n\n📎 ${attachments.length} Anhang${attachments.length > 1 ? 'e' : ''}`
      : text

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: displayContent,
      created_at: new Date().toISOString(),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setMessage('')
    setCharCount(0)
    setAttachments([]) // Clear attachments after sending
    setShowAttachments(false)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: fullMessage,
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
    // Resize handled by useEffect on [message, isExpanded]
  }

  function handleSend() {
    if (message.trim()) {
      send(message.trim())
    }
  }

  // Handle inline URL input submission
  async function handleInlineUrlSubmit() {
    const url = inlineUrlInput.trim()
    if (!url) {
      setIsEditingUrl(false)
      return
    }

    // Basic URL validation
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url
    }

    try {
      // Fetch content via defuddle API
      const response = await fetch('/api/defuddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          type: 'url',
          title: data.title || new URL(finalUrl).hostname,
          url: finalUrl,
          content: data.content || '',
          excerpt: data.excerpt || '',
        }
        setAttachments(prev => [...prev, newAttachment])
      }
    } catch (error) {
      console.error('Failed to fetch URL:', error)
    }

    setInlineUrlInput('')
    setIsEditingUrl(false)
    setShowAttachments(false)
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
      <>
        {/* Mobile backdrop — blur unter Header, Footer darf mit geblurrt werden */}
        <div
          className="fixed top-[77px] bottom-0 left-0 right-0 md:hidden bg-black/40 backdrop-blur-md z-30"
          onClick={() => { setIsOpen(false); setIsExpanded(false); }}
          aria-hidden="true"
        />
      <div
        ref={chatRef}
        className="fixed top-[77px] bottom-[96px] left-0 right-0 md:inset-auto md:right-0 md:top-[148px] md:bottom-0 w-full md:w-[35%] flex flex-col rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border-t md:border-l md:border-t border-[var(--border)] bg-[var(--bg)] md:bg-[var(--bg-card)] z-40 shadow-2xl animate-slide-in"
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
              className="p-1.5 rounded-full hover:bg-[var(--border)] transition-all duration-200 hover:scale-110 active:scale-95"
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

        {/* Attachment Chips */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-[var(--border)]/30">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs group"
              >
                <svg className="w-3 h-3 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-[var(--text)] max-w-[120px] truncate">{attachment.title}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                  className="p-0.5 rounded-full hover:bg-[var(--accent)]/20 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="px-4 py-2 text-sm text-[var(--text-muted)] italic border-b border-[var(--border)]/30 bg-[var(--accent)]/5 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            Transkribiere...
          </div>
        )}

        {/* Input Section - styled like example */}
        <div className="shrink-0 p-4">
          <div className="relative overflow-hidden rounded-xl bg-[var(--border)]/20">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={maxChars}
              className="chat-textarea w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-[var(--text)] placeholder-[var(--text-muted)]"
              placeholder={isLoading ? "Tippe weiter oder Enter zum Abbrechen..." : "Was möchtest du wissen?"}
              style={{ minHeight: '44px', maxHeight: '120px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/10 to-transparent pointer-events-none rounded-xl" />
          </div>

          {/* Controls */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Voice Button with animated bars */}
                <VoiceInputButton
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  isSupported={isVoiceSupported}
                  onToggle={toggleRecording}
                  audioLevels={audioLevels}
                />

                {/* Attachments Dropdown */}
                <div className="relative" data-attachment-dropdown>
                  <button
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="group relative p-1.5 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                    title={attachments.length > 0 ? `${attachments.length} Anhänge` : 'Anhang hinzufügen'}
                  >
                    <Paperclip className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-15deg] ${
                      attachments.length > 0
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--accent)]/60 group-hover:text-[var(--accent)]'
                    }`} />
                    {attachments.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] text-[var(--text-on-accent)] text-[10px] font-bold rounded-full flex items-center justify-center">
                        {attachments.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu with inline URL input */}
                  {showAttachments && (
                    <div
                      data-attachment-dropdown
                      className={`absolute bottom-full left-0 mb-2 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-sm z-50 animate-dropdown dropdown-glow ${
                        isEditingUrl ? 'w-72' : 'w-52'
                      }`}
                    >
                      {/* Web-Link Option - transforms to input */}
                      {isEditingUrl ? (
                        <div className="flex items-center gap-2 px-3 py-2">
                          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <input
                            ref={urlInputRef}
                            type="url"
                            value={inlineUrlInput}
                            onChange={(e) => setInlineUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleInlineUrlSubmit()
                              } else if (e.key === 'Escape') {
                                setIsEditingUrl(false)
                                setInlineUrlInput('')
                              }
                            }}
                            placeholder="example.com"
                            className="input-clean flex-1 bg-transparent border-none outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50"
                            autoFocus
                          />
                          <button
                            onClick={handleInlineUrlSubmit}
                            className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-110 transition-transform"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setIsEditingUrl(true)
                            setTimeout(() => urlInputRef.current?.focus(), 50)
                          }}
                          className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--accent)]/10 transition-all duration-200 rounded-lg mx-1 hover:mx-0 hover:px-4"
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <div className="relative w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all duration-300 group-hover:scale-110">
                            <svg
                              className="w-4 h-4 text-[var(--accent)] transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-110"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium group-hover:text-[var(--accent)] transition-colors">Web-Link</span>
                            <span className="text-[10px] text-[var(--text-muted)]">URL einfügen</span>
                          </div>
                          <svg className="w-4 h-4 ml-auto text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}

                      {/* Divider - hidden when editing */}
                      {!isEditingUrl && <div className="my-1 mx-3 h-px bg-[var(--border)]/50" />}

                      {/* PDF/Text Option (disabled) - hidden when editing */}
                      {!isEditingUrl && (
                        <div
                          className="group w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--text-muted)] cursor-not-allowed rounded-lg mx-1"
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <div className="relative w-8 h-8 shrink-0 rounded-lg bg-[var(--border)]/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium truncate">PDF / Text</span>
                            <span className="text-[10px] truncate">Datei hochladen</span>
                          </div>
                          <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium border border-[var(--accent)]/20">
                            bald ✨
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                      ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/25'
                      : 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-110 hover:-rotate-2 active:scale-95'
                  }`}
                  style={{
                    boxShadow: isLoading ? undefined : '0 0 15px var(--accent-glow)',
                  }}
                  aria-label={isLoading ? 'Abbrechen' : 'Senden'}
                >
                  {isLoading ? (
                    <Square className="w-4 h-4 fill-current" />
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

            {/* Footer - hidden on mobile/tablet */}
            <div className="hidden lg:flex items-center gap-1.5 mt-2 pt-2 border-t border-[var(--border)]/30 text-[10px] text-[var(--text-muted)]">
              <kbd className="px-1 py-0.5 bg-[var(--border)]/50 rounded text-[9px] font-mono">Shift+Enter</kbd>
              <span>neue Zeile</span>
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }

  // Floating bubble mode
  return (
    <>
      {/* Mobile backdrop — blur unter Header, Footer darf mit geblurrt werden */}
      {isOpen && (
        <div
          className="fixed top-[77px] bottom-0 left-0 right-0 md:hidden bg-black/40 backdrop-blur-md z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
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
      {/* Top: 148px (header + filterbar), Bottom: 96px (kiwi button area) */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed top-[77px] bottom-[96px] left-0 right-0 md:inset-auto md:top-[148px] md:bottom-[96px] md:left-auto md:right-6 md:w-[420px] md:max-w-[420px] transition-all duration-300 origin-bottom-right"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          <div
            className="relative flex flex-col h-full rounded-t-2xl md:rounded-3xl border-t md:border shadow-2xl backdrop-blur-xl overflow-hidden"
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
                  className="p-1.5 rounded-full hover:bg-[var(--border)] transition-all duration-200 hover:scale-110 active:scale-95"
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

            {/* Attachment Chips */}
            {attachments.length > 0 && (
              <div className="mx-4 mb-2 flex flex-wrap gap-1.5">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs"
                  >
                    <svg className="w-3 h-3 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-[var(--text)] max-w-[120px] truncate">{attachment.title}</span>
                    <button
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                      className="p-0.5 rounded-full hover:bg-[var(--accent)]/20 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mx-4 mb-2 px-3 py-2 text-sm text-[var(--text-muted)] italic rounded-lg bg-[var(--accent)]/5 border border-[var(--border)]/30 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
                Transkribiere...
              </div>
            )}

            {/* Input Section - styled like example component */}
            <div className="relative overflow-hidden rounded-xl mx-4 mb-2 bg-[var(--border)]/20">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={maxChars}
                className="chat-textarea w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-[var(--text)] placeholder-[var(--text-muted)]"
                placeholder={isLoading ? "Tippe weiter oder Enter zum Abbrechen..." : "Was möchtest du wissen?"}
                style={{ minHeight: '44px', maxHeight: '120px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/10 to-transparent pointer-events-none rounded-xl"
              />
            </div>

            {/* Controls Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {/* Voice Button with animated bars */}
                    <VoiceInputButton
                      isRecording={isRecording}
                      isProcessing={isProcessing}
                      isSupported={isVoiceSupported}
                      onToggle={toggleRecording}
                      audioLevels={audioLevels}
                    />

                    {/* Attachments Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAttachments(!showAttachments)}
                        className="group relative p-1.5 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                        title={attachments.length > 0 ? `${attachments.length} Anhänge` : 'Anhang hinzufügen'}
                      >
                        <Paperclip className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-15deg] ${
                          attachments.length > 0
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--accent)]/60 group-hover:text-[var(--accent)]'
                        }`} />
                        {attachments.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] text-[var(--text-on-accent)] text-[10px] font-bold rounded-full flex items-center justify-center">
                            {attachments.length}
                          </span>
                        )}
                      </button>

                      {/* Dropdown Menu with inline URL input */}
                      {showAttachments && (
                        <div
                          data-attachment-dropdown
                          className={`absolute bottom-full left-0 mb-2 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-sm z-50 animate-dropdown dropdown-glow ${
                            isEditingUrl ? 'w-72' : 'w-52'
                          }`}
                        >
                          {/* Web-Link Option - transforms to input */}
                          {isEditingUrl ? (
                            <div className="flex items-center gap-2 px-3 py-2">
                              <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                              <input
                                type="url"
                                value={inlineUrlInput}
                                onChange={(e) => setInlineUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineUrlSubmit()
                                  } else if (e.key === 'Escape') {
                                    setIsEditingUrl(false)
                                    setInlineUrlInput('')
                                  }
                                }}
                                placeholder="example.com"
                                className="input-clean flex-1 bg-transparent border-none outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50"
                                autoFocus
                              />
                              <button
                                onClick={handleInlineUrlSubmit}
                                className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-110 transition-transform"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setIsEditingUrl(true)
                              }}
                              className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--accent)]/10 transition-all duration-200 rounded-lg mx-1 hover:mx-0 hover:px-4"
                              style={{ width: 'calc(100% - 8px)' }}
                            >
                              <div className="relative w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all duration-300 group-hover:scale-110">
                                <svg
                                  className="w-4 h-4 text-[var(--accent)] transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-110"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium group-hover:text-[var(--accent)] transition-colors">Web-Link</span>
                                <span className="text-[10px] text-[var(--text-muted)]">URL einfügen</span>
                              </div>
                              <svg className="w-4 h-4 ml-auto text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}

                          {/* Divider - hidden when editing */}
                          {!isEditingUrl && <div className="my-1 mx-3 h-px bg-[var(--border)]/50" />}

                          {/* PDF/Text Option (disabled) - hidden when editing */}
                          {!isEditingUrl && (
                            <div
                              className="group w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--text-muted)] cursor-not-allowed rounded-lg mx-1"
                              style={{ width: 'calc(100% - 8px)' }}
                            >
                              <div className="relative w-8 h-8 shrink-0 rounded-lg bg-[var(--border)]/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="font-medium truncate">PDF / Text</span>
                                <span className="text-[10px] truncate">Datei hochladen</span>
                              </div>
                              <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium border border-[var(--accent)]/20">
                                bald ✨
                              </span>
                            </div>
                          )}
                        </div>
                      )}
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
                        ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/25'
                        : 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-110 hover:-rotate-2 active:scale-95'
                    }`}
                    style={{
                      boxShadow: isLoading ? undefined : '0 10px 15px -3px rgba(0,0,0,0.1), 0 0 0 0 var(--accent-glow)',
                    }}
                    aria-label={isLoading ? 'Abbrechen' : 'Senden'}
                  >
                    {isLoading ? (
                      <Square className="w-4 h-4 fill-current" />
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

              {/* Footer Info - hidden on mobile/tablet */}
              <div className="hidden lg:flex items-center gap-1.5 mt-2 pt-2 border-t border-[var(--border)]/30 text-[10px] text-[var(--text-muted)]">
                <kbd className="px-1 py-0.5 bg-[var(--border)]/50 rounded text-[9px] font-mono">Shift+Enter</kbd>
                <span>neue Zeile</span>
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

      {/* Voice Error Toast */}
      {voiceError && (
        <div className="fixed bottom-28 right-4 md:right-6 z-50 px-4 py-3 bg-red-500/90 text-white text-sm rounded-xl shadow-lg animate-in slide-in-from-bottom-2 max-w-xs">
          {voiceError}
        </div>
      )}

      {/* URL Input Modal */}
      <UrlInputModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onExtracted={(extracted) => {
          const newAttachment: Attachment = {
            id: crypto.randomUUID(),
            type: 'url',
            ...extracted,
          }
          setAttachments(prev => [...prev, newAttachment])
          setShowAttachments(true)
        }}
      />
    </div>
    </>
  )
}
