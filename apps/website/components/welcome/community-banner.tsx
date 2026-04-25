'use client'

import Link from 'next/link'

interface CommunityBannerProps {
  communityUrl: string // from env via Server Component, passed as prop
  name?: string | null
}

export function CommunityBanner({ communityUrl, name }: CommunityBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 text-center"
    >
      <p className="text-lg font-semibold mb-2">
        {name ? `Willkommen, ${name}! 👋` : 'Willkommen! 👋'}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Dein Account ist aktiv. Die automatische Community-Anmeldung hat kurz nicht geklappt —
        kein Drama, du kommst manuell rein:
      </p>
      <Link
        href={communityUrl}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Zur Community →
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        Falls das nicht geht: schreib uns an{' '}
        <a href="mailto:admin@generation-ai.org" className="underline">
          admin@generation-ai.org
        </a>
        .
      </p>
    </div>
  )
}
