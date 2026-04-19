import { render } from '@react-email/render'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import ConfirmSignup from '../src/templates/confirm-signup'
import Recovery from '../src/templates/recovery'
import MagicLink from '../src/templates/magic-link'
import EmailChange from '../src/templates/email-change'
import Reauth from '../src/templates/reauth'
import Invite from '../src/templates/invite'

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
    const html = await render(React.createElement(Component), { pretty: true })
    const outPath = join(OUT_DIR, `${name}.html`)
    writeFileSync(outPath, html, 'utf8')
    console.log(`✓ ${name} → ${outPath}`)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
