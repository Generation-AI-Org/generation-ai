import Anthropic from '@anthropic-ai/sdk'
import { KB_TOOLS, executeTool } from './kb-tools'
import type { ChatMessage, ContentSource, ContentType } from './types'

const client = new Anthropic()

/**
 * System prompt for V2 Member Agent
 * From v3-architecture.md
 */
export const SYSTEM_PROMPT = `Du bist der KI-Assistent von Generation AI — für Studierende im DACH-Raum.

Du hast Zugriff auf eine Wissensbasis mit Tools, Concepts, FAQs und Workflows.
Du erkundest die KB selbstständig um Fragen zu beantworten.

## Wie du vorgehst

1. Bei neuen Themen: Erst kb_explore() um Struktur zu verstehen
2. Dann kb_list() für relevante Kategorie (nur Übersichten)
3. Dann kb_read() für spezifische Items die relevant wirken
4. Antworte basierend auf dem was du gelesen hast

## Regeln

- Antworte NUR basierend auf KB-Inhalten
- Wenn nichts passt: "Dazu habe ich keine Infos"
- Keine Halluzinationen
- Nenne deine Quellen (Item-Titel)

## Stil

Deutsch, Du-Form, direkt. Erkläre Dinge so dass Studierende sie verstehen.`

/**
 * Agent result type
 */
export interface AgentResult {
  text: string
  sources: ContentSource[]
  iterations: number
}

/**
 * Run the V2 agent with tool-calling loop
 *
 * @param message - User's message
 * @param history - Previous messages in the conversation
 * @returns Agent result with text, sources, and iteration count
 */
export async function runAgent(
  message: string,
  history: ChatMessage[] = []
): Promise<AgentResult> {
  // Build messages array for Anthropic API
  const messages: Anthropic.MessageParam[] = [
    // Include history (last 6 messages max)
    ...history.slice(-6).map((msg): Anthropic.MessageParam => ({
      role: msg.role,
      content: msg.content
    })),
    // Add current user message
    { role: 'user', content: message }
  ]

  // Track sources from kb_read calls
  const sources: ContentSource[] = []
  const seenSlugs = new Set<string>()

  // Max 5 Tool-Calls pro Request (Cost-Limit per CONTEXT.md)
  let iterations = 0
  const maxIterations = 5

  while (iterations < maxIterations) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: KB_TOOLS,
      messages
    })

    // Agent ist fertig
    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text')
      const text = textBlock && textBlock.type === 'text' ? textBlock.text : ''
      return { text, sources, iterations }
    }

    // Agent will Tools nutzen
    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(block.name, block.input as Record<string, unknown>)

          // Bei kb_read: Item zu sources hinzufügen
          if (block.name === 'kb_read') {
            try {
              const parsed = JSON.parse(result)
              if (parsed && parsed.slug && !seenSlugs.has(parsed.slug)) {
                seenSlugs.add(parsed.slug)
                sources.push({
                  slug: parsed.slug,
                  title: parsed.title,
                  type: parsed.type as ContentType
                })
              }
            } catch {
              // Ignore parse errors
            }
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result
          })
        }
      }

      // Add assistant response with tool use
      messages.push({ role: 'assistant', content: response.content })
      // Add tool results as user message
      messages.push({ role: 'user', content: toolResults })
      iterations++
    } else {
      // Unexpected stop reason - extract any text and return
      const textBlock = response.content.find(b => b.type === 'text')
      const text = textBlock && textBlock.type === 'text' ? textBlock.text : 'Ich konnte keine vollständige Antwort finden.'
      return { text, sources, iterations }
    }
  }

  // Max iterations reached
  return {
    text: 'Ich konnte keine vollständige Antwort finden. Bitte versuche es mit einer anderen Frage.',
    sources,
    iterations
  }
}
