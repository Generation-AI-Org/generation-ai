---
phase: 17-auth-extensions
plan: 05
type: execute
wave: 3
depends_on: [17-01, 17-02, 17-03, 17-04]
files_modified:
  - packages/emails/scripts/export.ts
  - packages/emails/package.json
  - apps/website/emails/dist/confirm-signup.html
  - apps/website/emails/dist/recovery.html
  - apps/website/emails/dist/magic-link.html
  - apps/website/emails/dist/email-change.html
  - apps/website/emails/dist/reauth.html
  - apps/website/emails/dist/invite.html
  - apps/website/emails/dist/.gitkeep
  - .planning/phases/17-auth-extensions/MANUAL-STEPS.md
  - .changeset/phase-17-auth-emails.md
autonomous: false
requirements: [AUTH-EMAIL-10, AUTH-EMAIL-11]
user_setup:
  - service: supabase
    why: "Deploy HTML templates to Supabase Auth"
    dashboard_config:
      - task: "Paste 6 HTMLs into Supabase → Auth → Email Templates"
        location: "Supabase Dashboard → Auth → Email Templates"
      - task: "Set Subjects per MANUAL-STEPS.md subjects table"
        location: "same"
      - task: "Verify Rate Limits at defaults (30/h email, 30/h OTP, 150/5min refresh, 30/h anon)"
        location: "Supabase Dashboard → Auth → Rate Limits"
must_haves:
  truths:
    - "Running `pnpm -F @genai/emails run email:export` produces 6 HTML files in apps/website/emails/dist/"
    - "Each HTML file contains the correct Supabase template variable (e.g. recovery.html contains {{ .ConfirmationURL }})"
    - "Each HTML contains the @media (prefers-color-scheme: dark) block from Layout"
    - "Each HTML is inline-styled (no external CSS refs)"
    - "Each HTML contains the Outlook VML bulletproof-button fallback (mso conditional comments emitted by React Email Button pX/pY)"
    - "MANUAL-STEPS.md gives Luca a copy-pasteable checklist for Supabase Dashboard"
    - "Changeset for patch release (v4.3.x) committed"
  artifacts:
    - path: "packages/emails/scripts/export.ts"
      provides: "Render-to-HTML export script using @react-email/render"
    - path: "apps/website/emails/dist/confirm-signup.html"
      provides: "Production-ready HTML for Supabase Confirm Signup template"
    - path: ".planning/phases/17-auth-extensions/MANUAL-STEPS.md"
      provides: "Luca's manual-step checklist (HTMLs + subjects + rate limits)"
  key_links:
    - from: "packages/emails/scripts/export.ts"
      to: "packages/emails/src/templates/*.tsx"
      via: "dynamic import + @react-email/render"
      pattern: "render.*template"
---

<objective>
Ship the phase: (1) build the HTML export script that renders the 6 React Email templates to static HTML for paste-in to Supabase Dashboard, (2) run it, (3) write the MANUAL-STEPS.md with Supabase Dashboard instructions + subjects table + rate-limit recommendations, (4) add a changeset for patch v4.3.x, (5) human checkpoint: Luca pastes into Supabase and triggers a test mail.

Purpose: Deliver everything Luca needs to paste into Supabase in one place with zero ambiguity.
Output: 6 HTML files, export script, MANUAL-STEPS.md, changeset, and a checkpoint that pauses for Luca.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/17-auth-extensions/CONTEXT.md
@packages/emails/src/templates/confirm-signup.tsx
@packages/emails/src/templates/recovery.tsx
@packages/emails/src/templates/magic-link.tsx
@packages/emails/src/templates/email-change.tsx
@packages/emails/src/templates/reauth.tsx
@packages/emails/src/templates/invite.tsx
@CLAUDE.md

<interfaces>
@react-email/render API:
```ts
import { render } from '@react-email/render';
import ConfirmSignup from '../src/templates/confirm-signup';
const html = await render(<ConfirmSignup />, { pretty: true });
```

Template → output filename mapping (matches CONTEXT.md §Manual Steps table):
- confirm-signup.tsx → dist/confirm-signup.html
- recovery.tsx → dist/recovery.html
- magic-link.tsx → dist/magic-link.html
- email-change.tsx → dist/email-change.html
- reauth.tsx → dist/reauth.html
- invite.tsx → dist/invite.html

