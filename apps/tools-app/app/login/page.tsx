'use client'

import Link from 'next/link'

// TEMPORARILY DISABLED — restore from git history to re-enable login
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-4">
          <span className="w-3 h-3 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text)] mb-2">Login momentan geschlossen</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Wir öffnen bald wieder. Schau später vorbei!
        </p>
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
          &larr; Zurück zur App
        </Link>
      </div>
    </div>
  )
}
