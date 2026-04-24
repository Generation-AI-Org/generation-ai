import { Heading, Section, Text, Hr } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface PartnerInquiryEmailProps {
  name: string
  email: string
  organisation: string
  typ: 'Unternehmen' | 'Stiftung' | 'Hochschule' | 'Initiative'
  nachricht?: string
}

/**
 * PartnerInquiryEmail — Admin-Benachrichtigung bei neuer Partner-Anfrage.
 *
 * Subject: "Neue Partner-Anfrage: {organisation} ({typ})"
 * To: admin@generation-ai.org
 * From: noreply@generation-ai.org
 */
export default function PartnerInquiryEmail({
  name,
  email,
  organisation,
  typ,
  nachricht,
}: PartnerInquiryEmailProps): React.ReactElement {
  return (
    <Layout preview={`Neue Partner-Anfrage von ${name} (${organisation})`}>
      <Heading
        className="email-heading"
        style={{
          fontFamily: fontStack.sans,
          fontSize: '24px',
          fontWeight: 700,
          color: tokens.light.text,
          margin: '0 0 8px 0',
        }}
      >
        Neue Partner-Anfrage
      </Heading>

      <Text
        className="email-muted"
        style={{
          fontSize: '14px',
          color: tokens.light.textMuted,
          margin: '0 0 24px 0',
          fontFamily: fontStack.mono,
        }}
      >
        {typ} · {organisation}
      </Text>

      {/* Details */}
      <Section
        className="email-card"
        style={{
          backgroundColor: tokens.light.bgCard,
          borderRadius: '12px',
          border: '1px solid ' + tokens.light.border,
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <Text
          className="email-text"
          style={{
            fontSize: '14px',
            color: tokens.light.textMuted,
            margin: '0 0 4px 0',
            fontFamily: fontStack.mono,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Name
        </Text>
        <Text
          className="email-text"
          style={{
            fontSize: '16px',
            color: tokens.light.text,
            margin: '0 0 16px 0',
            fontFamily: fontStack.sans,
          }}
        >
          {name}
        </Text>

        <Text
          className="email-text"
          style={{
            fontSize: '14px',
            color: tokens.light.textMuted,
            margin: '0 0 4px 0',
            fontFamily: fontStack.mono,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          E-Mail
        </Text>
        <Text
          className="email-text"
          style={{
            fontSize: '16px',
            color: tokens.light.text,
            margin: '0 0 16px 0',
            fontFamily: fontStack.sans,
          }}
        >
          {email}
        </Text>

        <Text
          className="email-text"
          style={{
            fontSize: '14px',
            color: tokens.light.textMuted,
            margin: '0 0 4px 0',
            fontFamily: fontStack.mono,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Organisation
        </Text>
        <Text
          className="email-text"
          style={{
            fontSize: '16px',
            color: tokens.light.text,
            margin: '0 0 16px 0',
            fontFamily: fontStack.sans,
          }}
        >
          {organisation}
        </Text>

        <Text
          className="email-text"
          style={{
            fontSize: '14px',
            color: tokens.light.textMuted,
            margin: '0 0 4px 0',
            fontFamily: fontStack.mono,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Partnertyp
        </Text>
        <Text
          className="email-text"
          style={{
            fontSize: '16px',
            color: tokens.light.text,
            margin: '0 0 0 0',
            fontFamily: fontStack.sans,
          }}
        >
          {typ}
        </Text>

        {nachricht && (
          <>
            <Hr
              className="email-divider"
              style={{
                margin: '16px 0',
                border: 'none',
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: tokens.light.border,
              }}
            />
            <Text
              className="email-text"
              style={{
                fontSize: '14px',
                color: tokens.light.textMuted,
                margin: '0 0 4px 0',
                fontFamily: fontStack.mono,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Nachricht
            </Text>
            <Text
              className="email-text"
              style={{
                fontSize: '15px',
                color: tokens.light.text,
                margin: '0',
                fontFamily: fontStack.sans,
                lineHeight: '1.6',
              }}
            >
              {nachricht}
            </Text>
          </>
        )}
      </Section>
    </Layout>
  )
}
