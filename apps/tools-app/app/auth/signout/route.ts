import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@genai/auth/server'

async function handleSignOut() {
  const supabase = await createServerClient()
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
