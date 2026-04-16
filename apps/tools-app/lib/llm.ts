import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import type { ContentItem, ChatMessage, RecommendationResponse, ContentSource, ChatMode } from '@/lib/types'

// Lite tier uses Gemini 2.5 Flash-Lite (cheap, fast)
const LITE_MODEL = google('gemini-2.5-flash-lite')

function buildSystemPrompt(items: ContentItem[]): string {
  const knowledgeBase = items
    .map((item) => {
      return `---
SLUG: ${item.slug}
TITEL: ${item.title}
TYP: ${item.type}
KATEGORIE: ${item.category}
ZUSAMMENFASSUNG: ${item.summary}
${item.use_cases?.length ? `USE CASES: ${item.use_cases.join(', ')}` : ''}
${item.pricing_model ? `PRICING: ${item.pricing_model}` : ''}
${item.quick_win ? `QUICK WIN: ${item.quick_win}` : ''}

INHALT:
${item.content}
---`
    })
    .join('\n\n')

  return `Du bist der KI-Assistent von Generation AI — für Studierende im DACH-Raum.

## STRIKTE REGELN — KEINE AUSNAHMEN

1. **NUR AUS DER WISSENSBASIS ANTWORTEN**
   Du darfst AUSSCHLIESSLICH Informationen aus der unten stehenden Wissensbasis verwenden.
   Erfinde NIEMALS Tools, Fakten oder Empfehlungen die nicht explizit in der Wissensbasis stehen.

2. **"WEISS ICH NICHT" BEI FEHLENDER INFO**
   Wenn die Wissensbasis keine Antwort auf die Frage enthält:
   - Sage ehrlich: "Dazu habe ich leider keine Informationen in meiner Wissensbasis."
   - Erfinde NICHTS. Halluziniere NICHTS.
   - Lenke zurück zum Thema KI-Tools/KI-Wissen falls passend.

3. **QUELLEN IMMER ANGEBEN**
   Jede Information muss mit der Quelle verknüpft sein.
   Im "sources" Array: alle Slugs der Items aus denen du Infos verwendest.

4. **EMPFEHLUNGEN NUR AUS DER LISTE**
   Tool-Empfehlungen nur mit Slugs aus der Wissensbasis.
   Wenn nichts passt: leeres recommendedSlugs Array, ehrliche Erklärung.

## STIL
- Deutsch, Du-Form, kurz und direkt
- Max 3-4 Sätze Antwort
- Keine Floskeln

## ANTWORT-FORMAT
Antworte AUSSCHLIESSLICH mit validem JSON:
{
  "text": "Deine Antwort hier",
  "recommendedSlugs": ["slug1", "slug2"],
  "sources": [
    {"slug": "slug1", "title": "Titel 1", "type": "tool"},
    {"slug": "slug2", "title": "Titel 2", "type": "concept"}
  ]
}

- recommendedSlugs: Nur bei Tool-Empfehlungen (max 5)
- sources: ALLE Items aus denen du Informationen verwendet hast

## WISSENSBASIS

${knowledgeBase}`
}

function parseResponse(raw: string, items: ContentItem[]): RecommendationResponse {
  const trimmed = raw.trim()

  const defaultResponse: RecommendationResponse = {
    text: 'Dazu habe ich leider keine Informationen in meiner Wissensbasis.',
    recommendedSlugs: [],
    sources: [],
  }

  // Direkt parsen
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed.text) {
      return {
        text: parsed.text,
        recommendedSlugs: Array.isArray(parsed.recommendedSlugs) ? parsed.recommendedSlugs : [],
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      }
    }
  } catch {}

  // JSON-Block aus Prosa extrahieren
  const match = trimmed.match(/\{[\s\S]*"text"[\s\S]*\}/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      if (parsed.text) {
        return {
          text: parsed.text,
          recommendedSlugs: Array.isArray(parsed.recommendedSlugs) ? parsed.recommendedSlugs : [],
          sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        }
      }
    } catch {}
  }

  // Fallback: Text ohne JSON — aber JSON-Artefakte entfernen
  if (trimmed) {
    // Entferne häufige JSON-Artefakte die der LLM manchmal hinzufügt
    const cleanedText = trimmed
      // Entferne "sources: []" und "recommendedSlugs: []" Fragmente
      .replace(/\s*sources:\s*\[\s*\]\s*/gi, '')
      .replace(/\s*recommendedSlugs:\s*\[\s*\]\s*/gi, '')
      // Entferne leere JSON-Objekte am Ende
      .replace(/\s*\{\s*\}\s*$/g, '')
      // Entferne Markdown code blocks mit leerem JSON
      .replace(/```json\s*\{?\s*\}?\s*```/gi, '')
      .trim()

    if (cleanedText) {
      return { text: cleanedText, recommendedSlugs: [], sources: [] }
    }
  }

  return defaultResponse
}

export async function getRecommendations(
  message: string,
  history: ChatMessage[],
  items: ContentItem[],
  mode: ChatMode = 'public'
): Promise<RecommendationResponse> {
  // Build conversation messages
  const conversationHistory = history.slice(-6).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const messages = [
    ...conversationHistory,
    { role: 'user' as const, content: message },
  ]

  try {
    const { text } = await generateText({
      model: LITE_MODEL,
      system: buildSystemPrompt(items),
      messages,
    })

    const result = parseResponse(text, items)

    // Slugs validieren — nur Slugs die in items existieren
    const validSlugs = new Set(items.map((i) => i.slug))

    result.recommendedSlugs = result.recommendedSlugs
      .filter((s) => validSlugs.has(s))
      .slice(0, 5)

    // Sources validieren und anreichern
    const validSources: ContentSource[] = []
    const seenSlugs = new Set<string>()

    for (const source of result.sources) {
      if (source.slug && validSlugs.has(source.slug) && !seenSlugs.has(source.slug)) {
        const item = items.find((i) => i.slug === source.slug)
        if (item) {
          validSources.push({
            slug: item.slug,
            title: item.title,
            type: item.type,
          })
          seenSlugs.add(source.slug)
        }
      }
    }
    result.sources = validSources

    return result
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      text: 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.',
      recommendedSlugs: [],
      sources: [],
    }
  }
}
