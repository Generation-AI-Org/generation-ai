import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface MagicLinkEmailProps {
  name?: string
  confirmationUrl?: string
}

/**
 * Magic Link login email template.
 *
 * Subject (set in Supabase Dashboard): "Dein Anmelde-Link"
 * Supabase template variables are embedded as default prop values so that
 * render(...) produces HTML with Go-template syntax intact for Dashboard import.
 */
export default function MagicLinkEmail({
  name = '{{ .Data.name }}',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: MagicLinkEmailProps): React.ReactElement {
  return (
    <Layout preview="Dein Login-Link, gültig 15 Minuten.">
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
        hier ist dein Login-Link. Klick drauf und du bist drin.
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
        Der Link gilt 15 Minuten.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton slug="magic-link" href={confirmationUrl}>Anmelden</EmailButton>
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
        Falls du den Link nicht angefordert hast, ignorier die Mail.
      </Text>
    </Layout>
  )
}
