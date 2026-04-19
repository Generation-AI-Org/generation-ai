import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { fontStack, radius, tokens } from '../tokens'
import { BrandLogo } from './BrandLogo'

export interface LayoutProps {
  preview: string
  children: React.ReactNode
}

/**
 * Shared email layout — light default + dark override via prefers-color-scheme.
 *
 * Why this structure:
 * - Gmail iOS aggressively auto-inverts dark-designed emails to light, regardless
 *   of meta tags. The only reliable path to "dark in Gmail iOS" is to design the
 *   base as light, and let Gmail's own dark-mode invert turn it dark for the user.
 * - Apple Mail / Gmail Web honor `@media (prefers-color-scheme: dark)` so we keep
 *   a proper dark variant for those clients.
 * - The terminal-window header (`<BrandLogo>`) is an image with a baked-in dark
 *   background, so it stays dark everywhere regardless of what the mail client does.
 */
export function Layout({ preview, children }: LayoutProps): React.ReactElement {
  return (
    <Html lang="de">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
@media (prefers-color-scheme: dark) {
  .email-body { background-color: ${tokens.dark.bg} !important; }
  .email-card { background-color: ${tokens.dark.bgCard} !important; border-color: ${tokens.dark.border} !important; }
  .email-heading, .email-text { color: ${tokens.dark.text} !important; }
  .email-muted, .email-footer { color: ${tokens.dark.textMuted} !important; }
  .email-divider { border-top-color: ${tokens.dark.border} !important; border-color: ${tokens.dark.border} !important; }
  .email-btn { background-color: ${tokens.dark.accent} !important; color: ${tokens.dark.textOnAccent} !important; }
}

/* Outlook.com dark mode */
[data-ogsc] .email-body { background-color: ${tokens.dark.bg} !important; }
[data-ogsc] .email-card { background-color: ${tokens.dark.bgCard} !important; border-color: ${tokens.dark.border} !important; }
[data-ogsc] .email-heading, [data-ogsc] .email-text { color: ${tokens.dark.text} !important; }
[data-ogsc] .email-muted, [data-ogsc] .email-footer { color: ${tokens.dark.textMuted} !important; }
[data-ogsc] .email-btn { background-color: ${tokens.dark.accent} !important; color: ${tokens.dark.textOnAccent} !important; }
`,
          }}
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="email-body"
        style={{
          backgroundColor: tokens.light.bg,
          fontFamily: fontStack.sans,
          margin: 0,
          padding: '40px 20px',
        }}
      >
        <Container
          className="email-card"
          style={{
            maxWidth: '480px',
            backgroundColor: tokens.light.bgCard,
            borderRadius: radius['2xl'],
            border: '1px solid ' + tokens.light.border,
            padding: '40px 32px',
          }}
        >
          {/* Header: Brand logo (always-dark terminal window) */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <BrandLogo />
          </Section>

          {/* Content slot */}
          {children}

          {/* Divider */}
          <Hr
            className="email-divider"
            style={{
              margin: '32px 0',
              border: 'none',
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: tokens.light.border,
            }}
          />

          {/* Footer: brand signature */}
          <Text
            className="email-footer"
            style={{
              fontSize: '12px',
              color: tokens.light.textMuted,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Generation AI · Die KI-Community für Studierende
          </Text>

          {/* Legal footer */}
          <Text
            className="email-footer"
            style={{
              fontSize: '11px',
              color: tokens.light.textMuted,
              textAlign: 'center',
              margin: '8px 0 0 0',
            }}
          >
            Du bekommst diese Mail, weil du einen Account bei Generation AI hast. Fragen?{' '}
            <a
              href="mailto:info@generation-ai.org"
              style={{ color: tokens.light.textMuted, textDecoration: 'underline' }}
            >
              info@generation-ai.org
            </a>
          </Text>

          {/* Legal links */}
          <Text
            className="email-footer"
            style={{
              fontSize: '11px',
              color: tokens.light.textMuted,
              textAlign: 'center',
              margin: '8px 0 0 0',
            }}
          >
            <a
              href="https://generation-ai.org/impressum"
              style={{ color: tokens.light.textMuted, textDecoration: 'underline' }}
            >
              Impressum
            </a>
            {' · '}
            <a
              href="https://generation-ai.org/datenschutz"
              style={{ color: tokens.light.textMuted, textDecoration: 'underline' }}
            >
              Datenschutz
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
