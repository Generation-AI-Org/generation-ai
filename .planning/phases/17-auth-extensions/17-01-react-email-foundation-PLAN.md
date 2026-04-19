---
phase: 17-auth-extensions
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/emails/package.json
  - packages/emails/tsconfig.json
  - packages/emails/src/index.ts
  - packages/emails/src/tokens.ts
  - packages/emails/src/components/Layout.tsx
  - packages/emails/src/components/Button.tsx
  - packages/emails/src/components/BrandLogo.tsx
  - pnpm-workspace.yaml
autonomous: true
requirements: [AUTH-EMAIL-01, AUTH-EMAIL-02]
must_haves:
  truths:
    - "New workspace package @genai/emails exists and builds"
    - "Shared Layout component exposes Header (Logo) + children slot + Footer"
    - "Token helper exports brand colors + spacing + radius inline-usable as JS values"
    - "Layout adapts to prefers-color-scheme via CSS <style> block"
    - "EmailButton renders Outlook-VML-safe markup via React Email Button pX/pY props (bulletproof-button requirement)"
  artifacts:
    - path: "packages/emails/package.json"
      provides: "React Email deps, dist-exports, email CLI scripts"
      contains: "@react-email/components"
    - path: "packages/emails/src/tokens.ts"
      provides: "Inline-usable design tokens extracted from brand/tokens.json"
    - path: "packages/emails/src/components/Layout.tsx"
      provides: "Shared wrapper used by all 6 templates"
    - path: "packages/emails/src/components/BrandLogo.tsx"
      provides: "Mail-safe PNG Logo component with prefers-color-scheme swap"
    - path: "packages/emails/src/components/EmailButton.tsx"
      provides: "Bulletproof CTA button using React Email Button pX/pY (renders VML fallback for Outlook)"
  key_links:
    - from: "packages/emails/src/components/Layout.tsx"
      to: "packages/emails/src/tokens.ts"
      via: "import { tokens } from '../tokens'"
      pattern: "from.*tokens"
    - from: "packages/emails/src/components/Layout.tsx"
      to: "packages/emails/src/components/BrandLogo.tsx"
      via: "Layout header renders <BrandLogo />"
      pattern: "BrandLogo"
---

<objective>
Create the `@genai/emails` workspace package with React Email infrastructure: deps, TypeScript config, inline-token helper derived from `brand/tokens.json`, and the shared `Layout` wrapper (Header with logo + Body + Footer) used by all 6 Supabase email templates.

Purpose: Establish the foundation for DRY email templates. All 6 templates consume `Layout` + `tokens` — no duplication of colors, spacing, or footer markup.
Output: A buildable, importable `@genai/emails` package with Layout, BrandLogo, Button components and a typed tokens module.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/17-auth-extensions/CONTEXT.md
@brand/DESIGN.md
@brand/VOICE.md
@brand/tokens.json
@apps/website/lib/email.ts
@pnpm-workspace.yaml

<interfaces>
Token values to inline (from brand/tokens.json, theme.light + theme.dark):

Light:
- bg: #F6F6F6
- bgCard: #FFFFFF
- accent: #F5133B  (Rot, Education-Primary-Action)
- accentHover: #D9102F
- text: #141414
- textMuted: #555555
- textOnAccent: #FFFFFF
- border: rgba(0, 0, 0, 0.1)

Dark:
- bg: #141414
- bgCard: #1C1C1C
- accent: #CEFF32  (Neon-Grün, Business-Primary-Action)
- accentHover: #D4FF4D
- text: #F6F6F6
- textMuted: #8A8A8A
- textOnAccent: #141414
- border: rgba(255, 255, 255, 0.08)

