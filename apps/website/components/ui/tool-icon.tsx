'use client'

import {
  SiOpenai,
  SiClaude,
  SiPerplexity,
  SiGooglegemini,
  SiElevenlabs,
  SiNotebooklm,
  SiNotion,
  SiGithubcopilot,
  SiMake,
} from 'react-icons/si'

/**
 * Tool-Icons für die Marquee auf der Landing.
 * Deckt die häufigsten Tools aus der tools-app ab. Brands ohne simple-icons-
 * Eintrag (Midjourney, Gamma, Runway, Grok) werden über kleine Custom-SVGs
 * abgebildet, identisch in Form mit der tools-app ToolIcon-Komponente.
 */

type Props = { slug: string; size?: number; className?: string }

function MidjourneySvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12 2L2 7l3 13 7 2 7-2 3-13L12 2zm0 2.5l7.5 3.8-2.5 10.8-5 1.4-5-1.4-2.5-10.8L12 4.5z" />
      <path d="M12 8l-3 8h2l.5-1.5h3l.5 1.5h2L13 8h-1zm.5 5h-1l.5-2 .5 2z" />
    </svg>
  )
}

function GammaSvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18M10 5l-4 14M14 5l2 7-5 2" />
    </svg>
  )
}

function RunwaySvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M4 4h16v4H4zm0 6h16v4H4zm0 6h10v4H4z" />
    </svg>
  )
}

function GrokSvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="currentColor" fillRule="evenodd" clipRule="evenodd">
      <path d="M0 7.71428C0 3.4538 3.4538 0 7.71429 0H28.2857C32.5462 0 36 3.4538 36 7.71429V28.2857C36 32.5462 32.5462 36 28.2857 36H7.71428C3.4538 36 0 32.5462 0 28.2857V7.71428ZM7.00488 14.6445L18.0771 30.4574H22.9984L11.9258 14.6445H7.00488ZM7 30.4575L11.9226 23.4272L14.3848 26.944L11.9246 30.4575H7ZM24.1238 6L15.6143 18.1529L18.0765 21.6693L29.0483 6H24.1238ZM25.0156 30.457V13.5188L29.0496 7.75793V30.457H25.0156Z" />
    </svg>
  )
}

export function ToolIcon({ slug, size = 20, className = '' }: Props) {
  const common = { size, className }
  switch (slug) {
    case 'chatgpt':
      return <SiOpenai {...common} />
    case 'claude':
      return <SiClaude {...common} />
    case 'perplexity':
      return <SiPerplexity {...common} />
    case 'gemini':
      return <SiGooglegemini {...common} />
    case 'elevenlabs':
      return <SiElevenlabs {...common} />
    case 'notebooklm':
      return <SiNotebooklm {...common} />
    case 'notion-ai':
      return <SiNotion {...common} />
    case 'github-copilot':
      return <SiGithubcopilot {...common} />
    case 'make':
      return <SiMake {...common} />
    case 'midjourney':
      return <MidjourneySvg size={size} />
    case 'gamma':
      return <GammaSvg size={size} />
    case 'runway':
      return <RunwaySvg size={size} />
    case 'grok':
      return <GrokSvg size={size} />
    default:
      return null
  }
}
