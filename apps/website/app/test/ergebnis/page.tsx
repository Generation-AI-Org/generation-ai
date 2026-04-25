import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { TestResultsClient } from '@/components/test/test-results-client'

// /test/ergebnis — client-only result rendering.
// noindex,nofollow per UI-SPEC SEO contract.

export const metadata: Metadata = {
  title: 'Dein Ergebnis · AI Literacy Test',
  robots: { index: false, follow: false },
}

export default async function ErgebnisPage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return <TestResultsClient nonce={nonce} />
}
