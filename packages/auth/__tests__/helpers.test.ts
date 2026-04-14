import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUser, getSession } from '../src/helpers'

// Mock the server module's createClient
vi.mock('../src/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '../src/server'

const mockCreateClient = vi.mocked(createClient)

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when supabase returns error', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Auth error'),
        }),
      },
    } as any)

    const result = await getUser()
    expect(result).toBeNull()
  })

  it('returns user object when supabase returns valid user', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
    }

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    const result = await getUser()
    expect(result).toEqual(mockUser)
    expect(result?.id).toBe('user-123')
    expect(result?.email).toBe('test@example.com')
  })
})

describe('getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when supabase returns error', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: new Error('Session error'),
        }),
      },
    } as any)

    const result = await getSession()
    expect(result).toBeNull()
  })

  it('returns session when supabase returns valid session', async () => {
    const mockSession = {
      access_token: 'token-123',
      refresh_token: 'refresh-123',
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
    }

    mockCreateClient.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      },
    } as any)

    const result = await getSession()
    expect(result).toEqual(mockSession)
    expect(result?.access_token).toBe('token-123')
  })
})
