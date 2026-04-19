import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface ConfirmSignupEmailProps {
  name?: string
  confirmationUrl?: string
}

/**
 * Confirm Signup email template.
 *
 * Subject (set in Supabase Dashboard): "Willkommen bei Generation AI 👋"
 * Supabase template variables are embedded as default prop values so that
 * render(...) produces HTML with Go-template syntax intact for Dashboard import.
 */
export default function ConfirmSignupEmail({
  name = '{{ .Data.name }}',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: ConfirmSignupEmailProps): React.ReactElement {
  return (
    <Layout preview="Schön dass du da bist. Hier geht's weiter.">
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
        Hey {name} 👋
      </Heading>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum.
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 32px 0',
        }}
      >
        Bestätige kurz deine Mail-Adresse, dann geht's los.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton slug="confirm-signup" href={confirmationUrl}>E-Mail bestätigen</EmailButton>
      </Section>

      <Text
        className="email-muted"
        style={{
          fontSize: '14px',
          lineHeight: 1.55,
          color: tokens.light.textMuted,
          margin: '24px 0 0 0',
        }}
      >
        Falls du dich nicht angemeldet hast, ignorier die Mail einfach.
      </Text>
    </Layout>
  )
}
