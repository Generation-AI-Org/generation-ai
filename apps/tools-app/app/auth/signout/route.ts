import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@genai/auth/server'

// POST only. GET would be prefetched by Next.js <Link>, silently
// destroying the session as soon as any component rendered a logout link.
export async function POST() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://tools.generation-ai.org'),
    { status: 302 }
  )
}
