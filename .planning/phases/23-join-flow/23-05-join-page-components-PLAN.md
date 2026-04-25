---
phase: 23
plan: 05
slug: join-page-components
type: execute
wave: 2
depends_on:
  - 23-03
  - 23-04
files_modified:
  - apps/website/app/join/page.tsx
  - apps/website/components/join-client.tsx
  - apps/website/components/join/join-hero-section.tsx
  - apps/website/components/join/join-form-section.tsx
  - apps/website/components/join/join-form-card.tsx
  - apps/website/components/join/join-success-card.tsx
autonomous: true
requirements:
  # IMPORTANT: R4.1-R4.4 are covered AS REVISED by CONTEXT.md decisions. The
  # literal wording in REQUIREMENTS.md (multi-step wizard with progress bar,
  # Status field, Self-Select Level, Assessment-Weiche as step, Account+Circle
  # as step) was revised during /gsd-discuss-phase 23 and locked in the
  # following decisions:
  - R4.1  # covered-as-revised by D-17 (Single-Page layout, no progress bar — V1 Waitlist has no multi-step wizard)
  - R4.2  # covered-as-revised by D-18 (no Self-Select-Level, no Status field — fields limited to Email, Name, Uni-Combobox, Studiengang-optional, DSGVO, Marketing-Opt-in)
  - R4.3  # covered-as-revised by D-15 (Assessment-Weiche is a post-submit CTA in the Success-Card, not a wizard step)
  - R4.4  # covered-as-revised by D-01/D-10 (Step 3 Account+Circle deferred to Phase 25 — V1 delivers Waitlist-Submit with swappable handler interface per D-10)
  - R4.6
  - R4.7  # implemented via SessionStorage persistence in join-form-card.tsx
must_haves:
  truths:
    - "/join Route lädt mit HTTP 200 auf localhost Dev-Server"
    - "Route ist dynamic (ƒ in next build output), nicht static (○) — LEARNINGS.md CSP-Pflicht"
    - "Hero rendert mit LabeledNodes-BG + Eyebrow `// jetzt beitreten` + H1 `2 Minuten — dann bist du dabei.` + Lede + 3 Benefit-Icons (D-11, D-19, D-21)"
    - "Hero hat `min-h-[60vh]` statt `min-h-[calc(100vh-5rem)]` (D-19 — Form auf Desktop ohne Scroll angeteasert)"
    - "Form-Card rendert mit allen 6 Feldern (Email, Name, Uni-Combobox, Studiengang, DSGVO-Checkbox, Marketing-Opt-in) + Submit-Button"
    - "UniCombobox aus Plan 23-04 ist eingebunden als `university`-Feld"
    - "DSGVO-Checkbox required (D-14); Marketing-Checkbox optional default off (D-14)"
    - "Form submittet via Server-Action `submitJoinWaitlist` aus Plan 23-03"
    - "Form state survives page reload via SessionStorage hydration (R4.7)"
    - "Success-State = Inline-Swap via AnimatePresence (Form-Card raus, Success-Card rein; kein Route-Change, D-22)"
    - "Success-Card zeigt `„Danke, {firstName}! Wir melden uns, sobald wir live gehen."` + Primary-CTA `„Jetzt Level testen (2 min)"` (→ /test) + Secondary-Link `„Später im Dashboard"` (D-15, D-22)"
    - "?redirect_after=... Query-Param wird aus URL gelesen und als hidden field ins FormData durchgereicht (D-03)"
    - "Client-Wrapper mit MotionConfig nonce Prop (CSP-Pflicht LEARNINGS.md)"
    - "Server-Component nutzt await headers() (erzwingt dynamic rendering, LEARNINGS.md Regel 2)"
    - "Mobile responsive: Form-Card mx-4 sm:mx-auto max-w-lg, Touch-Targets ≥44px"
  artifacts:
    - path: "apps/website/app/join/page.tsx"
      provides: "Server-Component mit await headers() + Metadata"
      exports: ["default (JoinPage)", "metadata"]
      contains: "await headers()"
    - path: "apps/website/components/join-client.tsx"
      provides: "Client-Wrapper analog about-client.tsx mit MotionConfig nonce + Header + main + Footer"
      exports: ["JoinClient"]
      contains: "MotionConfig nonce"
    - path: "apps/website/components/join/join-hero-section.tsx"
      provides: "Hero mit LabeledNodes + Eyebrow + H1 + Lede + Benefit Row (reduziertes min-h-[60vh])"
      exports: ["JoinHeroSection"]
    - path: "apps/website/components/join/join-form-section.tsx"
      provides: "AnimatePresence Wrapper + Swap zwischen Form/Success"
      exports: ["JoinFormSection"]
    - path: "apps/website/components/join/join-form-card.tsx"
      provides: "Form mit allen Feldern + Zod-kompatibler Submit an Server-Action + SessionStorage-Persistence (R4.7)"
      exports: ["JoinFormCard"]
    - path: "apps/website/components/join/join-success-card.tsx"
      provides: "Success-Card mit Danke + Assessment-CTA + Secondary-Link"
      exports: ["JoinSuccessCard"]
  key_links:
    - from: "apps/website/app/join/page.tsx"
      to: "apps/website/components/join-client.tsx"
      via: "<JoinClient nonce={nonce} />"
      pattern: "JoinClient"
    - from: "apps/website/components/join-client.tsx"
      to: "apps/website/components/join/*"
      via: "mount hero + form section + Footer"
      pattern: "JoinHeroSection|JoinFormSection"
    - from: "apps/website/components/join/join-form-card.tsx"
      to: "apps/website/app/actions/waitlist.ts"
      via: "submitJoinWaitlist(formData)"
      pattern: "submitJoinWaitlist"
    - from: "apps/website/components/join/join-form-card.tsx"
      to: "apps/website/components/join/uni-combobox.tsx"
      via: "<UniCombobox ... />"
      pattern: "UniCombobox"
    - from: "apps/website/components/join/join-form-card.tsx"
      to: "browser sessionStorage"
      via: "window.sessionStorage.setItem('join-form-draft', ...) + hydrate in useEffect on mount"
      pattern: "sessionStorage"
    - from: "apps/website/components/join/join-form-section.tsx"
      to: "join-form-card + join-success-card"
      via: "AnimatePresence mode='wait' state swap"
      pattern: "AnimatePresence"
---

## Scope Note

**R4.1–R4.4 are intentionally covered AS REVISED.** The original REQUIREMENTS.md wording describes a multi-step wizard (progress bar, Status field, Self-Select-Level, Assessment-Weiche as a dedicated step, Step 3 Account+Circle). During `/gsd-discuss-phase 23`, Luca locked decisions that revise the shape of the delivered UI:

- **D-17** — Single-Page layout (no progress bar, no multi-step wizard). V1 is a single form + success card.
- **D-18** — Minimal field set: Email, Name, Uni-Combobox, Studiengang (optional), DSGVO-Consent, Marketing-Opt-in. NO Status field, NO Self-Select-Level, NO Motivation-Multi-Choice.
- **D-15** — Assessment-Weiche is a post-submit CTA in the Success-Card (`„Jetzt Level testen (2 min)" → /test`), not a dedicated step.
- **D-01 / D-10** — Account + Circle flow is deferred to Phase 25 (Circle-API-Sync). V1 delivers a Waitlist-Submit with a swappable handler interface; Phase 25 replaces the handler without changing the interface.

