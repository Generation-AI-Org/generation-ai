'use client'

import { useEffect, useRef, useState } from "react"
import { ToolIcon } from "@/components/ui/tool-icon"

// Phase 26 Plan 26-05 — Client-Marquee extrahiert aus tool-showcase-section.tsx,
// damit die Section selbst als async Server-Component die API fetchen kann
// (D-15). Diese Datei kapselt useEffect/useRef/useState + animations-Cloning.
//
// Datenshape ist die API-Response (`/api/public/featured-tools`):
//   { slug, title, summary, category, logo_domain, quick_win }
// Fallback-Tools (in tool-showcase-section.tsx) füllen `summary` direkt; bei
// echten API-Tools mit `summary === null` wird `quick_win` als Soft-Fallback
// verwendet (siehe `cardSummary`).

export interface MarqueeTool {
  slug: string
  title: string
  summary: string | null
  category: string
  logo_domain: string | null
  quick_win: string | null
}

interface ToolShowcaseMarqueeClientProps {
  tools: ReadonlyArray<MarqueeTool>
  toolsBase: string
}

export function ToolShowcaseMarqueeClient({
  tools,
  toolsBase,
}: ToolShowcaseMarqueeClientProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [start, setStart] = useState(false)

  // Duplicate cards for seamless loop (client-side, aria-hide clones).
  // Min-height (Pitfall 7) wird via Tailwind-class `min-h-[180px]` auf dem
  // Wrapper gesetzt, um CLS während Streaming zu vermeiden.
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
  }, [tools])

  return (
    <div
      className="relative min-h-[180px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]"
      style={{ ["--scroll-duration" as string]: "80s" }}
    >
      <ul
        ref={trackRef}
        className={`flex w-max shrink-0 flex-nowrap gap-4 py-4 hover:[animation-play-state:paused] ${start ? "animate-scroll" : ""}`}
      >
        {tools.map((t, i) => (
          <ToolCard key={`${t.slug}-${i}`} tool={t} toolsBase={toolsBase} />
        ))}
      </ul>
    </div>
  )
}

function ToolCard({
  tool,
  toolsBase,
}: {
  tool: MarqueeTool
  toolsBase: string
}) {
  // `summary` ist die primäre Beschreibung (Fallback-Tools füllen es immer);
  // bei API-Tools mit `summary === null` greifen wir auf `quick_win` zurück.
  const cardSummary = tool.summary ?? tool.quick_win ?? ""

  return (
    <li className="w-[280px] shrink-0">
      <a
        href={`${toolsBase}/${tool.slug}`}
        aria-label={`${tool.title} in der Tools-Bibliothek öffnen`}
        className="group block h-full rounded-2xl border border-border bg-bg-card p-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)]"
      >
        <div className="mb-3.5 flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-text-secondary transition-colors group-hover:text-[var(--accent)]"
            style={{
              background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
            }}
            aria-hidden="true"
          >
            <ToolIcon
              slug={tool.slug}
              size={20}
              className="transition-colors duration-300 group-hover:text-[var(--accent)]"
            />
          </div>
        </div>
        <div className="font-mono text-[15px] font-bold text-text">
          {tool.title}
        </div>
        <div
          className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "color-mix(in srgb, var(--accent) 70%, transparent)" }}
        >
          {tool.category}
        </div>
        {cardSummary && (
          <p className="mt-2 text-[13px] leading-[1.5] text-text-secondary">
            {cardSummary}
          </p>
        )}
      </a>
    </li>
  )
}
