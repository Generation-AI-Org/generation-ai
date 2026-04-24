---
phase: 25
plan: C
slug: confirm-email-template
type: execute
wave: 2
depends_on:
  - 25-A
files_modified:
  - packages/emails/src/templates/confirm-signup.tsx
  - packages/emails/src/index.ts
  - apps/website/emails/dist/confirm-signup.html
  - docs/CIRCLE-INTEGRATION.md
autonomous: true
requirements:
  - R6.1
  - R6.2
must_haves:
  truths:
    - "Bestehender Template `packages/emails/src/templates/confirm-signup.tsx` (aus Phase 17) wird so überarbeitet, dass er D-04 Single-CTA-Flow implementiert."
    - "Single CTA-Button `Loslegen →` (oder vergleichbar mit VOICE.md) zeigt auf `{{ .ConfirmationURL }}` — nach Confirm redirected die Route (Plan D) zu Circle-SSO."
    - "KEIN zweiter CTA 'Zur Community direkt' — D-04 verbietet Doppel-CTA (Klarheit > Flexibilität)."
    - "Supabase-Template-Variablen bleiben embedded als default props (`name = '{{ .Data.full_name }}'`, `confirmationUrl = '{{ .ConfirmationURL }}'`) damit `render(ConfirmSignupEmail())` HTML mit Go-Template-Syntax für Supabase-Dashboard-Import produziert."
    - "Template nutzt weiter `Layout`, `EmailButton`, `tokens`, `fontStack` aus `@genai/emails` (keine Inline-Magic-Numbers)."
    - "VOICE.md-konform: deutsch, locker, \"du\", keine Business-Sprache, Umlaute echt (ö/ä/ü/ß)."
    - "Der dazugehörige HTML-Export `apps/website/emails/dist/confirm-signup.html` ist re-generiert via `pnpm --filter @genai/emails email:export` + manuell in Supabase-Dashboard → Auth → Email Templates → Confirm signup eingespielt (HUMAN-UAT-Item in Plan I)."
    - "Preview-Text (`preview=\"...\"`) Match zum Body (\"Bestätige deine Mail, dann bist du drin.\" o.ä.)."
    - "`docs/CIRCLE-INTEGRATION.md` dokumentiert wie der Template in Supabase zu importieren ist (manueller Schritt — Supabase-Dashboard-Seed-Automation ist out-of-scope)."
    - "Old Template wird im Git-History erhalten für Rollback — Plan überschreibt, committet atomar."
  artifacts:
    - path: "packages/emails/src/templates/confirm-signup.tsx"
      provides: "Unified-Signup Confirm-Mail mit Single-CTA (D-04)"
      exports: ["default (ConfirmSignupEmail)", "ConfirmSignupEmailProps"]
    - path: "apps/website/emails/dist/confirm-signup.html"
      provides: "Für Supabase-Dashboard import (mit Go-Template-Vars)"
      exports: []
  key_links:
    - from: "apps/website/app/actions/signup.ts (Plan E)"
      to: "Supabase `/auth/v1/signup` trigger-Mail-Flow"
      via: "Supabase sendet den Template automatisch beim signUp call"
      pattern: "supabase\\.auth\\.signUp|admin\\.createUser"
---

<objective>
Den in Phase 17 erstellten `confirm-signup.tsx` von "bitte bestätige deine Mail" zu Unified-Signup-Single-CTA upgraden. Kein neuer Template — bestehenden behutsam erweitern.

Purpose: D-04 umsetzen (ein Link, eine Action). Der User klickt nicht "bestätigen" + "zur Community" nacheinander, sondern einen Button `Loslegen →` der durch Plan-D-Route direkt in Circle landet.
Output: Updated Template + re-generated HTML + Supabase-Dashboard-Import-Doku.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@packages/emails/src/templates/confirm-signup.tsx
@packages/emails/src/templates/waitlist-confirmation.tsx
@packages/emails/src/index.ts
@packages/emails/src/components/Layout.tsx
@packages/emails/src/components/EmailButton.tsx
@brand/VOICE.md

<interfaces>
```typescript
// packages/emails/src/templates/confirm-signup.tsx (updated)

export interface ConfirmSignupEmailProps {
  name?: string
  confirmationUrl?: string
}

// Defaults stay as Supabase Go-Template vars so exported HTML works in Supabase Dashboard
export default function ConfirmSignupEmail({
  name = '{{ .Data.full_name }}',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: ConfirmSignupEmailProps): React.ReactElement
```

**Kein API-Change** zu Phase 17 — `confirmationUrl` geht weiter auf `/auth/confirm?token=...&type=signup`, nur der Content des Mails wird angepasst.

