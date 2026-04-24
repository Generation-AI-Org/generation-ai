'use client'

// apps/website/components/test/level-badge.tsx
// Phase 24 — Hero badge for /test/ergebnis showing level + name + color-coded icon.

import { motion, useReducedMotion } from 'motion/react'
import { Sparkle, BookOpen, Rocket, Zap, Star } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { Level, LevelSlug } from '@/lib/assessment/types'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

interface LevelMeta {
  level: Level
  name: string
  icon: IconType
  colorVar: string
}

const LEVEL_META: Record<LevelSlug, LevelMeta> = {
  neugieriger: { level: 1, name: 'Neugieriger', icon: Sparkle, colorVar: 'var(--slate-9)' },
  einsteiger: { level: 2, name: 'Einsteiger', icon: BookOpen, colorVar: 'var(--brand-blue)' },
  fortgeschritten: {
    level: 3,
    name: 'Fortgeschritten',
    icon: Rocket,
    colorVar: 'var(--brand-neon)',
  },
  pro: { level: 4, name: 'Pro', icon: Zap, colorVar: 'var(--brand-pink)' },
  expert: { level: 5, name: 'Expert', icon: Star, colorVar: 'var(--brand-red)' },
}

export function LevelBadge({ slug }: { slug: LevelSlug }) {
  const meta = LEVEL_META[slug]
  const reducedMotion = useReducedMotion()
  const Icon = meta.icon

  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-16"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.6, delay: 0.1 }}
      aria-label={`Level ${meta.level}: ${meta.name}`}
    >
      <div
        className="inline-flex items-center gap-3 rounded-2xl border px-6 py-3"
        style={{
          backgroundColor: `color-mix(in oklab, ${meta.colorVar} 15%, transparent)`,
          borderColor: `color-mix(in oklab, ${meta.colorVar} 60%, transparent)`,
        }}
      >
        <Icon style={{ color: meta.colorVar }} className="h-7 w-7" aria-hidden />
        <span
          className="font-mono text-3xl font-bold"
          style={{ color: meta.colorVar }}
        >
          {meta.level}
        </span>
        <span className="text-xl font-semibold text-[var(--text)]">{meta.name}</span>
      </div>
      <motion.h1
        className="text-center font-mono font-bold tracking-[-0.03em]"
        style={{
          fontSize: 'var(--fs-display)',
          color: meta.colorVar,
          lineHeight: 1.02,
        }}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.5, delay: 0.3 }}
      >
        Level {meta.level}: {meta.name}
      </motion.h1>
    </motion.div>
  )
}
