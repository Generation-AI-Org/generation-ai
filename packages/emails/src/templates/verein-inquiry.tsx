import { Heading, Section, Text, Hr } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface VereinInquiryEmailProps {
  name: string
  email: string
  area: 'Events' | 'Content' | 'Tech' | 'Strategie' | 'Partnerschaften' | 'Allgemein'
  nachricht?: string
}

export default function VereinInquiryEmail({
  name,
  email,
  area,
  nachricht,
}: VereinInquiryEmailProps): React.ReactElement {
  return (
    <Layout preview={`Neue Vereins-Anfrage von ${name}`}>
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
        Neue Vereins-Anfrage
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
        {area}
      </Text>

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
        <Field label="Name" value={name} />
        <Field label="E-Mail" value={email} />
        <Field label="Bereich" value={area} last={!nachricht} />

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

function Field({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <>
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
        {label}
      </Text>
      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: last ? '0' : '0 0 16px 0',
          fontFamily: fontStack.sans,
        }}
      >
        {value}
      </Text>
    </>
  )
}