**Neue Semantik:** Plan D (Confirm-Route) weiss dass nach `verifyOtp` die User-Metadata `circle_member_id` hat und redirected zu Circle-SSO. Der Template selbst ändert die CTA-Destination NICHT — dieselbe Confirm-URL wie vorher.
</interfaces>

<environment_notes>
- Templates leben in `packages/emails/src/templates/`, der HTML-Export für Supabase geht in `apps/website/emails/dist/` via Script `pnpm --filter @genai/emails email:export`.
- Supabase-Dashboard → Auth → Email Templates ist **manueller Upload**. Der Executor kann nicht automatisch Supabase-Templates setzen (würde Supabase-Management-API erfordern, nicht in Scope). Deshalb: HTML-Export + Dokumentation in CIRCLE-INTEGRATION.md + HUMAN-UAT-Item in Plan I.
- Go-Template-Vars `{{ .ConfirmationURL }}`, `{{ .Data.full_name }}` müssen im finalen HTML stehen bleiben. Das Trick ist: Default-Props sind die Go-Var-Strings, so dass `render(Component())` ohne Props-Override genau diese Strings im HTML hat.
- VOICE.md Kurz-Regeln: "du" + deutsch + echte Umlaute + keine Business-Phrasen ("Wir bedauern" / "Sehr geehrter"). Typische Generation-AI-Ton-Beispiele: "Willkommen", "Loslegen", "Hey", "du bist drin".
</environment_notes>
</context>

<threat_model>
**Asset:** Confirm-Mail-Content (User sieht Email-Adresse + Klick führt in authenticated Session).

**Threats (ASVS L1):**

1. **Phishing-Template-Clone.**
   - Mitigation: Template nutzt nur HTTPS-Links auf `generation-ai.org` + `community.generation-ai.org`. Kein dynamischer Content aus User-Input wird in die Mail injected (nur `name` aus User-Metadata, das wurde im Signup-Flow von User selbst angegeben).

2. **Open-Redirect via `{{ .ConfirmationURL }}`.**
   - Mitigation: Supabase generiert die ConfirmationURL mit signierter Token-Query. Die Redirect-Ziel-Validierung passiert in Plan D (Confirm-Route) — Template selbst kann nur Supabase-kontrollierte URLs enthalten.

3. **XSS im Template via name-Prop.**
   - Mitigation: React-Email escaped content by default. `name` kommt aus `{{ .Data.full_name }}` (Supabase escape). Wir rendern nie `dangerouslySetInnerHTML`.

**Block on:** BLOCKER (HTTPS-only, kein `dangerouslySetInnerHTML`).
**Residual:** Phisher können den Template visuell nachbauen — Schutz ist organisatorisch (DMARC + SPF + DKIM, Phase-17-out-of-scope).
</threat_model>

<tasks>

<task type="auto">
  <name>Task C1: Template-Update für Single-CTA-Flow (D-04)</name>
  <files>packages/emails/src/templates/confirm-signup.tsx</files>
  <read_first>
    - `packages/emails/src/templates/confirm-signup.tsx` (**vollständig lesen** — bestehenden Layout-Aufbau nicht zerstören, nur Body-Copy + CTA-Text ändern)
    - `packages/emails/src/templates/waitlist-confirmation.tsx` (Referenz: wie EmailButton genutzt wird)
    - `brand/VOICE.md` (Ton: du, locker, Umlaute)
  </read_first>
  <action>
Den bestehenden `confirm-signup.tsx` so anpassen, dass:

1. **Preview-Text** matcht neuen Content: `preview="Bestätige kurz deine Mail — dann bist du drin."`
2. **Heading** bleibt `Hey {name} 👋`
3. **Intro-Text** kürzer + neuer Spin:
   - "Schön, dass du dabei bist!" → "Kurz bestätigen — dann geht's los."
4. **Single CTA-Button** via `EmailButton` komponente:
   - Label: `Loslegen →`
   - Href: `{confirmationUrl}`
   - Primary-Style (use existing tokens/variant from `EmailButton`)
5. **Subtext unter Button** erklärt den One-Shot-Flow:
   - "Der Link bringt dich direkt in die Community. Gültig 7 Tage."
6. **Kein zweiter CTA** zu `CIRCLE_COMMUNITY_URL` (D-04 verbietet Doppel-CTA).
7. **Footer-Disclaimer** behalten wie bisher, falls vorhanden (Adresse, Impressum-Link etc.).

Der Kern des finalen Templates sieht so aus (innerhalb von `<Layout>`):

