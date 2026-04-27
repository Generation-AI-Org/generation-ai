// Phase 25 Plan F — admin-auth unit tests
// Full route tests (401/403/400/404/200/502 path coverage) live in Plan H E2E
// per plan F3 fallback guidance — vitest+NextRequest route-handler setup is
// non-trivial in this app and the E2E covers the exact same surface.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@genai/auth/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@genai/auth/server'
import { checkAdminAuth } from '../admin-auth'

function makeRequest(options?: { origin?: string }): Request {
  return new Request('http://localhost/api/admin/circle-reprovision', {
    method: 'POST',
    headers: options?.origin ? { origin: options.origin } : undefined,
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  delete process.env.ADMIN_EMAIL_ALLOWLIST
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('checkAdminAuth', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as never)
    const result = await checkAdminAuth(makeRequest())
    expect(result).toEqual({
      ok: false,
      status: 401,
      reason: 'Not authenticated',
    })
  })

  it('returns 403 when authenticated but not admin + not allowlisted', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'u1', email: 'joe@user.de', user_metadata: {} },
          },
          error: null,
        }),
      },
    } as never)
    const result = await checkAdminAuth(makeRequest())
    expect(result).toMatchObject({ ok: false, status: 403 })
  })

  it('ignores user_metadata.role=admin because user metadata is client-writable', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'u1',
              email: 'a@admin.de',
              user_metadata: { role: 'admin' },
            },
          },
          error: null,
        }),
      },
    } as never)
    const result = await checkAdminAuth(makeRequest())
    expect(result).toEqual({
      ok: false,
      status: 403,
      reason: 'Not authorized (admin only)',
    })
  })

  it('returns ok when user email is in ADMIN_EMAIL_ALLOWLIST', async () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = 'luca@generation-ai.org, team@generation-ai.org'
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'u2',
              email: 'Luca@generation-AI.org', // case-insensitive match
              user_metadata: {},
            },
          },
          error: null,
        }),
      },
    } as never)
    const result = await checkAdminAuth(makeRequest())
    expect(result).toEqual({
      ok: true,
      userId: 'u2',
      email: 'Luca@generation-AI.org',
    })
  })

  it('ignores empty allowlist entries + trims', async () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = '  ,,, luca@generation-ai.org  , '
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'u3',
              email: 'luca@generation-ai.org',
              user_metadata: {},
            },
          },
          error: null,
        }),
      },
    } as never)
    const result = await checkAdminAuth(makeRequest())
    expect(result.ok).toBe(true)
  })

  it('returns 403 when Origin header is not in allowlist (CSRF, REVIEW LO-02)', async () => {
    const result = await checkAdminAuth(
      makeRequest({ origin: 'https://evil.com' }),
    )
    expect(result).toEqual({
      ok: false,
      status: 403,
      reason: 'Cross-origin request denied',
    })
  })

  it('allows allowlisted Origin header (generation-ai.org)', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'u1',
              email: 'luca@generation-ai.org',
              user_metadata: { role: 'admin' },
            },
          },
          error: null,
        }),
      },
    } as never)
    process.env.ADMIN_EMAIL_ALLOWLIST = 'luca@generation-ai.org'
    const result = await checkAdminAuth(
      makeRequest({ origin: 'https://generation-ai.org' }),
    )
    expect(result.ok).toBe(true)
  })

  it('returns 401 when user has no email', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: null, user_metadata: {} } },
          error: null,
        }),
      },
    } as never)
    const result = await checkAdminAuth(makeRequest())
    expect(result).toMatchObject({ ok: false, status: 401 })
  })
})
