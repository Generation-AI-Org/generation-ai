'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CardGrid from '@/components/library/CardGrid'
import FilterBar from '@/components/library/FilterBar'
import FloatingChat from '@/components/chat/FloatingChat'
import { useTheme } from '@/components/ThemeProvider'
import type { ContentItemMeta, ChatMode } from '@/lib/types'

interface AppShellProps {
  items: ContentItemMeta[]
  mode: ChatMode
}

export default function AppShell({ items, mode }: AppShellProps) {
  const [highlightedSlugs, setHighlightedSlugs] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggleTheme } = useTheme()

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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
        setSelectedIndex(0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-header)]">
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

        {/* Mobile Search Button */}
        <button
          onClick={() => {
            setShowSearch(true)
            setTimeout(() => searchInputRef.current?.focus(), 50)
          }}
          className={`md:hidden p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-black/20 hover:bg-black/30'
          }`}
          aria-label="Suche öffnen"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Desktop Search Bar */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setShowSearch(!showSearch)
              if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 50)
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-white/70'
                : 'bg-black/20 hover:bg-black/30 text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden lg:inline">Suche</span>
            <kbd className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded font-mono ${
              theme === 'dark' ? 'bg-white/10' : 'bg-black/15'
            }`}>⌘K</kbd>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
            theme === 'dark'
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-black/20 hover:bg-black/30'
          }`}
          aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Legal Links - Desktop only, visible in header */}
        <div className="hidden lg:flex items-center gap-3 ml-2 text-xs text-white/50">
          <Link href="/impressum" className="hover:text-white/80 transition-colors">
            Impressum
          </Link>
          <span>|</span>
          <Link href="/datenschutz" className="hover:text-white/80 transition-colors">
            Datenschutz
          </Link>
        </div>

      </header>

      {/* Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] md:pt-[20vh]" onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-bg-card rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex-1 bg-transparent text-text placeholder:text-text-muted outline-none text-base"
                />
                <kbd className="text-xs px-2 py-1 rounded bg-[var(--border)] text-text-muted font-mono">ESC</kbd>
              </div>
              {searchQuery && (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchedItems.map((item, index) => (
                    <a
                      key={item.id}
                      href={`/${item.slug}`}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        index === selectedIndex
                          ? 'bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]'
                          : 'hover:bg-[var(--border)]'
                      }`}
                      onClick={() => setShowSearch(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-sm">
                        {item.title[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-text font-medium text-sm">{item.title}</p>
                        <p className="text-text-muted text-xs">{item.category}</p>
                      </div>
                      {index === selectedIndex && (
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-text-muted font-mono">Enter</kbd>
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

      {/* Main Content — Full Width Library */}
      <main id="main-content" className="flex flex-col flex-1 overflow-hidden">
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
        <div className="flex-1 overflow-y-auto">
          <CardGrid
            items={items}
            highlightedSlugs={highlightedSlugs}
            activeFilter={activeFilter}
          />
        </div>
      </main>

      {/* Floating Chat */}
      <FloatingChat onHighlight={setHighlightedSlugs} mode={mode} />

      {/* Mobile Legal Footer */}
      <footer className="lg:hidden flex items-center justify-center gap-4 py-2 border-t border-[var(--border)] bg-[var(--bg-header)] text-xs text-text-muted shrink-0">
        <Link href="/impressum" className="hover:text-text transition-colors">
          Impressum
        </Link>
        <span>|</span>
        <Link href="/datenschutz" className="hover:text-text transition-colors">
          Datenschutz
        </Link>
      </footer>
    </div>
  )
}
