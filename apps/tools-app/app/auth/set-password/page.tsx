'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@genai/auth'
import Link from 'next/link'
import { TerminalBrandHeader } from '@/components/auth/TerminalBrandHeader'
import { StatusPill } from '@/components/ui/StatusPill'

function SetPasswordInner() {
  const searchParams = useSearchParams()
  const isFirstLogin = searchParams.get('first') === '1'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Passwort muss mindestens 8 Zeichen haben.' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein.' })
      return
    }

    setLoading(true)
    setMessage(null)

    const supabase = createBrowserClient()
    // Set password + mark account as having password (D-05, D-01)
    const { error } = await supabase.auth.updateUser({
      password,
      data: { has_password: true },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Passwort erfolgreich gesetzt!' })
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
  }

  async function handleSkip() {
    setSkipping(true)
    const supabase = createBrowserClient()
    // D-02: Skip setzt has_password=false explizit, damit confirm-route beim nächsten Magic-Link nicht re-prompt'et.
    const { error } = await supabase.auth.updateUser({
      data: { has_password: false },
    })
    if (error) {
      // WR-01: Metadata-Write failed → Flag bleibt undefined → User würde beim
      // nächsten Magic-Link wieder zum First-Login-Prompt geschickt. Statt still zu
      // redirecten zeigen wir einen Error, sodass User Retry oder Passwort-Setzen
      // als Alternative wählen kann.
      console.error('Skip metadata write failed:', error.message)
      setMessage({
        type: 'error',
        text: 'Skip konnte nicht gespeichert werden. Bitte versuch es nochmal oder setz jetzt ein Passwort.',
      })
      setSkipping(false)
      return
    }
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <TerminalBrandHeader />
          <h1 className="text-xl font-semibold text-[var(--text)]">Neues Passwort setzen</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Wähle ein sicheres Passwort für deinen Account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Neues Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen"
              required
              minLength={8}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
            />
          </div>

          {/* Message */}
          {message && <StatusPill type={message.type}>{message.text}</StatusPill>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || skipping || !password || !confirmPassword}
            className="mx-auto block py-2.5 px-6 rounded-full bg-[var(--accent)] text-bg font-medium shadow-[0_0_12px_var(--accent-glow)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Wird gespeichert...
              </span>
            ) : (
              'Passwort speichern'
            )}
          </button>
        </form>

        {/* Skip Button — only in first-login mode (D-02) */}
        {isFirstLogin && (
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading || skipping}
            className="mx-auto block mt-3 py-2 px-6 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-50 transition-colors"
          >
            {skipping ? 'Wird gespeichert...' : 'Später setzen'}
          </button>
        )}

        {/* Back Link — hidden in first-login mode (force decision) */}
        {!isFirstLogin && (
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              &larr; Zurück zur App
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordInner />
    </Suspense>
  )
}