This plan therefore satisfies R4.1-R4.4 via their revised specifications. Phase 25 (`/gsd-plan-phase 25`) will extend the flow to implement the full Account + Circle trigger against the same UI.

<objective>
Die komplette /join-Page bauen: Server-Component + Client-Wrapper + Hero + Form + Success-Card. Alles DS-konform, CSP-konform, per UI-SPEC verbatim.

Purpose: Das ist das sichtbare Ergebnis. Alle anderen Plans sind Infrastruktur für dieses. Jede Copy, jedes Token, jede ARIA-Attribute kommt aus der UI-SPEC — keine freien Interpretationen.
Output: 6 neue Files, /join Route funktional end-to-end.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/23-join-flow/23-CONTEXT.md
@.planning/phases/23-join-flow/23-UI-SPEC.md
@apps/website/CLAUDE.md
@apps/website/AGENTS.md
@LEARNINGS.md
@apps/website/app/about/page.tsx
@apps/website/components/about-client.tsx
@apps/website/components/about/about-hero-section.tsx
@apps/website/components/partner/partner-contact-form.tsx
@apps/website/components/ui/labeled-nodes.tsx
@apps/website/components/layout/header.tsx
@apps/website/components/layout/footer.tsx

<interfaces>
<!-- From Plan 23-03 (Server Action) -->
```typescript
// apps/website/app/actions/waitlist.ts
export type WaitlistFieldErrors = Partial<{
  email: string
  name: string
  university: string
  study_program: string
  consent: string
}>
export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: WaitlistFieldErrors }
export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult>
```

<!-- From Plan 23-04 (UniCombobox) -->
```typescript
// apps/website/components/join/uni-combobox.tsx
export interface UniComboboxProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  required?: boolean
  disabled?: boolean
  error?: string
  labelId?: string
  describedById?: string
  placeholder?: string
}
export function UniCombobox(props: UniComboboxProps): JSX.Element
```

<!-- Existing Layout components (header/footer) from Phase 20 -->
```typescript
// apps/website/components/layout/header.tsx
export function Header(): JSX.Element // Sticky, z-50, Skip-Link, Nav, Mobile-Sheet
// apps/website/components/layout/footer.tsx
export function Footer(): JSX.Element // 4-Spalten Sitemap + Legal + Kontakt + Social
```

<!-- Blueprint: about-client.tsx structure -->
```tsx
'use client'
import { MotionConfig } from 'motion/react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export function AboutClient({ nonce }: { nonce: string }) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        {/* sections + SectionTransitions */}
      </main>
      <Footer />
    </MotionConfig>
  )
}
```
</interfaces>

<!-- Field-name reconciliation note (UI-SPEC vs plan):
     UI-SPEC line 337 labels the marketing checkbox as `name="marketing_consent"`.
     This plan (and the Zod schema in Plan 23-03, and the DB column in Plan 23-01)
     uses `name="marketing_opt_in"`. Source of truth is the plan — UI-SPEC has a
     naming typo here. The rest of the UI-SPEC styling/copy guidance for the
     marketing checkbox applies verbatim; only the `name` attribute differs. -->
