import React from 'react'

export interface EmailButtonProps {
  href: string
  slug: 'confirm-signup' | 'magic-link' | 'recovery' | 'email-change' | 'invite'
  children: string
}

const BASE = 'https://generation-ai.org/brand/logos'
const VERSION = 'v=1'

/**
 * CTA button rendered as a PNG image wrapped in a clickable <a>.
 *
 * Why as image: Gmail iOS aggressively inverts button colors — pure neon gets
 * dimmed, dark bg flips to white. Mail clients don't invert images, so shipping
 * the button (neon outline pill with neon mono label) as a pre-rendered PNG
 * guarantees identical look in every client.
 *
 * The `children` prop is the label text and doubles as the accessible alt.
 * `slug` chooses which pre-rendered PNG to display (built by logos:generate).
 */
export function EmailButton({ href, slug, children }: EmailButtonProps): React.ReactElement {
  const src = `${BASE}/btn-${slug}.png?${VERSION}`
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        textDecoration: 'none',
        lineHeight: 0,
      }}
    >
      <img
        src={src}
        alt={children}
        width={200}
        height={44}
        style={{
          display: 'block',
          border: 0,
          outline: 'none',
          maxWidth: '200px',
          height: 'auto',
          textDecoration: 'none',
        }}
      />
    </a>
  )
}
