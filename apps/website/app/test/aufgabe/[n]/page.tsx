import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { loadQuestions } from '@/lib/assessment/load-questions'
import { highlightCode } from '@/lib/shiki'
import { AufgabeClient } from '@/components/test/aufgabe-client'

// /test/aufgabe/[n] — one question per route, 1-based index in URL.
// noindex,nofollow per UI-SPEC SEO contract (only /test is canonical).

export const metadata: Metadata = {
  title: 'Aufgabe · AI Literacy Test',
  robots: { index: false, follow: false },
}

export default async function AufgabePage({
  params,
}: {
  params: Promise<{ n: string }>
}) {
  const { n } = await params
  const index = Number.parseInt(n, 10) - 1
  const questions = loadQuestions()

  if (!Number.isInteger(index) || index < 0 || index >= questions.length) {
    notFound()
  }

  // Pre-render shiki HTML for best-prompt options — server-side only,
  // zero client bundle impact.
  const highlighted: Record<string, Record<string, string>> = {}
  const q = questions[index]
  if (q.type === 'best-prompt') {
    const perOption: Record<string, string> = {}
    for (const opt of q.options) {
      perOption[opt.id] = await highlightCode(opt.code, opt.language)
    }
    highlighted[q.id] = perOption
  }

  const nonce = (await headers()).get('x-nonce') ?? ''

  return (
    <AufgabeClient
      nonce={nonce}
      questions={questions}
      currentIndex={index}
      highlightedCode={highlighted}
    />
  )
}