</context>

<tasks>

<task type="auto">
  <name>Task 1a: Hero-Section + Form-Section wrapper (structural, display-only)</name>
  <files>
    - apps/website/components/join/join-hero-section.tsx
    - apps/website/components/join/join-form-section.tsx
  </files>
  <read_first>
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` (Hero + Form-Section sections)
    - `apps/website/components/about/about-hero-section.tsx` (Hero-Blueprint — NUR `min-h` weicht ab)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-11, D-19, D-21 (Layout + Copy)
    - `brand/VOICE.md` (falls Copy-Adjustments nötig — aber UI-SPEC Copywriting-Contract ist primary source)
  </read_first>
  <action>

**File 1: `apps/website/components/join/join-hero-section.tsx`**

Kopiere `about-hero-section.tsx` als Blueprint und passe an:
- `min-h-[calc(100vh-5rem)]` → `min-h-[60vh]` (D-19)
- Eyebrow: `// Generation AI · Über uns` → `// jetzt beitreten` (D-21)
- H1: `Warum es uns gibt.` → `2 Minuten — dann bist du dabei.` (D-11, D-21)
- KEIN H2/Claim-Paragraph (D-21: keine H2-Subline)
- Lede: aktuellen ersetzen mit `Kostenlos. Für alle Fachrichtungen. Keine Haken.` (D-21)
- Labels für LabeledNodes: thematisch `JOIN, COMMUNITY, KOSTENLOS, 2 MINUTEN, KI-SKILLS, DACH, STUDIERENDE, NETZWERK, EVENTS, TOOLS, WISSEN, FREEMIUM, BEITRETEN, TALENT, ZUKUNFT` (UI-SPEC verbatim)
- Benefit Row unter Lede: 3 Items `Kostenlos`, `Keine Verpflichtung`, `In 2 Minuten` (UI-SPEC Component 1 Benefit Row)

Benefit Row Pattern (exakt aus UI-SPEC):
```tsx
<div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6">
  {['Kostenlos', 'Keine Verpflichtung', 'In 2 Minuten'].map((label, i, arr) => (
    <React.Fragment key={label}>
      <span
        className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        style={{ textShadow: textShadowSm }}
      >
        {label}
      </span>
      {i < arr.length - 1 && (
        <span
          aria-hidden="true"
          className="h-1 w-1 rounded-full opacity-60"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </React.Fragment>
  ))}
</div>
```

Wichtig:
- `import React from 'react'` für Fragment
- Wie about-hero: `useReducedMotion()`, `<motion.div initial animate transition>`, text-shadows als Konstanten
- LabeledNodes nimmt `labels` prop als string[]

**Prüfen ob LabeledNodes `labels`-Prop akzeptiert:** Lies `apps/website/components/ui/labeled-nodes.tsx` und passe ggf. an. Falls die Component `labels` nicht prop-gesteuert sondern intern hartcoded macht: Prop hinzufügen (default = vorhandene Liste), so dass join-hero eigene Labels übergeben kann ohne globales Default zu ändern. Wenn das zu invasiv ist, Default-Labels akzeptieren und Abweichung im SUMMARY vermerken.

**File 2: `apps/website/components/join/join-form-section.tsx`**

Diese Component ist der AnimatePresence-Wrapper zwischen Form und Success. Die State-schwere Logik (sessionStorage, Submit) sitzt IN JoinFormCard (Task 1b); diese Section koordiniert nur den Swap.

```tsx
'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { JoinFormCard } from './join-form-card'
import { JoinSuccessCard } from './join-success-card'

export function JoinFormSection() {
  const prefersReducedMotion = useReducedMotion()
  const [submittedName, setSubmittedName] = useState<string | null>(null)

  return (
    <section aria-label="Beitrittsformular" data-section="join-form" className="relative py-16 px-6">
      <div className="mx-auto max-w-lg">
        <AnimatePresence mode="wait">
          {submittedName === null ? (
            <motion.div
              key="form"
              initial={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeIn' }}
            >
              <JoinFormCard onSuccess={(name) => setSubmittedName(name)} />
            </motion.div>
          ) : (
            <JoinSuccessCard key="success" name={submittedName} />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
```

Wichtig: `JoinSuccessCard` besitzt eigenes `motion.div` mit initial/animate — dadurch macht AnimatePresence den Exit-Enter-Sync sauber (Form raus → Success rein).

JoinFormCard + JoinSuccessCard werden in Task 1b erstellt. Zwischen Task 1a und 1b ist das Plan-Build deshalb temporär rot (Imports resolven noch nicht); das ist erwartet. Nach Task 1b muss `pnpm --filter @genai/website exec tsc --noEmit` grün sein.
  </action>
  <verify>
    <automated>test -f apps/website/components/join/join-hero-section.tsx && test -f apps/website/components/join/join-form-section.tsx && grep -q "min-h-\[60vh\]" apps/website/components/join/join-hero-section.tsx && grep -q "2 Minuten — dann bist du dabei" apps/website/components/join/join-hero-section.tsx && grep -q "// jetzt beitreten" apps/website/components/join/join-hero-section.tsx && grep -q "Kostenlos. Für alle Fachrichtungen" apps/website/components/join/join-hero-section.tsx && grep -q "AnimatePresence" apps/website/components/join/join-form-section.tsx</automated>
  </verify>
  <acceptance_criteria>
    - Beide Files existieren, beide mit `'use client'`
    - Hero: `min-h-[60vh]` (NICHT calc(100vh-5rem)), Eyebrow/H1/Lede/BenefitRow verbatim per D-21
    - Hero: keine H2-Subline (D-21)
    - Hero: 3 Benefit-Items mit Dot-Accents
    - FormSection: AnimatePresence mode="wait" swap
    - FormSection importiert JoinFormCard und JoinSuccessCard (diese Files werden in Task 1b erstellt)
    - tsc kann nach Task 1a temporär rot sein (missing imports) — wird in Task 1b grün
  </acceptance_criteria>
  <done>Hero + FormSection-Shell stehen; interaktive Cards folgen in Task 1b.</done>
