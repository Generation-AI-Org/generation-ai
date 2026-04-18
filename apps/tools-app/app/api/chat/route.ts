import { NextResponse } from 'next/server'
import { getFullContent } from '@/lib/content'
import { getRecommendations } from '@/lib/llm'
import { runAgent } from '@/lib/agent'
import { createServerClient } from '@/lib/supabase'
import { sanitizeUserInput } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'
import type { ChatMessage, ChatMode, ChatContext } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, history = [], sessionId, mode = 'public', context } = body as {
      message: string
      history?: ChatMessage[]
      sessionId?: string
      mode?: ChatMode
      context?: ChatContext
    }

    // Strict context validation (T-15-04/T-15-07): all fields must be strings,
    // summary bounded to < 2000 chars to protect token budget. Invalid → ignore
    // silently, never fail the request.
    const validContext: ChatContext | undefined =
      context &&
      typeof context.slug === 'string' &&
      typeof context.title === 'string' &&
      typeof context.type === 'string' &&
      typeof context.summary === 'string' &&
      context.slug.length < 200 &&
      context.title.length < 300 &&
      context.type.length < 100 &&
      context.summary.length < 2000
        ? context
        : undefined

    // Rate limit check FIRST (per D-14, D-15)
    const ip = getClientIp(req)
    const rateLimitSessionId = sessionId ?? 'anonymous'
    const rateLimit = await checkRateLimit(ip, rateLimitSessionId)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Du sendest gerade viele Nachrichten. Bitte warte kurz.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter ?? 60),
            'X-RateLimit-Limit': String(rateLimit.limit ?? 20),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.reset ?? Date.now() + 60000),
          },
        }
      )
    }

    // Validate mode — only 'public' or 'member' accepted, default to 'public'
    const validMode: ChatMode = mode === 'member' ? 'member' : 'public'

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Nachricht fehlt.' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Session anlegen oder fortführen
    let activeSessionId = sessionId
    if (!activeSessionId) {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({})
        .select('id')
        .single()
      if (error || !session) throw new Error('Session konnte nicht angelegt werden.')
      activeSessionId = session.id
    }

    // Sanitize user input before storage (per D-07, D-10)
    const sanitizedMessage = sanitizeUserInput(message)

    // Build LLM-only context prefix (T-15-08): sanitize every field, never
    // persist this prefix to chat_messages — pure LLM transport.
    const contextPrefix = validContext
      ? `Der User liest gerade: ${sanitizeUserInput(validContext.title)} (${sanitizeUserInput(validContext.type)})\nKurzbeschreibung: ${sanitizeUserInput(validContext.summary)}\nSlug: ${sanitizeUserInput(validContext.slug)}\n\n`
      : ''

    const messageForLLM = contextPrefix + sanitizedMessage

    // User-Message persistieren (WITHOUT contextPrefix — DB bloat + PII-adjacent)
    await supabase.from('chat_messages').insert({
      session_id: activeSessionId,
      role: 'user',
      content: sanitizedMessage,
    })

    if (validMode === 'member') {
      // V2: Agent mit Tool-Calling
      const result = await runAgent(messageForLLM, history)

      // Assistant-Message persistieren (mit sources)
      await supabase.from('chat_messages').insert({
        session_id: activeSessionId,
        role: 'assistant',
        content: result.text,
        // recommended_slugs bleibt leer fuer V2
      })

      return NextResponse.json({
        sessionId: activeSessionId,
        text: result.text,
        recommendedSlugs: result.sources.map((s) => s.slug),
        sources: result.sources,
      })
    } else {
      // V1: Full-Context (bestehender Code)
      const items = await getFullContent()
      const result = await getRecommendations(messageForLLM, history, items, validMode)

      // Assistant-Message persistieren
      await supabase.from('chat_messages').insert({
        session_id: activeSessionId,
        role: 'assistant',
        content: result.text,
        recommended_slugs: result.recommendedSlugs,
      })

      return NextResponse.json({
        sessionId: activeSessionId,
        text: result.text,
        recommendedSlugs: result.recommendedSlugs,
        sources: result.sources,
      })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
