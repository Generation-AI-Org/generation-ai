'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
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

  const registerOpenSearch = (fn: (() => void) | null) => {
    setOpenSearch(() => fn)
  }

  return (
    <HighlightContext.Provider value={{ highlightedSlugs, setHighlightedSlugs }}>
      <SearchContext.Provider value={{ openSearch, registerOpenSearch }}>
        <div className="flex flex-col h-screen overflow-hidden bg-bg">
          {/* Header */}
          <header
            className="flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-header)]"
            onClick={() => setHighlightedSlugs([])}
          >
            <a href="https://community.generation-ai.org" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Image
                src={theme === 'dark' ? '/logo-blue-neon-new.jpg' : '/logo-pink-red.jpg'}
                alt="Generation AI"
                width={150}
                height={50}
                className="h-9 md:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
                priority
                key={theme}
              />
            </a>
            <div className="w-px h-6 md:h-7 bg-white/20 hidden md:block" />
            <span className="text-white/90 text-sm md:text-base font-semibold tracking-wide hidden md:block">
              KI-Tools
            </span>

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

            {/* Mobile Login/Logout Button */}
            {mode === 'public' ? (
              <Link
                href="/login"
                className={`group md:hidden p-2.5 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-105 active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/90'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent)]/90'
                }`}
                aria-label="Anmelden"
              >
                <svg className="w-5 h-5 text-[var(--text-on-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
              </Link>
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
