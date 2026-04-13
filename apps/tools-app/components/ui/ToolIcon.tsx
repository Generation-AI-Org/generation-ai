'use client'

import {
  SiOpenai,
  SiClaude,
  SiAnthropic,
  SiPerplexity,
  SiGithubcopilot,
  SiNotion,
  SiMake,
  SiGooglegemini,
  SiMeta,
  SiElevenlabs,
  SiObsidian,
  SiN8N,
  SiZapier,
  SiDeepl,
  SiCanva,
  SiReplit,
  SiNotebooklm,
  SiSuno,
  SiV0,
} from 'react-icons/si'

// Custom inline SVG for brands not in simple-icons

function CursorSvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 466.73 532.09" width={size} height={size} fill="currentColor">
      <path d="M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94C3.55,129.26,0,135.4,0,142.05v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11V142.05c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99L238.42,508.15c-1.39,2.4-5.06,1.42-5.06-1.36V273.58c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z" />
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

function MidjourneySvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12 2L2 7l3 13 7 2 7-2 3-13L12 2zm0 2.5l7.5 3.8-2.5 10.8-5 1.4-5-1.4-2.5-10.8L12 4.5z" />
      <path d="M12 8l-3 8h2l.5-1.5h3l.5 1.5h2L13 8h-1zm.5 5h-1l.5-2 .5 2z" />
    </svg>
  )
}

function WhisperSvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12 1a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5zm-7 11a7 7 0 0 0 14 0M12 18v4M9 22h6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function GrokSvg({ size }: { size: number }) {
  // Grok (xAI): Official 2025 logo icon — rounded square with X pattern
  // Source: https://commons.wikimedia.org/wiki/File:Grok-2025-logo.svg
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="currentColor" fillRule="evenodd" clipRule="evenodd">
      <path d="M0 7.71428C0 3.4538 3.4538 0 7.71429 0H28.2857C32.5462 0 36 3.4538 36 7.71429V28.2857C36 32.5462 32.5462 36 28.2857 36H7.71428C3.4538 36 0 32.5462 0 28.2857V7.71428ZM7.00488 14.6445L18.0771 30.4574H22.9984L11.9258 14.6445H7.00488ZM7 30.4575L11.9226 23.4272L14.3848 26.944L11.9246 30.4575H7ZM24.1238 6L15.6143 18.1529L18.0765 21.6693L29.0483 6H24.1238ZM25.0156 30.457V13.5188L29.0496 7.75793V30.457H25.0156Z" />
    </svg>
  )
}

function OtterSvg({ size }: { size: number }) {
  // Otter.ai: Official logo — ring (O) + two tall pills (II) + two short pills
  // Source: Official SVG from otter.ai
  return (
    <svg viewBox="0 0 185 73" width={size} height={size * (73/185)} fill="currentColor">
      {/* O - Ring/Donut */}
      <path d="M36.5,53.8c9.7,0,17.6-7.9,17.6-17.6s-7.9-17.6-17.6-17.6S19,26.6,19,36.3S26.8,53.8,36.5,53.8z M36.5,73C16.3,73,0,56.7,0,36.5S16.3,0,36.5,0S73,16.3,73,36.5S56.7,73,36.5,73z" />
      {/* II - Two tall pills */}
      <path d="M91,1c5.5,0,10,4.5,10,10v51c0,5.5-4.5,10-10,10s-10-4.5-10-10V11C81,5.5,85.5,1,91,1z" />
      <path d="M119,1c5.5,0,10,4.5,10,10v51c0,5.5-4.5,10-10,10s-10-4.5-10-10V11C109,5.5,113.5,1,119,1z" />
      {/* + - Two shorter pills */}
      <path d="M147,24c5.5,0,10,4.5,10,10v6c0,5.5-4.5,10-10,10s-10-4.5-10-10v-6C137,28.5,141.5,24,147,24z" />
      <path d="M175,14c5.5,0,10,4.5,10,10v25c0,5.5-4.5,10-10,10s-10-4.5-10-10V24C165,18.5,169.5,14,175,14z" />
    </svg>
  )
}

function ElicitSvg({ size }: { size: number }) {
  // Elicit: Official logo SVG
  return (
    <svg viewBox="0 0 1800 1800" width={size} height={size} fill="currentColor">
      <g transform="translate(0,1800) scale(1,-1)">
        <path d="M1201 1358 c164 -95 294 -177 290 -181 -4 -4 -129 -78 -277 -163 -148 -85 -278 -164 -288 -174 -28 -28 -26 -83 4 -115 42 -45 71 -36 281 86 l192 111 41 -22 c22 -13 45 -26 49 -30 5 -4 -67 -51 -160 -105 -92 -53 -223 -129 -290 -168 -129 -74 -151 -98 -137 -151 8 -34 49 -66 85 -66 17 0 100 42 220 111 l193 112 44 -24 c24 -13 45 -27 47 -30 2 -3 -96 -63 -218 -135 l-222 -129 -65 0 -65 0 -265 155 c-313 183 -300 174 -334 224 -45 67 -34 161 27 224 l31 32 -22 16 c-41 28 -65 91 -60 156 7 93 27 111 324 285 142 83 263 152 268 152 5 1 143 -77 307 -171z" />
      </g>
    </svg>
  )
}

