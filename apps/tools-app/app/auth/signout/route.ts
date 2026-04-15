import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://tools.generation-ai.org'), {
    status: 302,
  })
}

// Also support GET for simple link-based logout
export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://tools.generation-ai.org'), {
    status: 302,
  })
}
