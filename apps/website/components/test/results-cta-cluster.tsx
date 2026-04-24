'use client'

// apps/website/components/test/results-cta-cluster.tsx
// Phase 24 — Primary + secondary CTA row on /test/ergebnis.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Dimension, LevelSlug } from '@/lib/assessment/types'
import { useAssessment } from '@/lib/assessment/use-assessment'

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
  const dimensions: Dimension[] = [
    'tools',
    'prompting',
    'agents',
    'application',
    'literacy',
  ]
  const skillsParam = dimensions.map((d) => `${d}:${skills[d]}`).join(',')
  const qs = new URLSearchParams({
    pre: slug,
    source: 'test',
    skills: skillsParam,
  }).toString()
  return `/join?${qs}`
}

export function ResultsCtaCluster({ slug, skills }: ResultsCtaClusterProps) {
  const router = useRouter()
  const { resetAssessment } = useAssessment()
  const joinHref = buildJoinHref(slug, skills)

  function handleRetry() {
    resetAssessment()
    router.push('/test')
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 sm:flex-row">
      <Link
        href={joinHref}
        className="rounded-full bg-[var(--accent)] px-8 py-3 font-mono text-sm font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)]"
      >
        Jetzt beitreten & loslegen
      </Link>
      <button
        type="button"
        onClick={handleRetry}
        className="rounded-full border border-[var(--border)] px-6 py-2.5 font-mono text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--slate-7)] hover:text-[var(--text)]"
      >
        Test nochmal machen
      </button>
    </div>
  )
}
