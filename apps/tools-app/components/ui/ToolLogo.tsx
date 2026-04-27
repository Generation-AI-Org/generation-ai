'use client'

import { useState } from 'react'
import Image from 'next/image'
import ToolIcon from './ToolIcon'

interface ToolLogoProps {
  slug: string
  domain: string | null
  name: string
  size?: number
  priority?: boolean
}

export default function ToolLogo({ slug, domain, name, size = 48, priority = false }: ToolLogoProps) {
  const [clearbitFailed, setClearbitFailed] = useState(false)
  const iconSize = Math.round(size * 0.52)

  // If we have a custom icon for this slug, always use it
  const hasCustomIcon = [
    'chatgpt', 'claude', 'perplexity', 'cursor',
    'github-copilot', 'notion-ai', 'make',
    'gamma', 'midjourney', 'whisper',
    'gemini', 'meta-ai', 'elevenlabs', 'obsidian',
    'n8n', 'zapier', 'deepl', 'canva', 'replit',
    'notebooklm', 'suno', 'v0',
    'grok', 'otter-ai', 'elicit', 'bolt', 'runway', 'super-whisper',
    'lovable',
  ].includes(slug)

  if (hasCustomIcon) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--border)] border border-[var(--border)] rounded-xl transition-[background-color,border-color] duration-300 group-hover:border-[var(--accent)]/40 group-hover:bg-[var(--accent-soft)]">
        <ToolIcon
          slug={slug}
          size={iconSize}
          className="text-text-secondary transition-colors duration-300 group-hover:text-[var(--accent)]"
        />
      </div>
    )
  }

  // Fallback chain: Clearbit → letter
  if (!domain || clearbitFailed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--accent-soft)] border border-[var(--accent)]/20 rounded-xl">
        <span
          className="text-[var(--accent)] font-black leading-none select-none"
          style={{ fontSize: size * 0.42 }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden transition-[background-color,border-color] duration-300 group-hover:border-[var(--accent)]/40 group-hover:bg-[var(--accent-soft)]">
      <Image
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${name} Logo`}
        width={size}
        height={size}
        className="object-contain w-full h-full p-1"
        unoptimized
        priority={priority}
        onError={() => setClearbitFailed(true)}
      />
    </div>
  )
}
