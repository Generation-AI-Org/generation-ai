'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      // Check for PKCE code in query params (modern Supabase flow)
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const type = urlParams.get('type')

      // Check for error in query or hash
      const error = urlParams.get('error')
      if (error) {
        console.error('Auth error:', error, urlParams.get('error_description'))
        window.location.href = `/login?error=${error}`
        return
      }

      // PKCE flow: exchange code for session
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          window.location.href = '/login?error=exchange_failed'
          return
        }

        // Check if this is a password recovery flow
        if (type === 'recovery') {
          window.location.href = '/auth/set-password'
          return
        }

        // Success - redirect to home
        window.location.href = '/'
        return
      }

      // Fallback: Check hash for legacy implicit flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          console.error('Set session error:', sessionError)
          window.location.href = '/login?error=session_failed'
          return
        }

        const hashType = hashParams.get('type')
        if (hashType === 'recovery') {
          window.location.href = '/auth/set-password'
          return
        }

        window.location.href = '/'
        return
      }

      // No code or tokens - check if already signed in
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/'
      } else {
        window.location.href = '/login?error=no_tokens'
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-muted)] text-sm">Anmeldung wird verarbeitet...</p>
      </div>
    </div>
  )
}
