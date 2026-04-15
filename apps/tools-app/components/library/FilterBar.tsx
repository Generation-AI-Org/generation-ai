'use client'

import Link from 'next/link'
import type { ChatMode } from '@/lib/types'

const FILTERS = [
  { label: 'Alle', value: '' },
  { label: 'Texte schreiben', value: 'Texte schreiben' },
  { label: 'Recherche', value: 'Recherche' },
  { label: 'Automation', value: 'Automation' },
  { label: 'Coding', value: 'Coding' },
  { label: 'Präsentationen', value: 'Präsentationen' },
]

interface FilterBarProps {
  active: string
  onChange: (filter: string) => void
  mode?: ChatMode
}

export default function FilterBar({ active, onChange, mode = 'public' }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide border-b border-[var(--border)] bg-bg">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`
            shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-150 cursor-pointer
            ${active === f.value
              ? 'bg-[var(--accent)] text-bg shadow-[0_0_12px_var(--accent-glow)]'
              : 'bg-[var(--border)] text-text-muted hover:bg-[var(--accent)]/10 hover:text-text border border-[var(--border)]'
            }
          `}
        >
          {f.label}
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Login/Settings Button */}
      {mode === 'public' ? (
        <Link
          href="/login"
          className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[0_0_12px_var(--accent-glow)] hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Anmelden</span>
        </Link>
      ) : (
        <Link
          href="/settings"
          className="shrink-0 p-2.5 min-h-[44px] min-w-[44px] rounded-full bg-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--text)] transition-all flex items-center justify-center"
          title="Einstellungen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      )}
    </div>
  )
}
