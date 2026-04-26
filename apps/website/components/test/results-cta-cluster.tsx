'use client'

// apps/website/components/test/results-cta-cluster.tsx
// Phase 24 — Primary + secondary CTA row on /test/ergebnis.

import Link from 'next/link'
import type { Dimension, LevelSlug } from '@/lib/assessment/types'
import { buildSkillsParam } from '@/lib/assessment/storage'

export interface ResultsCtaClusterProps {
  slug: LevelSlug
  skills: Record<Dimension, number>
}

/**
 * Build `/join?pre=<slug>&source=test&skills=tools:80,prompting:60,...`.
 * URLSearchParams percent-encodes `:` and `,` in the skills value.
 */
export function buildJoinHref(
  slug: LevelSlug,
  skills: Record<Dimension, number>,
): string {
  const qs = new URLSearchParams({
    pre: slug,
    source: 'test',
    skills: buildSkillsParam(skills),
  }).toString()
  return `/join?${qs}`
}

export function ResultsCtaCluster({ slug, skills }: ResultsCtaClusterProps) {
  const joinHref = buildJoinHref(slug, skills)

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 sm:flex-row">
      <Link
        href={joinHref}
        className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 font-mono text-sm font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.96]"
      >
        Jetzt registrieren
      </Link>
      <a
        href="https://community.generation-ai.org"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--border)] px-6 py-2.5 font-mono text-sm text-[var(--text)] transition-colors hover:border-[var(--border-accent)] hover:text-[var(--accent-hover)]"
      >
        Zur Community
      </a>
    </div>
  )
}
