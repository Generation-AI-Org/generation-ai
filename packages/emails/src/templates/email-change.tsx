import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface EmailChangeEmailProps {
  confirmationUrl?: string
  newEmail?: string
}

/**
 * Change Email confirmation template.
 *
 * Subject (set in Supabase Dashboard): "Neue Mail-Adresse bestätigen"
 * Supabase template variables are embedded as default prop values so that
 * render(...) produces HTML with Go-template syntax intact for Dashboard import.
 */
export default function EmailChangeEmail({
  confirmationUrl = '{{ .ConfirmationURL }}',
  newEmail = '{{ .Email }}',
}: EmailChangeEmailProps): React.ReactElement {
  return (
    <Layout preview="Klick, um die Änderung zu bestätigen.">
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
        Neue Mail-Adresse bestätigen
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
        Du willst deine Mail-Adresse zu {newEmail} ändern.
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
        Bestätige die Änderung mit einem Klick:
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton href={confirmationUrl}>Änderung bestätigen</EmailButton>
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
        Falls du das nicht warst, ignorier die Mail. Deine aktuelle Mail-Adresse bleibt.
      </Text>
    </Layout>
  )
}