Radius: full = 9999px (Buttons), 2xl = 16px (Cards)
Spacing base: 4px. Used values: 8, 16, 24, 32, 48.
Fonts: Geist Sans stack, Geist Mono stack for buttons (mail-clients fall back to system since custom fonts are unreliable in mail).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Scaffold @genai/emails package</name>
  <files>packages/emails/package.json, packages/emails/tsconfig.json, packages/emails/src/index.ts, packages/emails/src/tokens.ts, pnpm-workspace.yaml</files>
  <read_first>
    - packages/emails/ (verify does not exist)
    - packages/ui/package.json (reference for workspace package shape — exports, scripts, catalog deps)
    - packages/ui/tsconfig.json (reference for tsconfig)
    - pnpm-workspace.yaml (already workspace is `packages/*` — no edit expected, verify)
    - brand/tokens.json (extract exact hex values for tokens.ts)
  </read_first>
  <action>
    1. Create `packages/emails/package.json` with:
       - `"name": "@genai/emails"`, `"version": "0.0.1"`, `"private": true`
       - `"exports": { ".": "./src/index.ts", "./templates/*": "./src/templates/*.tsx", "./components/*": "./src/components/*.tsx" }`
       - `"scripts": { "email:dev": "email dev --dir ./src/templates --port 3030", "email:export": "tsx scripts/export.ts", "test": "vitest run" }`
       - dependencies: `"@react-email/components": "^0.0.31"`, `"@react-email/render": "^1.0.1"`, `"react-email": "^3.0.1"`
       - devDependencies: `"tsx": "^4.19.0"`, `"typescript": "catalog:"`, `"@types/react": "catalog:"`
       - peerDependencies: `"react": "catalog:"`, `"react-dom": "catalog:"`
    2. Create `packages/emails/tsconfig.json` extending `../config/tsconfig/base.json` if present (check packages/ui/tsconfig.json first — match that pattern). jsx: "react-jsx", target: "es2020", module: "esnext", moduleResolution: "bundler", strict: true, include: ["src/**/*"].
    3. Create `packages/emails/src/tokens.ts` exporting a typed `tokens` object with two keys (`light`, `dark`) each containing exact hex values from `brand/tokens.json` (see <interfaces> block above). Also export `radius` (full: '9999px', '2xl': '16px'), `space` (2: '8px', 4: '16px', 6: '24px', 8: '32px', 12: '48px'), and `fontStack` (sans: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", mono: "'Geist Mono', ui-monospace, Menlo, monospace"). Use `as const`.
    4. Create `packages/emails/src/index.ts` re-exporting: `Layout`, `BrandLogo`, `EmailButton` from `./components/*` (stub files in this task, filled in Task 2), and `tokens` from `./tokens`.
    5. Run `pnpm install` from repo root so pnpm links the new workspace package.
    6. `pnpm-workspace.yaml` already has `packages/*` → no edit needed. Verify with grep.
  </action>
  <verify>
    <automated>test -f packages/emails/package.json && test -f packages/emails/src/tokens.ts && pnpm -w install --frozen-lockfile=false && grep -q "#F5133B" packages/emails/src/tokens.ts && grep -q "#CEFF32" packages/emails/src/tokens.ts && pnpm -F @genai/emails exec tsc --noEmit</automated>
  </verify>
  <done>
    - `packages/emails/package.json` exists with exact deps listed above
    - `packages/emails/src/tokens.ts` exports `tokens.light.accent === '#F5133B'` and `tokens.dark.accent === '#CEFF32'`
    - `pnpm install` succeeds, `@genai/emails` resolvable as workspace pkg
    - `tsc --noEmit` from `packages/emails` passes
  </done>
  <acceptance_criteria>
    - grep `"@react-email/components"` in packages/emails/package.json → matches
    - grep `"#F5133B"` in packages/emails/src/tokens.ts → matches (light accent)
    - grep `"#CEFF32"` in packages/emails/src/tokens.ts → matches (dark accent)
    - grep `"#141414"` in packages/emails/src/tokens.ts → matches (dark bg)
    - grep `"email:export"` in packages/emails/package.json → matches
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
  </acceptance_criteria>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Implement Layout + Button + BrandLogo components</name>
  <files>packages/emails/src/components/Layout.tsx, packages/emails/src/components/EmailButton.tsx, packages/emails/src/components/BrandLogo.tsx</files>
  <read_first>
    - packages/emails/src/tokens.ts (from Task 1)
    - brand/DESIGN.md §A (Mail-Strategie) and §F (Logo-Matrix)
    - brand/VOICE.md §"Mails — Strukturelemente" (Footer signature "— Generation AI")
    - apps/website/lib/email.ts (reference existing prefers-color-scheme pattern lines 29-40)
    - React Email docs via context7: `mcp__context7__resolve-library-id` with "react-email", then `mcp__context7__get-library-docs` for `<Html>`, `<Head>`, `<Body>`, `<Container>`, `<Section>`, `<Img>`, `<Button>`, `<Preview>`, `<Text>`, `<Link>`, `<Hr>`, `<Font>`. SPECIFICALLY verify the `<Button>` component's `pX` and `pY` padding props — these render the VML bulletproof-button fallback (`<!--[if mso]>...<![endif]-->`) required for Outlook compatibility.
  </read_first>
  <action>
    1. `BrandLogo.tsx`: export `<BrandLogo />` using `<Img>`. Renders TWO `<Img>` tags — one for light, one for dark, toggled via inline `@media (prefers-color-scheme: dark)` CSS classes. Light src: `https://generation-ai.org/brand/logos/logo-wide-red.png`, Dark src: `https://generation-ai.org/brand/logos/logo-wide-neon.png`. Width 180, height 40 (derived proportion). Alt "Generation AI". Apply CSS class names `email-logo-light` and `email-logo-dark` — actual display toggling lives in Layout's `<Head><style>` block (see step 3).
       Rationale per CONTEXT.md §Technische Notizen: SVG is unreliable in mail clients, PNG required. PNG hosting at generation-ai.org/brand/logos/ is a manual asset upload handled by the final export task (Plan 17-05) — for now the URLs are referenced by the component.
    2. `EmailButton.tsx`: export `<EmailButton href, children>` wrapping React Email's `<Button>` component from `@react-email/components`.
       **CRITICAL — Outlook VML bulletproof-button requirement (per CONTEXT.md §Success Criteria "Bulletproof Buttons"):**
       - Use React Email's `<Button>` `pX={24}` and `pY={12}` props (numeric values, NOT a CSS `padding` string).
       - Do NOT use inline `style={{ padding: '...' }}` for button padding — that bypasses React Email's VML fallback renderer.
       - React Email's `<Button>` with `pX`/`pY` auto-generates the `<!--[if mso]>...<![endif]-->` VML markup that Outlook Desktop needs to render the button with correct padding (Outlook ignores CSS padding on `<a>` tags).
       - Example: `<Button href={href} pX={24} pY={12} style={{ backgroundColor: tokens.light.accent, color: tokens.light.textOnAccent, borderRadius: tokens.radius.full, fontFamily: tokens.fontStack.mono, fontWeight: 700, fontSize: '14px', letterSpacing: '0.02em', textDecoration: 'none' }} className="email-btn">{children}</Button>`
       - Add className `email-btn` so Layout's dark-mode CSS overrides background to `tokens.dark.accent` and color to `tokens.dark.textOnAccent`.
    3. `Layout.tsx`: export `<Layout preview, children>` using React Email components.
       - `<Html lang="de">` → `<Head>` with `<meta name="color-scheme" content="light dark">`, `<meta name="supported-color-schemes" content="light dark">`, and a raw `<style>` block containing the `@media (prefers-color-scheme: dark)` rules that override:
         * `.email-body` background → tokens.dark.bg
         * `.email-card` background → tokens.dark.bgCard, border-color → tokens.dark.border
         * `.email-heading` color → tokens.dark.text
         * `.email-text` color → tokens.dark.text
         * `.email-muted` color → tokens.dark.textMuted
         * `.email-footer` color → tokens.dark.textMuted
         * `.email-divider` border-color → tokens.dark.border
         * `.email-btn` background → tokens.dark.accent, color → tokens.dark.textOnAccent
         * `.email-logo-light` display: none !important
         * `.email-logo-dark` display: inline-block !important
       - Default (Light) inline styles outside the media query: `.email-logo-dark { display: none; }`.
       - `<Preview>{preview}</Preview>` at body start.
       - `<Body className="email-body" style={{ backgroundColor: tokens.light.bg, fontFamily: tokens.fontStack.sans, margin: 0, padding: '40px 20px' }}>`
       - `<Container className="email-card" style={{ maxWidth: '480px', backgroundColor: tokens.light.bgCard, borderRadius: tokens.radius['2xl'], border: '1px solid ' + tokens.light.border, padding: '40px 32px' }}>`
       - Header `<Section style={{ textAlign: 'center', marginBottom: '32px' }}>` with `<BrandLogo />`.
       - Content slot: `{children}`
       - `<Hr className="email-divider" style={{ margin: '32px 0', borderTop: '1px solid ' + tokens.light.border, border: 'none', borderTopWidth: '1px', borderTopStyle: 'solid' }} />`
       - Footer `<Text className="email-footer" style={{ fontSize: '12px', color: tokens.light.textMuted, textAlign: 'center', margin: 0 }}>Generation AI · Die KI-Community für Studierende</Text>` — this matches VOICE.md Utility-Signatur tone.
       - Legal line below footer: `<Text className="email-footer" style={{ fontSize: '11px', color: tokens.light.textMuted, textAlign: 'center', margin: '8px 0 0 0' }}>Du bekommst diese Mail, weil du einen Account bei Generation AI hast. Fragen? Antworte einfach auf diese Mail.</Text>`
    4. All three components export typed props (`LayoutProps`, `EmailButtonProps`, `BrandLogoProps`). All styles inline — no Tailwind, no external CSS.
  </action>
  <verify>
    <automated>pnpm -F @genai/emails exec tsc --noEmit && grep -q "prefers-color-scheme: dark" packages/emails/src/components/Layout.tsx && grep -q "pX=" packages/emails/src/components/EmailButton.tsx && grep -q "pY=" packages/emails/src/components/EmailButton.tsx && ! grep -q "padding:" packages/emails/src/components/EmailButton.tsx && grep -q "#F5133B\|tokens.light.accent" packages/emails/src/components/EmailButton.tsx && grep -q "logo-wide-red.png" packages/emails/src/components/BrandLogo.tsx && grep -q "logo-wide-neon.png" packages/emails/src/components/BrandLogo.tsx</automated>
  </verify>
  <done>
    - Layout renders Header (with Logo) + children + Hr + Footer
    - Prefers-color-scheme media query swaps bg/text/border/button/logo
    - EmailButton wraps React Email `<Button>` with `pX={24} pY={12}` props (NOT CSS `padding`) — enables VML bulletproof-button fallback for Outlook
    - EmailButton uses pill radius (9999px) and Mono font stack
    - BrandLogo references PNG URLs at generation-ai.org (to be uploaded in Plan 17-05)
    - `tsc --noEmit` passes for the package
  </done>
  <acceptance_criteria>
    - grep `@media (prefers-color-scheme: dark)` in Layout.tsx → matches
    - grep `color-scheme` and `supported-color-schemes` in Layout.tsx → both match
    - grep `logo-wide-red.png` AND `logo-wide-neon.png` in BrandLogo.tsx → both match
    - grep `borderRadius.*9999\|radius.full` in EmailButton.tsx → matches
    - grep `Generation AI · Die KI-Community` in Layout.tsx → matches
    - grep `pX=` in packages/emails/src/components/EmailButton.tsx → matches (VML-safe padding)
    - grep `pY=` in packages/emails/src/components/EmailButton.tsx → matches (VML-safe padding)
    - grep `padding:` in packages/emails/src/components/EmailButton.tsx → MUST NOT match (CSS padding bypasses VML fallback)
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
    - No SVG URL (`.svg`) referenced in BrandLogo.tsx (PNG only per CONTEXT.md §Technische Notizen)
  </acceptance_criteria>
</task>

</tasks>

<verification>
- Package builds cleanly (`tsc --noEmit` green)
- `pnpm install` from root succeeds, `@genai/emails` appears in pnpm-lock as workspace pkg
- All token values match `brand/tokens.json` exactly (no drift)
- Layout component wires BrandLogo in header and renders `{children}` between
- Media query in Layout covers: bg, card, text, muted, footer, divider, button, logo-light/dark
- EmailButton uses React Email `<Button pX pY>` for Outlook VML fallback (bulletproof button)
</verification>

<success_criteria>
- [ ] packages/emails/ workspace package exists with React Email deps
- [ ] tokens.ts exports typed light+dark token sets matching brand/tokens.json
- [ ] Layout.tsx uses `@media (prefers-color-scheme: dark)` to swap all visual tokens
- [ ] BrandLogo.tsx references PNG URLs (no SVG) for light (red) + dark (neon) logos
- [ ] EmailButton.tsx wraps React Email `<Button>` with `pX={24} pY={12}` (not CSS `padding`) — Outlook VML bulletproof-button fallback
- [ ] `pnpm -F @genai/emails exec tsc --noEmit` passes
</success_criteria>

<output>
After completion, create `.planning/phases/17-auth-extensions/17-01-SUMMARY.md`
</output>
