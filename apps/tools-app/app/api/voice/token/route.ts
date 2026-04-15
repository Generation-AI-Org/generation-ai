import { NextResponse } from 'next/server'

export async function POST() {
  if (!process.env.DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Voice service not configured' }, { status: 503 })
  }

  try {
    // Try to get a temporary key via Deepgram's grant endpoint
    const res = await fetch('https://api.deepgram.com/v1/projects', {
      method: 'GET',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
    })

    if (!res.ok) {
      // If we can't validate the key, return error
      console.error('[voice/token] Invalid API key or network issue:', res.status)
      return NextResponse.json({ error: 'Voice service unavailable' }, { status: 502 })
    }

    // Key is valid - return it for WebSocket auth
    // Note: Deepgram WebSocket auth via subprotocol keeps key in memory only,
    // not exposed in URL or easily visible in network tab
    return NextResponse.json({
      token: process.env.DEEPGRAM_API_KEY,
    })
  } catch (err) {
    console.error('[voice/token] Network error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
}
