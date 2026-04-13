import { createAdminClient } from '@genai/auth/admin'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import type { KBExploreResult, KBListItem, KBReadResult, ContentType } from '@/lib/types'

/**
 * KB Tools for the V2 Agent
 *
 * These tools enable the agent to navigate the knowledge base:
 * - kbExplore: Get KB structure (categories, types, counts)
 * - kbList: List items with optional filters
 * - kbRead: Read full content of a single item
 * - kbSearch: Full-text search across all items
 */

// Tool Implementations

export async function kbExplore(): Promise<KBExploreResult> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('content_items')
    .select('category, type')
    .eq('status', 'published')

  const stats: KBExploreResult = {
    categories: {},
    types: {},
    total: data?.length || 0
  }

  data?.forEach(item => {
    stats.categories[item.category] = (stats.categories[item.category] || 0) + 1
    stats.types[item.type] = (stats.types[item.type] || 0) + 1
  })

  return stats
}

export async function kbList(params: {
  category?: string
  type?: string
  limit?: number
}): Promise<KBListItem[]> {
  const supabase = createAdminClient()
  const limit = Math.min(params.limit || 10, 50) // Cap at 50 for DoS mitigation

  let query = supabase
    .from('content_items')
    .select('slug, title, summary, category, type')
    .eq('status', 'published')

  if (params.category) {
    query = query.eq('category', params.category)
  }
  if (params.type) {
    query = query.eq('type', params.type)
  }

  const { data } = await query.limit(limit)
  return (data || []) as KBListItem[]
}

export async function kbRead(slug: string): Promise<KBReadResult | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('content_items')
    .select('slug, title, type, category, content')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return null

  return {
    slug: data.slug,
    title: data.title,
    type: data.type as ContentType,
    category: data.category,
    content: data.content
  }
}

export async function kbSearch(query: string, limit = 5): Promise<KBListItem[]> {
  const supabase = createAdminClient()
  const maxLimit = Math.min(limit, 20) // Cap at 20 for DoS mitigation

  // 1. Try FTS on title with websearch syntax
  const { data } = await supabase
    .from('content_items')
    .select('slug, title, summary, category, type')
    .eq('status', 'published')
    .textSearch('title', query, { type: 'websearch' })
    .limit(maxLimit)

  if (data?.length) {
    return data as KBListItem[]
  }

  // 2. Fallback: ILIKE on title, summary, content
  const { data: fallback } = await supabase
    .from('content_items')
    .select('slug, title, summary, category, type')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(maxLimit)

  return (fallback || []) as KBListItem[]
}

// Tool Definitions for Anthropic API

export const KB_TOOLS: Tool[] = [
  {
    name: "kb_explore",
    description: "Zeigt Struktur der Wissensbasis: Kategorien, Typen, Anzahl Items. Nutze das zuerst um dich zu orientieren. Gibt zurueck welche Kategorien und Content-Typen existieren und wie viele Items es jeweils gibt.",
    input_schema: {
      type: "object" as const,
      properties: {}
    }
  },
  {
    name: "kb_list",
    description: "Listet Items einer Kategorie oder eines Typs. Gibt nur slug, title, summary zurueck - nicht den vollen Content. Nutze das um relevante Items zu finden bevor du den vollen Inhalt liest.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          description: "Filter nach Kategorie (optional)"
        },
        type: {
          type: "string",
          enum: ["tool", "concept", "faq", "workflow", "guide"],
          description: "Filter nach Typ (optional)"
        },
        limit: {
          type: "integer",
          description: "Max Ergebnisse (default: 10, max: 50)"
        }
      }
    }
  },
  {
    name: "kb_read",
    description: "Liest den vollen Content eines Items anhand seines slugs. Nutze das nachdem du via kb_list oder kb_search ein relevantes Item gefunden hast. Gibt title, type, category und den kompletten content zurueck.",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: "Der slug des Items (z.B. 'chatgpt', 'prompting-basics')"
        }
      },
      required: ["slug"]
    }
  },
  {
    name: "kb_search",
    description: "Volltextsuche ueber alle Items in der Wissensbasis. Nutze das wenn du nicht weisst in welcher Kategorie etwas ist oder nach einem bestimmten Begriff suchst. Durchsucht Titel, Summary und Content.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Suchbegriff (z.B. 'Halluzinationen', 'ChatGPT Alternative')"
        },
        limit: {
          type: "integer",
          description: "Max Ergebnisse (default: 5, max: 20)"
        }
      },
      required: ["query"]
    }
  }
]

// Tool Dispatcher

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case 'kb_explore':
      return JSON.stringify(await kbExplore())

    case 'kb_list':
      return JSON.stringify(await kbList({
        category: input.category as string | undefined,
        type: input.type as string | undefined,
        limit: input.limit as number | undefined
      }))

    case 'kb_read':
      return JSON.stringify(await kbRead(input.slug as string))

    case 'kb_search':
      return JSON.stringify(await kbSearch(
        input.query as string,
        input.limit as number | undefined
      ))

    default:
      return JSON.stringify({ error: 'Unknown tool' })
  }
}
