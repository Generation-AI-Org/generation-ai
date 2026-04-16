import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const type = url.searchParams.get('type')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  const origin = url.origin

  // Handle OAuth/Magic Link errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  // No code = invalid callback
  if (!code) {
    console.error('Auth callback: no code provided')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
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

  // Exchange PKCE code for session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Code exchange error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Verify session was actually established
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Session verification failed:', userError?.message)
    return NextResponse.redirect(`${origin}/login?error=session_failed`)
  }

  console.log('Auth callback success: user', user.id, 'type:', type)

  // Handle password recovery flow
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/set-password`)
  }

  // Success - redirect to home
  return NextResponse.redirect(origin)
}
