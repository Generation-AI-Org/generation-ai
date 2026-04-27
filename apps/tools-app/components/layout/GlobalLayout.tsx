'use client'

// ─────────────────────────────────────────────────────────────────────────────
// MIRROR: apps/website/components/layout/header.tsx
// Phase 28 keeps Tools-App navigation aligned with the website header while
// preserving app-specific actions such as search, theme, account and chat.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useChatContext } from '@/components/layout/ChatContextProvider'
import { ToolsHeader } from '@/components/layout/ToolsHeader'
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
        <div className="min-h-screen bg-bg">
          <ToolsHeader
            mode={mode}
            openSearch={openSearch}
            onClearHighlights={() => setHighlightedSlugs([])}
          />

          {/* Main Content — children provide route-specific content */}
          <main
            id="main-content"
            className={`min-h-screen pt-20 transition-[margin] duration-300 ${
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
