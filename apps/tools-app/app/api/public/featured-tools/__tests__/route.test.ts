import { describe, expect, it, vi, beforeEach } from "vitest"

// Mock @/lib/supabase before import.
// Query chain in route: from(...).select(...).eq(...).eq(...).in(...)
const mockIn = vi.fn()
const mockEq2 = vi.fn(() => ({ in: mockIn }))
const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({ from: mockFrom }),
}))

import { GET } from "../route"

describe("GET /api/public/featured-tools", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 200 + sorted tools by FEATURED_TOOLS order", async () => {
    // DB returns out-of-order
    mockIn.mockResolvedValueOnce({
      data: [
        { slug: "claude", title: "Claude", summary: "", category: "ai", logo_domain: null, quick_win: null },
        { slug: "chatgpt", title: "ChatGPT", summary: "", category: "ai", logo_domain: null, quick_win: null },
      ],
      error: null,
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tools[0].slug).toBe("chatgpt") // FEATURED_TOOLS index 0
    expect(body.tools[1].slug).toBe("claude")
    expect(body.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it("sets Cache-Control header for edge cache", async () => {
    mockIn.mockResolvedValueOnce({ data: [], error: null })
    const res = await GET()
    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=300, stale-while-revalidate=1800",
    )
  })

  it("returns 500 with generic message on DB error (no stack leak)", async () => {
    mockIn.mockResolvedValueOnce({
      data: null,
      error: { message: "internal supabase trace…" },
    })
    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("Failed to load featured tools")
    expect(JSON.stringify(body)).not.toContain("internal supabase trace")
  })

  it("response shape includes required fields", async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ slug: "chatgpt", title: "ChatGPT", summary: "x", category: "ai", logo_domain: "openai.com", quick_win: "Schreibe einen Prompt" }],
      error: null,
    })
    const res = await GET()
    const body = await res.json()
    expect(body.tools[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      category: expect.any(String),
    })
    expect(body.tools[0]).toHaveProperty("logo_domain")
    expect(body.tools[0]).toHaveProperty("quick_win")
  })
})
