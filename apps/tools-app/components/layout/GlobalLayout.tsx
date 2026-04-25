'use client'

// ─────────────────────────────────────────────────────────────────────────────
// MIRROR: apps/website/components/layout/header.tsx
// Phase 22.6 (Decision B-08): Nav structure & right-side CTAs are duplicated
// from the website header. When updating one, update the other manually.
// Future: extract to @genai/ui (Backlog Phase 28+).
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@genai/ui'
import { useTheme } from '@/components/ThemeProvider'
import { useChatContext } from '@/components/layout/ChatContextProvider'
import type { ChatMode } from '@/lib/types'

// Lazy load chat - not needed for initial render, reduces bundle
const FloatingChat = dynamic(() => import('@/components/chat/FloatingChat'), {
  ssr: false,
})

// ---------------------------------------------------------------------------
// HighlightContext — exposes highlightedSlugs + setter to HomeLayout (CardGrid)
// ---------------------------------------------------------------------------
interface HighlightContextValue {
  highlightedSlugs: string[]
  setHighlightedSlugs: (slugs: string[]) => void
}

const HighlightContext = createContext<HighlightContextValue | null>(null)

export function useHighlightContext(): HighlightContextValue {
  const ctx = useContext(HighlightContext)
  if (!ctx) {
    // Fallback no-op on routes without HighlightContext (shouldn't happen
    // inside GlobalLayout children, but keeps hook safe to call).
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[GlobalLayout] useHighlightContext called outside provider — returning no-op.')
    }
    return { highlightedSlugs: [], setHighlightedSlugs: () => {} }
  }
  return ctx
}

