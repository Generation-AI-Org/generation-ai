import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack, radius } from '../tokens'

export interface ReauthEmailProps {
  token?: string
}

/**
 * Reauthentication (OTP) email template.
 *
 * Subject (set in Supabase Dashboard): "Kurz bestätigen, dass du's bist"
 * Supabase template variables are embedded as default prop values so that
 * render(...) produces HTML with Go-template syntax intact for Dashboard import.
 *
 * No CTA button — user reads the 6-digit code and enters it in the app.
 */
export default function ReauthEmail({
  token = '{{ .Token }}',
}: ReauthEmailProps): React.ReactElement {
  return (
    <Layout preview="Aus Sicherheitsgründen — dein Code kommt hier.">
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
        Kurz bestätigen, dass du's bist
      </Heading>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 32px 0',
        }}
      >
        Gib diesen Code in Generation AI ein, um fortzufahren:
      </Text>

      {/* OTP code block — no button. User copies the 6-digit code into the app. */}
      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        {/* OTP code is rendered with static light-theme colors for maximum contrast/readability in all mail clients. */}
        <Text
          className="email-code"
          style={{
            display: 'inline-block',
            fontFamily: fontStack.mono,
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: tokens.light.text,
            backgroundColor: '#EFEFEF',
            padding: '16px 24px',
            borderRadius: radius['2xl'],
            margin: 0,
          }}
        >
          {token}
        </Text>
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
        Der Code gilt 10 Minuten. Falls du das nicht angefordert hast, ignorier die Mail.
      </Text>
    </Layout>
  )
}
