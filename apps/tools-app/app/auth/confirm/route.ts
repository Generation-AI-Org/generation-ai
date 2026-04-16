import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@genai/auth'

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
  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    console.error('OTP verification error:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/set-password`)
  }

  const redirectPath = next.startsWith('/') ? next : '/'
  return NextResponse.redirect(`${origin}${redirectPath}`)
}
