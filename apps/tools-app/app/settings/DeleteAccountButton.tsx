'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteAccountButton() {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Löschung fehlgeschlagen')
      }

      // Redirect to homepage after successful deletion
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setIsDeleting(false)
    }
  }

  if (!isConfirming) {
    return (
      <button
        onClick={() => setIsConfirming(true)}
        className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        Account löschen
      </button>
    )
  }

  return (
    <div className="space-y-4 p-4 border border-red-500/30 rounded-lg bg-red-500/5">
      <p className="text-sm text-red-400">
        Bist du sicher? Diese Aktion löscht deinen Account und alle deine Daten unwiderruflich.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="px-4 py-2 text-[var(--text-muted)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
        </button>
      </div>
    </div>
  )
}
