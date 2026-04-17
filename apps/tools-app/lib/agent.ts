import OpenAI from 'openai'
import { KB_TOOLS_OPENAI, executeTool } from './kb-tools'
import type { ChatMessage, ContentSource, ContentType } from './types'

// Gemini via OpenAI-compatible API (supports tool calling)
let _geminiClient: OpenAI | null = null

function getGeminiClient(): OpenAI {
  if (!_geminiClient) {
    _geminiClient = new OpenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    })
  }
  return _geminiClient
}

const MODEL = 'gemini-3-flash-preview'

/**
 * Strip <think> reasoning tags from response
 */
function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

/**
 * Create chat completion with Gemini 3 Flash
 */
async function createCompletion(
  messages: OpenAI.ChatCompletionMessageParam[],
  tools: OpenAI.ChatCompletionTool[]
): Promise<{ response: OpenAI.ChatCompletion; model: string }> {
  const startTime = Date.now()

  console.log(`[Timing] Gemini 3 Flash request starting...`)
  // reasoning_effort: 'low' — Gemini 3 thinking cannot be disabled; default effort
  // makes the model over-plan and keep requesting more tool calls instead of
  // synthesizing. "low" still thinks, just less, and emits finish_reason: stop reliably.
  // max_completion_tokens (not max_tokens) is the OpenAI-compat param that includes
  // reasoning tokens for thinking models — 8000 leaves headroom for reasoning + answer.
  const response = await getGeminiClient().chat.completions.create({
    model: MODEL,
    max_completion_tokens: 8000,
    reasoning_effort: 'low',
    tools: tools.length ? tools : undefined,
    messages,
  })
  const elapsed = Date.now() - startTime
  const usage = response.usage
  const reasoning = usage?.completion_tokens_details?.reasoning_tokens
  console.log(`[Timing] Gemini completed in ${elapsed}ms | Tokens: ${usage?.prompt_tokens ?? '?'} in, ${usage?.completion_tokens ?? '?'} out (reasoning: ${reasoning ?? '?'})`)
  return { response, model: MODEL }
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
 * Primary: MiniMax, Fallback: Gemini Flash-Lite
 *
 * @param message - User's message
 * @param history - Previous messages in the conversation
 * @returns Agent result with text, sources, and iteration count
 */
export async function runAgent(
  message: string,
  history: ChatMessage[] = []
): Promise<AgentResult> {
  const agentStart = Date.now()
  console.log(`[Timing] === Agent started ===`)

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
    console.log(`[Timing] --- Iteration ${iterations + 1} starting ---`)
    const iterStart = Date.now()
    const { response, model } = await createCompletion(messages, KB_TOOLS_OPENAI)
    console.log(`[Timing] LLM call completed in ${Date.now() - iterStart}ms (model: ${model})`)

    const choice = response.choices[0]
    const assistantMessage = choice.message

    // Agent ist fertig (no tool calls)
    if (choice.finish_reason === 'stop' || !assistantMessage.tool_calls?.length) {
      const text = stripThinkTags(assistantMessage.content || '')
      console.log(`[Timing] === Agent finished in ${Date.now() - agentStart}ms (${iterations} iterations) ===`)
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

        const toolStart = Date.now()
        const args = JSON.parse(funcCall.arguments)
        const result = await executeTool(funcCall.name, args)
        console.log(`[Timing] Tool ${funcCall.name} completed in ${Date.now() - toolStart}ms`)

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
      console.log(`[Timing] === Agent finished in ${Date.now() - agentStart}ms (${iterations} iterations) ===`)
      return { text, sources, iterations }
    }
  }

  // Max iterations reached — force a final synthesis call without tools.
  // Append an explicit user instruction so the model knows it MUST answer now,
  // otherwise low-reasoning Gemini sometimes replies with empty content.
  console.log(`[Timing] === Agent max iterations reached, forcing synthesis ===`)
  const synthMessages: OpenAI.ChatCompletionMessageParam[] = [
    ...messages,
    {
      role: 'user',
      content:
        'Tool-Budget erschöpft. Antworte jetzt final auf meine ursprüngliche Frage, basierend auf den bisher recherchierten Infos. Wenn die Infos unvollständig sind, sag das offen — aber gib trotzdem eine Antwort. Keine weiteren Recherchen.',
    },
  ]
  const synthStart = Date.now()
  const { response: synthResponse } = await createCompletion(synthMessages, [])
  console.log(`[Timing] Synthesis call completed in ${Date.now() - synthStart}ms`)

  const synthText = stripThinkTags(synthResponse.choices[0]?.message?.content || '')
  console.log(`[Timing] === Agent finished in ${Date.now() - agentStart}ms (${iterations} iterations + synthesis) ===`)

  return {
    text: synthText || 'Ich konnte keine vollständige Antwort finden. Bitte versuche es mit einer anderen Frage.',
    sources,
    iterations,
  }
}
