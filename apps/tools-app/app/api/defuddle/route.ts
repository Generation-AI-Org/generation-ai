import { NextRequest, NextResponse } from 'next/server'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

export async function POST(req: NextRequest) {
  if (!FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: 'Firecrawl not configured' },
      { status: 503 }
    )
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL required' },
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
        url,
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
    const content = data.data?.markdown || ''
    const title = data.data?.metadata?.title || new URL(url).hostname
    const excerpt = content.slice(0, 200) + (content.length > 200 ? '...' : '')

    return NextResponse.json({
      title,
      content,
      excerpt,
      url,
    })
  } catch (error) {
    console.error('[Defuddle] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process URL' },
      { status: 500 }
    )
  }
}
