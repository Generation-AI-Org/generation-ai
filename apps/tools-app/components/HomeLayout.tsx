'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import CardGrid from '@/components/library/CardGrid'
import FilterBar from '@/components/library/FilterBar'
import { useAuth } from '@/components/AuthProvider'
import {
  useHighlightContext,
  useSearchContext,
} from '@/components/layout/GlobalLayout'
import type { ContentItemMeta, ChatMode } from '@/lib/types'

interface HomeLayoutProps {
  items: ContentItemMeta[]
}

export default function HomeLayout({ items }: HomeLayoutProps) {
  const { user } = useAuth()
  const mode: ChatMode = user ? 'member' : 'public'

  const { highlightedSlugs, setHighlightedSlugs } = useHighlightContext()
  const searchCtx = useSearchContext()

  const [activeFilter, setActiveFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter items by search query
  const searchedItems = searchQuery
    ? items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : []

  // Reset selection when search query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Open-search handler (stable identity via useCallback for context registration)
  const openSearch = useCallback(() => {
    setShowSearch(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [])

  // Register openSearch with GlobalLayout header
  useEffect(() => {
    if (!searchCtx) return
    searchCtx.registerOpenSearch(openSearch)
    return () => {
      searchCtx.registerOpenSearch(null)
    }
  }, [searchCtx, openSearch])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
        setSelectedIndex(0)
        // Clear any highlighted cards
        setHighlightedSlugs([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openSearch, setHighlightedSlugs])

  // Handle search input keyboard navigation
  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, searchedItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && searchedItems[selectedIndex]) {
      e.preventDefault()
      window.location.href = `/${searchedItems[selectedIndex].slug}`
    }
  }

  return (
    <>
      {/* Search Overlay */}
      {showSearch && (
        <div
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] md:pt-[20vh] animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="w-full max-w-lg mx-4 animate-[popIn_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-bg-card rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
                <svg className="w-5 h-5 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Tool suchen..."
                  aria-label="Tool suchen"
                  className="input-clean flex-1 bg-transparent text-text placeholder:text-text-muted outline-none text-base"
                />
                <kbd className="text-xs px-2.5 py-1 rounded-full bg-[var(--border)] text-text-muted font-mono">ESC</kbd>
              </div>
              {searchQuery && (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchedItems.map((item, index) => (
                    <a
                      key={item.id}
                      href={`/${item.slug}`}
                      className={`group flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                        index === selectedIndex
                          ? 'bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]'
                          : 'hover:bg-[var(--accent)]/5 hover:pl-5'
                      }`}
                      onClick={() => setShowSearch(false)}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-sm transition-transform duration-200 ${
                        index === selectedIndex ? 'scale-110' : 'group-hover:scale-105'
                      }`}>
                        {item.title[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-text font-medium text-sm">{item.title}</p>
                        <p className="text-text-muted text-xs">{item.category}</p>
                      </div>
                      {index === selectedIndex && (
                        <kbd className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--border)] text-text-muted font-mono">Enter</kbd>
                      )}
                    </a>
                  ))}
                  {searchedItems.length === 0 && (
                    <p className="px-4 py-6 text-center text-text-muted text-sm">Keine Tools gefunden</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className="flex flex-col flex-1 overflow-hidden"
        onClick={(e) => {
          // Clear highlights on any click outside of highlighted cards
          const card = (e.target as HTMLElement).closest('[data-card]')
          if (!card) {
            // Clicked on empty space, filterbar, etc.
            setHighlightedSlugs([])
          } else {
            // Clicked on a card - check if it's highlighted
            const slug = card.getAttribute('data-slug')
            if (!slug || !highlightedSlugs.includes(slug)) {
              // Clicked on non-highlighted card - clear highlights
              setHighlightedSlugs([])
            }
          }
        }}
      >
        <FilterBar active={activeFilter} onChange={setActiveFilter} mode={mode} />
        <div className="flex-1 overflow-y-auto">
          <CardGrid
            items={items}
            highlightedSlugs={highlightedSlugs}
            activeFilter={activeFilter}
          />
        </div>
      </div>
    </>
  )
}
