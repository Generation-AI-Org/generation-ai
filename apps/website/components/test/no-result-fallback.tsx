'use client'

// apps/website/components/test/no-result-fallback.tsx
// Phase 24 — Empty-state for /test/ergebnis when user deep-links without a
// completed assessment (D-11 — no persistence, state lost after navigation away).

import Link from 'next/link'

export function NoResultFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="max-w-lg text-2xl font-semibold text-[var(--text)] sm:text-3xl">
        Kein Ergebnis vorhanden. Starte den Test, um dein Ergebnis zu sehen.
      </h1>
      <Link
        href="/test"
        className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 font-mono text-sm font-bold tracking-[0.02em] text-[var(--text-on-accent)]"
      >
        Test starten
      </Link>
    </div>
  )
}
