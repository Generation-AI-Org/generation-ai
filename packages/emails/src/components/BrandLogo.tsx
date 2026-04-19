import { Img } from '@react-email/components'
import React from 'react'

/**
 * Mail-safe brand logo using PNG assets.
 * SVG is unreliable in email clients — PNG only per CONTEXT.md §Technische Notizen.
 *
 * Renders two <Img> tags toggled via @media (prefers-color-scheme: dark) in Layout's
 * <Head><style> block:
 *   - Light: logo-wide-red.png (visible by default)
 *   - Dark: logo-wide-neon.png (shown in dark mode, hidden in light mode)
 *
 * PNG assets to be uploaded to generation-ai.org/brand/logos/ in Plan 17-05.
 */
export function BrandLogo(): React.ReactElement {
  return (
    <>
      {/* Light mode logo — visible by default, hidden in dark mode */}
      <Img
        src="https://generation-ai.org/brand/logos/logo-wide-red.png"
        alt="Generation AI"
        width={180}
        height={40}
        className="email-logo-light"
        style={{ display: 'block', margin: '0 auto' }}
      />
      {/* Dark mode logo — hidden by default, shown in dark mode via Layout's <style> block */}
      <Img
        src="https://generation-ai.org/brand/logos/logo-wide-neon.png"
        alt="Generation AI"
        width={180}
        height={40}
        className="email-logo-dark"
        style={{ display: 'none', margin: '0 auto' }}
      />
    </>
  )
}
