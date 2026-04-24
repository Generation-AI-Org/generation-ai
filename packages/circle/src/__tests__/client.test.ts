import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addMemberToSpace,
  createMember,
  generateSsoUrl,
  getMemberByEmail,
} from '../client'

const ORIGINAL_ENV = { ...process.env }

function mockFetch(responses: Array<{ status?: number; body?: unknown; headers?: Record<string, string> }>) {
  let call = 0
  global.fetch = vi.fn(async () => {
    const r = responses[call++] ?? { status: 500 }
    const status = r.status ?? 200
    const res = {
      ok: status < 400,
      status,
      headers: new Headers(r.headers ?? { 'x-request-id': 'test-corr-id' }),
      json: async () => r.body ?? {},
    } as unknown as Response
    return res
  }) as typeof fetch
}

beforeEach(() => {
  process.env.CIRCLE_API_TOKEN = 'test-token'
  process.env.CIRCLE_COMMUNITY_ID = '511295'
  process.env.CIRCLE_COMMUNITY_URL = 'https://community.generation-ai.org'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.restoreAllMocks()
})

describe('config validation', () => {
  it('throws CONFIG_MISSING when CIRCLE_API_TOKEN unset', async () => {
    delete process.env.CIRCLE_API_TOKEN
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({
      name: 'CircleApiError',
      code: 'CONFIG_MISSING',
    })
  })

  it('throws CONFIG_MISSING when CIRCLE_COMMUNITY_ID unset', async () => {
    delete process.env.CIRCLE_COMMUNITY_ID
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({
      name: 'CircleApiError',
      code: 'CONFIG_MISSING',
    })
  })
})

describe('getMemberByEmail', () => {
  it('returns member when found (single object response)', async () => {
    mockFetch([{ status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: 511295 } }])
    const result = await getMemberByEmail('a@b.de')
    expect(result).toEqual({ circleMemberId: '42' })
  })

  it('returns member when found (records array response)', async () => {
    mockFetch([
      {
        status: 200,
        body: { records: [{ id: 99, email: 'a@b.de', name: 'A', community_id: 511295 }] },
      },
    ])
    const result = await getMemberByEmail('a@b.de')
    expect(result).toEqual({ circleMemberId: '99' })
  })

  it('returns null on 404', async () => {
    mockFetch([{ status: 404 }])
    const result = await getMemberByEmail('missing@b.de')
    expect(result).toBeNull()
  })

  it('returns null when records array empty', async () => {
    mockFetch([{ status: 200, body: { records: [] } }])
    const result = await getMemberByEmail('missing@b.de')
    expect(result).toBeNull()
  })

  it('throws UNAUTHORIZED on 401 without retry', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: async () => ({}),
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(fetchSpy).toHaveBeenCalledTimes(1) // no retry
  })
})

describe('createMember', () => {
  it('is idempotent — reuses existing member', async () => {
    mockFetch([
      { status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: 511295 } },
    ])
    const result = await createMember({ email: 'a@b.de', name: 'A' })
    expect(result).toEqual({ circleMemberId: '42', alreadyExists: true })
  })

  it('creates when not found', async () => {
    mockFetch([
      { status: 404 }, // getMemberByEmail miss
      { status: 201, body: { id: 99, email: 'new@b.de', name: 'N', community_id: 511295 } },
    ])
    const result = await createMember({ email: 'new@b.de', name: 'N' })
    expect(result).toEqual({ circleMemberId: '99', alreadyExists: false })
  })
})

describe('addMemberToSpace', () => {
  it('resolves on 200', async () => {
    mockFetch([{ status: 200, body: {} }])
    await expect(addMemberToSpace('42', '2574363')).resolves.toBeUndefined()
  })

  it('swallows 409 (already in space) as success', async () => {
    mockFetch([{ status: 409 }])
    await expect(addMemberToSpace('42', '2574363')).resolves.toBeUndefined()
  })

  it('propagates 500 as SERVER_ERROR after retries', async () => {
    mockFetch([{ status: 500 }, { status: 500 }, { status: 500 }])
    await expect(addMemberToSpace('42', '2574363')).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })
})

describe('generateSsoUrl', () => {
  it('returns sso_url + expires_at when response has sso_url', async () => {
    mockFetch([
      {
        status: 200,
        body: {
          sso_url: 'https://community.generation-ai.org/sso?token=xyz',
          expires_at: '2026-05-01T00:00:00Z',
        },
      },
    ])
    const result = await generateSsoUrl({ memberId: '42' })
    expect(result).toEqual({
      ssoUrl: 'https://community.generation-ai.org/sso?token=xyz',
      expiresAt: '2026-05-01T00:00:00Z',
    })
  })

  it('composes URL from access_token fallback', async () => {
    mockFetch([
      {
        status: 200,
        body: {
          access_token: 'abc123',
          expires_at: '2026-05-01T00:00:00Z',
        },
      },
    ])
    const result = await generateSsoUrl({ memberId: '42', redirectPath: '/c/vorstellungsrunde' })
    expect(result.ssoUrl).toContain('/sso?token=abc123')
    expect(result.ssoUrl).toContain('redirect=')
    expect(result.expiresAt).toBe('2026-05-01T00:00:00Z')
  })

  it('passes custom TTL to Circle', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ sso_url: 'x', expires_at: 'y' }),
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await generateSsoUrl({ memberId: '42', ttlSeconds: 3600 })
    const call = fetchSpy.mock.calls[0]?.[1] as RequestInit
    expect(call.body).toContain('"ttl_seconds":3600')
  })
})

describe('retry logic', () => {
  it('retries on 500 then succeeds on attempt 2', async () => {
    mockFetch([
      { status: 500 },
      { status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: 511295 } },
    ])
    const result = await getMemberByEmail('a@b.de')
    expect(result).toEqual({ circleMemberId: '42' })
  })
})
