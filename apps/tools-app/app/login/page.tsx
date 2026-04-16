'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Check deine Mails! Wichtig: Öffne den Link auf DIESEM Gerät/Browser.' })
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setMessage({ type: 'error', text: error.message })
      return
    }

    // Verify session is actually established before redirect
    // This ensures cookies are properly set
    if (!data.session) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Session konnte nicht etabliert werden.' })
      return
    }

    // Double-check by fetching the session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      setMessage({ type: 'error', text: 'Session-Verifikation fehlgeschlagen.' })
      return
    }

    // Small delay to ensure cookies are written
    await new Promise(resolve => setTimeout(resolve, 100))

    // Success - redirect to home
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center mx-auto">
              <span className="w-3 h-3 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold text-[var(--text)]">Bei Generation AI anmelden</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Zugang zum erweiterten KI-Assistenten
          </p>
        </div>

        {/* Form */}
        <form onSubmit={showPassword ? handlePasswordLogin : handleMagicLink} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
            />
          </div>

          {/* Password (optional) */}
          {showPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dein Passwort"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email}
            className="mx-auto block py-2.5 px-6 rounded-full bg-[var(--accent)] text-bg font-medium shadow-[0_0_12px_var(--accent-glow)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Wird geladen...
              </span>
            ) : showPassword ? (
              'Anmelden'
            ) : (
              'Magic Link senden'
            )}
          </button>
        </form>

        {/* Toggle Password Login */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            {showPassword ? 'Lieber Magic Link nutzen' : 'Mit Passwort anmelden'}
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            &larr; Zurück zur App
          </Link>
        </div>
      </div>
    </div>
  )
}
