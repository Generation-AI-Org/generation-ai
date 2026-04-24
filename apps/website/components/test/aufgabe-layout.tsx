'use client'

// apps/website/components/test/aufgabe-layout.tsx
// Phase 24 — Compact full-screen layout for /test/aufgabe/[n].
// Header strip with progress bar, centered content, footer with Nächste-Aufgabe button.

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface AufgabeLayoutProps {
  /** 0-based index of the current question */
  questionIndex: number
  totalQuestions: number
  onNext: () => void
  nextDisabled: boolean
  children: ReactNode
  /** Optional slot rendered as an absolute overlay scoped to the header strip (h-14). */
  checkpointSlot?: ReactNode
}

export function AufgabeLayout({
  questionIndex,
  totalQuestions,
  onNext,
  nextDisabled,
  children,
  checkpointSlot,
}: AufgabeLayoutProps) {
  const percent = ((questionIndex + 1) / totalQuestions) * 100
  const humanLabel = `Aufgabe ${questionIndex + 1}/${totalQuestions}`

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--bg)]">
      {/* Checkpoint slot — absolutely positioned over the header strip (h-14 scope). */}
      {checkpointSlot}
      {/* Header strip — compact, no main-site <Header/> per UI-SPEC */}
      <header
        className="flex h-14 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)] px-4 sm:px-8"
        role="banner"
      >
        <Link
          href="/test"
          className="hidden items-center gap-2 text-sm text-[var(--text)] hover:text-[var(--accent)] sm:inline-flex"
          aria-label="Zurück zum Test-Start"
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.15em]">
            GenAI
          </span>
        </Link>
        <div className="mx-auto w-full max-w-xs flex-1">
          <Progress
            value={percent}
            className="h-1"
            aria-label={`Aufgabe ${questionIndex + 1} von ${totalQuestions}`}
          />
          <span className="sr-only" aria-live="polite">
            Aufgabe {questionIndex + 1} von {totalQuestions}
          </span>
        </div>
        <span className="font-mono text-sm text-[var(--text-muted)]">{humanLabel}</span>
      </header>

      {/* Main — relative so CheckpointCelebration can absolutely overlay */}
      <main
        id="main-content"
        className="relative flex w-full flex-1 flex-col"
      >
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</div>
      </main>

      {/* Footer — Nächste Aufgabe */}
      <footer className="flex h-20 items-center justify-end border-t border-[var(--border)] px-4 sm:px-8">
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          aria-disabled={nextDisabled}
          title={nextDisabled ? 'Beantworte zuerst diese Aufgabe' : undefined}
          className={cn(
            'min-h-[48px] rounded-full px-8 py-3 font-mono text-sm font-bold tracking-[0.02em]',
            'bg-[var(--accent)] text-[var(--text-on-accent)]',
            'transition-all duration-150',
            'hover:scale-[1.02] hover:shadow-[0_0_20px_var(--accent-glow)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'disabled:hover:scale-100 disabled:hover:shadow-none',
          )}
        >
          Nächste Aufgabe
        </button>
      </footer>
    </div>
  )
}
