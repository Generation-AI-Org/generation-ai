'use client'

// apps/website/components/test/widgets/option-card.tsx
// Phase 24 — Shared card-style radio button used by CardPickWidget + MCWidget.

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OptionCardProps {
  label: string
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  /** Optional id for testing/ARIA hook-up */
  id?: string
  /** WR-03: roving tabindex from parent radio-group. */
  tabIndex?: number
  /** WR-03: notify parent when this option receives focus. */
  onFocus?: () => void
}

export function OptionCard({
  label,
  selected,
  onSelect,
  disabled,
  id,
  tabIndex,
  onFocus,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      id={id}
      aria-checked={selected}
      disabled={disabled}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'relative min-h-[80px] min-w-[48px] rounded-2xl border p-4 text-left transition-all duration-150',
        'bg-[var(--bg-card)]',
        'hover:border-[var(--border-accent)] hover:bg-[var(--bg-elevated)] hover:scale-[1.015] hover:shadow-[0_0_20px_var(--accent-glow)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100',
        selected
          ? 'border-[var(--border-accent)] bg-[var(--bg-elevated)]'
          : 'border-[var(--border)]',
      )}
    >
      {selected && (
        <Check
          className="absolute top-3 right-3 h-4 w-4 text-[var(--accent)]"
          aria-hidden
        />
      )}
      <span className="block text-base leading-[1.6] text-[var(--text)]">{label}</span>
    </button>
  )
}
