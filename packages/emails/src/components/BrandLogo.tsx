import { Img, Link, Section, Text } from '@react-email/components'
import React from 'react'
import { fontStack } from '../tokens'

const HOME_URL = 'https://generation-ai.org'

const imgBase: React.CSSProperties = {
  margin: '0 auto',
  height: 'auto',
  maxWidth: '170px',
  outline: 'none',
  border: 0,
  textDecoration: 'none',
}

/**
 * Brand logo header — theme-adaptive, terminal-retro vibe.
 *
 * - Light clients show red logo; dark clients show neon logo (via Layout's <style>).
 * - `height: auto` prevents Gmail/Apple-Mail squish when container shrinks
 *   (PNG is 480x270, intrinsic 16:9 — browser computes height from width).
 * - Logo is clickable → links to generation-ai.org.
 * - Monospace "prompt" subtitle echoes the terminal splash screen on the website.
 * - Subtitle color swaps with theme (red → neon) via Layout's CSS toggle.
 */
export function BrandLogo(): React.ReactElement {
  return (
    <Section style={{ textAlign: 'center', padding: '8px 0 4px 0' }}>
      <Link href={HOME_URL} style={{ textDecoration: 'none' }}>
        {/* Light mode — red logo. Hidden in dark via CSS in Layout. */}
        <Img
          src="https://generation-ai.org/brand/logos/logo-wide-red.png"
          alt="Generation AI"
          width={170}
          className="email-logo-light"
          style={{ ...imgBase, display: 'block' }}
        />
        {/* Dark mode — neon logo. Hidden in light via CSS in Layout. */}
        <Img
          src="https://generation-ai.org/brand/logos/logo-wide-neon.png"
          alt="Generation AI"
          width={170}
          className="email-logo-dark"
          style={{ ...imgBase, display: 'none' }}
        />
      </Link>
      {/* Terminal-style prompt subtitle. Color swaps with theme (see Layout). */}
      <Text
        className="email-prompt"
        style={{
          fontFamily: fontStack.mono,
          fontSize: '11px',
          color: '#F5133B',
          margin: '14px 0 0 0',
          letterSpacing: '0.08em',
          opacity: 0.8,
        }}
      >
        {'> generation-ai:~$'}
      </Text>
    </Section>
  )
}
