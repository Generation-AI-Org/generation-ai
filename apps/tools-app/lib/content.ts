import { createServerClient } from '@/lib/supabase'
import type { ContentItem, ContentItemMeta } from '@/lib/types'

async function getPublishedItems(): Promise<ContentItemMeta[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('id, type, title, slug, summary, category, tags, use_cases, pricing_model, logo_domain, quick_win')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getPublishedItems error:', error.message)
    return []
  }
  return (data ?? []) as ContentItemMeta[]
}

// Featured tools appear first in this order
// D-17 (Phase 26): single source of truth — re-used by /api/public/featured-tools
export const FEATURED_TOOLS = ['chatgpt', 'claude', 'lovable', 'cursor', 'perplexity']

export async function getPublishedTools(): Promise<ContentItemMeta[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('id, type, title, slug, summary, category, tags, use_cases, pricing_model, logo_domain, quick_win')
    .eq('status', 'published')
    .eq('type', 'tool')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getPublishedTools error:', error.message)
    return []
  }

  const items = (data ?? []) as ContentItemMeta[]

  // Sort: featured tools first (in order), then rest by created_at
  return items.sort((a, b) => {
    const aIndex = FEATURED_TOOLS.indexOf(a.slug)
    const bIndex = FEATURED_TOOLS.indexOf(b.slug)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return 0 // keep original order for non-featured
  })
}

export async function getFullContent(): Promise<ContentItem[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('status', 'published')
    .order('type', { ascending: true })
    .order('title', { ascending: true })

  if (error) {
    console.error('getFullContent error:', error.message)
    return []
  }
  return (data ?? []) as ContentItem[]
}

export async function getItemBySlug(slug: string): Promise<ContentItem | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null
  return data as ContentItem
}
