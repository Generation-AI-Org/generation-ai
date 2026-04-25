// apps/website/lib/assessment/load-community.ts
// Phase 24 — Community recommendation loader, filtered by level.

import type { LevelSlug } from './types'
import data from '@/content/assessment/community-index.json'

export interface CommunityRec {
  id: string
  type: 'workshop' | 'tool' | 'artikel' | 'community'
  title: string
  description: string
  href: string
  levels: LevelSlug[]
}

export function loadRecommendations(slug: LevelSlug, limit = 5): CommunityRec[] {
  const all = data as CommunityRec[]
  return all.filter((r) => r.levels.includes(slug)).slice(0, limit)
}
