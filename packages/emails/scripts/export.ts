import { render } from '@react-email/render'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import ConfirmSignup from '../src/templates/confirm-signup'
import Recovery from '../src/templates/recovery'
import MagicLink from '../src/templates/magic-link'
import EmailChange from '../src/templates/email-change'
import Reauth from '../src/templates/reauth'
import Invite from '../src/templates/invite'

// ESM-safe __dirname — works regardless of package "type" field or tsx ESM mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const REPO_ROOT = join(__dirname, '..', '..', '..')
const OUT_DIR = join(REPO_ROOT, 'apps', 'website', 'emails', 'dist')

const TEMPLATES = [
  { name: 'confirm-signup', component: ConfirmSignup },
  { name: 'recovery', component: Recovery },
  { name: 'magic-link', component: MagicLink },
  { name: 'email-change', component: EmailChange },
  { name: 'reauth', component: Reauth },
  { name: 'invite', component: Invite },
] as const

async function run() {
  mkdirSync(OUT_DIR, { recursive: true })
  for (const { name, component: Component } of TEMPLATES) {
    // pretty: false — formatter splits Outlook VML conditional comments across lines
    // (`<![endif]-->` becomes `<! [endif]-->`) which breaks button rendering in
    // Outlook Desktop. Supabase pastes raw HTML; humans don't read these artifacts.
    const html = await render(React.createElement(Component), { pretty: false })
    const outPath = join(OUT_DIR, `${name}.html`)
    writeFileSync(outPath, html, 'utf8')
    console.log(`✓ ${name} → ${outPath}`)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
