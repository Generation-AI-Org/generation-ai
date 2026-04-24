// Phase 25 — Generic auth-error page for confirm-route failures.
// Kept minimal — Phase 27 copy-pass will polish messaging.

import { headers } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = {
  robots: { index: false, follow: false },
}

const REASON_MESSAGES: Record<string, { title: string; body: string }> = {
  invalid_or_expired: {
    title: 'Link abgelaufen',
    body: 'Der Confirm-Link ist leider nicht mehr gültig. Starte den Anmeldeflow einfach neu.',
  },
  missing_params: {
    title: 'Link unvollständig',
    body: 'Diesem Link fehlen Parameter. Bitte starte den Flow erneut oder schreib uns.',
  },
  rate_limited: {
    title: 'Kurz durchatmen',
    body: 'Zu viele Versuche hintereinander. Bitte warte 15 Minuten und probier es dann nochmal.',
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  await headers() // ensure dynamic + CSP nonce request-scope
  const params = await searchParams
  const reason = params.reason ?? 'invalid_or_expired'
  const msg = REASON_MESSAGES[reason] ?? REASON_MESSAGES.invalid_or_expired

  return (
    <main id="main-content" className="min-h-screen pt-20 px-6">
      <section className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">{msg.title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{msg.body}</p>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Zurück zu /join
        </Link>
      </section>
    </main>
  )
}
