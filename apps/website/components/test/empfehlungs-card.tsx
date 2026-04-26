'use client'

// apps/website/components/test/empfehlungs-card.tsx
// Phase 24 — Results page recommendation card (grid item).

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CommunityRec } from '@/lib/assessment/load-community'

const TYPE_LABEL: Record<CommunityRec['type'], string> = {
  workshop: 'Workshop',
  tool: 'Tool',
  artikel: 'Artikel',
  community: 'Community',
}

export function EmpfehlungsCard({ rec }: { rec: CommunityRec }) {
  const isExternal = rec.href.startsWith('http')
  const opensNewTab = isExternal && !rec.href.startsWith('https://tools.generation-ai.org')
  return (
    <Link
      href={rec.href}
      target={opensNewTab ? '_blank' : undefined}
      rel={opensNewTab ? 'noopener noreferrer' : undefined}
      className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--slate-7)] hover:bg-[var(--bg-elevated)]"
    >
      <span className="inline-flex self-start rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-sm font-bold tracking-[0.08em] text-[var(--text-muted)]">
        {TYPE_LABEL[rec.type]}
      </span>
      <h3 className="text-xl font-semibold text-[var(--text)]">{rec.title}</h3>
      <p className="line-clamp-2 text-sm leading-[1.55] text-[var(--text-muted)]">
        {rec.description}
      </p>
      <span className="inline-flex items-center gap-1 font-mono text-sm text-[var(--accent)] group-hover:text-[var(--accent-hover)]">
        Anschauen <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  )
}
