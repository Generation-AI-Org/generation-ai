'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Link, Loader2, AlertCircle, Check } from 'lucide-react'

interface ExtractedContent {
  title: string
  content: string
  url: string
  excerpt: string
}

interface UrlInputModalProps {
  isOpen: boolean
  onClose: () => void
  onExtracted: (content: ExtractedContent) => void
}

export default function UrlInputModal({ isOpen, onClose, onExtracted }: UrlInputModalProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setUrl('')
      setError(null)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Auto-prepend https:// if no protocol
      let normalizedUrl = url.trim()
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der URL')
      }

      onExtracted(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ups, da ist was schiefgelaufen. Probier's nochmal!")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-semibold text-[var(--text)]">Web-Link hinzufügen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Füge eine URL hinzu, um den Inhalt als Kontext für deine Frage zu nutzen.
          </p>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/artikel"
              className="w-full px-4 py-3 bg-[var(--border)]/30 border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 transition-colors"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)]/50 transition-colors"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Laden...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Hinzufügen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
