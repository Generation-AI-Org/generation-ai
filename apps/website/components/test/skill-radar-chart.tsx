'use client'

// apps/website/components/test/skill-radar-chart.tsx
// Phase 22.8-11 — Radar over the four launch dimensions in canonical accent color.

import { useReducedMotion } from 'motion/react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import type { LevelSlug, SkillScores, Dimension } from '@/lib/assessment/types'

const DIM_LABELS: Record<Dimension, string> = {
  tools: 'Tools',
  prompting: 'Prompting',
  agents: 'Agents',
  application: 'Anwendung',
}

export function SkillRadarChart({
  skills,
  slug,
}: {
  skills: SkillScores
  slug: LevelSlug
}) {
  const reducedMotion = useReducedMotion()
  const color = 'var(--accent-hover)'

  const data: Array<{ dim: string; score: number }> = [
    { dim: DIM_LABELS.tools, score: skills.tools },
    { dim: DIM_LABELS.prompting, score: skills.prompting },
    { dim: DIM_LABELS.agents, score: skills.agents },
    { dim: DIM_LABELS.application, score: skills.application },
  ]

  // Sort dimensions by descending score for the accessible caption.
  const dimensions: Dimension[] = ['tools', 'prompting', 'agents', 'application']
  const sorted = dimensions
    .map((d): [Dimension, number] => [d, skills[d]])
    .sort((a, b) => b[1] - a[1])
  const topTwo = sorted.slice(0, 2).map(([d]) => DIM_LABELS[d])
  const bottom = DIM_LABELS[sorted[sorted.length - 1][0]]

  return (
    <figure className="mx-auto max-w-xl py-8" data-testid="skill-radar" data-level={slug}>
      <div className="aspect-square w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 28, right: 56, bottom: 28, left: 56 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="dim"
              tick={{ fill: 'var(--text-muted)', fontSize: 14 }}
              tickLine={false}
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
