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
 * Shared email layout wrapper used by all 6 Supabase auth templates.
 *
 * Structure: Html > Head (color-scheme meta + dark-mode CSS) > Body > Container > Header (BrandLogo) > children > Hr > Footer
 *
 * Dark mode: @media (prefers-color-scheme: dark) rules in <style> block swap
 * all visual tokens (bg, card, text, muted, footer, divider, button, logo).
 * Supported by Gmail (web), Apple Mail, and modern Outlook web — not Outlook Desktop.
 */
export function Layout({ preview, children }: LayoutProps): React.ReactElement {
  return (
    <Html lang="de">
      <Head>
        {/* Color scheme support declarations */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
@media (prefers-color-scheme: dark) {
  .email-body { background-color: ${tokens.dark.bg} !important; }
  .email-card { background-color: ${tokens.dark.bgCard} !important; border-color: ${tokens.dark.border} !important; }
  .email-heading { color: ${tokens.dark.text} !important; }
  .email-text { color: ${tokens.dark.text} !important; }
  .email-muted { color: ${tokens.dark.textMuted} !important; }
  .email-footer { color: ${tokens.dark.textMuted} !important; }
  .email-divider { border-top-color: ${tokens.dark.border} !important; border-color: ${tokens.dark.border} !important; }
  .email-btn { background-color: ${tokens.dark.accent} !important; color: ${tokens.dark.textOnAccent} !important; }
  .email-logo-light { display: none !important; }
  .email-logo-dark-wrap { display: block !important; max-height: none !important; max-width: 100% !important; overflow: visible !important; line-height: normal !important; }
}

/* Outlook.com dark mode */
[data-ogsc] .email-logo-light { display: none !important; }
[data-ogsc] .email-logo-dark-wrap { display: block !important; max-height: none !important; max-width: 100% !important; overflow: visible !important; }
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
          {/* Header: Brand logo */}
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

          {/* Footer: brand signature — matches VOICE.md Utility-Signatur tone */}
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
            Du bekommst diese Mail, weil du einen Account bei Generation AI hast. Fragen? Antworte einfach auf diese Mail.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
