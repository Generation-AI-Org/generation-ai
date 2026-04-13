'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      // Parse URL hash for tokens (Magic Link implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const error = hashParams.get('error')

      // Check for error first
      if (error) {
        console.error('Auth error:', error, hashParams.get('error_description'))
        window.location.href = `/login?error=${error}`
        return
      }

      // If we have tokens, manually set the session
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

        // Success - redirect to home
        window.location.href = '/'
        return
      }

      // No tokens in hash - check if already signed in
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
