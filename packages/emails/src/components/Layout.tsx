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
 * Always dark CI theme — matches the website/terminal splash look.
 * No theme-adaptive swap (Gmail iOS doesn't support it reliably), so we
 * ship a single dark variant that looks identical across all mail clients.
 */
export function Layout({ preview, children }: LayoutProps): React.ReactElement {
  return (
    <Html lang="de">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: tokens.dark.bg,
          fontFamily: fontStack.sans,
          margin: 0,
          padding: '40px 20px',
        }}
      >
        <Container
          style={{
            maxWidth: '480px',
            backgroundColor: tokens.dark.bgCard,
            borderRadius: radius['2xl'],
            border: '1px solid ' + tokens.dark.border,
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
            style={{
              margin: '32px 0',
              border: 'none',
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: tokens.dark.border,
            }}
          />

          {/* Footer: brand signature */}
          <Text
            style={{
              fontSize: '12px',
              color: tokens.dark.textMuted,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Generation AI · Die KI-Community für Studierende
          </Text>

          {/* Legal footer */}
          <Text
            style={{
              fontSize: '11px',
              color: tokens.dark.textMuted,
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
