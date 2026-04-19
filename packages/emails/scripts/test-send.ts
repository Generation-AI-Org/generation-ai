import { render } from '@react-email/render'
import { Resend } from 'resend'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import ConfirmSignup from '../src/templates/confirm-signup'
import Recovery from '../src/templates/recovery'
import MagicLink from '../src/templates/magic-link'
import EmailChange from '../src/templates/email-change'
import Reauth from '../src/templates/reauth'
import Invite from '../src/templates/invite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../../../apps/website/.env.local')
const envFile = readFileSync(envPath, 'utf-8')
const apiKey = envFile.match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim()

if (!apiKey) {
  console.error('RESEND_API_KEY not found in apps/website/.env.local')
  process.exit(1)
}

const to = process.argv[2]
if (!to || !to.includes('@')) {
  console.error('Usage: pnpm -F @genai/emails run email:test-send <email@example.com>')
  process.exit(1)
}

const resend = new Resend(apiKey)

const DUMMY_URL = 'https://generation-ai.org/auth/callback?token=DUMMY_TOKEN_FOR_TESTING'
const DUMMY_TOKEN = '384921'
const DUMMY_NAME = 'Luca'
const DUMMY_INVITER = 'Max Mustermann'

const templates = [
  { name: 'confirm-signup', subject: '[TEST] Willkommen bei Generation AI 👋', component: ConfirmSignup, props: { confirmationUrl: DUMMY_URL, name: DUMMY_NAME } },
  { name: 'magic-link', subject: '[TEST] Dein Anmelde-Link', component: MagicLink, props: { confirmationUrl: DUMMY_URL, name: DUMMY_NAME } },
  { name: 'recovery', subject: '[TEST] Neues Passwort für Generation AI', component: Recovery, props: { confirmationUrl: DUMMY_URL, name: DUMMY_NAME } },
  { name: 'email-change', subject: '[TEST] Neue Mail-Adresse bestätigen', component: EmailChange, props: { confirmationUrl: DUMMY_URL, name: DUMMY_NAME } },
  { name: 'reauth', subject: "[TEST] Kurz bestätigen, dass du's bist", component: Reauth, props: { token: DUMMY_TOKEN } },
  { name: 'invite', subject: `[TEST] ${DUMMY_INVITER} hat dich zu Generation AI eingeladen`, component: Invite, props: { confirmationUrl: DUMMY_URL, inviterName: DUMMY_INVITER } },
]

async function main() {
  console.log(`Sending 6 test emails to ${to}...\n`)
  for (const t of templates) {
    const html = await render(t.component(t.props as any) as any)
    const { data, error } = await resend.emails.send({
      from: 'Generation AI <noreply@generation-ai.org>',
      to,
      subject: t.subject,
      html,
    })
    if (error) {
      console.error(`❌ ${t.name}: ${error.message}`)
    } else {
      console.log(`✅ ${t.name} → ${data?.id}`)
    }
    await new Promise((r) => setTimeout(r, 600))
  }
  console.log('\nDone. Check your inbox (including spam).')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
