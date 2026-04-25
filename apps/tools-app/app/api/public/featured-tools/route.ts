import { createServerClient } from "@/lib/supabase"
import { FEATURED_TOOLS } from "@/lib/content"

export interface FeaturedToolsResponse {
  tools: Array<{
    slug: string
    title: string
    summary: string | null
    category: string
    logo_domain: string | null
    quick_win: string | null
  }>
  generated_at: string
}

/**
 * Public Featured-Tools endpoint — no auth, edge-cached.
 *
 * Phase 26 / D-07: Vercel-Edge-Cache (`s-maxage=300, swr=1800`) replaces
 *   eigenes Rate-Limit. Origin-Hits sind durch das Caching auf wenige
 *   Requests/Stunde begrenzt.
 *
 * Phase 26 / D-17: `FEATURED_TOOLS` ist hardcoded in `@/lib/content` —
 *   single source, kein DB-Migration nötig.
 *
 * Threat-Mitigations (siehe 26-04-PLAN.md threat_model):
 *   - T-26-04-02: Generic 500-Message, kein supabase-trace-leak.
 *   - T-26-04-04: proxy.ts matcher excludes /api/* — no session logic here.
 *   - T-26-04-05: Explicit column whitelist in `.select(...)` — no `*`.
 */
export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("content_items")
    .select("slug, title, summary, category, logo_domain, quick_win")
    .eq("status", "published")
    .eq("type", "tool")
    .in("slug", FEATURED_TOOLS)

  if (error) {
    return Response.json(
      { error: "Failed to load featured tools" },
      { status: 500 },
    )
  }

  // Sort by FEATURED_TOOLS array order (chatgpt first, then claude, lovable, cursor, perplexity)
  const sorted = (data ?? []).sort(
    (a, b) =>
      FEATURED_TOOLS.indexOf(a.slug) - FEATURED_TOOLS.indexOf(b.slug),
  )

  const body: FeaturedToolsResponse = {
    tools: sorted,
    generated_at: new Date().toISOString(),
  }

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    },
  })
}
