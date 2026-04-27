import { NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'
import { parsePublicHttpUrl } from '@/lib/url-safety'

const MAX_CONTENT_LENGTH = 4000 // Characters to extract
const MAX_HTML_BYTES = 2 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const rate = await checkRateLimit(getClientIp(req), 'extract-url')
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Zu viele URL-Abfragen. Bitte warte kurz.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter ?? 60) } },
      )
    }

    const body = await req.json()
    const { url } = body as { url: string }

    if (!url?.trim()) {
      return NextResponse.json({ error: 'URL fehlt.' }, { status: 400 })
    }

    const parsedUrl = parsePublicHttpUrl(url)
    if (!parsedUrl) {
      return NextResponse.json(
        { error: 'Ungültige oder nicht unterstützte URL.' },
        { status: 400 }
      )
    }

    // Fetch the URL with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    let response: Response
    try {
      response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GenAI-Bot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
    } catch (error) {
      clearTimeout(timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Die Seite hat zu lange zum Laden gebraucht. Bitte versuche es mit einer anderen URL.' },
          { status: 408 }
        )
      }
      return NextResponse.json(
        { error: 'Konnte die URL nicht laden. Bitte prüfe ob die Seite erreichbar ist.' },
        { status: 502 }
      )
    }
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Die Seite gab einen Fehler zurück (${response.status}).` },
        { status: 502 }
      )
    }
    const length = Number(response.headers.get('content-length') ?? '0')
    if (length > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: 'Die Seite ist zu groß zum Auslesen.' },
        { status: 413 },
      )
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return NextResponse.json(
        { error: 'Diese URL enthält keinen lesbaren Text (nur HTML-Seiten werden unterstützt).' },
        { status: 400 }
      )
    }

    const html = await response.text()

    // Parse with JSDOM and Readability
    const dom = new JSDOM(html, { url: parsedUrl.toString() })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article || !article.textContent?.trim()) {
      return NextResponse.json(
        { error: 'Konnte keinen lesbaren Inhalt aus der Seite extrahieren.' },
        { status: 422 }
      )
    }

    // Clean and truncate the content
    let content = article.textContent
      .replace(/\s+/g, ' ')
      .trim()

    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.slice(0, MAX_CONTENT_LENGTH) + '...'
    }

    return NextResponse.json({
      title: article.title || parsedUrl.hostname,
      content,
      url: parsedUrl.toString(),
      excerpt: article.excerpt || content.slice(0, 200) + '...',
    })
  } catch (error) {
    console.error('URL extraction error:', error)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