function BoltSvg({ size }: { size: number }) {
  // Bolt.new: Official StackBlitz lightning bolt
  // Source: https://github.com/simple-icons/simple-icons (stackblitz.svg)
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M10.797 14.182H3.635L16.728 0l-3.525 9.818h7.162L7.272 24l3.524-9.818Z" />
    </svg>
  )
}

function RunwaySvg({ size }: { size: number }) {
  // Runway: Official geometric icon
  // Source: https://uxwing.com/runway-ai-icon/
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} fill="currentColor">
      <path d="M392.51 511.69c-62.032 5.67-113.901-67.019-153.657-103.887C218.749 552.665-.15 538.933 0 391.985c.072-61.724 0-212.549 0-272.331C0 98.16 5.899 76.515 16.965 58.16c21-35.599 61.58-58.584 102.906-58.14c62.254.079 212.177-.071 272.639 0c147.084 0 161.053 218.821 15.696 238.523l68.977 68.884c75.785 71.27 18.906 207.396-84.673 204.263zm-33.407-86.199c42.745 44.035 110.984-24.182 66.963-66.869L306.489 239.217h-66.891v66.862l103.365 103.222l16.14 16.19zM72.417 392.056c-.974 61.201 95.66 61.423 94.693 0V119.654c.817-30.525-31.464-54.778-60.613-45.375c-1.268.373-2.465.746-3.59 1.197c-18.306 6.787-31.013 25.522-30.49 45.074v271.506zM392.51 166.893c61.429.975 61.358-95.524 0-94.556H230.109c12.335 25.974 9.196 66.425 9.418 94.556H392.51z" />
    </svg>
  )
}

function SuperWhisperSvg({ size }: { size: number }) {
  // SuperWhisper: Official logo — rounded triangle with triangular hole (Möbius-style)
  // Source: https://superwhisper.com/image/lettermark.png
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      {/* Outer rounded triangle */}
      <path d="M12 1.5 C12.8 1.5 13.5 1.9 14 2.7 L22.5 17.5 C23.3 18.9 22.3 20.7 20.7 20.7 L3.3 20.7 C1.7 20.7 0.7 18.9 1.5 17.5 L10 2.7 C10.5 1.9 11.2 1.5 12 1.5 Z" />
      {/* Inner triangular hole (inverted) */}
      <path d="M12 7 L16.5 15 L7.5 15 Z" fill="#141414" />
    </svg>
  )
}

function LovableSvg({ size }: { size: number }) {
  // Lovable: Official logo — stylized L-shape with rounded corners
  // Source: https://lovable.dev/favicon.svg
  return (
    <svg viewBox="0 0 180 180" width={size} height={size} fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M54.6052 0C83.9389 0 107.719 23.8424 107.719 53.2535V73.4931H125.395C154.729 73.4931 178.508 97.3355 178.508 126.747C178.508 156.158 154.729 180 125.395 180H1.4917V53.2535C1.4917 23.8424 25.2714 0 54.6052 0Z" />
    </svg>
  )
}

type IconEntry =
  | { type: 'si'; component: React.ComponentType<{ size?: number; className?: string }> }
  | { type: 'custom'; component: React.FC<{ size: number }> }

const TOOL_ICONS: Record<string, IconEntry> = {
  chatgpt:          { type: 'si', component: SiOpenai },
  claude:           { type: 'si', component: SiClaude },
  perplexity:       { type: 'si', component: SiPerplexity },
  cursor:           { type: 'custom', component: CursorSvg },
  'github-copilot': { type: 'si', component: SiGithubcopilot },
  'notion-ai':      { type: 'si', component: SiNotion },
  make:             { type: 'si', component: SiMake },
  gamma:            { type: 'custom', component: GammaSvg },
  midjourney:       { type: 'custom', component: MidjourneySvg },
  whisper:          { type: 'custom', component: WhisperSvg },
  gemini:           { type: 'si', component: SiGooglegemini },
  'meta-ai':        { type: 'si', component: SiMeta },
  elevenlabs:       { type: 'si', component: SiElevenlabs },
  obsidian:         { type: 'si', component: SiObsidian },
  n8n:              { type: 'si', component: SiN8N },
  zapier:           { type: 'si', component: SiZapier },
  deepl:            { type: 'si', component: SiDeepl },
  canva:            { type: 'si', component: SiCanva },
  replit:           { type: 'si', component: SiReplit },
  notebooklm:       { type: 'si', component: SiNotebooklm },
  suno:             { type: 'si', component: SiSuno },
  v0:               { type: 'si', component: SiV0 },
  grok:             { type: 'custom', component: GrokSvg },
  'otter-ai':       { type: 'custom', component: OtterSvg },
  elicit:           { type: 'custom', component: ElicitSvg },
  bolt:             { type: 'custom', component: BoltSvg },
  runway:           { type: 'custom', component: RunwaySvg },
  'super-whisper':  { type: 'custom', component: SuperWhisperSvg },
  lovable:          { type: 'custom', component: LovableSvg },
}

interface ToolIconProps {
  slug: string
  size?: number
  className?: string
}

export default function ToolIcon({ slug, size = 22, className = '' }: ToolIconProps) {
  const entry = TOOL_ICONS[slug]

  if (!entry) {
    return null
  }

  if (entry.type === 'si') {
    const Icon = entry.component
    return <Icon size={size} className={className} />
  }

  const Custom = entry.component
  return (
    <span className={className}>
      <Custom size={size} />
    </span>
  )
}
