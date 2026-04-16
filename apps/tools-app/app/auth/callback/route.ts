import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

  // Determine redirect URL based on type
  const redirectUrl = type === 'recovery'
    ? `${origin}/auth/set-password`
    : origin

  // Create response FIRST - cookies will be set on this response
  const response = NextResponse.redirect(redirectUrl)

  // Create Supabase client that sets cookies directly on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // CRITICAL: Set cookies on the RESPONSE, not cookieStore
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Exchange PKCE code for session - this triggers setAll with auth cookies
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Code exchange error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  console.log('Auth callback success, redirecting to:', redirectUrl)

  // Return response WITH cookies attached
  return response
}