</task>

<task type="auto">
  <name>Task 1b: Form-Card + Success-Card (interactive, state + sessionStorage)</name>
  <files>
    - apps/website/components/join/join-form-card.tsx
    - apps/website/components/join/join-success-card.tsx
  </files>
  <read_first>
    - `apps/website/components/partner/partner-contact-form.tsx` (Form-Blueprint — Input-Styling, Error-Render-Pattern, Submit-Button-Hover-Handler verbatim)
    - `apps/website/components/join/uni-combobox.tsx` (Plan 23-04 Props-Interface)
    - `apps/website/app/actions/waitlist.ts` (Plan 23-03 Server-Action + Result-Types)
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` Components 4 + 5 (Form-Card + Success-Card Copy + Styling)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-15, D-22 (Success-Copy + Assessment-CTA)
    - `.planning/REQUIREMENTS.md` R4.7 (SessionStorage-Persistence)
  </read_first>
  <action>

**File 1: `apps/website/components/join/join-form-card.tsx`**

Blueprint: `apps/website/components/partner/partner-contact-form.tsx`. Komplett kopieren und auf die /join-Felder umbauen. ZUSÄTZLICH zu den Feldern + Submit-Logik: **SessionStorage-Persistence implementieren (R4.7).**

```tsx
'use client'

import { useState, useRef, useId, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { submitJoinWaitlist, type WaitlistFieldErrors } from '@/app/actions/waitlist'
import { UniCombobox } from '@/components/join/uni-combobox'

// R4.7 — SessionStorage key + draft shape
// Draft persists while the user fills out the form, is hydrated on mount,
// and is cleared after a successful submit (onSuccess path).
const DRAFT_KEY = 'join-form-draft'

interface FormDraft {
  email: string
  name: string
  university: string
  study_program: string
  marketing_opt_in: boolean
}

const emptyDraft: FormDraft = {
  email: '',
  name: '',
  university: '',
  study_program: '',
  marketing_opt_in: false,
}

function readDraft(): FormDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormDraft>
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      name: typeof parsed.name === 'string' ? parsed.name : '',
      university: typeof parsed.university === 'string' ? parsed.university : '',
      study_program: typeof parsed.study_program === 'string' ? parsed.study_program : '',
      marketing_opt_in: typeof parsed.marketing_opt_in === 'boolean' ? parsed.marketing_opt_in : false,
    }
  } catch {
    return null
  }
}

function writeDraft(draft: FormDraft) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // ignore quota / private-mode errors — persistence is a nice-to-have
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // noop
  }
}

export interface JoinFormCardProps {
  onSuccess: (name: string) => void
}