// ---------------------------------------------------------------------------
// SearchContext — HomeLayout registers an `openSearch` callback; the header's
// search button only renders when a consumer has registered.
// ---------------------------------------------------------------------------
interface SearchContextValue {
  openSearch: (() => void) | null
  registerOpenSearch: (fn: (() => void) | null) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearchContext(): SearchContextValue | null {
  return useContext(SearchContext)
}

interface GlobalLayoutProps {
  mode: ChatMode
  children: ReactNode
}

export default function GlobalLayout({ mode, children }: GlobalLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  // chatContext is populated by DetailPageShell (on /[slug]) via ChatContextProvider.
  // On Home/Settings/Legal it stays null → FloatingChat stays in floating/popup mode.
  const { chatContext } = useChatContext()

  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([])
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [openSearch, setOpenSearch] = useState<(() => void) | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const registerOpenSearch = (fn: (() => void) | null) => {
    setOpenSearch(() => fn)
  }

  return (
    <HighlightContext.Provider value={{ highlightedSlugs, setHighlightedSlugs }}>
      <SearchContext.Provider value={{ openSearch, registerOpenSearch }}>
        <div className="flex flex-col h-screen overflow-hidden bg-bg">
          {/* Header */}
          <header
            className="relative flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-header)]"
            onClick={() => setHighlightedSlugs([])}
          >
            <a href="https://generation-ai.org" className="shrink-0 hover:opacity-90 transition-opacity">
              <Logo context="header" theme={theme} size="md" />
            </a>
            <div className="w-px h-6 md:h-7 bg-white/20 hidden md:block" />
            <span className="text-white/90 text-sm md:text-base font-semibold tracking-wide hidden md:block">
              KI-Tools
            </span>

            {/* Desktop nav — Phase 22.6 Plan 09 (Decision B-08): mirrors website header.
                5 items: Events · Tools (active) · Community · Für Partner · Über uns
                Cross-domain links use <a> NOT <Link> (B-05 full page load). */}
            <nav
              aria-label="Hauptnavigation"
              className="hidden md:flex items-center gap-6 ml-6"
              data-tools-nav="desktop"
            >
              <a
                href="https://generation-ai.org/events"
                data-nav-item="events"
                className="font-mono text-[13px] font-medium text-white/70 hover:text-white transition-colors"
              >
                Events
              </a>
              <a
                href="https://tools.generation-ai.org"
                data-nav-item="tools"
                aria-current="page"
                className="font-mono text-[13px] font-bold text-white border-b-2 border-[var(--accent)] pb-0.5"
              >
                Tools
              </a>
              <a
                href="https://generation-ai.org/community"
                data-nav-item="community"
                className="font-mono text-[13px] font-medium text-white/70 hover:text-white transition-colors"
              >
                Community
              </a>
              <a
                href="https://generation-ai.org/partner"
                data-nav-item="partner"
                className="font-mono text-[13px] font-medium text-white/70 hover:text-white transition-colors"
              >
                Für Partner
              </a>
              <a
                href="https://generation-ai.org/about"
                data-nav-item="about"
                className="font-mono text-[13px] font-medium text-white/70 hover:text-white transition-colors"
              >
                Über uns
              </a>
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Mobile Search Button — only rendered when a page has registered an openSearch */}
            {openSearch && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openSearch()
                }}
                className={`group md:hidden p-2.5 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15'
                    : 'bg-black/20 hover:bg-black/25'
                }`}
                aria-label="Suche öffnen"
              >
                <svg className="w-5 h-5 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-12deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Desktop Search Bar — only rendered when a page has registered an openSearch */}
            {openSearch && (
              <div className="relative hidden md:block">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openSearch()
                  }}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm hover:scale-[1.03] ${
                    theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/15 text-white/80'
                      : 'bg-black/20 hover:bg-black/25 text-white'
                  }`}
                >
                  <svg className="w-4 h-4 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-12deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden lg:inline">Suche</span>
                  <kbd className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-black/15'
                  }`}>⌘K</kbd>
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleTheme()
              }}
              className={`group p-2.5 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-105 active:scale-95 ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/15'
                  : 'bg-black/20 hover:bg-black/25'
              }`}
              aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110 group-active:rotate-45 group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-110 group-active:rotate-[-20deg] group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Logged-out: Primary CTA "Kostenlos registrieren" + Secondary "Bereits Mitglied? Einloggen"
                Phase 22.6 Plan 07 (Decision B-03 + B-11): replaces the old single icon-button.
                - Primary: cross-domain <a> (full page load, B-05) with hardcoded utm_source=tools (B-11).
                - Secondary: internal <Link href="/login"> (tools-app route).
                - Mobile burger sheet overhaul deferred to Plan 09; for V1 the secondary link hides on
                  very narrow screens (<sm) to keep the header from wrapping.
            */}
            {mode === 'public' ? (
              <div className="flex items-center gap-3">
                <a
                  href="https://generation-ai.org/join?utm_source=tools"
                  data-cta="primary-register"
                  className="bg-[var(--accent)] text-[var(--text-on-accent)] font-mono font-bold text-sm rounded-full px-4 py-2.5 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03] transition-all duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] whitespace-nowrap"
                >
                  Kostenlos registrieren
                </a>
                <Link
                  href="/login"
                  data-cta="secondary-login"
                  className="hidden sm:inline-block font-mono text-[12px] text-text-muted hover:text-text transition-colors whitespace-nowrap"
                >
                  Bereits Mitglied? Einloggen
                </Link>
              </div>
            ) : (
              <>
                {/* Settings - use <a> to bypass router cache */}
                <a
                  href="/settings"
                  className={`group md:hidden p-2.5 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/15'
                      : 'bg-black/20 hover:bg-black/25'
                  }`}
                  aria-label="Einstellungen"
                >
                  <svg className="w-5 h-5 text-white transition-transform duration-500 group-hover:rotate-90 group-active:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </a>

                <form action="/auth/signout" method="POST" className="md:hidden">
                  <button
                    type="submit"
                    className={`group p-2.5 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-105 active:scale-95 ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-red-500/20'
                        : 'bg-black/20 hover:bg-red-500/20'
                    }`}
                    aria-label="Abmelden"
                  >
                    <svg className="w-5 h-5 text-white group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                  </button>
                </form>
              </>
            )}

            {/* Legal Links - Desktop only, visible in header */}
            <div className="hidden lg:flex items-center gap-3 ml-2 text-xs text-white/70">
              <Link href="/impressum" className="hover:text-white/80 transition-colors">
                Impressum
              </Link>
              <span>|</span>
              <Link href="/datenschutz" className="hover:text-white/80 transition-colors">
                Datenschutz
              </Link>
            </div>

            {/* Mobile burger toggle — Phase 22.6 Plan 09 (Decision B-08).
                Visible on mobile only. Opens panel with 5 nav-items + (logged-out only) CTAs. */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMobileNavOpen((v) => !v)
              }}
              aria-label={mobileNavOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={mobileNavOpen}
              data-tools-burger
              className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {/* Mobile nav panel — anchored to header (relative). */}
            {mobileNavOpen && (
              <div
                data-tools-nav="mobile"
                onClick={(e) => e.stopPropagation()}
                className="md:hidden absolute top-full left-0 right-0 bg-[var(--bg-header)] border-b border-[var(--border)] shadow-lg z-50"
              >
                <nav
                  aria-label="Hauptnavigation mobil"
                  className="flex flex-col p-4 gap-1"
                >
                  <a
                    href="https://generation-ai.org/events"
                    onClick={() => setMobileNavOpen(false)}
                    className="font-mono text-sm text-white/80 hover:text-white px-2 py-3 rounded-md hover:bg-white/5 transition-colors"
                  >
                    Events
                  </a>
                  <a
                    href="https://tools.generation-ai.org"
                    aria-current="page"
                    onClick={() => setMobileNavOpen(false)}
                    className="font-mono text-sm text-white font-bold px-2 py-3 rounded-md bg-white/5 transition-colors"
                  >
                    Tools
                  </a>
                  <a
                    href="https://generation-ai.org/community"
                    onClick={() => setMobileNavOpen(false)}
                    className="font-mono text-sm text-white/80 hover:text-white px-2 py-3 rounded-md hover:bg-white/5 transition-colors"
                  >
                    Community
                  </a>
                  <a
                    href="https://generation-ai.org/partner"
                    onClick={() => setMobileNavOpen(false)}
                    className="font-mono text-sm text-white/80 hover:text-white px-2 py-3 rounded-md hover:bg-white/5 transition-colors"
                  >
                    Für Partner
                  </a>
                  <a
                    href="https://generation-ai.org/about"
                    onClick={() => setMobileNavOpen(false)}
                    className="font-mono text-sm text-white/80 hover:text-white px-2 py-3 rounded-md hover:bg-white/5 transition-colors"
                  >
                    Über uns
                  </a>

                  {/* Logged-out CTAs in mobile menu (no CTAs when logged-in). */}
                  {mode === 'public' && (
                    <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-white/10">
                      <a
                        href="https://generation-ai.org/join?utm_source=tools"
                        onClick={() => setMobileNavOpen(false)}
                        className="bg-[var(--accent)] text-[var(--text-on-accent)] font-mono font-bold text-sm rounded-full px-4 py-2.5 text-center hover:shadow-[0_0_20px_var(--accent-glow)] transition-all"
                      >
                        Kostenlos registrieren
                      </a>
                      <Link
                        href="/login"
                        onClick={() => setMobileNavOpen(false)}
                        className="font-mono text-xs text-white/70 hover:text-white text-center py-2"
                      >
                        Bereits Mitglied? Einloggen
                      </Link>
                    </div>
                  )}
                </nav>
              </div>
            )}
          </header>

          {/* Main Content — children provide route-specific content */}
          <main
            id="main-content"
            className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
              isChatExpanded
                ? chatContext
                  ? 'lg:mr-[400px]'
                  : 'md:mr-[35%]'
                : ''
            }`}
          >
            {children}
          </main>

          {/* Floating Chat - always rendered, handles its own expand state */}
          <FloatingChat
            onHighlight={setHighlightedSlugs}
            onExpandChange={setIsChatExpanded}
            mode={mode}
            context={chatContext ?? undefined}
          />
        </div>
      </SearchContext.Provider>
    </HighlightContext.Provider>
  )
}
