'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from '@genai/ui'
import { useTheme } from '@/components/ThemeProvider'
import { AccountMenu } from '@/components/layout/AccountMenu'
import type { ChatMode } from '@/lib/types'

const navLinks = [
  { label: 'Tools', href: 'https://tools.generation-ai.org', key: 'tools' },
  { label: 'Events', href: 'https://generation-ai.org/events', key: 'events' },
  { label: 'Community', href: 'https://generation-ai.org/community', key: 'community' },
] as const

const partnerSubItems = [
  { label: 'Unternehmen', href: 'https://generation-ai.org/partner?typ=unternehmen' },
  { label: 'Stiftungen', href: 'https://generation-ai.org/partner?typ=stiftungen' },
  { label: 'Hochschulen', href: 'https://generation-ai.org/partner?typ=hochschulen' },
  { label: 'Initiativen', href: 'https://generation-ai.org/partner?typ=initiativen' },
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
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <a href="https://generation-ai.org" className="flex min-w-0 items-center justify-self-start" aria-label="Generation AI - Startseite">
            <Logo context="header" theme={theme} size="lg" interactive />
          </a>

          <div
            aria-label="Tools-App Hauptnavigation"
            className="hidden items-center gap-1 md:flex"
            data-tools-nav="desktop"
          >
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                data-nav-item={link.key}
                className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] transition-colors duration-150 hover:text-[var(--text-on-header-hover)]"
              >
                {link.label}
              </a>
            ))}

            <div className="group relative flex items-center">
              <a
                href="https://generation-ai.org/partner"
                data-nav-item="partner"
                className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] transition-colors duration-150 hover:text-[var(--text-on-header-hover)]"
              >
                Für Partner
              </a>
              <button
                type="button"
                aria-label="Partnertypen-Untermenü öffnen"
                className="-ml-1 p-1.5 text-[var(--text-on-header)] transition-colors duration-150 hover:text-[var(--text-on-header-hover)]"
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 min-w-44 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-xl">
                  <p className="px-3 pb-1 pt-2 text-xs font-mono uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Für Partner
                  </p>
                  {partnerSubItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--text)] transition-colors duration-150 hover:bg-[var(--accent-soft)]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://generation-ai.org/about"
              data-nav-item="about"
              className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] transition-colors duration-150 hover:text-[var(--text-on-header-hover)]"
            >
              Über uns
            </a>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2">
            {openSearch && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  openSearch()
                }}
                className={`group hidden min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm font-mono text-white transition-[background-color,transform,color] duration-300 hover:scale-[1.03] md:inline-flex ${
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
                <kbd className="hidden rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/75 2xl:inline">
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
              <div className="hidden items-center gap-3 md:flex">
                <a
                  href="https://generation-ai.org/join?utm_source=tools"
                  data-cta="primary-register"
                  className="whitespace-nowrap rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-mono font-bold text-[var(--text-on-accent)] transition-opacity duration-150 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Jetzt beitreten
                </a>
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
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white md:hidden"
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
          className="absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-[var(--bg-header)] shadow-xl md:hidden"
        >
          <nav aria-label="Hauptnavigation mobil" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                data-nav-item={link.key}
                aria-current={link.key === 'tools' ? 'page' : undefined}
                onClick={() => setMobileNavOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm font-mono transition-colors duration-150 ${
                  link.key === 'tools'
                    ? 'bg-white/10 font-bold text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}

            <a
              href="https://generation-ai.org/partner"
              data-nav-item="partner"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-white"
            >
              Für Partner
            </a>
            <a
              href="https://generation-ai.org/about"
              data-nav-item="about"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-white"
            >
              Über uns
            </a>

            {mode === 'public' ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
                {openSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false)
                      openSearch()
                    }}
                    className="rounded-xl px-3 py-3 text-left text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    Suche öffnen
                  </button>
                )}
                <a
                  href="https://generation-ai.org/join?utm_source=tools"
                  data-cta="mobile-primary-register"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-mono font-bold text-[var(--text-on-accent)] transition-opacity duration-150 hover:opacity-90"
                >
                  Jetzt beitreten
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
                {openSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false)
                      openSearch()
                    }}
                    className="block w-full rounded-xl px-3 py-3 text-left text-sm font-mono text-white/80 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    Suche öffnen
                  </button>
                )}
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