export function JoinFormCard({ onSuccess }: JoinFormCardProps) {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const redirectAfter = searchParams.get('redirect_after') ?? ''

  // --- Controlled form state (needed for UniCombobox + sessionStorage) ---
  // We start from emptyDraft to keep SSR markup deterministic, then hydrate
  // from sessionStorage in a mount-only useEffect (avoids hydration mismatch).
  const [draft, setDraft] = useState<FormDraft>(emptyDraft)
  const [hydrated, setHydrated] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<WaitlistFieldErrors>({})

  // R4.7 — Hydrate from sessionStorage on mount (client-only, post-SSR)
  useEffect(() => {
    const stored = readDraft()
    if (stored) setDraft(stored)
    setHydrated(true)
  }, [])

  // R4.7 — Debounced write on every field change (300ms) to avoid hammering
  // sessionStorage on every keystroke. Only runs after initial hydration so
  // we don't immediately overwrite stored draft with emptyDraft.
  useEffect(() => {
    if (!hydrated) return
    const handle = setTimeout(() => writeDraft(draft), 300)
    return () => clearTimeout(handle)
  }, [draft, hydrated])

  const updateField = <K extends keyof FormDraft>(key: K, value: FormDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const validateField = (name: string, value: string): string => {
    if (name === 'email') {
      if (!value.trim()) return 'Das Feld darf nicht leer sein.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'Hmm, die Mail-Adresse passt noch nicht ganz.'
    }
    if (name === 'name' && !value.trim()) return 'Das Feld darf nicht leer sein.'
    if (name === 'university' && !value.trim()) return 'Das Feld darf nicht leer sein.'
    return ''
  }

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const err = validateField(e.target.name, e.target.value)
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: err || undefined }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)

    // Client-side pre-check required fields (server revalidates)
    const email = (formData.get('email') as string) ?? ''
    const name = (formData.get('name') as string) ?? ''
    const uni = (formData.get('university') as string) ?? ''
    const consent = formData.get('consent') === 'on' || formData.get('consent') === 'true'

    const clientErrors: WaitlistFieldErrors = {}
    const e1 = validateField('email', email); if (e1) clientErrors.email = e1
    const e2 = validateField('name', name); if (e2) clientErrors.name = e2
    const e3 = validateField('university', uni); if (e3) clientErrors.university = e3
    if (!consent) clientErrors.consent = 'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      // Focus first invalid field (UI-SPEC A11y)
      const firstErrorName = Object.keys(clientErrors)[0]
      const input = form.querySelector<HTMLElement>(`[name="${firstErrorName}"]`)
      input?.focus()
      return
    }

    setFieldErrors({})
    setServerError(null)

    startTransition(async () => {
      const result = await submitJoinWaitlist(formData)
      if (result.ok) {
        // R4.7 — clear draft on successful submit
        clearDraft()
        onSuccess(name.trim())
      } else {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        setServerError(result.error)
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[var(--border)]/60 bg-bg-card shadow-sm px-6 py-8 sm:px-8 sm:py-10 space-y-6"
      aria-label="Beitrittsformular"
    >
      {/* === Email === */}
      <div>
        <label
          htmlFor={`${formId}-email`}
          id={`${formId}-email-label`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          E-MAIL
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          disabled={isPending}
          value={draft.email}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={handleTextBlur}
          autoComplete="email"
          placeholder="deine@uni.de"
          className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
        />
        {fieldErrors.email && (
          <p id={`${formId}-email-error`} role="alert" className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* === Name === (single combined field per UI-SPEC recommendation) */}
      <div>
        <label
          htmlFor={`${formId}-name`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          VOR- UND NACHNAME
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          disabled={isPending}
          value={draft.name}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={handleTextBlur}
          autoComplete="name"
          placeholder="Dein Name"
          className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
        />
        {fieldErrors.name && (
          <p id={`${formId}-name-error`} role="alert" className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* === Uni Combobox (Plan 23-04) === */}
      <div>
        <label
          htmlFor={`${formId}-university`}
          id={`${formId}-university-label`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          HOCHSCHULE ODER AUSBILDUNG
        </label>
        <UniCombobox
          id={`${formId}-university`}
          name="university"
          value={draft.university}
          onChange={(v) => updateField('university', v)}
          onBlur={() => {
            const err = validateField('university', draft.university)
            setFieldErrors((prev) => ({ ...prev, university: err || undefined }))
          }}
          required
          disabled={isPending}
          error={fieldErrors.university}
          labelId={`${formId}-university-label`}
          describedById={fieldErrors.university ? `${formId}-university-error` : undefined}
          placeholder="Such deine Hochschule oder tipp frei"
        />
        {fieldErrors.university && (
          <p id={`${formId}-university-error`} role="alert" className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
            {fieldErrors.university}
          </p>
        )}
      </div>

      {/* === Studiengang (optional, D-13) === */}
      <div>
        <label
          htmlFor={`${formId}-study_program`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          STUDIENGANG
          <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-60">
            OPTIONAL
          </span>
        </label>
        <input
          id={`${formId}-study_program`}
          name="study_program"
          type="text"
          disabled={isPending}
          value={draft.study_program}
          onChange={(e) => updateField('study_program', e.target.value)}
          placeholder="z.B. Wirtschaftsinformatik"
          className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
        />
      </div>

      {/* === DSGVO-Consent (required, D-14) === */}
      <div>
        <label htmlFor={`${formId}-consent`} className="flex items-start gap-3 min-h-[44px] cursor-pointer">
          <input
            id={`${formId}-consent`}
            name="consent"
            type="checkbox"
            required
            disabled={isPending}
            aria-required="true"
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border border-[var(--border)] bg-bg checked:bg-[var(--accent-soft)] checked:border-[var(--border-accent)]"
          />
          <span className="text-text-secondary leading-[1.5]" style={{ fontSize: 'var(--fs-body)' }}>
            Ich habe die{' '}
            <a href="/datenschutz" target="_blank" rel="noopener" className="underline hover:no-underline" style={{ color: 'var(--accent)' }}>
              Datenschutzerklärung
            </a>{' '}
            gelesen und stimme ihr zu.
          </span>
        </label>
        {fieldErrors.consent && (
          <p role="alert" className="mt-1 text-sm" style={{ color: 'var(--status-error)' }}>
            {fieldErrors.consent}
          </p>
        )}
      </div>

      {/*
        === Marketing-Opt-in (optional default off, D-14) ===
        NOTE: Form field name is `marketing_opt_in` (matches Zod schema in
        Plan 23-03 + DB column in Plan 23-01). UI-SPEC line 337 contains a
        typo (`marketing_consent`) — follow the plan for the `name`
        attribute. The UI-SPEC styling + label copy applies verbatim.
        Checkbox state is tracked in `draft.marketing_opt_in` so that
        SessionStorage hydration restores it on reload (R4.7).
      */}
      <div>
        <label htmlFor={`${formId}-marketing`} className="flex items-start gap-3 min-h-[44px] cursor-pointer">
          <input
            id={`${formId}-marketing`}
            name="marketing_opt_in"
            type="checkbox"
            disabled={isPending}
            checked={draft.marketing_opt_in}
            onChange={(e) => updateField('marketing_opt_in', e.target.checked)}
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border border-[var(--border)] bg-bg checked:bg-[var(--accent-soft)] checked:border-[var(--border-accent)]"
          />
          <span className="text-text-secondary leading-[1.5]" style={{ fontSize: 'var(--fs-body)' }}>
            Ich möchte über Events und Neuigkeiten per E-Mail informiert werden.
          </span>
        </label>
      </div>

      {/* === Honeypot === */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" className="sr-only" autoComplete="off" />

      {/* === redirect_after passthrough === */}
      {redirectAfter && <input type="hidden" name="redirect_after" value={redirectAfter} />}

      {/* === Server error banner === */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)', background: 'rgba(220, 38, 38, 0.08)' }}
        >
          {serverError}
        </div>
      )}

      {/* === Submit === */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full px-6 py-3 font-mono font-bold text-[14px] tracking-[0.02em] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', minHeight: '44px' }}
        onMouseEnter={(e) => {
          if (!isPending) {
            e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'
            e.currentTarget.style.transform = 'scale(1.03)'
          }
        }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span>Einen Moment…</span>
            <span className="sr-only">Formular wird gesendet</span>
          </span>
        ) : (
          'Kostenlos beitreten'
        )}
      </button>
    </form>
  )
}
```

**Wichtige Punkte zur SessionStorage-Logik (R4.7):**
- `readDraft()` / `writeDraft()` / `clearDraft()` sind SSR-safe (`typeof window === 'undefined'` guard).
- Hydration passiert in einem Mount-only `useEffect` — KEIN direkter Read im `useState`-Initializer, weil das die SSR-HTML-Struktur vom Client-HTML abweichen liesse (Next.js hydration mismatch).
- `hydrated`-Flag verhindert, dass der Debounced-Write den Storage direkt nach Mount mit `emptyDraft` überschreibt.
- Debounce = 300ms — vermeidet per-keystroke sessionStorage-Writes.
- `clearDraft()` in `onSuccess`-Pfad — nach erfolgreichem Submit ist der Draft obsolet.
- `try/catch` um alle sessionStorage-Calls — Quota-Errors (Safari Private Mode) dürfen den Flow nicht brechen.

**File 2: `apps/website/components/join/join-success-card.tsx`**

Per UI-SPEC "5. JoinSuccessCard". Key points:
- `<div role="status" aria-live="polite">` als Container
- `<h2>` mit `tabIndex={-1}` — `useEffect` focused es on mount (UI-SPEC A11y Focus Management)
- Headline: `Danke, {name}! Wir melden uns, sobald wir live gehen.` (first word of name via `name.trim().split(/\s+/)[0]`)
- Body: `Du stehst auf der Warteliste. Schau schon mal in deinen Posteingang — wir haben dir eine kurze Bestätigung geschickt.`
- Primary-CTA `<a href="/test">` — label `Jetzt Level testen (2 min)` — same button styling als Submit + ArrowRight-Icon aus lucide
- Secondary-Link `<a href="#">` — label `Später im Dashboard` — font-mono micro style

Motion specs aus UI-SPEC "Form-to-Success Swap":
```tsx
<motion.div
  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
  className="rounded-2xl border border-[var(--border)]/60 bg-bg-card shadow-sm px-6 py-8 sm:px-8 sm:py-10"
  role="status"
  aria-live="polite"
>
  ...
</motion.div>
```

Signature:
```tsx
'use client'
export interface JoinSuccessCardProps { name: string }
export function JoinSuccessCard({ name }: JoinSuccessCardProps) { ... }
```
  </action>
  <verify>
    <automated>test -f apps/website/components/join/join-form-card.tsx && test -f apps/website/components/join/join-success-card.tsx && grep -q "submitJoinWaitlist" apps/website/components/join/join-form-card.tsx && grep -q "UniCombobox" apps/website/components/join/join-form-card.tsx && grep -q "redirect_after" apps/website/components/join/join-form-card.tsx && grep -q "Datenschutzerklärung" apps/website/components/join/join-form-card.tsx && grep -q "sessionStorage" apps/website/components/join/join-form-card.tsx && grep -q "join-form-draft" apps/website/components/join/join-form-card.tsx && grep -q "clearDraft" apps/website/components/join/join-form-card.tsx && grep -q "Jetzt Level testen" apps/website/components/join/join-success-card.tsx && grep -q 'href="/test"' apps/website/components/join/join-success-card.tsx && grep -q "Später im Dashboard" apps/website/components/join/join-success-card.tsx && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - Beide Files existieren, beide mit `'use client'`
    - Form-Card: 6 Felder + Honeypot + redirect_after hidden
    - Form: DSGVO-Checkbox `required`, Marketing-Checkbox nicht required (default off)
    - Form: Marketing-Feld heisst `name="marketing_opt_in"` (NICHT `marketing_consent`) — matches Plan 23-03 Zod-Schema + Plan 23-01 DB-Column
    - Form: UniCombobox eingebunden
    - Form: Controlled state via `draft`-useState mit `updateField`
    - Form: `useEffect` für Hydration aus sessionStorage (mount-only, nach SSR)
    - Form: Debounced (300ms) Write auf sessionStorage bei jeder Änderung
    - Form: `clearDraft()` im onSuccess-Pfad
    - Form: SessionStorage-Key `'join-form-draft'`
    - Form: Alle sessionStorage-Calls in try/catch + typeof window Guards
    - Form: Client-side validation via handleTextBlur + pre-submit check
    - Form: Server-Error-Banner + fieldErrors aus WaitlistResult
    - Success-Card: `name.trim().split(/\s+/)[0]` für firstName
    - Success-Card: `<a href="/test">` primary + `Jetzt Level testen (2 min)` label
    - Success-Card: Secondary-Link `Später im Dashboard`
    - Success-Card: `<h2 tabIndex={-1}>` + useEffect focused
    - tsc clean (NACH Task 1a + 1b zusammen)
  </acceptance_criteria>
  <done>Form-Card + Success-Card kompilieren, SessionStorage-Persistence aktiv, R4.7 erfüllt.</done>
</task>

<task type="auto">
  <name>Task 2: Client-Wrapper + Server-Component Page</name>
  <files>
    - apps/website/components/join-client.tsx
    - apps/website/app/join/page.tsx
  </files>
  <read_first>
    - `apps/website/components/about-client.tsx` (Blueprint — MotionConfig nonce + Header/main/Footer)
    - `apps/website/app/about/page.tsx` (Blueprint — await headers() + Metadata export)
    - `LEARNINGS.md` (CSP-Rules: nonce on request, force-dynamic, await headers() erzwingt dynamic rendering)
    - `apps/website/AGENTS.md` (Unterseiten-Blueprint)
  </read_first>
  <action>

**File 1: `apps/website/components/join-client.tsx`**

```tsx
'use client'

// Client-Wrapper für /join (Phase 23). Pattern analog zu about-client.tsx:
//   - MotionConfig mit nonce für CSP-konforme motion/react styles (LEARNINGS.md)
//   - Header + <main> mit pt-20 (fixer Header überlagert sonst Content)
//   - Hero + Form-Section direkt hintereinander — KEIN <SectionTransition>
//     (UI-SPEC Layout Contract: D-19 Form soll auf Desktop ohne Scroll
//     angeteasert sein; eine Section-Transition würde die Form unter den Fold
//     schieben und widerspricht dem Kern-Requirement)
//   - Kein <SectionTransition> zwischen Form und Footer — Form schliesst als
//     finaler CTA-Cluster visuell selbst ab (AGENTS.md Ausnahme-Regel)

import { MotionConfig } from 'motion/react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { JoinHeroSection } from '@/components/join/join-hero-section'
import { JoinFormSection } from '@/components/join/join-form-section'

export interface JoinClientProps {
  nonce: string
}

export function JoinClient({ nonce }: JoinClientProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <JoinHeroSection />
        <JoinFormSection />
      </main>
      <Footer />
    </MotionConfig>
  )
}
```

**File 2: `apps/website/app/join/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'

import { JoinClient } from '@/components/join-client'

// Route `/join` — Top-Conversion-Endpoint (Phase 23 V1 Waitlist).
//
// Server Component. `await headers()` liest x-nonce (aus proxy.ts) und erzwingt
// implizit dynamic rendering (LEARNINGS.md Regel 2: CSP-mit-Nonce braucht
// dynamic rendering, sonst frisst strict-dynamic alle Scripts).
//
// Keine `export const dynamic = "force-dynamic"` nötig — `await headers()`
// reicht. Das Root-Layout hat zusätzlich `export const dynamic = "force-dynamic"`
// (LEARNINGS.md CSP-Incident-Fix), also doppelt abgesichert.
//
// Suspense wrapper: JoinFormCard nutzt useSearchParams() — Next.js 16 erzwingt
// Suspense-Boundary um Client-Components mit useSearchParams().

export const metadata: Metadata = {
  title: {
    absolute: 'Jetzt beitreten · Generation AI',
  },
  description:
    'Kostenlos Mitglied werden. Für Studierende im DACH-Raum, die KI ernst nehmen. In 2 Minuten dabei.',
  openGraph: {
    title: 'Jetzt beitreten · Generation AI',
    description:
      'Kostenlos Mitglied werden. Für Studierende im DACH-Raum, die KI ernst nehmen. In 2 Minuten dabei.',
    url: 'https://generation-ai.org/join',
  },
  twitter: {
    title: 'Jetzt beitreten · Generation AI',
    description:
      'Kostenlos Mitglied werden. Für Studierende im DACH-Raum, die KI ernst nehmen. In 2 Minuten dabei.',
  },
  alternates: {
    canonical: 'https://generation-ai.org/join',
  },
}

export default async function JoinPage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <Suspense fallback={null}>
      <JoinClient nonce={nonce} />
    </Suspense>
  )
}
```

Suspense-Wrapper ist notwendig, weil `JoinFormCard` (via `useSearchParams()`) sonst den CSR-Fallback erzwingen würde — Next.js 16 macht das zum Build-Error. `Suspense` ist der saubere Weg.

WICHTIG: Headerschema muss zu about-page.tsx passen. KEINE neuen CSP-Regeln, KEIN Ändern von proxy.ts.
  </action>
  <verify>
    <automated>test -f apps/website/components/join-client.tsx && test -f apps/website/app/join/page.tsx && grep -q "'use client'" apps/website/components/join-client.tsx && grep -q "MotionConfig nonce" apps/website/components/join-client.tsx && grep -q "await headers()" apps/website/app/join/page.tsx && grep -q "Jetzt beitreten · Generation AI" apps/website/app/join/page.tsx && grep -q "Suspense" apps/website/app/join/page.tsx && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -10 && pnpm --filter @genai/website build 2>&1 | tail -30</automated>
  </verify>
  <acceptance_criteria>
    - `join-client.tsx` hat `'use client'`, MotionConfig nonce, Header, main#main-content, Footer
    - `join-client.tsx` mounted `JoinHeroSection` + `JoinFormSection` direkt hintereinander (keine SectionTransition)
    - `app/join/page.tsx` default-export async function mit `await headers()`
    - Metadata-Export mit korrektem title/description/OG/canonical
    - `<Suspense>` umgibt JoinClient
    - `pnpm --filter @genai/website build` grün
    - Build-Output zeigt `/join` als `ƒ` (dynamic), NICHT `○` (static) — LEARNINGS.md Regel 3
  </acceptance_criteria>
  <done>/join ist live auf localhost:3000/join via `pnpm dev:website`.</done>
</task>

<task type="auto">
  <name>Task 3: Lokaler Prod-Check (CSP + Content + Console)</name>
  <files>(kein Repo-Diff, nur Verification)</files>
  <read_first>
    - `LEARNINGS.md` (Regel 4: "Lokaler Prod-Check ist Pflicht: pnpm build && NODE_ENV=production pnpm start, dann Console auf CSP-Errors prüfen")
  </read_first>
  <action>
Starte lokal einen Production-Build und verifiziere /join:

```bash
pnpm --filter @genai/website build
cd apps/website && NODE_ENV=production pnpm start &
# wait for server up
sleep 4
# Smoke-Test: /join lädt ohne 500er
curl -sSf -o /tmp/join.html -w "%{http_code}" http://localhost:3000/join
# Expect: 200, and /tmp/join.html contains "2 Minuten — dann bist du dabei." (H1 copy)
grep -c "2 Minuten" /tmp/join.html
# Expect: >= 1
```

Wenn möglich auch:
- Playwright-Chrome headless gegen `http://localhost:3000/join` laufen lassen und auf Console-Errors prüfen (darf KEINE CSP-Violations geben)
- Alternativ: `claude-in-chrome`-MCP nutzen um via Chrome-Extension die Page zu öffnen + Console zu screenshotten

Falls Console-Violations auftauchen (nonce fehlt, script-src blocked):
1. `next build` Output auf `ƒ /join` prüfen (muss dynamic sein)
2. `headers()`-Call in `page.tsx` verifizieren
3. `MotionConfig nonce={nonce}` verifizieren
4. NICHT proxy.ts oder lib/csp.ts anfassen — stattdessen Root-Cause im page.tsx / join-client.tsx finden

Danach Server sauber killen.
  </action>
  <verify>
    <automated>pnpm --filter @genai/website build 2>&1 | grep -E "^ƒ /join|^○ /join" | head -5</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm --filter @genai/website build` grün
    - Build-Output zeigt `ƒ /join` (dynamic) — NICHT `○ /join`
    - curl auf `http://localhost:3000/join` gibt HTTP 200
    - HTML enthält H1-Text "2 Minuten — dann bist du dabei."
    - Keine CSP-Violations in Browser-Console (wenn Playwright/Chrome-MCP verfügbar)
  </acceptance_criteria>
  <done>Prod-Check sign-off — /join ist CSP-safe und inhaltlich rendert korrekt.</done>
</task>

</tasks>

<verification>
- 6 neue Files committed
- /join build grün + dynamic
- CSP intakt
- Form funktional (manuelles Testen: Submit mit valid/invalid inputs, Success-Swap, Combobox Keyboard-Nav)
- Mobile responsive (Form-Card mx-4 sm:mx-auto, min-h-[44px] touch targets)
- R4.7 SessionStorage-Persistence: Reload mid-fill → Felder bleiben gefüllt
</verification>

<success_criteria>
- User kann auf /join gehen, Form ausfüllen, submitten, Success-Card sehen
- Invalid-Submit zeigt fieldErrors inline
- Rate-Limit-Hit zeigt Banner "Zu viele Versuche"
- `?redirect_after=/events/foo` wird als hidden input durchgereicht und im DB-Insert gespeichert
- Reload mid-fill behält Email/Name/Uni/Studiengang/Marketing-Checkbox (SessionStorage, R4.7)
- Nach erfolgreichem Submit ist der Draft gecleart (neue Session startet frisch)
- Assessment-CTA verlinkt auf `/test` (aktuell 404/placeholder — Phase 24 baut die Seite)
</success_criteria>

<output>
Create `.planning/phases/23-join-flow/23-05-SUMMARY.md` with:
- 6 file paths
- Build-output snippet (`ƒ /join` line)
- CSP-Check-Status
- Screenshot-Pfad (wenn mit Playwright/Chrome screengeshotted)
- SessionStorage-Keys + Testing-Notes (R4.7 coverage)
- Offene Fragen für Plan 23-06 (E2E-Tests)
</output>
