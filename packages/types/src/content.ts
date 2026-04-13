export type ContentType = 'tool' | 'guide' | 'faq' | 'concept' | 'workflow'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type PricingModel = 'free' | 'freemium' | 'paid' | 'open_source'

export interface ContentItem {
  id: string
  type: ContentType
  status: ContentStatus
  title: string
  slug: string
  summary: string
  content: string
  category: string
  tags: string[]
  use_cases: string[]
  pricing_model: PricingModel | null
  external_url: string | null
  logo_domain: string | null
  quick_win: string | null
  updated_at: string
  created_at: string
}

export type ContentItemMeta = Pick<
  ContentItem,
  | 'id'
  | 'type'
  | 'title'
  | 'slug'
  | 'summary'
  | 'category'
  | 'tags'
  | 'use_cases'
  | 'pricing_model'
  | 'logo_domain'
  | 'quick_win'
>

export interface ContentSource {
  slug: string
  title: string
  type: ContentType
}
