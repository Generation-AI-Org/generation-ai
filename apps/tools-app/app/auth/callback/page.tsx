'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const type = urlParams.get('type')
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')

      // Handle error from Supabase
      if (error) {
        console.error('Auth callback error:', error, errorDescription)
        setStatus('error')
        setErrorMessage(errorDescription || error)
        setTimeout(() => {
          window.location.href = `/login?error=${encodeURIComponent(error)}`
        }, 2000)
        return
      }

      // PKCE flow: exchange code for session
      // IMPORTANT: This MUST happen client-side because the code verifier
      // is stored in the browser by createBrowserClient
      if (code) {
        console.log('Exchanging code for session...')

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          setStatus('error')
          setErrorMessage(exchangeError.message)
          setTimeout(() => {
            window.location.href = '/login?error=exchange_failed'
          }, 2000)
          return
        }

        // Verify session is actually established
        if (!data.session) {
          console.error('No session after exchange')
          setStatus('error')
          setErrorMessage('Session konnte nicht erstellt werden')
          setTimeout(() => {
            window.location.href = '/login?error=no_session'
          }, 2000)
          return
        }

        console.log('Session established for user:', data.user?.email)
        setStatus('success')

        // Handle password recovery flow
        if (type === 'recovery') {
          window.location.href = '/auth/set-password'
          return
        }

        // Success - redirect to home
        // Small delay to ensure cookies are written
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
        return
      }

      // Fallback: Check hash for legacy implicit flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        console.log('Using legacy hash flow...')

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          console.error('Set session error:', sessionError)
          setStatus('error')
          setErrorMessage(sessionError.message)
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

        setStatus('success')
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
        return
      }

      // No code or tokens - something went wrong
      console.error('No code or tokens in callback URL')
      setStatus('error')
      setErrorMessage('Keine Authentifizierungsdaten gefunden')
      setTimeout(() => {
        window.location.href = '/login?error=no_tokens'
      }, 2000)
    }

    handleAuth()
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
        {status === 'success' && (
          <>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 text-sm">Erfolgreich angemeldet!</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 text-sm">{errorMessage || 'Fehler bei der Anmeldung'}</p>
          </>
        )}
      </div>
    </div>
  )
}
