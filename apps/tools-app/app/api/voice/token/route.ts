import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Voice token endpoint disabled. Use /api/voice/transcribe.' },
    { status: 410 },
  )
}
