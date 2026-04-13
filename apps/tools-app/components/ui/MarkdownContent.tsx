'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
}

// XSS-safe content rendering via react-markdown (per D-11)
export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-text mt-8 mb-3 first:mt-0 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-text mt-8 mb-2 first:mt-0 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-text mt-6 mb-2 tracking-tight">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-text-secondary text-[13px] leading-relaxed mb-3">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-3 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex gap-2 items-start py-0.5">
              <span className="text-[var(--accent)] mt-1.5 shrink-0 text-[8px]">▸</span>
              <span className="text-text-secondary text-[13px] leading-relaxed">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-secondary">{children}</em>
          ),
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
          code: ({ children }) => (
            <code className="bg-[var(--border)] px-1.5 py-0.5 rounded text-xs font-mono text-text">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-[var(--border)] p-4 rounded-lg overflow-x-auto my-4 text-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--accent)] pl-4 py-1 my-4 bg-[var(--accent-soft)] rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="border-[var(--border)] my-6" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
