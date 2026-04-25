import { ArrowUpRight } from "lucide-react"
import { BeispielBadge } from "@/components/ui/beispiel-badge"
import {
  ToolShowcaseMarqueeClient,
  type MarqueeTool,
} from "./tool-showcase-marquee.client"

// Phase 26 Plan 26-05 — Server-Component-Refactor (D-15).
//
// Diese Section fetched `/api/public/featured-tools` von der tools-app
// server-seitig (ISR `revalidate: 300`, AbortController-Timeout) und
// reicht das Ergebnis an `ToolShowcaseMarqueeClient` weiter. Die Marquee-
// Animation lebt in der `.client.tsx` daneben (useEffect/useRef braucht
// Client-Boundary; die Section selbst muss aber Server bleiben, sonst kann
// sie nicht direkt fetchen).
//
// Bei Fetch-Fehler (Timeout, 5xx, Netz aus, leere Response) fällt die
// Section auf `FALLBACK_TOOLS` zurück — die identische 12-Tool-Liste, die
// vor Phase 26 hardcoded inline lebte. Visuell darf der Fallback nicht
// vom alten State abweichen (daher 12 Entries, nicht 5).
//
// Header ist static (kein motion entry). Phase 20.6 hatte einen motion-
// Wrapper hinzugefügt, mit Server-Component-Refactor wäre der jetzt
// in eine eigene Client-Subcomp ausgelagert — Trade-off nicht wert.
// Konsistent mit CommunityPreviewSection (D-24).

const TOOLS_BASE =
  process.env.NEXT_PUBLIC_TOOLS_APP_URL ?? "https://tools.generation-ai.org"
const TOOLS_API = `${TOOLS_BASE}/api/public/featured-tools`

interface FeaturedToolsAPI {
  tools: Array<{
    slug: string
    title: string
    summary: string | null
    category: string
    logo_domain: string | null
    quick_win: string | null
  }>
  generated_at: string
}

// D-15 Fallback — exakt die 12 Tools aus dem Pre-Phase-26 hardcoded Array.
// Mapping vom alten Shape `{name, slug, cat, desc}` auf das API-Shape:
//   name → title, cat → category, desc → summary,
//   logo_domain → null, quick_win → null
// `as const` damit der Typcheck `MarqueeTool` matched ohne mutable casts.
const FALLBACK_TOOLS: ReadonlyArray<MarqueeTool> = [
  {
    slug: "claude",
    title: "Claude",
    summary: "Longform-Schreiben, Coding, nuancierte Analysen.",
    category: "KI-Assistenten",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "chatgpt",
    title: "ChatGPT",
    summary: "Allround-Chatbot für Texte, Code und Recherche.",
    category: "KI-Assistenten",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "gemini",
    title: "Gemini",
    summary: "Googles Assistent mit Deep Research und Workspace-Integration.",
    category: "KI-Assistenten",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "perplexity",
    title: "Perplexity",
    summary: "KI-Suchmaschine mit belegbaren Quellen.",
    category: "Recherche",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "notebooklm",
    title: "NotebookLM",
    summary: "Quellengebundener KI-Assistent mit Audio-Overviews.",
    category: "Recherche",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "midjourney",
    title: "Midjourney",
    summary: "Photorealistische Bilder aus Text.",
    category: "Bildgenerierung",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "elevenlabs",
    title: "ElevenLabs",
    summary: "Realistische Sprachsynthese und Voice Cloning.",
    category: "Audio",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "gamma",
    title: "Gamma",
    summary: "KI-generierte Decks in Minuten.",
    category: "Slides",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "runway",
    title: "Runway",
    summary: "Video-Generierung und Editing mit KI.",
    category: "Video",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "github-copilot",
    title: "GitHub Copilot",
    summary: "Code-Completion im Editor, unterstützt 100+ Sprachen.",
    category: "Coding",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "notion-ai",
    title: "Notion AI",
    summary: "KI-Schreibassistent direkt im Notion-Workspace.",
    category: "Produktivität",
    logo_domain: null,
    quick_win: null,
  },
  {
    slug: "make",
    title: "Make",
    summary: "Visueller Workflow-Builder für 1500+ Apps.",
    category: "Automatisierung",
    logo_domain: null,
    quick_win: null,
  },
] as const

async function fetchFeaturedTools(): Promise<ReadonlyArray<MarqueeTool>> {
  // Defensive Timeout (Pitfall 8): API down → Build/SSR darf nicht hängen.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(TOOLS_API, {
      next: { revalidate: 300 }, // D-15 ISR — 5min cache
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as FeaturedToolsAPI
    return data.tools.length > 0 ? data.tools : FALLBACK_TOOLS
  } catch (err) {
    console.warn("[tool-showcase] API fetch failed, using fallback:", err)
    return FALLBACK_TOOLS
  } finally {
    clearTimeout(timeout)
  }
}

export async function ToolShowcaseSection() {
  const tools = await fetchFeaturedTools()

  return (
    <section
      aria-labelledby="tool-showcase-heading"
      data-section="tool-showcase"
      className="bg-bg py-24 sm:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 8px var(--accent-glow)",
                }}
              />
              {"// tool-bibliothek"}
            </div>
            <h2
              id="tool-showcase-heading"
              className="mt-4 font-mono font-bold leading-[1.1] tracking-[-0.025em] text-text text-balance"
              style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
            >
              Über 100 KI-Tools, kuratiert.
            </h2>
            <p className="mt-5 text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl">
              Eine wachsende Bibliothek mit Anleitungen — sortiert nach
              Anwendungsfall.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3 sm:pb-2">
            <BeispielBadge />
            <a
              href={TOOLS_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--accent-hover,var(--accent))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
              style={{
                outlineColor: "var(--text)",
                transitionDuration: "var(--dur-normal)",
                transitionTimingFunction: "var(--ease-out)",
                transitionProperty: "color",
              }}
            >
              Alle Tools ansehen
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <ToolShowcaseMarqueeClient tools={tools} toolsBase={TOOLS_BASE} />
    </section>
  )
}
