import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'
import { parsePublicHttpUrl } from '@/lib/url-safety'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
const MAX_MARKDOWN_CHARS = 6000

export async function POST(req: NextRequest) {
  if (!FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: 'Firecrawl not configured' },
      { status: 503 }
    )
  }

  try {
    const rate = await checkRateLimit(getClientIp(req), 'defuddle')
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Zu viele URL-Abfragen. Bitte warte kurz.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter ?? 60) } },
      )
    }

    const { url } = await req.json()

    const parsedUrl = parsePublicHttpUrl(url)
    if (!parsedUrl) {
      return NextResponse.json(
        { error: 'Ungültige oder nicht unterstützte URL.' },
        { status: 400 }
      )
    }

    // Call Firecrawl API
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: parsedUrl.toString(),
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Firecrawl] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Extract content from Firecrawl response
    const rawContent = data.data?.markdown || ''
    const content = rawContent.slice(0, MAX_MARKDOWN_CHARS)
    const title = data.data?.metadata?.title || parsedUrl.hostname
    const excerpt = content.slice(0, 200) + (content.length > 200 ? '...' : '')

    return NextResponse.json({
      title,
      content,
      excerpt,
      url: parsedUrl.toString(),
    })
  } catch (error) {
    console.error('[Defuddle] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process URL' },
      { status: 500 }
    )
  }
}
