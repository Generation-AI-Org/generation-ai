import { Button, Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface WaitlistReinviteEmailProps {
  name?: string
  joinUrl?: string
}

/**
 * Waitlist Re-Invite email (Phase 25 post-launch, Q10).
 *
 * Sent ONCE per waitlist-entry when SIGNUP_ENABLED flips to true.
 * Not a Supabase-template — sent directly via Resend from scripts/waitlist-reinvite.ts.
 */
export default function WaitlistReinviteEmail({
  name = 'Freund der Community',
  joinUrl = 'https://generation-ai.org/join?source=waitlist-reinvite',
}: WaitlistReinviteEmailProps): React.ReactElement {
  return (
    <Layout preview="Wir sind live — dein Platz wartet.">
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
        Kurze Sache: Die Anmeldung für Generation AI ist jetzt offen.
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
        Du standest auf unserer Warteliste — jetzt kannst du direkt loslegen. Ein Klick, kurz bestätigen, und du bist in der Community.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <Button
          href={joinUrl}
          style={{
            display: 'inline-block',
            backgroundColor: tokens.light.accent,
            color: tokens.light.textOnAccent,
            fontFamily: fontStack.mono,
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 28px',
            borderRadius: '999px',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          Jetzt anmelden →
        </Button>
      </Section>

      <Text
        className="email-muted"
        style={{
          fontSize: '14px',
          lineHeight: 1.55,
          color: tokens.light.textMuted,
          margin: '32px 0 0 0',
        }}
      >
        Falls du doch nicht mehr willst: einfach ignorieren, wir schreiben dich nicht nochmal an.
      </Text>
    </Layout>
  )
}
