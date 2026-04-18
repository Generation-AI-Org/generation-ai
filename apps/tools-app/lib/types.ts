// Re-export shared types from @genai/types
export type {
  ContentType,
  ContentStatus,
  PricingModel,
  ContentItem,
  ContentItemMeta,
  ContentSource,
} from '@genai/types/content'

import type { ContentType, ContentSource } from '@genai/types/content'

// App-specific types (Chat, KB-Tools)
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendedSlugs?: string[]
  sources?: ContentSource[]
  created_at: string
}

export type ChatMode = 'public' | 'member'

export interface ChatContext {
  slug: string
  title: string
  type: string
  summary: string
}

export interface RecommendationResponse {
  text: string
  recommendedSlugs: string[]
  sources: ContentSource[]
}

// KB Tool result types
export interface KBExploreResult {
  categories: Record<string, number>
  types: Record<string, number>
  total: number
}

export interface KBListItem {
  slug: string
  title: string
  summary: string
  category: string
  type: ContentType
}

export interface KBReadResult {
  slug: string
  title: string
  type: ContentType
  category: string
  content: string
}
