import { Img, Link, Section } from '@react-email/components'
import React from 'react'
import { fontStack } from '../tokens'

const HOME_URL = 'https://generation-ai.org'

/**
 * Brand logo header — static macOS-style terminal window containing the Neon logo.
 * Matches the look of the website's terminal splash screen (without animations).
 *
 * Structure:
 *   ┌────────────────────────┐
 *   │ ● ● ●   generation-ai  │  ← title bar (dark gray chrome)
 *   ├────────────────────────┤
 *   │                        │
 *   │     [ NEON LOGO ]      │  ← content area (near-black bg)
 *   │                        │
 *   └────────────────────────┘
 *
 * Built as a table so all mail clients (Gmail, Outlook, Apple Mail) render the
 * rounded window consistently. Theme-agnostic — looks identical on every client.
 */
export function BrandLogo(): React.ReactElement {
  // Matches website terminal-splash palette — content darker than card bg
  // so the terminal window stands out from the email card.
  const titleBarBg = '#3a3a3a'
  const titleBarText = '#a0a0a0'
  const contentBg = '#1c1c1c'
  const borderColor = '#2a2a2a'
  // CRT-style subtle scanlines overlaid on the content area. 2px dark + 1px
  // slightly-lit band. Renders in Apple Mail + Gmail Web; Outlook gracefully
  // falls back to solid bg.
  const scanlines =
    'repeating-linear-gradient(0deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 2px, rgba(206,255,50,0.035) 2px, rgba(206,255,50,0.035) 3px)'
  const windowRadius = 10

  return (
    <Section style={{ textAlign: 'center', padding: '4px 0' }}>
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
            border: `1px solid ${borderColor}`,
            borderRadius: `${windowRadius}px`,
            backgroundColor: contentBg,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            // overflow:hidden doesn't clip inner corners in Outlook, so we
            // paint title bar with a flat top and let content paint the
            // bottom with matching corners via its own background.
          }}
          width={280}
        >
          <tbody>
            {/* Title bar: 3 dots + filename */}
            <tr>
              <td
                style={{
                  backgroundColor: titleBarBg,
                  padding: '8px 12px',
                  borderTopLeftRadius: `${windowRadius - 1}px`,
                  borderTopRightRadius: `${windowRadius - 1}px`,
                  borderBottom: `1px solid ${borderColor}`,
                  fontFamily: fontStack.mono,
                  fontSize: '11px',
                  color: titleBarText,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  width="100%"
                  style={{ borderCollapse: 'collapse' }}
                >
                  <tbody>
                    <tr>
                      {/* Traffic light dots (left) */}
                      <td
                        style={{
                          width: '54px',
                          verticalAlign: 'middle',
                          lineHeight: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '11px',
                            height: '11px',
                            borderRadius: '50%',
                            backgroundColor: '#ff5f57',
                            marginRight: '6px',
                          }}
                        />
                        <span
                          style={{
                            display: 'inline-block',
                            width: '11px',
                            height: '11px',
                            borderRadius: '50%',
                            backgroundColor: '#febc2e',
                            marginRight: '6px',
                          }}
                        />
                        <span
                          style={{
                            display: 'inline-block',
                            width: '11px',
                            height: '11px',
                            borderRadius: '50%',
                            backgroundColor: '#28c840',
                          }}
                        />
                      </td>
                      {/* Title (center-ish) */}
                      <td
                        style={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          fontFamily: fontStack.mono,
                          fontSize: '11px',
                          color: titleBarText,
                          letterSpacing: '0.04em',
                        }}
                      >
                        generation-ai — zsh
                      </td>
                      {/* Spacer to balance the dots column */}
                      <td style={{ width: '54px' }}>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            {/* Content area: logo */}
            <tr>
              <td
                style={{
                  backgroundColor: contentBg,
                  padding: '28px 20px',
                  textAlign: 'center',
                  borderBottomLeftRadius: `${windowRadius - 1}px`,
                  borderBottomRightRadius: `${windowRadius - 1}px`,
                }}
              >
                <Img
                  src="https://generation-ai.org/brand/logos/logo-wide-neon.png?v=5"
                  alt="Generation AI"
                  width={180}
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    height: 'auto',
                    maxWidth: '180px',
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
