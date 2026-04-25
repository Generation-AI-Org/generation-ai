'use client'

import { useState } from 'react'
import { createBrowserClient } from '@genai/auth'
import { StatusPill } from '@/components/ui/StatusPill'

type Props = {
  hasPassword: boolean
  email: string
}

export function PasswordSection({ hasPassword: initialHasPassword, email }: Props) {
  const [hasPasswordState, setHasPasswordState] = useState(initialHasPassword)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isChangeMode = hasPasswordState

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Passwort muss mindestens 8 Zeichen haben.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein.' })
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()

    // D-04: Change-Mode — Re-Auth via signInWithPassword als Current-Password-Check.
    if (isChangeMode) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (reauthError) {
        setLoading(false)
        setMessage({ type: 'error', text: 'Aktuelles Passwort stimmt nicht.' })
        return
      }
    }

    // D-05: Passwort setzen + has_password=true flagen (idempotent).
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { has_password: true },
    })
    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    setMessage({
      type: 'success',
      text: isChangeMode ? 'Passwort erfolgreich geändert.' : 'Passwort erfolgreich gesetzt.',
    })
    setHasPasswordState(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isChangeMode && (
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Aktuelles Passwort
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
          />
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Neues Passwort
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mindestens 8 Zeichen"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Passwort bestätigen
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Passwort wiederholen"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
        />
      </div>

      {message && <StatusPill type={message.type}>{message.text}</StatusPill>}

      <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword || (isChangeMode && !currentPassword)}
        className="py-2.5 px-6 rounded-full bg-[var(--accent)] text-bg font-medium shadow-[0_0_12px_var(--accent-glow)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading
          ? 'Wird gespeichert...'
          : isChangeMode
            ? 'Passwort ändern'
            : 'Passwort setzen'}
      </button>
    </form>
  )
}
