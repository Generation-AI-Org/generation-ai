'use client'

import { useEffect, useRef, memo, useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage } from '@/lib/types'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSourceClick?: (slug: string) => void
}

// XSS-safe markdown rendering via react-markdown (per D-06, D-09)
// Memoized to prevent re-renders when parent updates
const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  // Memoized components object to prevent recreation on every render
  const components: Components = useMemo(() => ({
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
    em: ({ children }) => <em className="text-text-secondary">{children}</em>,
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
    li: ({ children }) => <li className="text-text-secondary">{children}</li>,
    code: ({ children, className }) => {
      const isBlock = className?.includes('language-')
      if (isBlock) {
        return (
          <pre className="bg-[var(--border)] p-3 rounded-lg overflow-x-auto my-2">
            <code className="text-xs font-mono">{children}</code>
          </pre>
        )
      }
      return (
        <code className="bg-[var(--border)] px-1.5 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      )
    },
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--accent)] hover:underline"
      >
        {children}
      </a>
    ),
    h2: ({ children }) => (
      <p className="font-semibold text-text mt-3 mb-1">{children}</p>
    ),
    h3: ({ children }) => (
      <p className="font-medium text-text mt-2 mb-1">{children}</p>
    ),
  }), [])

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
})

export default function MessageList({ messages, isLoading, onSourceClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] md:text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[var(--bg-elevated)] text-text rounded-br-md'
                : 'bg-bg-card border border-[var(--accent)]/20 text-text-secondary rounded-bl-md'
            }`}
          >
            {msg.role === 'assistant' ? <MarkdownContent content={msg.content} /> : msg.content}
            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[var(--border)]/50">
                <span className="text-xs text-text-muted">Quellen:</span>
                {msg.sources.map((source) => (
                  <button
                    key={source.slug}
                    onClick={() => onSourceClick?.(source.slug)}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/10
                               text-[var(--accent)] hover:bg-[var(--accent)]/20
                               transition-colors cursor-pointer"
                  >
                    {source.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-bg-card border border-[var(--accent)]/20 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/70 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/70 animate-bounce [animation-delay:120ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/70 animate-bounce [animation-delay:240ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
