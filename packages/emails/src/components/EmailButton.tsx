import { Button } from '@react-email/button'
import React from 'react'
import { fontStack, radius, tokens } from '../tokens'

export interface EmailButtonProps {
  href: string
  children: React.ReactNode
}

/**
 * Bulletproof CTA button for email.
 *
 * Uses @react-email/button@0.0.10 which exposes pX and pY props.
 * These numeric props trigger React Email's VML rendering path, generating
 * <!--[if mso]>...<![endif]--> markup required for Outlook Desktop to render
 * buttons with correct padding (Outlook ignores CSS padding on <a> tags).
 *
 * CRITICAL: Do NOT add inline padding via style prop — that bypasses VML fallback.
 * Use pX (horizontal) and pY (vertical) numeric pixel values instead.
 *
 * className="email-btn" allows Layout's dark-mode <style> block to swap:
 *   - backgroundColor → tokens.dark.accent (#CEFF32)
 *   - color → tokens.dark.textOnAccent (#141414)
 */
export function EmailButton({ href, children }: EmailButtonProps): React.ReactElement {
  return (
    <Button
      href={href}
      pX={24}
      pY={12}
      className="email-btn"
      style={{
        backgroundColor: tokens.light.accent,
        color: tokens.light.textOnAccent,
        borderRadius: radius.full,
        fontFamily: fontStack.mono,
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.02em',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      {children}
    </Button>
  )
}