Rate-Limit recommendations (from CONTEXT.md §Manual Steps):
| Limit | Wert |
| Email-based (signup, signin, reset) | 30/hour |
| OTP verifications | 30/hour |
| Token refreshes | 150/5 min |
| Anonymous sign-ins | 30/hour |
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Write export script + generate 6 HTML files</name>
  <files>packages/emails/scripts/export.ts, packages/emails/package.json, apps/website/emails/dist/confirm-signup.html, apps/website/emails/dist/recovery.html, apps/website/emails/dist/magic-link.html, apps/website/emails/dist/email-change.html, apps/website/emails/dist/reauth.html, apps/website/emails/dist/invite.html, apps/website/emails/dist/.gitkeep</files>
  <read_first>
    - packages/emails/package.json (verify email:export script from 17-01)
    - All 6 template files in packages/emails/src/templates/
    - @react-email/render docs via context7: `mcp__context7__resolve-library-id` with "@react-email/render", then get docs for `render()` with `pretty` option
  </read_first>
  <action>
    1. Create `apps/website/emails/dist/.gitkeep` so the directory exists in git.
    2. Create `packages/emails/scripts/export.ts`:
       ```ts
       import { render } from '@react-email/render';
       import { writeFileSync, mkdirSync } from 'node:fs';
       import { join, dirname } from 'node:path';
       import ConfirmSignup from '../src/templates/confirm-signup';
       import Recovery from '../src/templates/recovery';
       import MagicLink from '../src/templates/magic-link';
       import EmailChange from '../src/templates/email-change';
       import Reauth from '../src/templates/reauth';
       import Invite from '../src/templates/invite';
       import React from 'react';

       const REPO_ROOT = join(__dirname, '..', '..', '..');
       const OUT_DIR = join(REPO_ROOT, 'apps', 'website', 'emails', 'dist');

       const TEMPLATES = [
         { name: 'confirm-signup', component: ConfirmSignup },
         { name: 'recovery', component: Recovery },
         { name: 'magic-link', component: MagicLink },
         { name: 'email-change', component: EmailChange },
         { name: 'reauth', component: Reauth },
         { name: 'invite', component: Invite },
       ] as const;

       async function run() {
         mkdirSync(OUT_DIR, { recursive: true });
         for (const { name, component: Component } of TEMPLATES) {
           const html = await render(React.createElement(Component), { pretty: true });
           const outPath = join(OUT_DIR, `${name}.html`);
           writeFileSync(outPath, html, 'utf8');
           console.log(`✓ ${name} → ${outPath}`);
         }
       }

       run().catch((err) => { console.error(err); process.exit(1); });
       ```
    3. Confirm `packages/emails/package.json` has script `"email:export": "tsx scripts/export.ts"` (created in 17-01 Task 1 — verify, do not duplicate).
    4. Run `pnpm -F @genai/emails run email:export` from repo root.
    5. Verify 6 HTML files now exist in `apps/website/emails/dist/`.
    6. Spot-check one HTML: `grep "{{ .ConfirmationURL }}" apps/website/emails/dist/recovery.html` must match, confirming Go-template variables pass through `render()` untouched (they're literal string content, React treats them as text).
    7. Spot-check `@media (prefers-color-scheme: dark)` in all 6 HTMLs.
    8. **Verify Outlook VML bulletproof-button fallback:** grep for `mso` conditional comments in each HTML (React Email's `<Button pX pY>` emits `<!--[if mso]>...<![endif]-->` VML markup around CTA buttons — this is how Outlook Desktop renders padded buttons). All 6 templates have a CTA button, so all 6 HTMLs must contain `mso`.
  </action>
  <verify>
    <automated>pnpm -F @genai/emails run email:export && for t in confirm-signup recovery magic-link email-change reauth invite; do test -f apps/website/emails/dist/$t.html || exit 1; done && grep -l "{{ .ConfirmationURL }}" apps/website/emails/dist/confirm-signup.html apps/website/emails/dist/recovery.html apps/website/emails/dist/magic-link.html apps/website/emails/dist/email-change.html apps/website/emails/dist/invite.html && grep -q "{{ .Token }}" apps/website/emails/dist/reauth.html && for t in confirm-signup recovery magic-link email-change reauth invite; do grep -q "prefers-color-scheme: dark" apps/website/emails/dist/$t.html || (echo "missing dark media in $t" && exit 1); done && for t in confirm-signup recovery magic-link email-change reauth invite; do grep -q "mso" apps/website/emails/dist/$t.html || (echo "missing VML mso fallback in $t (bulletproof-button check failed — verify EmailButton uses pX/pY not padding)" && exit 1); done</automated>
  </verify>
  <done>
    - All 6 HTML files exist and are non-empty
    - Supabase variables preserved ({{ .ConfirmationURL }} in 5 templates, {{ .Token }} in reauth)
    - prefers-color-scheme: dark block present in all 6
    - Outlook VML bulletproof-button fallback (`mso` conditional comments) present in all 6
    - Export is reproducible via `pnpm -F @genai/emails run email:export`
  </done>
  <acceptance_criteria>
    - All 6 files exist: `ls apps/website/emails/dist/*.html | wc -l` == 6
    - `grep -c "{{ .ConfirmationURL }}" apps/website/emails/dist/recovery.html` >= 1
    - `grep -c "{{ .ConfirmationURL }}" apps/website/emails/dist/magic-link.html` >= 1
    - `grep -c "{{ .ConfirmationURL }}" apps/website/emails/dist/confirm-signup.html` >= 1
    - `grep -c "{{ .ConfirmationURL }}" apps/website/emails/dist/email-change.html` >= 1
    - `grep -c "{{ .ConfirmationURL }}" apps/website/emails/dist/invite.html` >= 1
    - `grep -c "{{ .Token }}" apps/website/emails/dist/reauth.html` >= 1
    - `grep -c "prefers-color-scheme: dark" apps/website/emails/dist/*.html` shows >=1 per file (6 files)
    - **VML bulletproof-button check** — `grep -q "mso" apps/website/emails/dist/confirm-signup.html` exits 0
    - **VML bulletproof-button check** — `grep -q "mso" apps/website/emails/dist/recovery.html` exits 0
    - **VML bulletproof-button check** — `grep -q "mso" apps/website/emails/dist/magic-link.html` exits 0
    - **VML bulletproof-button check** — `grep -q "mso" apps/website/emails/dist/email-change.html` exits 0
    - **VML bulletproof-button check** — `grep -q "mso" apps/website/emails/dist/reauth.html` exits 0
    - **VML bulletproof-button check** — `grep -q "mso" apps/website/emails/dist/invite.html` exits 0
    - `grep -c "logo-wide-red.png" apps/website/emails/dist/confirm-signup.html` >= 1 (light logo embedded)
    - `grep -c "logo-wide-neon.png" apps/website/emails/dist/confirm-signup.html` >= 1 (dark logo embedded)
    - File size of each HTML > 2KB (real content, not empty)
  </acceptance_criteria>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Write MANUAL-STEPS.md and add changeset</name>
  <files>.planning/phases/17-auth-extensions/MANUAL-STEPS.md, .changeset/phase-17-auth-emails.md</files>
  <read_first>
    - .planning/phases/17-auth-extensions/CONTEXT.md §Manual Steps (lines 88-138)
    - apps/website/emails/dist/ (confirm all 6 HTMLs exist from Task 1)
    - CLAUDE.md §Changelog & Versioning
    - existing .changeset/ directory for format reference
  </read_first>
  <action>
    1. Create `.planning/phases/17-auth-extensions/MANUAL-STEPS.md` with the following sections (copy-pasteable for Luca):

       ```markdown
       # Phase 17 — Manual Steps für Luca

       > Nach Claude's Auto-Run: 3 Schritte, ~10 Minuten.

       ## 1. Email-Templates in Supabase einspielen

       Dashboard → https://supabase.com/dashboard/project/wbohulnuwqrhystaamjc/auth/templates

       Für jedes der 6 Templates: Body + Subject setzen. Body = Inhalt der HTML-Datei 1:1 reinpasten.

       | Supabase-Feld | Body-Datei | Subject |
       |---|---|---|
       | Confirm signup | `apps/website/emails/dist/confirm-signup.html` | `Willkommen bei Generation AI 👋` |
       | Magic Link | `apps/website/emails/dist/magic-link.html` | `Dein Anmelde-Link` |
       | Change Email Address | `apps/website/emails/dist/email-change.html` | `Neue Mail-Adresse bestätigen` |
       | Reset Password | `apps/website/emails/dist/recovery.html` | `Neues Passwort für Generation AI` |
       | Reauthentication | `apps/website/emails/dist/reauth.html` | `Kurz bestätigen, dass du's bist` |
       | Invite user | `apps/website/emails/dist/invite.html` | `[Name] hat dich zu Generation AI eingeladen` |

       ## 2. Rate-Limits auf Prod-Defaults

       Dashboard → Auth → Rate Limits. Prüfen und ggf. auf diese Werte setzen (= Supabase-Defaults):

       | Limit | Wert |
       |---|---|
       | Email-based rate limits | 30 per hour |
       | OTP verifications | 30 per hour |
       | Token refreshes | 150 per 5 min |
       | Anonymous sign-ins | 30 per hour |

       Grund: Phase 13 hat ggf. Test-Werte drin gelassen. Für unsere Nutzerzahl (<1000) reichen Defaults, sind Over-Engineering für alles drüber.

       ## 3. Smoke-Test

       1. Auf eigenem Account: Passwort zurücksetzen triggern (Login-Seite → "Passwort vergessen")
       2. Mail in Gmail Light prüfen → Logo rot, Button rot, lesbar
       3. Gmail Dark-Mode aktivieren → Logo neon-grün, Button neon-grün, Background dunkel
       4. Apple Mail Light + Dark gegenchecken
       5. **Outlook Desktop (falls zur Hand):** Button muss gepaddete Pill sein, nicht nackter Link-Text — verifiziert dass VML-Fallback greift
       6. Wenn alles passt: Luca meldet zurück an Claude "approved" → Phase-17 SUMMARY wird finalisiert

       ## Notes

       - **Outlook-VML-Fallback via React Email Button pX/pY**: Die Buttons nutzen React Emails `<Button>`-Component mit `pX={24} pY={12}` (nicht CSS-`padding`). Das rendert automatisch `<!--[if mso]>...<![endif]-->` VML-Markup, damit Outlook Desktop den Button korrekt gepaddet darstellt. Verifiziert im Export via `grep mso apps/website/emails/dist/*.html` — muss in allen 6 HTMLs matchen.

       ## Troubleshooting

       - **Logo erscheint nicht** → Website-Deploy auf Vercel abwarten (PNGs liegen unter `https://generation-ai.org/brand/logos/logo-wide-{red|neon}.png`)
       - **Dark-Mode greift nicht in Gmail** → Gmail unterstützt `prefers-color-scheme` nur im Web-Client + neueren Mobile-Apps. Outlook ignoriert es — akzeptiertes Fallback: Light-Theme greift, Button bleibt via VML korrekt gepaddet.
       - **Button in Outlook Desktop sieht aus wie nackter Link (kein Padding)** → VML-Fallback fehlt. Prüfen: `grep mso apps/website/emails/dist/recovery.html` muss matchen. Falls nicht: EmailButton.tsx nutzt CSS-`padding` statt `pX`/`pY` props — zurück zu Plan 17-01 Task 2.
       - **{{ .ConfirmationURL }} erscheint wörtlich im Mail-Body** → Supabase hat die Variable nicht geparst. Sicherstellen, dass HTML 1:1 in das Body-Feld des richtigen Templates gepastet wurde (nicht in das Plain-Text-Feld).
       ```

    2. Create `.changeset/phase-17-auth-emails.md` for a patch release:
       ```markdown
       ---
       "@genai/website": patch
       "@genai/tools-app": patch
       ---

       Phase 17: Supabase auth email templates vereinheitlicht auf React Email — 6 Templates (Confirm Signup, Magic Link, Reset Password, Change Email, Reauthentication, Invite) teilen ein Layout + Design-Tokens aus brand/tokens.json, theme-adaptiv via prefers-color-scheme. Copy aus brand/VOICE.md. HTML-Export via `pnpm -F @genai/emails run email:export`.
       ```
  </action>
  <verify>
    <automated>test -f .planning/phases/17-auth-extensions/MANUAL-STEPS.md && test -f .changeset/phase-17-auth-emails.md && grep -q "Rate-Limits" .planning/phases/17-auth-extensions/MANUAL-STEPS.md && grep -q "30 per hour" .planning/phases/17-auth-extensions/MANUAL-STEPS.md && grep -q "150 per 5 min" .planning/phases/17-auth-extensions/MANUAL-STEPS.md && grep -q "Outlook-VML-Fallback" .planning/phases/17-auth-extensions/MANUAL-STEPS.md && grep -q "pX/pY" .planning/phases/17-auth-extensions/MANUAL-STEPS.md && grep -q '"@genai/website": patch' .changeset/phase-17-auth-emails.md</automated>
  </verify>
  <done>
    - MANUAL-STEPS.md exists with subjects table, rate-limit table, smoke-test, troubleshooting
    - MANUAL-STEPS.md includes Outlook-VML-Fallback note documenting React Email Button pX/pY + `grep mso` verification
    - Changeset exists in .changeset/ for patch bump
  </done>
  <acceptance_criteria>
    - grep `"Confirm signup"` in MANUAL-STEPS.md → matches
    - grep `"30 per hour"` in MANUAL-STEPS.md → matches
    - grep `"150 per 5 min"` in MANUAL-STEPS.md → matches
    - grep `"Willkommen bei Generation AI"` in MANUAL-STEPS.md → matches
    - grep `"Outlook-VML-Fallback"` in MANUAL-STEPS.md → matches
    - grep `"pX/pY"` in MANUAL-STEPS.md → matches
    - grep `"grep mso"` in MANUAL-STEPS.md → matches
    - grep `"patch"` in .changeset/phase-17-auth-emails.md → matches
    - grep `"@genai/website"` in .changeset/phase-17-auth-emails.md → matches
  </acceptance_criteria>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Luca pastes into Supabase + smoke-tests</name>
  <what-built>
    - 6 HTML files ready at `apps/website/emails/dist/*.html`
    - MANUAL-STEPS.md with exact subjects + rate-limit table + troubleshooting + Outlook-VML-Fallback note
    - Changeset for patch v4.3.x
    - PNG logos in apps/website/public/brand/logos/ (will resolve to https://generation-ai.org/brand/logos/*.png once website is deployed)
  </what-built>
  <how-to-verify>
    **PRE-REQ:** Push website changes to main so that https://generation-ai.org/brand/logos/logo-wide-red.png and logo-wide-neon.png are reachable (Vercel will auto-deploy on push).

    **Then:**

    1. Open `.planning/phases/17-auth-extensions/MANUAL-STEPS.md` and follow Section 1: paste each of the 6 HTMLs into the matching Supabase Email Template slot + set the matching Subject.
    2. Follow Section 2: check Rate Limits, reset to defaults if Phase-13 test values are still active.
    3. Follow Section 3: smoke-test. Trigger Password-Reset on your own account. Verify:
       - [ ] Mail arrives within 1 minute
       - [ ] Subject reads "Neues Passwort für Generation AI"
       - [ ] Logo appears (red on Light, neon on Dark)
       - [ ] Body text matches VOICE.md ("klick auf den Button, um ein neues Passwort zu setzen. Der Link gilt 60 Minuten.")
       - [ ] CTA button reads "Passwort zurücksetzen"
       - [ ] Footer reads "Generation AI · Die KI-Community für Studierende"
       - [ ] Dark-mode in Gmail web client swaps the background + logo
       - [ ] Apple Mail Light + Dark both render correctly
       - [ ] (Optional, wenn Outlook Desktop verfügbar) CTA-Button in Outlook Desktop ist gepaddete Pill (VML-Fallback greift)
    4. If any checkbox fails, post the failure to Claude with a screenshot — Claude will gap-close.
    5. If all pass: respond "approved" — Claude writes SUMMARY.md and closes the phase.
  </how-to-verify>
  <resume-signal>Reply with "approved" once all 6 templates are live in Supabase and the smoke-test passes. If something's off, paste screenshot + which check failed.</resume-signal>
</task>

</tasks>

<verification>
- 6 HTMLs exist in apps/website/emails/dist/
- Each contains correct Supabase template variable + @media prefers-color-scheme
- Each contains Outlook VML bulletproof-button fallback (`mso` conditional comments)
- MANUAL-STEPS.md and changeset in place
- MANUAL-STEPS.md documents Outlook-VML-Fallback mechanism + verification command
- Human checkpoint documented with exact verification steps
</verification>

<success_criteria>
- [ ] 6 production-ready HTML templates exported
- [ ] All 6 HTMLs contain `mso` VML fallback for Outlook bulletproof buttons
- [ ] MANUAL-STEPS.md gives Luca copy-paste instructions + subjects + rate-limit recommendations + Outlook-VML note
- [ ] Changeset for patch v4.3.x committed
- [ ] Luca signs off after smoke-test in Gmail + Apple Mail
</success_criteria>

<output>
After completion (post-checkpoint approval), create `.planning/phases/17-auth-extensions/17-05-SUMMARY.md` AND a phase-level `.planning/phases/17-auth-extensions/SUMMARY.md` consolidating all 5 plans.
</output>
