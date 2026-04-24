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
  process.env.CIRCLE_HEADLESS_TOKEN = 'test-headless-token'
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
    mockFetch([{ status: 200, body: { success: true, message: 'User added to space' } }])
    await expect(addMemberToSpace('a@b.de', '2574363')).resolves.toBeUndefined()
  })

  it('swallows 409 (already in space) as success', async () => {
    mockFetch([{ status: 409 }])
    await expect(addMemberToSpace('a@b.de', '2574363')).resolves.toBeUndefined()
  })

  it('propagates 500 as SERVER_ERROR after retries', async () => {
    mockFetch([{ status: 500 }, { status: 500 }, { status: 500 }])
    await expect(addMemberToSpace('a@b.de', '2574363')).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })

  it('sends {email, space_id:int} payload to /space_members', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ success: true, message: 'User added to space' }),
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await addMemberToSpace('a@b.de', '2574363')

    const call = fetchSpy.mock.calls[0]
    const url = call?.[0] as string
    const init = call?.[1] as RequestInit
    expect(url).toBe('https://app.circle.so/api/admin/v2/space_members')
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"space_id":2574363,"email":"a@b.de"}')
  })
})

describe('generateSsoUrl', () => {
  // Sample response shape from Circle Headless API (verified live 2026-04-24).
  const sampleHeadlessResponse = {
    access_token: 'eyJhbGc.payload.signature',
    access_token_expires_at: '2026-04-24T22:59:48.857Z',
    refresh_token: 'refresh-xyz',
    refresh_token_expires_at: '2026-05-24T21:59:48.000Z',
    community_member_id: 80552151,
    community_id: 511295,
  }

  it('composes seamless-login URL from access_token', async () => {
    mockFetch([{ status: 200, body: sampleHeadlessResponse }])
    const result = await generateSsoUrl({ memberId: '80552151' })
    expect(result.ssoUrl).toBe(
      'https://community.generation-ai.org/session/cookies?access_token=eyJhbGc.payload.signature',
    )
    expect(result.expiresAt).toBe('2026-04-24T22:59:48.857Z')
  })

  it('hits the Headless API path with Headless token + numeric member ID', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => sampleHeadlessResponse,
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await generateSsoUrl({ memberId: '80552151' })

    const call = fetchSpy.mock.calls[0]
    const url = call?.[0] as string
    const init = call?.[1] as RequestInit
    expect(url).toBe('https://app.circle.so/api/v1/headless/auth_token')
    expect(init.method).toBe('POST')
    // Member ID coerced to number per Circle API contract.
    expect(init.body).toBe('{"community_member_id":80552151}')
    // Headless token used, not Admin token.
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer test-headless-token')
  })

  it('throws CONFIG_MISSING when CIRCLE_HEADLESS_TOKEN unset', async () => {
    delete process.env.CIRCLE_HEADLESS_TOKEN
    await expect(generateSsoUrl({ memberId: '80552151' })).rejects.toMatchObject({
      name: 'CircleApiError',
      code: 'CONFIG_MISSING',
    })
  })

  it('throws UNKNOWN when access_token missing from response', async () => {
    mockFetch([{ status: 200, body: { ...sampleHeadlessResponse, access_token: '' } }])
    await expect(generateSsoUrl({ memberId: '80552151' })).rejects.toMatchObject({
      name: 'CircleApiError',
      code: 'UNKNOWN',
    })
  })

  it('strips trailing slash from CIRCLE_COMMUNITY_URL', async () => {
    process.env.CIRCLE_COMMUNITY_URL = 'https://community.generation-ai.org/'
    mockFetch([{ status: 200, body: sampleHeadlessResponse }])
    const result = await generateSsoUrl({ memberId: '80552151' })
    expect(result.ssoUrl).toBe(
      'https://community.generation-ai.org/session/cookies?access_token=eyJhbGc.payload.signature',
    )
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
