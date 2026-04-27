'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@genai/ui'
import { useTheme } from '@/components/ThemeProvider'
import { AccountMenu } from '@/components/layout/AccountMenu'
import type { ChatMode } from '@/lib/types'

const navLinks = [
  { label: 'Tools', href: 'https://tools.generation-ai.org', key: 'tools', active: true },
  { label: 'Events', href: 'https://generation-ai.org/events', key: 'events', active: false },
  { label: 'Community', href: 'https://generation-ai.org/community', key: 'community', active: false },
  { label: 'Für Partner', href: 'https://generation-ai.org/partner', key: 'partner', active: false },
  { label: 'Über uns', href: 'https://generation-ai.org/about', key: 'about', active: false },
] as const

interface ToolsHeaderProps {
  mode: ChatMode
  openSearch: (() => void) | null
  onClearHighlights: () => void
}

export function ToolsHeader({ mode, openSearch, onClearHighlights }: ToolsHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!mobileNavOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileNavOpen])

  return (
    <header
      className="relative shrink-0 border-b border-white/10 bg-[var(--bg-header)]"
      onClick={onClearHighlights}
    >
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>

      <nav aria-label="Hauptnavigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <a href="https://generation-ai.org" className="flex shrink-0 items-center" aria-label="Generation AI - Startseite">
            <Logo context="header" theme={theme} size="lg" interactive />
          </a>

          <div
            aria-label="Tools-App Hauptnavigation"
            className="hidden items-center gap-1 xl:flex"
            data-tools-nav="desktop"
          >
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                data-nav-item={link.key}
                aria-current={link.active ? 'page' : undefined}
                className={`relative px-3 py-2 text-sm font-mono transition-colors duration-150 ${
                  link.active
                    ? 'font-bold text-[var(--text-on-header-hover)]'
                    : 'font-medium text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)]'
                }`}
              >
                {link.label}
                {link.active && (
                  <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {openSearch && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  openSearch()
                }}
                className={`group hidden min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm font-mono text-white transition-[background-color,transform,color] duration-300 hover:scale-[1.03] xl:inline-flex ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15'
                    : 'bg-black/20 hover:bg-black/25'
                }`}
                aria-label="Suche öffnen"
              >
                <svg className="h-4 w-4 text-[var(--accent)] transition-transform duration-300 group-hover:rotate-[-12deg] group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden xl:inline">Suche</span>
                <kbd className="hidden rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/75 xl:inline">
                  ⌘K
                </kbd>
              </button>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                toggleTheme()
              }}
              className={`group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 transition-[background-color,transform] duration-300 hover:scale-105 active:scale-[0.96] ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/15'
                  : 'bg-black/20 hover:bg-black/25'
              }`}
              aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110 group-active:rotate-45 group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-110 group-active:rotate-[-20deg] group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {mode === 'public' ? (
              <div className="hidden items-center gap-3 xl:flex">
                <a
                  href="https://generation-ai.org/join?utm_source=tools"
                  data-cta="primary-register"
                  className="whitespace-nowrap rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-mono font-bold text-[var(--text-on-accent)] transition-[box-shadow,transform,background-color] duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Kostenlos Mitglied werden
                </a>
                <Link
                  href="/login"
                  data-cta="secondary-login"
                  className="whitespace-nowrap text-xs font-mono text-white/75 transition-colors duration-150 hover:text-white"
                >
                  Einloggen
                </Link>
              </div>
            ) : (
              <AccountMenu />
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setMobileNavOpen((value) => !value)
              }}
              aria-label={mobileNavOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={mobileNavOpen}
              aria-controls="tools-mobile-nav"
              data-tools-burger
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white xl:hidden"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileNavOpen && (
        <div
          id="tools-mobile-nav"
          data-tools-nav="mobile"
          onClick={(event) => event.stopPropagation()}
          className="absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-[var(--bg-header)] shadow-xl xl:hidden"
        >
          <nav aria-label="Hauptnavigation mobil" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                data-nav-item={link.key}
                aria-current={link.active ? 'page' : undefined}
                onClick={() => setMobileNavOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm font-mono transition-colors duration-150 ${
                  link.active
                    ? 'bg-white/10 font-bold text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}

            {mode === 'public' ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
                <a
                  href="https://generation-ai.org/join?utm_source=tools"
                  data-cta="mobile-primary-register"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-mono font-bold text-[var(--text-on-accent)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98]"
                >
                  Kostenlos Mitglied werden
                </a>
                <Link
                  href="/login"
                  data-cta="mobile-secondary-login"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2 text-center text-xs font-mono text-white/75 transition-colors duration-150 hover:text-white"
                >
                  Bereits Mitglied? Einloggen
                </Link>
              </div>
            ) : (
              <div className="mt-3 border-t border-white/10 pt-4">
                <p className="px-3 pb-2 text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-white/55">
                  Account
                </p>
                <Link
                  href="/settings"
                  onClick={() => setMobileNavOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                >
                  Einstellungen
                </Link>
                <a
                  href="https://community.generation-ai.org"
                  onClick={() => setMobileNavOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                >
                  Community öffnen
                </a>
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-xl px-3 py-3 text-left text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-[var(--status-error)]"
                  >
                    Abmelden
                  </button>
                </form>
              </div>
            )}

            <div className="mt-3 flex gap-4 border-t border-white/10 px-3 pt-4 text-xs font-mono text-white/55">
              <Link href="/impressum" onClick={() => setMobileNavOpen(false)} className="transition-colors duration-150 hover:text-white">
                Impressum
              </Link>
              <Link href="/datenschutz" onClick={() => setMobileNavOpen(false)} className="transition-colors duration-150 hover:text-white">
                Datenschutz
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
