import OpenAI from 'openai'
import { KB_TOOLS_OPENAI, executeTool } from './kb-tools'
import type { ChatMessage, ContentSource, ContentType } from './types'

// Primary: GLM-5.1 via Z.AI Coding Plan
const glmClient = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://api.z.ai/api/coding/paas/v4',
})

// Fallback: MiniMax M2.7
const minimaxClient = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: 'https://api.minimax.io/v1',
})

const PRIMARY_MODEL = 'glm-5.1'
const FALLBACK_MODEL = 'MiniMax-M2.7'

/**
 * Strip <think> reasoning tags from response (GLM & MiniMax both use these)
 */
function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

/**
 * Create chat completion with GLM-5.1 primary, MiniMax fallback
 */
async function createCompletion(
  messages: OpenAI.ChatCompletionMessageParam[],
  tools: OpenAI.ChatCompletionTool[]
): Promise<{ response: OpenAI.ChatCompletion; model: string }> {
  // Try GLM-5.1 first
  try {
    const response = await glmClient.chat.completions.create({
      model: PRIMARY_MODEL,
      max_tokens: 2000,
      tools,
      messages,
    })
    return { response, model: PRIMARY_MODEL }
  } catch (error) {
    console.warn(`GLM-5.1 failed, falling back to MiniMax:`, (error as Error).message)

    // Fallback to MiniMax
    const response = await minimaxClient.chat.completions.create({
      model: FALLBACK_MODEL,
      max_tokens: 2000,
      tools,
      messages,
    })
    return { response, model: FALLBACK_MODEL }
  }
}

/**
 * System prompt for V2 Member Agent
 * From v3-architecture.md
 */
export const SYSTEM_PROMPT = `Du bist der KI-Assistent von Generation AI — für Studierende im DACH-Raum.

Du hast Zugriff auf:
1. **Wissensbasis (KB)** — kuratierte Inhalte zu KI-Tools, Concepts, FAQs
2. **Web-Recherche** — vertrauenswürdige externe Quellen (offizielle Docs, GitHub, etc.)

## Wie du vorgehst

1. IMMER zuerst KB durchsuchen (kb_search, kb_list, kb_read)
2. KB-Treffer? → Antworte damit, nenne die Quelle
3. Kein KB-Treffer? → web_search() für externe Recherche (nur KI/Tech-Themen!)
4. Antworte basierend auf den Recherche-Ergebnissen

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
 * Primary: GLM-5.1, Fallback: MiniMax M2.7
 *
 * @param message - User's message
 * @param history - Previous messages in the conversation
 * @returns Agent result with text, sources, and iteration count
 */
export async function runAgent(
  message: string,
  history: ChatMessage[] = []
): Promise<AgentResult> {
  // Build messages array for OpenAI-compatible API
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Include history (last 6 messages max)
    ...history.slice(-6).map((msg): OpenAI.ChatCompletionMessageParam => ({
      role: msg.role as 'user' | 'assistant',
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
    const { response, model } = await createCompletion(messages, KB_TOOLS_OPENAI)

    const choice = response.choices[0]
    const assistantMessage = choice.message

    // Agent ist fertig (no tool calls)
    if (choice.finish_reason === 'stop' || !assistantMessage.tool_calls?.length) {
      const text = stripThinkTags(assistantMessage.content || '')
      return { text, sources, iterations }
    }

    // Agent will Tools nutzen
    if (assistantMessage.tool_calls?.length) {
      // Add assistant message with tool calls
      messages.push(assistantMessage)

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        // Handle both function and custom tool call formats
        const funcCall = 'function' in toolCall ? toolCall.function : null
        if (!funcCall) continue

        const args = JSON.parse(funcCall.arguments)
        const result = await executeTool(funcCall.name, args)

        // Bei kb_read: Item zu sources hinzufügen
        if (funcCall.name === 'kb_read') {
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

        // Add tool result
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result
        })
      }

      iterations++
    } else {
      // No tool calls - extract text and return
      const text = stripThinkTags(assistantMessage.content || '') || 'Ich konnte keine vollständige Antwort finden.'
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
