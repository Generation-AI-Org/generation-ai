import type { PricingModel, ContentType } from '@/lib/types'

type BadgeVariant = 'pricing' | 'type' | 'category'

interface BadgeProps {
  variant: BadgeVariant
  value: string
  className?: string
}

// Theme-aware pricing badges using CSS variables
const pricingConfig: Record<string, { label: string; style: string }> = {
  free: {
    label: 'Kostenlos',
    style: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/25',
  },
  freemium: {
    label: 'Freemium',
    style: 'bg-[var(--bg-header)]/15 text-[var(--bg-header)] border border-[var(--bg-header)]/25',
  },
  paid: {
    label: 'Kostenpflichtig',
    style: 'bg-[var(--border)] text-text-muted border border-[var(--border)]',
  },
  open_source: {
    label: 'Open Source',
    style: 'bg-[var(--accent-soft)] text-[var(--accent)]/75 border border-[var(--accent)]/20',
  },
}

const typeConfig: Record<string, { label: string; style: string }> = {
  tool:  { label: 'Tool',  style: 'bg-[var(--border)] text-text-muted border border-[var(--border)]' },
  guide: { label: 'Guide', style: 'bg-[var(--bg-header)]/15 text-[var(--bg-header)] border border-[var(--bg-header)]/25' },
  faq:   { label: 'FAQ',   style: 'bg-[var(--border)] text-text-secondary border border-[var(--border)]' },
}

export default function Badge({ variant, value, className = '' }: BadgeProps) {
  let label = value
  let style = 'bg-white/5 text-[#888] border border-white/8'

  if (variant === 'pricing') {
    const config = pricingConfig[value]
    if (config) { label = config.label; style = config.style }
  } else if (variant === 'type') {
    const config = typeConfig[value]
    if (config) { label = config.label; style = config.style }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${style} ${className}`}>
      {label}
    </span>
  )
}
