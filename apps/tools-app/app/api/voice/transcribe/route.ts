import { NextResponse } from 'next/server'
import { createClient as createAuthClient } from '@genai/auth/server'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'

const MAX_AUDIO_BYTES = 10 * 1024 * 1024

export async function POST(request: Request) {
  if (!process.env.DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Voice service not configured' }, { status: 503 })
  }

  try {
    const auth = await createAuthClient()
    const {
      data: { user },
    } = await auth.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Bitte melde dich an, um Spracheingabe zu nutzen.' },
        { status: 401 },
      )
    }

    const rate = await checkRateLimit(getClientIp(request), 'voice-transcribe')
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Zu viele Transkriptionen. Bitte warte kurz.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfter ?? 60) },
        },
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: 'Audio ist zu groß. Bitte nimm eine kürzere Aufnahme auf.' },
        { status: 413 },
      )
    }

    // Convert blob to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Send to Deepgram pre-recorded API
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?' + new URLSearchParams({
        model: 'nova-2',
        language: 'de',           // German primary
        detect_language: 'true',  // Fallback to detected language if not German
        punctuate: 'true',
        smart_format: 'true',
      }).toString(),
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': audioFile.type || 'audio/webm',
        },
        body: buffer,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[voice/transcribe] Deepgram error:', response.status, errorText)
      return NextResponse.json({ error: 'Transcription failed' }, { status: 502 })
    }

    const data = await response.json()
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    return NextResponse.json({ transcript })
  } catch (err) {
    console.error('[voice/transcribe] Error:', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
