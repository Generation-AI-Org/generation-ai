import { memo } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import ToolLogo from '@/components/ui/ToolLogo'
import { getCardPreview } from '@/components/library/card-preview'
import type { ContentItemMeta } from '@/lib/types'

interface ContentCardProps {
  item: ContentItemMeta
  isHighlighted: boolean
  isDimmed: boolean
  animationDelay?: number
  priority?: boolean
}

// Memoized to prevent re-renders when grid updates but this card's props are stable
const ContentCard = memo(function ContentCard({ item, isHighlighted, isDimmed, animationDelay = 0, priority = false }: ContentCardProps) {
  const preview = getCardPreview(item)

  return (
    <Link
      href={`/${item.slug}`}
      data-card
      data-slug={item.slug}
      className={`
        group block rounded-2xl border p-4 md:p-5 transition-[transform,box-shadow,border-color,background-color,opacity] duration-300 ease-[var(--ease-out)] cursor-pointer min-h-[176px]
        hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        active:scale-[0.98] active:transition-transform active:duration-75
        ${isHighlighted
          ? 'bg-bg-card border-2 border-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)] animate-pulse-once z-10'
          : 'bg-bg-card border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-bg-card/80'
        }
        ${isDimmed ? 'opacity-35' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
          <ToolLogo slug={item.slug} domain={item.logo_domain} name={item.title} size={48} priority={priority} />
        </div>
        {item.pricing_model && (
          <Badge variant="pricing" value={item.pricing_model} />
        )}
      </div>

      {/* Title */}
      <h3 className="text-text font-bold font-mono text-[15px] leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors duration-150">
        {item.title}
      </h3>

      {/* Category */}
      <p className="text-[var(--accent)]/50 text-[11px] uppercase tracking-widest font-semibold mb-3">
        {item.category}
      </p>

      <p className="border-t border-[var(--border)]/60 pt-3 text-[13px] leading-relaxed text-text-secondary line-clamp-2">
        {preview}
      </p>
    </Link>
  )
})

export default ContentCard
