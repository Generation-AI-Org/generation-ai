import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@genai/auth/server'

// Route liest Cookies via Supabase-Server-Client → ist faktisch dynamic.
// Explizit setzen als Versicherung gegen künftige Refactors, die den
// Cookie-Zugriff entfernen und die Route accidentally static prerendern
// würden (siehe LEARNINGS.md 2026-04-18, CSP + static prerendering).
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const origin = new URL(request.url).origin

  if (!token_hash || !type) {
    console.error('Auth confirm: missing token_hash or type')
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    console.error('OTP verification error:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  // Recovery flow: always to /auth/set-password (password reset UI), D-06 — template stays
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/set-password`)
  }

  // First-Login-Prompt (D-01, D-02): Wenn has_password weder true noch false, First-Login-Screen zeigen.
  // has_password=true → hat Passwort, kein Prompt.
  // has_password=false → hat Skip gewählt, kein Re-Prompt.
  // has_password=undefined → Alt-User oder neuer User, First-Login-Screen mit Skip-Option.
  const hasPassword = data?.user?.user_metadata?.has_password
  if (hasPassword !== true && hasPassword !== false) {
    return NextResponse.redirect(`${origin}/auth/set-password?first=1`)
  }

  // Safe-redirect: nur same-origin Paths erlauben.
  // `//evil.com/path` und `/\\evil.com` würden sonst als protocol-relative URL
  // an externe Domain leiten (open-redirect via Magic-Link, Phishing-Vektor).
  const isSafePath =
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.startsWith('/\\')
  const redirectPath = isSafePath ? next : '/'
  return NextResponse.redirect(`${origin}${redirectPath}`)
}
