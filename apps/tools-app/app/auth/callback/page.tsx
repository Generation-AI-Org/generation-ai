'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient, needsFirstLoginPrompt } from '@genai/auth'

/**
 * Legacy fallback callback page.
 *
 * The canonical magic link flow goes through /auth/confirm/route.ts
 * (server-side verifyOtp with token_hash). This page only handles:
 *  - Error redirects from Supabase (missing template params, etc.)
 *  - Legacy hash-based implicit flow (very old magic links)
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handle = async () => {
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')

      if (errorParam) {
        const msg = errorDescription || errorParam
        setStatus('error')
        setErrorMessage(msg)
        setTimeout(() => {
          window.location.href = `/login?error=${encodeURIComponent(errorParam)}`
        }, 2000)
        return
      }

      // Legacy hash-based implicit flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      const supabase = createBrowserClient()

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
          setTimeout(() => {
            window.location.href = '/login?error=session_failed'
          }, 2000)
          return
        }

        const hashType = hashParams.get('type')
        if (hashType === 'recovery') {
          window.location.href = '/auth/set-password'
          return
        }

        // Phase 19: First-Login-Prompt via shared tri-state helper.
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // WR-02: getUser kann null liefern wenn Session nicht etabliert wurde.
          window.location.href = '/login?error=session_failed'
          return
        }
        window.location.href = needsFirstLoginPrompt(user) ? '/auth/set-password?first=1' : '/'
        return
      }

      // No params — PKCE flow, session was set server-side via cookie.
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // WR-02: Session-Etablierung fehlgeschlagen — User zurück zum Login.
        window.location.href = '/login?error=session_failed'
        return
      }
      window.location.href = needsFirstLoginPrompt(user) ? '/auth/set-password?first=1' : '/'
    }

    handle()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-muted)] text-sm">Anmeldung wird verarbeitet...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-8 h-8 bg-[var(--status-error)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-[var(--status-error)] text-sm">{errorMessage || 'Fehler bei der Anmeldung'}</p>
          </>
        )}
      </div>
    </div>
  )
}
