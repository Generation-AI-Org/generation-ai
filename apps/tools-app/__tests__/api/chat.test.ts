// WICHTIG: next-test-api-route-handler muss ERSTER Import sein
import { testApiHandler } from 'next-test-api-route-handler'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies BEFORE importing handler
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-session-123' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(() =>
    Promise.resolve({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    })
  ),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

vi.mock('@/lib/content', () => ({
  getFullContent: vi.fn(() => Promise.resolve([])),
}))

vi.mock('@/lib/llm', () => ({
  getRecommendations: vi.fn(() =>
    Promise.resolve({
      text: 'Test response from LLM',
      recommendedSlugs: [],
      sources: [],
    })
  ),
}))

vi.mock('@/lib/agent', () => ({
  runAgent: vi.fn(() =>
    Promise.resolve({
      text: 'Test agent response',
      sources: [],
    })
  ),
}))

vi.mock('@/lib/sanitize', () => ({
  sanitizeUserInput: vi.fn((input: string) => input),
}))

// Import handler AFTER mocks are set up
import * as chatHandler from '@/app/api/chat/route'
import { checkRateLimit } from '@/lib/ratelimit'

describe('/api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when message is empty', async () => {
    await testApiHandler({
      appHandler: chatHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '' }),
        })
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBeDefined()
      },
    })
  })

  it('returns 400 when message is whitespace only', async () => {
    await testApiHandler({
      appHandler: chatHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '   ' }),
        })
        expect(res.status).toBe(400)
      },
    })
  })

  it('returns 200 with valid message', async () => {
    await testApiHandler({
      appHandler: chatHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Hello, AI!' }),
        })
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.sessionId).toBeDefined()
        expect(data.text).toBeDefined()
      },
    })
  })

  it('returns 429 when rate limited', async () => {
    // Override the mock for this test
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    })

    await testApiHandler({
      appHandler: chatHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test message' }),
        })
        expect(res.status).toBe(429)
        expect(res.headers.get('Retry-After')).toBeDefined()
        const data = await res.json()
        expect(data.error).toBeDefined()
        expect(data.retryAfter).toBeDefined()
      },
    })
  })
})
