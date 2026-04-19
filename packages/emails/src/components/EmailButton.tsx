import React from 'react'
import { fontStack, radius, tokens } from '../tokens'

export interface EmailButtonProps {
  href: string
  children: string
}

/**
 * Escape user-controlled strings before HTML interpolation.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Terminal-style CTA — neon outline pill with neon text, no fill.
 *
 * Why outline instead of filled: Gmail iOS's smart color inversion flips any
 * dark or near-dark background (even color-tinted ones) to a light background
 * in dark mode. An outline button has no fill to invert — the neon color is
 * preserved as a colored stroke/text by every client.
 *
 * Outlook Desktop renders borders on <a> tags fine (no VML fallback needed for
 * outlined buttons) so the markup is also simpler.
 */
export function EmailButton({ href, children }: EmailButtonProps): React.ReactElement {
  const accent = tokens.dark.accent // #CEFF32 neon
  const font = fontStack.mono
  const pX = 24
  const pY = 11 // slightly less to compensate for 2px border

  const safeHref = escapeHtml(href)
  const safeChildren = escapeHtml(children)

  const html = `<a href="${safeHref}" class="email-btn" style="border:2px solid ${accent};border-radius:${radius.full};color:${accent};display:inline-block;font-family:${font};font-size:14px;font-weight:700;letter-spacing:0.02em;padding:${pY}px ${pX}px;text-decoration:none;background:transparent;">${safeChildren}</a>`

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