```tsx
<Layout preview="Bestätige kurz deine Mail — dann bist du drin.">
  <Heading style={{ ...existing heading style... }}>
    Hey {name} 👋
  </Heading>

  <Text style={{ ...existing text style... }}>
    Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum.
  </Text>

  <Text style={{ ...existing text style, margin: '0 0 32px 0' }}>
    Kurz deine Mail bestätigen — dann geht's los.
  </Text>

  <Section style={{ textAlign: 'center', margin: '32px 0' }}>
    <EmailButton href={confirmationUrl} variant="primary">
      Loslegen →
    </EmailButton>
  </Section>

  <Text style={{ ...existing muted-text style, fontSize: '14px' }}>
    Der Link bringt dich direkt in die Community. Gültig 7 Tage.
  </Text>

  {/* keep existing footer content unchanged */}
</Layout>
```

**Nicht ändern:**
- Default-Props `name = '{{ .Data.full_name }}'`, `confirmationUrl = '{{ .ConfirmationURL }}'` — Supabase-Dashboard-Import braucht Go-Template-Vars.
- Layout-Wrapper, Font-Stack, Tokens — bleiben wie Phase 17.
- Export: `export default function ConfirmSignupEmail(props): React.ReactElement`.

**VOICE-Check:**
- Keine "Sehr geehrter", "Wir bedauern", "Bitte klicken Sie".
- Echte Umlaute: ö/ä/ü/ß (nicht oe/ae/ue/ss).
- Tempo: 2-3 kurze Sätze, ein Button.

Wenn der bestehende Template irgendwo "Bestätigen" als CTA-Label nutzt, **überschreiben mit "Loslegen →"** (D-04 Content-Pass).
  </action>
  <verify>
    <automated>test -f packages/emails/src/templates/confirm-signup.tsx && grep -q "Loslegen" packages/emails/src/templates/confirm-signup.tsx && grep -q "'{{ .ConfirmationURL }}'" packages/emails/src/templates/confirm-signup.tsx && grep -q "'{{ .Data.full_name }}'" packages/emails/src/templates/confirm-signup.tsx && ! grep -q "Zur Community" packages/emails/src/templates/confirm-signup.tsx && ! grep -qi "bitte klicken sie" packages/emails/src/templates/confirm-signup.tsx && pnpm --filter @genai/emails exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Template exportiert weiter `default ConfirmSignupEmail` + `ConfirmSignupEmailProps`
    - Enthält string `Loslegen` (Single-CTA, D-04)
    - Enthält string `{{ .ConfirmationURL }}` als Default-Prop (Supabase-Go-Var)
    - Enthält string `{{ .Data.full_name }}` als Default-Prop
    - Enthält NICHT `Zur Community` als separaten zweiten CTA-Text (Violation D-04)
    - Enthält NICHT `Bitte klicken Sie` (VOICE-Violation)
    - `tsc --noEmit` clean
  </acceptance_criteria>
  <done>Template updated, TypeScript clean.</done>
</task>

<task type="auto">
  <name>Task C2: HTML-Export regenerieren</name>
  <files>apps/website/emails/dist/confirm-signup.html</files>
  <read_first>
    - `packages/emails/scripts/export.ts` (falls vorhanden — verstehen welches Script der `email:export`-Task ausführt)
    - Bestehendes `apps/website/emails/dist/confirm-signup.html` (Vergleich Before/After)
  </read_first>
  <action>
`pnpm --filter @genai/emails email:export` ausführen. Das Script re-rendert alle Templates in `packages/emails/src/templates/*.tsx` nach `apps/website/emails/dist/*.html`.

**Manuelles Review des HTML-Outputs:**
1. `grep -q "Loslegen" apps/website/emails/dist/confirm-signup.html` → muss matchen
2. `grep -q "{{ .ConfirmationURL }}" apps/website/emails/dist/confirm-signup.html` → muss matchen (Go-Template-Var intakt)
3. `grep -q "{{ .Data.full_name }}" apps/website/emails/dist/confirm-signup.html` → muss matchen
4. Kein `[object Object]` oder `NaN` im Output (Render-Error-Indikatoren).

Wenn das Script fehlt (unwahrscheinlich, Phase 17 hat es sicher), kann auch `npx react-email export --dir ./src/templates --out ../../apps/website/emails/dist` von `packages/emails/` aus genutzt werden.

