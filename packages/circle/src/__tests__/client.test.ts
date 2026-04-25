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
  it('returns member when found (200 single-object response)', async () => {
    mockFetch([{ status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: 511295 } }])
    const result = await getMemberByEmail('a@b.de')
    expect(result).toEqual({ circleMemberId: '42' })
  })

  it('returns null on 404 (not-found)', async () => {
    mockFetch([{ status: 404, body: { success: false, message: 'Oops! Missing record.' } }])
    const result = await getMemberByEmail('missing@b.de')
    expect(result).toBeNull()
  })

  it('hits /community_members/search?email= (NOT plain /community_members which ignores the filter)', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ id: 42, email: 'a@b.de', name: 'A', community_id: 511295 }),
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await getMemberByEmail('a+plus@b.de')
    const url = fetchSpy.mock.calls[0]?.[0] as string
    expect(url).toBe(
      'https://app.circle.so/api/admin/v2/community_members/search?email=a%2Bplus%40b.de',
    )
    // Regression guard: must NOT use the unfiltered /community_members path
    // (Phase-25 incident — that endpoint silently ignores ?email= and
    // returned the first member of the community for every signup).
    expect(url).not.toMatch(/\/community_members\?/)
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

  it('creates when not found, parsing community_member-wrapped response', async () => {
    mockFetch([
      { status: 404 }, // getMemberByEmail miss
      {
        status: 201,
        body: {
          message: 'This user has been invited to the community.',
          community_member: { id: 99, email: 'new@b.de', name: 'N', community_id: 511295 },
        },
      },
    ])
    const result = await createMember({ email: 'new@b.de', name: 'N' })
    expect(result).toEqual({ circleMemberId: '99', alreadyExists: false })
  })

  it('throws clear error when response missing community_member.id (Bug #6 regression guard)', async () => {
    mockFetch([
      { status: 404 },
      // Mimics the pre-Bug-#6 mistake: top-level shape, no wrapper
      { status: 201, body: { id: 99, email: 'new@b.de' } },
    ])
    await expect(createMember({ email: 'new@b.de', name: 'N' })).rejects.toMatchObject({
      code: 'UNKNOWN',
      message: expect.stringContaining('community_member.id'),
    })
  })

  it('sends skip_invitation:false + space_ids + NO password (default)', async () => {
    const fetchSpy = vi.fn(async (_url: unknown, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'GET') {
        return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) } as unknown as Response
      }
      return {
        ok: true, status: 201, headers: new Headers(),
        json: async () => ({
          message: 'invited',
          community_member: { id: 99, email: 'new@b.de', name: 'N', community_id: 511295 },
        }),
      } as unknown as Response
    })
    global.fetch = fetchSpy as unknown as typeof fetch
    await createMember({ email: 'new@b.de', name: 'N', spaceIds: [2574363] })

    const body = JSON.parse((fetchSpy.mock.calls[1]?.[1] as RequestInit).body as string)
    expect(body.skip_invitation).toBe(false)
    expect(body.space_ids).toEqual([2574363])
    // Critical: NO password when skipInvitation:false — otherwise Circle
    // suppresses the invitation email (live-verified 2026-04-25 — Test A
    // without password got the mail, Test B with password got nothing).
    expect(body.password).toBeUndefined()
  })

  it('sends password ONLY when skipInvitation:true (headless flow)', async () => {
    const fetchSpy = vi.fn(async (_url: unknown, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'GET') {
        return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) } as unknown as Response
      }
      return {
        ok: true, status: 201, headers: new Headers(),
        json: async () => ({ message: 'ok', community_member: { id: 1, email: 'a@b.de', name: 'A', community_id: 511295 } }),
      } as unknown as Response
    })
    global.fetch = fetchSpy as unknown as typeof fetch
    await createMember({ email: 'a@b.de', name: 'A', skipInvitation: true })
    const body = JSON.parse((fetchSpy.mock.calls[1]?.[1] as RequestInit).body as string)
    expect(body.skip_invitation).toBe(true)
    expect(typeof body.password).toBe('string')
    // Circle policy: ≥6 chars, 1 upper, 1 num, 1 sym
    expect(body.password.length).toBeGreaterThanOrEqual(6)
    expect(body.password).toMatch(/[A-Z]/)
    expect(body.password).toMatch(/[0-9]/)
    expect(body.password).toMatch(/[!@#$%^&*]/)
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
