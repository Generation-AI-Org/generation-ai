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
  name = '{{ .Data.full_name }}',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: ConfirmSignupEmailProps): React.ReactElement {
  return (
    <Layout preview="Bestätige kurz deine Mail — dann bist du drin.">
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
        Ein Klick — und du bist in der Community.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton slug="confirm-signup" href={confirmationUrl}>In die Community →</EmailButton>
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
        Der Link loggt dich automatisch ein und bringt dich direkt in die Community. Gültig 7 Tage.
      </Text>

      <Text
        className="email-muted"
        style={{
          fontSize: '13px',
          lineHeight: 1.55,
          color: tokens.light.textMuted,
          margin: '16px 0 0 0',
        }}
      >
        Falls du dich nicht angemeldet hast, ignorier die Mail einfach.
      </Text>
    </Layout>
  )
}
