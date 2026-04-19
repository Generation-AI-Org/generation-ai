import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface RecoveryEmailProps {
  name?: string
  confirmationUrl?: string
}

/**
 * Reset Password (recovery) email template.
 *
 * Subject (set in Supabase Dashboard): "Neues Passwort für Generation AI"
 * Supabase template variables are embedded as default prop values so that
 * render(...) produces HTML with Go-template syntax intact for Dashboard import.
 */
export default function RecoveryEmail({
  name = '{{ .Data.name }}',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: RecoveryEmailProps): React.ReactElement {
  return (
    <Layout preview="Setz dein Passwort in 60 Minuten zurück.">
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
        Hey {name},
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
        klick auf den Button, um ein neues Passwort zu setzen.
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
        Der Link gilt 60 Minuten.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton slug="recovery" href={confirmationUrl}>Passwort zurücksetzen</EmailButton>
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
        Falls du das nicht warst, ignorier die Mail. Dein Passwort bleibt unverändert.
      </Text>
    </Layout>
  )
}
