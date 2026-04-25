'use client'

// apps/website/components/test/skill-radar-chart.tsx
// Phase 24 — Radar over 5 dimensions with per-level color + sr-only figcaption.

import { useReducedMotion } from 'motion/react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import type { LevelSlug, SkillScores, Dimension } from '@/lib/assessment/types'

const LEVEL_COLOR: Record<LevelSlug, string> = {
  neugieriger: 'var(--slate-9)',
  einsteiger: 'var(--brand-blue)',
  fortgeschritten: 'var(--brand-neon)',
  pro: 'var(--brand-pink)',
  expert: 'var(--brand-red)',
}

const DIM_LABELS: Record<Dimension, string> = {
  tools: 'Tools',
  prompting: 'Prompting',
  agents: 'Agents',
  application: 'Anwendung',
  literacy: 'Critical Literacy',
}

export function SkillRadarChart({
  skills,
  slug,
}: {
  skills: SkillScores
  slug: LevelSlug
}) {
  const reducedMotion = useReducedMotion()
  const color = LEVEL_COLOR[slug]

  const data: Array<{ dim: string; score: number }> = [
    { dim: DIM_LABELS.tools, score: skills.tools },
    { dim: DIM_LABELS.prompting, score: skills.prompting },
    { dim: DIM_LABELS.agents, score: skills.agents },
    { dim: DIM_LABELS.application, score: skills.application },
    { dim: DIM_LABELS.literacy, score: skills.literacy },
  ]

  // Sort dimensions by descending score for the accessible caption.
  const dimensions: Dimension[] = ['tools', 'prompting', 'agents', 'application', 'literacy']
  const sorted = dimensions
    .map((d): [Dimension, number] => [d, skills[d]])
    .sort((a, b) => b[1] - a[1])
  const topTwo = sorted.slice(0, 2).map(([d]) => DIM_LABELS[d])
  const bottom = DIM_LABELS[sorted[sorted.length - 1][0]]

  return (
    <figure className="mx-auto max-w-lg py-8" data-testid="skill-radar">
      <div className="aspect-square w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="dim"
              tick={{ fill: 'var(--text-muted)', fontSize: 14 }}
            />
            <Radar
              dataKey="score"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
              isAnimationActive={!reducedMotion}
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        Deine Stärken: {topTwo.join(', ')}. Ausbaufähig: {bottom}.
      </figcaption>
    </figure>
  )
}
