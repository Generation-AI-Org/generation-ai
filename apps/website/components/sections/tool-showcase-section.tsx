'use client'

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useTheme } from "@/components/ThemeProvider"
import { ToolIcon } from "@/components/ui/tool-icon"

// Tool-Showcase (Simon §4.6 "Über 100 KI-Tools, kuratiert.") — DS-polished.
//
// Struktur:
//   1. Section-Header mit Eyebrow "// tool-bibliothek" + Hero-level H2 + Lede
//      (linksbündig, BeispielBadge + "Alle Tools"-Link rechtsbündig)
//   2. Infinite-Marquee mit 12 Tool-Cards (Theme-aware Icon-BG, BeispielBadge)
//
// DS-Alignment:
//   - Entry-Motion via motion/react (fadeIn, viewport once), reduced-motion Fallback
//   - Easings + Durations via CSS-Tokens (--ease-out, --dur-normal) über inline styles
//   - Keyboard-Fokus: Card-Links mit focus-visible:outline, Neutral-Ring (DS §C)
//   - Hover: card border-accent + accent-glow shadow (DS §C Interaction-States)
//   - Tokens only: --accent, --text*, --border*, --bg-card, --bg-elevated, --accent-glow.
//     Keine stray Hex-Werte (Icon-BG jetzt theme-aware über DS-Tokens).
//   - Marquee pausiert bei prefers-reduced-motion (globals.css @media-Rule auf
//     .animate-scroll, D-06 PFLICHT).
//   - Theme-aware: BeispielBadge (.light → brand-red, dark → brand-neon) bleibt erhalten.

/**
 * BeispielBadge — Stub-Markierung für Demo/Dummy-Content.
 * Theme-aware: .light → brand-red, dark → brand-neon.
 */
export function BeispielBadge({ className = "" }: { className?: string }) {
  const { theme } = useTheme()
  const tone =
    theme === "light"
      ? "bg-brand-red-3 text-brand-red-12"
      : "bg-brand-neon-3 text-brand-neon-12"
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${tone} ${className}`}
    >
      Beispiel
    </span>
  )
}

type Tool = {
  name: string
  slug: string
  cat: string
  desc: string
}

// Quelle: apps/tools-app/supabase/seed-v2.sql — slugs stimmen 1:1 mit der Tools-
// App überein, Links gehen auf tools.generation-ai.org/${slug} (Detail-Page).
const tools: Tool[] = [
  { name: "Claude", slug: "claude", cat: "KI-Assistenten", desc: "Longform-Schreiben, Coding, nuancierte Analysen." },
  { name: "ChatGPT", slug: "chatgpt", cat: "KI-Assistenten", desc: "Allround-Chatbot für Texte, Code und Recherche." },
  { name: "Gemini", slug: "gemini", cat: "KI-Assistenten", desc: "Googles Assistent mit Deep Research und Workspace-Integration." },
  { name: "Perplexity", slug: "perplexity", cat: "Recherche", desc: "KI-Suchmaschine mit belegbaren Quellen." },
  { name: "NotebookLM", slug: "notebooklm", cat: "Recherche", desc: "Quellengebundener KI-Assistent mit Audio-Overviews." },
  { name: "Midjourney", slug: "midjourney", cat: "Bildgenerierung", desc: "Photorealistische Bilder aus Text." },
  { name: "ElevenLabs", slug: "elevenlabs", cat: "Audio", desc: "Realistische Sprachsynthese und Voice Cloning." },
  { name: "Gamma", slug: "gamma", cat: "Slides", desc: "KI-generierte Decks in Minuten." },
  { name: "Runway", slug: "runway", cat: "Video", desc: "Video-Generierung und Editing mit KI." },
  { name: "GitHub Copilot", slug: "github-copilot", cat: "Coding", desc: "Code-Completion im Editor, unterstützt 100+ Sprachen." },
  { name: "Notion AI", slug: "notion-ai", cat: "Produktivität", desc: "KI-Schreibassistent direkt im Notion-Workspace." },
  { name: "Make", slug: "make", cat: "Automatisierung", desc: "Visueller Workflow-Builder für 1500+ Apps." },
]

const TOOLS_BASE = "https://tools.generation-ai.org"

export function ToolShowcaseSection() {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <section
      aria-labelledby="tool-showcase-heading"
      data-section="tool-showcase"
      className="bg-bg py-24 sm:py-32 border-b border-border overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          {...fadeIn}
          className="flex flex-col gap-6 mb-14 sm:flex-row sm:items-end sm:justify-between"
        >
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
              Anwendungsfall. Diese Auswahl ist exemplarisch.
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
        </motion.div>
      </div>

      <motion.div {...fadeIn}>
        <ToolMarquee />
      </motion.div>
    </section>
  )
}

function ToolMarquee() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [start, setStart] = useState(false)

  // Duplicate cards for seamless loop (client-side, aria-hide clones)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const originals = Array.from(track.children)
    const clones = originals.map((el) => {
      const c = el.cloneNode(true) as HTMLElement
      c.setAttribute("aria-hidden", "true")
      c.setAttribute("tabindex", "-1")
      track.appendChild(c)
      return c
    })
    setStart(true)
    return () => {
      clones.forEach((c) => c.remove())
      setStart(false)
    }
  }, [])

  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]"
      style={{ ["--scroll-duration" as string]: "80s" }}
    >
      <ul
        ref={trackRef}
        className={`flex w-max shrink-0 flex-nowrap gap-4 py-4 hover:[animation-play-state:paused] ${start ? "animate-scroll" : ""}`}
      >
        {tools.map((t, i) => (
          <ToolCard key={`${t.slug}-${i}`} tool={t} />
        ))}
      </ul>
    </div>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <li className="w-[280px] shrink-0">
      <a
        href={`${TOOLS_BASE}/${tool.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${tool.name} in der Tools-Bibliothek öffnen`}
        className="group block h-full rounded-2xl border border-border bg-bg-card p-5 transition-all hover:-translate-y-[2px] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
        style={{
          outlineColor: "var(--text)",
          transitionDuration: "var(--dur-normal)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border text-text-secondary transition-colors group-hover:text-[var(--accent)] motion-reduce:transition-none"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border)",
              transitionDuration: "var(--dur-normal)",
              transitionTimingFunction: "var(--ease-out)",
            }}
            aria-hidden="true"
          >
            <ToolIcon slug={tool.slug} size={20} />
          </div>
          <BeispielBadge />
        </div>
        <div className="font-mono text-[15px] font-bold text-text">
          {tool.name}
        </div>
        <div
          className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "color-mix(in srgb, var(--accent) 70%, transparent)" }}
        >
          {tool.cat}
        </div>
        <p className="mt-2 text-[13px] leading-[1.5] text-text-secondary">
          {tool.desc}
        </p>
      </a>
    </li>
  )
}
