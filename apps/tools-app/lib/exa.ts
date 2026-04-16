// lib/exa.ts
// Exa.ai /answer endpoint - open search with spam filter

const EXA_ANSWER_URL = 'https://api.exa.ai/answer'

// Domains to exclude (low quality, SEO spam, opinions over facts)
const EXCLUDED_DOMAINS = [
  "pinterest.com",
  "quora.com",
  "reddit.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "instagram.com",
  "tiktok.com",
]

export interface ExaCitation {
  url: string
  title: string
}

export interface ExaAnswerResponse {
  answer: string
  citations: ExaCitation[]
  query: string
}

/**
 * Get an answer using Exa.ai /answer endpoint
 * Uses open search (no domain whitelist) for best quality
 * Excludes known spam/social media domains
 */
export async function searchTrustedSources(
  query: string,
  _limit: number = 5
): Promise<ExaAnswerResponse> {
  const apiKey = process.env.EXA_API_KEY

  if (!apiKey) {
    return {
      query,
      answer: "Die Web-Recherche ist momentan nicht konfiguriert.",
      citations: []
    }
  }

  try {
    const response = await fetch(EXA_ANSWER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        query,
        excludeDomains: EXCLUDED_DOMAINS,
        // text: true entfernt — /answer gibt bereits eine Zusammenfassung
      }),
    })

    if (!response.ok) {
      console.error('Exa API error:', response.status, await response.text())
      return {
        query,
        answer: "Bei der Recherche ist ein Fehler aufgetreten.",
        citations: []
      }
    }

    const data = await response.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const citations: ExaCitation[] = (data.citations || []).map((c: any) => ({
      url: c.url || '',
      title: c.title || 'Quelle'
    }))

    return {
      query,
      answer: data.answer || '',
      citations
    }
  } catch (error) {
    console.error('Exa answer error:', error)
    return {
      query,
      answer: "Bei der Recherche ist ein Fehler aufgetreten.",
      citations: []
    }
  }
}
