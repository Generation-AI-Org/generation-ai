import { createClient } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Create response first, then modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const { supabase, response: updatedResponse } = createClient(request, response)
  response = updatedResponse

  // CRITICAL: Use getUser(), not getSession() — validates JWT against Supabase
  // This refreshes the session if needed
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
