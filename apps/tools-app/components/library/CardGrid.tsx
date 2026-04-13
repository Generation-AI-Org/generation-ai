'use client'

import { useMemo } from 'react'
import ContentCard from './ContentCard'
import type { ContentItemMeta } from '@/lib/types'

interface CardGridProps {
  items: ContentItemMeta[]
  highlightedSlugs: string[]
  activeFilter: string
}

export default function CardGrid({ items, highlightedSlugs, activeFilter }: CardGridProps) {
  const filtered = activeFilter
    ? items.filter(
        (item) =>
          item.use_cases?.some((uc) =>
            uc.toLowerCase().includes(activeFilter.toLowerCase())
          ) ||
          item.category?.toLowerCase().includes(activeFilter.toLowerCase())
      )
    : items

  const hasHighlights = highlightedSlugs.length > 0

  // Sort: highlighted items first, rest keeps original order
  const sorted = useMemo(() => {
    if (!hasHighlights) return filtered

    const highlighted = filtered.filter(item => highlightedSlugs.includes(item.slug))
    const rest = filtered.filter(item => !highlightedSlugs.includes(item.slug))

    // Sort highlighted items by their position in highlightedSlugs array
    highlighted.sort((a, b) =>
      highlightedSlugs.indexOf(a.slug) - highlightedSlugs.indexOf(b.slug)
    )

    return [...highlighted, ...rest]
  }, [filtered, highlightedSlugs, hasHighlights])

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-text-secondary text-sm font-medium">Keine Tools gefunden</p>
        <p className="text-text-muted text-xs mt-1">Versuch einen anderen Filter</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
      {sorted.map((item, index) => {
        const isHighlighted = hasHighlights && highlightedSlugs.includes(item.slug)
        const isDimmed = hasHighlights && !highlightedSlugs.includes(item.slug)
        return (
          <ContentCard
            key={item.id}
            item={item}
            isHighlighted={isHighlighted}
            isDimmed={isDimmed}
            animationDelay={isHighlighted ? index * 50 : 0}
          />
        )
      })}
    </div>
  )
}
