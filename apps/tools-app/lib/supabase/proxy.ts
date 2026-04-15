import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function createClient(request: NextRequest, response: NextResponse) {
  // Use a holder object so setAll can update the response reference
  const responseHolder = { current: response }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on request (for subsequent server calls)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Recreate response with updated request headers
          responseHolder.current = NextResponse.next({
            request: { headers: request.headers },
          })
          // Set cookies on response (for browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            responseHolder.current.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Return getter so caller always gets the latest response
  return {
    supabase,
    get response() { return responseHolder.current }
  }
}
