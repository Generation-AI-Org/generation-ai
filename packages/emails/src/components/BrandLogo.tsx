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
 * - Light clients: red logo (default visible).
 * - Dark clients: neon logo (shown via Layout's <style>).
 * - Display is controlled ONLY via class → CSS (no `display` inline) because Gmail
 *   iOS often treats inline styles as higher-priority than `!important` class rules.
 * - Dark logo wrapped in hidden <div> (overflow/max-width: 0) as a safety net for
 *   clients that strip media queries — keeps the dark image fully hidden.
 * - `height: auto` prevents Gmail/Apple-Mail squish when container shrinks.
 */
export function BrandLogo(): React.ReactElement {
  return (
    <Section style={{ textAlign: 'center', padding: '8px 0 4px 0' }}>
      <Link href={HOME_URL} style={{ textDecoration: 'none' }}>
        {/* Light mode logo — visible by default. Hidden in dark via Layout CSS. */}
        <Img
          src="https://generation-ai.org/brand/logos/logo-wide-red.png"
          alt="Generation AI"
          width={170}
          className="email-logo-light"
          style={imgBase}
        />
        {/* Dark mode logo — hidden by default wrapper; media query un-hides. */}
        <div
          className="email-logo-dark-wrap"
          style={{
            display: 'none',
            maxHeight: 0,
            maxWidth: 0,
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          <Img
            src="https://generation-ai.org/brand/logos/logo-wide-neon.png"
            alt="Generation AI"
            width={170}
            className="email-logo-dark"
            style={imgBase}
          />
        </div>
      </Link>
    </Section>
  )
}
