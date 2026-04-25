import { headers } from 'next/headers'
import { TestClient } from '@/components/test/test-client'

// Route `/test` — AI Literacy Assessment landing + entry point (Phase 24).
// Server component reads x-nonce for CSP-compliant MotionConfig.

export default async function TestPage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return <TestClient nonce={nonce} />
}
