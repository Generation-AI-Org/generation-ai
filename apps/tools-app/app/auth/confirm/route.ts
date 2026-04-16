import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const origin = new URL(request.url).origin

  // Validate required parameters
  if (!token_hash || !type) {
    console.error('Auth confirm: missing token_hash or type')
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
  }

  // Create Supabase client with cookie access
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Verify OTP token - this works cross-device, no code_verifier needed!
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  })

  if (error) {
    console.error('OTP verification error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  console.log('Auth confirm success, redirecting to:', next)

  // Handle password recovery flow
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/set-password`)
  }

  // Success - redirect to next or home
  const redirectPath = next.startsWith('/') ? next : '/'
  return NextResponse.redirect(`${origin}${redirectPath}`)
}
