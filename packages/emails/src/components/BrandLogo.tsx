import { Img, Link, Section } from '@react-email/components'
import React from 'react'

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
 * Brand logo header — theme-adaptive, clickable.
 *
 * - Light clients show red logo; dark clients show neon logo (via Layout's <style>).
 * - `height: auto` prevents Gmail/Apple-Mail squish when container shrinks
 *   (PNG is native 960x540 16:9 — browser computes height from width).
 * - Logo links to generation-ai.org.
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
    </Section>
  )
}