**Kein Commit des HTML-Files ohne parallel den Template-Source committed zu haben** — sonst Git-Drift.
  </action>
  <verify>
    <automated>test -f apps/website/emails/dist/confirm-signup.html && grep -q "Loslegen" apps/website/emails/dist/confirm-signup.html && grep -q "{{ .ConfirmationURL }}" apps/website/emails/dist/confirm-signup.html && grep -q "{{ .Data.full_name }}" apps/website/emails/dist/confirm-signup.html && ! grep -q "\\[object Object\\]" apps/website/emails/dist/confirm-signup.html</automated>
  </verify>
  <acceptance_criteria>
    - HTML-File existiert + ist neuer-als-oder-gleich-alt wie Template (`stat -c %Y` Check)
    - Enthält `Loslegen` + Go-Template-Vars intakt
    - Kein Render-Error im Output
  </acceptance_criteria>
  <done>Dashboard-ready HTML erzeugt.</done>
</task>

<task type="auto">
  <name>Task C3: Supabase-Dashboard-Import-Doku in CIRCLE-INTEGRATION.md</name>
  <files>docs/CIRCLE-INTEGRATION.md</files>
  <read_first>
    - `docs/DEPLOYMENT.md` (Struktur matchen)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` D-04 + Scope Punkt 3 (Email-Template-Update)
  </read_first>
  <action>
Wenn `docs/CIRCLE-INTEGRATION.md` noch nicht existiert, Datei mit Top-Level-Heading erstellen:

```markdown
# Circle-Integration (Phase 25)

> Wie unified signup funktioniert + Setup + Troubleshooting.

## Architektur-Überblick

[wird in Plan I mit Content gefüllt — hier platzhalten, NICHT löschen wenn bereits geschrieben]

## Email-Templates in Supabase-Dashboard einspielen

**Wann:** Nach jedem `pnpm --filter @genai/emails email:export` Run, oder wenn `packages/emails/src/templates/confirm-signup.tsx` geändert wurde.

**Schritte:**

1. Supabase-Dashboard öffnen → Project `wbohulnuwqrhystaamjc` → Authentication → Email Templates.
2. Template "Confirm signup" auswählen.
3. Inhalt aus `apps/website/emails/dist/confirm-signup.html` kopieren und in den Editor einfügen.
4. **Subject** setzen: `Willkommen bei Generation AI 👋`
5. **Speichern** (oben rechts).
6. Test-Mail an Luca's Email senden via "Send test email" Button → visuell prüfen.

**Supabase-Go-Template-Vars (NICHT manuell ersetzen — Supabase injected live):**
- `{{ .ConfirmationURL }}` → der Confirm-Link inkl. Token
- `{{ .Data.full_name }}` → Name aus `raw_user_meta_data.full_name` (wird in Plan E gesetzt)
- `{{ .Email }}` → User-Email

**Rollback:** Wenn neue Version kaputt ist, Git-History von `packages/emails/src/templates/confirm-signup.tsx` nutzen, `email:export` re-runnen, alte HTML ins Dashboard einfügen.

**Automation-Roadmap:** Supabase-Management-API könnte die Templates automatisiert setzen (post-v4.0), aktuell manueller Schritt.
```

Falls die Datei schon existiert aber keine Email-Sektion hat: nur den neuen Abschnitt `## Email-Templates in Supabase-Dashboard einspielen` ergänzen, bestehenden Content nicht überschreiben.
  </action>
  <verify>
    <automated>test -f docs/CIRCLE-INTEGRATION.md && grep -q "Email-Templates in Supabase-Dashboard einspielen" docs/CIRCLE-INTEGRATION.md && grep -q "email:export" docs/CIRCLE-INTEGRATION.md && grep -q "{{ .ConfirmationURL }}" docs/CIRCLE-INTEGRATION.md</automated>
  </verify>
  <acceptance_criteria>
    - `docs/CIRCLE-INTEGRATION.md` existiert
    - Enthält Abschnitt zu Template-Import in Supabase
    - Nennt `pnpm --filter @genai/emails email:export` als Export-Command
    - Erklärt Go-Template-Vars
    - Mentioniert Rollback-Pfad via Git
  </acceptance_criteria>
  <done>Luca (oder jeder Dev) weiss wie Template-Updates ins Dashboard kommen.</done>
</task>

</tasks>

<verification>
**Automated:**
- `pnpm --filter @genai/emails exec tsc --noEmit` — clean
- Grep-Gates in Tasks oben (Loslegen / Go-Vars / kein Doppel-CTA)

**HUMAN-UAT (verschoben nach Plan I):**
- Template in Supabase-Dashboard einspielen
- Test-Mail an Luca's Email → visuelles Review: Button-Kontrast, Umlaut-Rendering, Mobile-Responsive
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
