// apps/website/lib/assessment/profiles.ts
// Phase 24 — Level-profile MDX component registry.
// Used by /test/ergebnis to render the profile matching the scored level.

import type { ComponentType } from 'react'
import type { LevelSlug } from './types'
import Neugieriger from '@/content/assessment/profiles/neugieriger.mdx'
import Einsteiger from '@/content/assessment/profiles/einsteiger.mdx'
import Fortgeschritten from '@/content/assessment/profiles/fortgeschritten.mdx'
import Pro from '@/content/assessment/profiles/pro.mdx'
import Expert from '@/content/assessment/profiles/expert.mdx'

export const LevelProfile: Record<LevelSlug, ComponentType> = {
  neugieriger: Neugieriger,
  einsteiger: Einsteiger,
  fortgeschritten: Fortgeschritten,
  pro: Pro,
  expert: Expert,
}
