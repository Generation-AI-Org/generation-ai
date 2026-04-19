import { Img, Link, Section } from '@react-email/components'
import React from 'react'

const HOME_URL = 'https://generation-ai.org'

/**
 * Brand logo header — single universal badge that looks identical in every email client.
 *
 * Why no theme-adaptive swap: Gmail iOS does NOT reliably support CSS-based image
 * swaps via @media (prefers-color-scheme) or [data-ogsc] — confirmed by Litmus,
 * Email on Acid, Audienceful (2025/2026). There is no 2026 hack that changes this.
 * Industry-best-practice is "one logo that works everywhere," so we bake a dark
 * badge into the logo region → Neon mark on black pill, identical in every client,
 * on any background the mail client decides to paint.
 *
 * - Always neon-on-black → identical in Apple Mail (light/dark), Gmail (Web/iOS/Android),
 *   Outlook (Desktop/Web), Yahoo, etc.
 * - `height: auto` prevents Gmail/Apple-Mail squish when container shrinks.
 * - Logo links to generation-ai.org.
 */
export function BrandLogo(): React.ReactElement {
  return (
    <Section style={{ textAlign: 'center', padding: '8px 0 4px 0' }}>
      <Link href={HOME_URL} style={{ textDecoration: 'none' }}>
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          align="center"
          style={{
            margin: '0 auto',
            borderCollapse: 'separate',
            backgroundColor: '#0a0a0a',
            borderRadius: '14px',
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '20px 28px', textAlign: 'center' }}>
                <Img
                  src="https://generation-ai.org/brand/logos/logo-wide-neon.png"
                  alt="Generation AI"
                  width={170}
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    height: 'auto',
                    maxWidth: '170px',
                    outline: 'none',
                    border: 0,
                    textDecoration: 'none',
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  )
}
