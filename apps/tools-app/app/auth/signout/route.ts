import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function handleSignOut() {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.signOut()

  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://tools.generation-ai.org'),
    { status: 302 }
  )
}

export async function POST() {
  return handleSignOut()
}

// Also support GET for simple link-based logout
export async function GET() {
  return handleSignOut()
}
