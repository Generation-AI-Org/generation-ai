import { Heading, Text } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface PartnerInquiryConfirmationEmailProps {
  name: string
  typ: 'Unternehmen' | 'Stiftung' | 'Hochschule' | 'Initiative'
}

/**
 * PartnerInquiryConfirmationEmail — Bestätigungsmail an den Absender.
 *
 * Subject: "Deine Anfrage bei Generation AI ist eingegangen."
 * To: {submitter email}
 * From: noreply@generation-ai.org
 */
export default function PartnerInquiryConfirmationEmail({
  name,
  typ,
}: PartnerInquiryConfirmationEmailProps): React.ReactElement {
  return (
    <Layout preview="Wir haben deine Anfrage erhalten — wir melden uns innerhalb von 48 Stunden.">
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
        Anfrage eingegangen.
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
        wir haben deine Anfrage als <strong>{typ}</strong> erhalten. Wir melden uns innerhalb von 48 Stunden bei dir.
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: '0 0 24px 0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        Bis dahin — schau dich gerne auf generation-ai.org um oder tritt unserer Community bei.
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
          href="mailto:admin@generation-ai.org"
          style={{ color: tokens.light.textMuted, textDecoration: 'underline' }}
        >
          admin@generation-ai.org
        </a>
      </Text>
    </Layout>
  )
}
