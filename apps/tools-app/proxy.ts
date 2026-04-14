import { createClient } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // 2. Build CSP directives
  const isDev = process.env.NODE_ENV === 'development'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wbohulnuwqrhystaamjc.supabase.co'

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ''}`,
    "img-src 'self' blob: data: https://logo.clearbit.com",
    "font-src 'self'",
    `connect-src 'self' ${supabaseUrl}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]
  const cspHeader = cspDirectives.join('; ')

  // 3. Prepare request headers with nonce for Server Components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // 4. Create response with modified request headers
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // 5. Execute Supabase Auth (can modify response via cookies)
  const { supabase, response: updatedResponse } = createClient(request, response)
  response = updatedResponse

  // CRITICAL: Use getUser(), not getSession() — validates JWT against Supabase
  // This refreshes the session if needed
  await supabase.auth.getUser()

  // 6. CSP temporarily disabled - caused 500s on Vercel Edge Runtime
  // The CSP header value was rejected as invalid by Headers.set()
  // TODO: Fix CSP format for Edge Runtime compatibility
  // response.headers.set('Content-Security-Policy-Report-Only', cspHeader)

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
