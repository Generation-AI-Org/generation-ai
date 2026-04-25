import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'

import { JoinClient } from '@/components/join-client'

// Route `/join` — Top-Conversion-Endpoint (Phase 23 V1 Waitlist).
//
// Server Component. `await headers()` liest x-nonce (aus proxy.ts) und erzwingt
// implizit dynamic rendering (LEARNINGS.md Regel 2: CSP-mit-Nonce braucht
// dynamic rendering, sonst frisst strict-dynamic alle Scripts).
//
// Keine `export const dynamic = "force-dynamic"` nötig — `await headers()`
// reicht. Das Root-Layout hat zusätzlich `export const dynamic = "force-dynamic"`
// (LEARNINGS.md CSP-Incident-Fix), also doppelt abgesichert.
//
// Suspense wrapper: JoinFormCard nutzt useSearchParams() — Next.js 16 erzwingt
// Suspense-Boundary um Client-Components mit useSearchParams().

export const metadata: Metadata = {
  title: {
    absolute: 'Jetzt beitreten · Generation AI',
  },
  description:
    'Kostenlos Mitglied werden. Für Studierende im DACH-Raum, die KI ernst nehmen. In 2 Minuten dabei.',
  openGraph: {
    title: 'Jetzt beitreten · Generation AI',
    description:
      'Kostenlos Mitglied werden. Für Studierende im DACH-Raum, die KI ernst nehmen. In 2 Minuten dabei.',
    url: 'https://generation-ai.org/join',
  },
  twitter: {
    title: 'Jetzt beitreten · Generation AI',
    description:
      'Kostenlos Mitglied werden. Für Studierende im DACH-Raum, die KI ernst nehmen. In 2 Minuten dabei.',
  },
  alternates: {
    canonical: 'https://generation-ai.org/join',
  },
}

export default async function JoinPage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <Suspense fallback={null}>
      <JoinClient nonce={nonce} />
    </Suspense>
  )
}
