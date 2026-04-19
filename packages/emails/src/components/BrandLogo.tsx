import { Img, Link, Section } from '@react-email/components'
import React from 'react'

const HOME_URL = 'https://generation-ai.org'
const TERMINAL_IMG = 'https://generation-ai.org/brand/logos/terminal-header.png?v=5'

/**
 * Brand logo header — complete macOS-style terminal window rendered as a single PNG.
 *
 * Why as one PNG:
 * - Gmail iOS aggressively inverts colors in CSS/HTML elements, breaking any
 *   HTML-composed terminal chrome (titlebar goes light, content goes light).
 * - Mail clients never invert images, so shipping the whole terminal window
 *   (title bar + 3 dots + "generation-ai — zsh" title + logo with scanlines)
 *   as one PNG guarantees the retro dark look in every client and every theme.
 * - PNG is 1120x520 (4x retina for 280x130 display).
 *
 * Logo is clickable → links to generation-ai.org.
 */
export function BrandLogo(): React.ReactElement {
  return (
    <Section style={{ textAlign: 'center', padding: '4px 0' }}>
      <Link href={HOME_URL} style={{ textDecoration: 'none' }}>
        <Img
          src={TERMINAL_IMG}
          alt="Generation AI"
          width={280}
          style={{
            display: 'block',
            margin: '0 auto',
            height: 'auto',
            maxWidth: '280px',
            outline: 'none',
            border: 0,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            borderRadius: '10px',
          }}
        />
      </Link>
    </Section>
  )
}
