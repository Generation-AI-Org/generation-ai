'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export function AccountMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <button
        type="button"
        aria-label="Account-Menü öffnen"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-mono font-bold text-white transition-[background-color,transform,color] duration-300 hover:scale-[1.03] hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--text-on-accent)]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21a8 8 0 10-16 0" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        </span>
        <span>Account</span>
        <svg
          className={`h-4 w-4 text-white/70 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-xl"
        >
          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--text)] transition-colors duration-150 hover:bg-[var(--accent-soft)]"
            onClick={() => setOpen(false)}
          >
            <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.8 1.8 0 00.36 1.98l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.8 1.8 0 0015 19.4a1.8 1.8 0 00-1 1.62V21a2 2 0 01-4 0v-.08A1.8 1.8 0 009 19.4a1.8 1.8 0 00-1.98.36l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.8 1.8 0 004.6 15a1.8 1.8 0 00-1.62-1H3a2 2 0 010-4h.08A1.8 1.8 0 004.6 9a1.8 1.8 0 00-.36-1.98l-.06-.06a2 2 0 112.83-2.83l.06.06A1.8 1.8 0 009 4.6a1.8 1.8 0 001-1.62V3a2 2 0 014 0v.08A1.8 1.8 0 0015 4.6a1.8 1.8 0 001.98-.36l.06-.06a2 2 0 112.83 2.83l-.06.06A1.8 1.8 0 0019.4 9a1.8 1.8 0 001.62 1H21a2 2 0 010 4h-.08A1.8 1.8 0 0019.4 15z" />
            </svg>
            Einstellungen
          </Link>
          <a
            href="https://community.generation-ai.org"
            role="menuitem"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--text)] transition-colors duration-150 hover:bg-[var(--accent-soft)]"
            onClick={() => setOpen(false)}
          >
            <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 21v-2a4 4 0 00-3-3.87" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Community öffnen
          </a>
          <div className="my-1 h-px bg-[var(--border)]" />
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-mono text-[var(--status-error)] transition-colors duration-150 hover:bg-[var(--status-error)]/10"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              Abmelden
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
