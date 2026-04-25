import { describe, it, expect, vi, beforeEach } from 'vitest'

// REVIEW MD-04 — guard-rail: `createAdminClient()` must NOT
//   (a) read request cookies,
//   (b) share state across calls,
//   (c) have any pathway that could set cookies on an outgoing response.
//
// The implementation wraps `@supabase/supabase-js.createClient` with
// `persistSession: false` + `autoRefreshToken: false`. We verify the option
// payload Shape here so a future drift that enables persistence (and thus
// cookie writes) fails loudly in CI.

// Capture the options passed through to the real supabase-js client.
const mockSupabaseCreate = vi.fn(() => ({ _stub: true }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockSupabaseCreate,
}))

describe('createAdminClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
    vi.resetModules()
  })

  it('disables session persistence (no cookie writes)', async () => {
    const { createAdminClient } = await import('../src/admin')
    createAdminClient()

    expect(mockSupabaseCreate).toHaveBeenCalledTimes(1)
    const [url, key, opts] = mockSupabaseCreate.mock.calls[0] as [
      string,
      string,
      { auth: { autoRefreshToken: boolean; persistSession: boolean } },
    ]

    expect(url).toBe('https://test.supabase.co')
    expect(key).toBe('test-service-role-key')
    expect(opts.auth.persistSession).toBe(false)
    expect(opts.auth.autoRefreshToken).toBe(false)
  })

  it('returns a fresh client per call (no singleton / no cross-request state)', async () => {
    const { createAdminClient } = await import('../src/admin')
    createAdminClient()
    createAdminClient()
    createAdminClient()

    expect(mockSupabaseCreate).toHaveBeenCalledTimes(3)
  })

  it('does not consult `next/headers` cookies()', async () => {
    // Importing `next/headers` would throw outside a request scope. The fact
    // that this test runs at all in a plain vitest env means the module does
    // not transitively import it. Double-guard: scan the source for the
    // import.
    const fs = await import('node:fs')
    const path = await import('node:path')
    const source = fs.readFileSync(
      path.resolve(__dirname, '../src/admin.ts'),
      'utf-8',
    )
    expect(source).not.toContain('next/headers')
    expect(source).not.toContain('cookies()')
  })
})
