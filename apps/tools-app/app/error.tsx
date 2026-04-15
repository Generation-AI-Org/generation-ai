'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <p className="text-text-muted text-sm mb-2">Etwas ist schiefgelaufen.</p>
      <h1 className="text-text text-xl font-semibold mb-6">Unerwarteter Fehler</h1>
      <button
        onClick={reset}
        className="bg-neon text-black-brand font-semibold px-5 py-2.5 rounded-lg hover:bg-neon/90 transition-colors text-sm"
      >
        Nochmal versuchen
      </button>
    </div>
  )
}
