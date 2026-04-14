import { testApiHandler } from 'next-test-api-route-handler'
import * as healthHandler from '@/app/api/health/route'
import { describe, it, expect } from 'vitest'

describe('/api/health', () => {
  it('returns 200 with status ok', async () => {
    await testApiHandler({
      appHandler: healthHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' })
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.status).toBe('ok')
        expect(data.timestamp).toBeDefined()
      },
    })
  })
})
