import Anthropic from '@anthropic-ai/sdk'
import { KB_TOOLS, executeTool } from './kb-tools'
import type { ChatMessage, ContentSource, ContentType } from './types'

// Anthropic client (Claude Haiku 4.5 — fast + excellent tool-use)
let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 4096
const MAX_ITERATIONS = 5

export const SYSTEM_PROMPT = `Du bist der KI-Assistent von Generation AI — für Studierende im DACH-Raum.

Du hast Zugriff auf:
1. **Wissensbasis (KB)** — kuratierte Inhalte zu KI-Tools, Concepts, FAQs
2. **Web-Recherche** — vertrauenswürdige externe Quellen (offizielle Docs, GitHub, etc.)

## Wie du vorgehst

1. IMMER zuerst KB durchsuchen (kb_search, kb_list, kb_read)
2. KB-Treffer? → Antworte damit, nenne die Quelle
3. Kein KB-Treffer? → web_search() für externe Recherche (nur KI/Tech-Themen!)
4. Antworte basierend auf den Recherche-Ergebnissen

## Tool-Budget (WICHTIG)

- **Max 3 Tool-Calls insgesamt pro Antwort.** Nach 3 Recherchen MUSST du antworten, auch wenn die Info unvollständig ist.
- Nach kb_search: Wähle das 1-2 relevanteste Item und lies nur das via kb_read. Liste nicht alle auf.
- Wiederhole kb_list/kb_search nicht mit minimal anderen Queries — wenn die erste Suche nichts Brauchbares ergab, ist das Thema nicht in der KB.

## Antwort-Format

**Bei KB-Treffer:**
Antworte direkt. Am Ende: "📚 Quelle: [Item-Titel]"

**Bei Web-Recherche:**
Antworte basierend auf den Ergebnissen. Am Ende:
"🔗 Quellen: [URL1], [URL2]"

## Regeln

- KB hat Priorität — immer zuerst checken
- web_search NUR für KI/Tech-Themen, nicht für allgemeines Wissen
- Bei web_search: Füge "2026" zur Query hinzu für aktuelle Ergebnisse (z.B. "GPT-5 features 2026")
- Keine Infos erfinden — wenn nichts gefunden: "Dazu konnte ich nichts finden"
- Deutsch, Du-Form, direkt und hilfreich
- Bei Fragen zu Generation AI selbst: "Stell deine Frage in unserer Community auf Circle!"`

export interface AgentResult {
  text: string
  sources: ContentSource[]
  iterations: number
}

/**
 * Extract text content from an Anthropic response's content blocks.
 */
function extractText(content: Anthropic.ContentBlock[]): string {
  const textBlock = content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  return textBlock ? textBlock.text : ''
}

/**
 * Run the V2 agent with Claude Haiku 4.5 + tool-calling loop.
 *
 * Flow:
 * 1. Send user message + tool definitions
 * 2. Claude responds with either end_turn (final text) or tool_use (needs tools)
 * 3. On tool_use: execute tools, send results back, repeat (max 5 iterations)
 * 4. On max iterations: force final synthesis without tools
 */
export async function runAgent(
  message: string,
  history: ChatMessage[] = []
): Promise<AgentResult> {
  const agentStart = Date.now()
  console.log(`[Timing] === Agent started (Claude Haiku 4.5) ===`)

  // Build message history (Anthropic expects alternating user/assistant, no system)
  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-6).map((msg): Anthropic.MessageParam => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ]

  const sources: ContentSource[] = []
  const seenSlugs = new Set<string>()
  let iterations = 0

  while (iterations < MAX_ITERATIONS) {
    const iterStart = Date.now()
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: KB_TOOLS,
      messages,
    })
    const elapsed = Date.now() - iterStart
    console.log(
      `[Timing] Claude call ${iterations + 1}: ${elapsed}ms | ${response.usage.input_tokens} in, ${response.usage.output_tokens} out | stop: ${response.stop_reason}`
    )

    // Append assistant response to conversation
    messages.push({ role: 'assistant', content: response.content })

    // End of turn → final answer
    if (response.stop_reason === 'end_turn') {
      const text = extractText(response.content)
      console.log(
        `[Timing] === Agent finished in ${Date.now() - agentStart}ms (${iterations + 1} iterations) ===`
      )
      return { text, sources, iterations: iterations + 1 }
    }

    // Tool use → execute all requested tools
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      )

      const toolResults: Anthropic.ToolResultBlockParam[] = []
      for (const block of toolUseBlocks) {
        const toolStart = Date.now()
        const result = await executeTool(
          block.name,
          block.input as Record<string, unknown>
        )
        console.log(
          `[Timing] Tool ${block.name}: ${Date.now() - toolStart}ms`
        )

        // Track sources from kb_read calls
        if (block.name === 'kb_read') {
          try {
            const parsed = JSON.parse(result)
            if (parsed?.slug && !seenSlugs.has(parsed.slug)) {
              seenSlugs.add(parsed.slug)
              sources.push({
                slug: parsed.slug,
                title: parsed.title,
                type: parsed.type as ContentType,
              })
            }
          } catch {
            // Ignore parse errors
          }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        })
      }

      messages.push({ role: 'user', content: toolResults })
      iterations++
    } else {
      // Unexpected stop_reason (max_tokens, stop_sequence, etc.) → return what we have
      const text = extractText(response.content) || 'Ich konnte keine vollständige Antwort finden.'
      console.log(
        `[Timing] === Agent finished with stop_reason=${response.stop_reason} in ${Date.now() - agentStart}ms ===`
      )
      return { text, sources, iterations: iterations + 1 }
    }
  }

  // Max iterations reached — force a final synthesis call without tools
  console.log(`[Timing] === Max iterations reached, forcing synthesis ===`)
  const synthMessages: Anthropic.MessageParam[] = [
    ...messages,
    {
      role: 'user',
      content:
        'Tool-Budget erschöpft. Antworte jetzt final auf meine ursprüngliche Frage, basierend auf den bisher recherchierten Infos. Wenn die Infos unvollständig sind, sag das offen — aber gib trotzdem eine Antwort. Keine weiteren Recherchen.',
    },
  ]
  const synthStart = Date.now()
  const synthResponse = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: synthMessages,
  })
  console.log(`[Timing] Synthesis call: ${Date.now() - synthStart}ms`)

  const synthText = extractText(synthResponse.content)
  console.log(
    `[Timing] === Agent finished in ${Date.now() - agentStart}ms (${iterations} iterations + synthesis) ===`
  )

  return {
    text:
      synthText ||
      'Ich konnte keine vollständige Antwort finden. Bitte versuche es mit einer anderen Frage.',
    sources,
    iterations,
  }
}
