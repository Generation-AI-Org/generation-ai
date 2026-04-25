'use client'

// apps/website/components/test/sparring-slot.tsx
// Phase 24 — Placeholder "PRISMA" chat slot with forward-compatible props.
// mode: 'live' falls back to placeholder until future phase wires real backend.

import Link from 'next/link'
import type { Dimension, Level } from '@/lib/assessment/types'

export interface SparringSlotProps {
  level: Level
  skills: Record<Dimension, number>
  mode: 'placeholder' | 'live'
  className?: string
}

const PLACEHOLDER_MESSAGE =
  'PRISMA ist deine KI-Sparring-Partner:in auf deinem Lernweg — sie kommt bald. Schau dir bis dahin die Empfehlungen an, oder tritt bei und sei dabei, wenn sie live geht.'

export function SparringSlot(props: SparringSlotProps) {
  // Live mode is not yet implemented — fall back safely.
  return <SparringSlotPlaceholder {...props} />
}

function SparringSlotPlaceholder({ className }: SparringSlotProps) {
  return (
    <div
      className={[
        'mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header strip */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
        <div
          className="h-7 w-7 rounded-full"
          style={{
            background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-pink))',
          }}
          aria-hidden
        />
        <span className="font-mono text-sm font-bold text-[var(--text)]">PRISMA</span>
        <span className="ml-auto rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-xs font-bold tracking-[0.08em] text-[var(--text-muted)]">
          Kommt bald
        </span>
      </div>

      {/* Message area */}
      <div className="flex max-h-[240px] min-h-[160px] flex-col gap-3 p-4">
        <div className="max-w-[85%] self-start rounded-xl rounded-tl-none bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-sm leading-[1.65] text-[var(--text)]">{PLACEHOLDER_MESSAGE}</p>
        </div>
        <Link
          href="/join?source=test-sparring"
          className="self-start font-mono text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
        >
          Jetzt beitreten →
        </Link>
      </div>

      {/* Disabled input */}
      <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3 opacity-50">
        <input
          type="text"
          placeholder="Chat mit PRISMA kommt bald…"
          disabled
          aria-disabled="true"
          className="flex-1 cursor-not-allowed rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          title="Verfügbar nach Live-Schaltung von PRISMA"
        />
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="cursor-not-allowed rounded-full bg-[var(--accent)] px-4 py-2 font-mono text-sm font-bold text-[var(--text-on-accent)] opacity-40"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
