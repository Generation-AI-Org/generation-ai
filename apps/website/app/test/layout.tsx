import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { TestLayoutProvider } from '@/components/test/test-layout-provider'

// Layout for /test/* routes — SEO metadata handled here, routes override where needed.
// AssessmentProvider is mounted via TestLayoutProvider so answers survive
// /test/aufgabe/[n] navigations within this layout segment.

export const metadata: Metadata = {
  title: {
    absolute: 'AI Literacy Test — Wo stehst du wirklich mit KI?',
  },
  description:
    'Take the AI Literacy Test — 10 interactive tasks, 15 minutes, honest results. Free, anonymous, no signup required.',
  openGraph: {
    title: 'AI Literacy Test',
    description:
      'Free AI literacy assessment — find out your real AI skill level in 15 minutes.',
    url: 'https://generation-ai.org/test',
    type: 'website',
  },
  twitter: {
    title: 'AI Literacy Test',
    description:
      'Free AI literacy assessment — find out your real AI skill level in 15 minutes.',
  },
  alternates: { canonical: 'https://generation-ai.org/test' },
}

export default function TestLayout({ children }: { children: ReactNode }) {
  return <TestLayoutProvider>{children}</TestLayoutProvider>
}
