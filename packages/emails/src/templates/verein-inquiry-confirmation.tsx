import { Heading, Text } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface VereinInquiryConfirmationEmailProps {
  name: string
  area: 'Events' | 'Content' | 'Tech' | 'Strategie' | 'Partnerschaften' | 'Allgemein'
}

export default function VereinInquiryConfirmationEmail({
  name,
  area,
}: VereinInquiryConfirmationEmailProps): React.ReactElement {
  return (
    <Layout preview="Wir haben deine Nachricht erhalten.">
      <Heading
        className="email-heading"
        style={{
          fontFamily: fontStack.sans,
          fontSize: '24px',
          fontWeight: 700,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Nachricht angekommen.
      </Heading>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: '0 0 16px 0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        Hey {name},
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: '0 0 16px 0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        wir haben deine Nachricht zum Bereich <strong>{area}</strong> erhalten. Wir melden uns bei dir.
      </Text>

      <Text
        className="email-muted"
        style={{
          fontSize: '14px',
          color: tokens.light.textMuted,
          margin: '0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        Fragen? Schreib uns direkt an{' '}
        <a
          href="mailto:info@generation-ai.org"
          style={{ color: tokens.light.textMuted, textDecoration: 'underline' }}
        >
          info@generation-ai.org
        </a>
      </Text>
    </Layout>
  )
}
