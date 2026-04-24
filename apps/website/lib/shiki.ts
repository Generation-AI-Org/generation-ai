// apps/website/lib/shiki.ts
// Phase 24 — Server-side shiki singleton for pre-rendering code blocks.
// Theme: github-dark (matches site default). Zero bytes shipped to client
// because all callers are server components.

import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'python', 'json', 'bash', 'plaintext'],
    })
  }
  return highlighterPromise
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter()
  const loaded = hl.getLoadedLanguages() as string[]
  const safeLang = loaded.includes(lang) ? lang : 'plaintext'
  return hl.codeToHtml(code, { lang: safeLang, theme: 'github-dark' })
}
