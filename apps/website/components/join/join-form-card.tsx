'use client'

import { useState, useRef, useId, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  submitJoinWaitlist,
  type WaitlistFieldErrors,
} from '@/app/actions/waitlist'
import { UniCombobox } from '@/components/join/uni-combobox'
import { readStoredAssessmentResult } from '@/lib/assessment/storage'
import type { Level, LevelSlug } from '@/lib/assessment/types'
import { OTHER_UNIVERSITY, UNIVERSITIES } from '@/lib/universities'

// ---------------------------------------------------------------------------
// R4.7 — SessionStorage draft persistence
// ---------------------------------------------------------------------------

const DRAFT_KEY = 'join-form-draft'

type ApplicantStatus = 'student' | 'early_career' | 'other'
type LegacyApplicantStatus = ApplicantStatus | 'working' | 'alumni'

interface FormDraft {
  email: string
  first_name: string
  last_name: string
  birth_year: string
  status: ApplicantStatus
  university: string
  university_other: string
  study_field: string
  study_field_other: string
  highest_degree: string
  career_field: string
  context: string
  marketing_opt_in: boolean
}

const emptyDraft: FormDraft = {
  email: '',
  first_name: '',
  last_name: '',
  birth_year: '',
  status: 'student',
  university: '',
  university_other: '',
  study_field: '',
  study_field_other: '',
  highest_degree: '',
  career_field: '',
  context: '',
  marketing_opt_in: false,
}

const statusOptions: Array<{
  value: ApplicantStatus
  label: string
  helper: string
}> = [
  {
    value: 'student',
    label: 'Studierend',
    helper: 'Ich studiere aktuell.',
  },
  {
    value: 'early_career',
    label: 'Early Career',
    helper: 'Ich bin im Berufseinstieg.',
  },
  {
    value: 'other',
    label: 'Sonstiges',
    helper: 'Ich passe anders rein.',
  },
]

const studyFieldOptions = [
  'BWL / Wirtschaft',
  'Informatik',
  'Medien / Kommunikation',
  'Ingenieurwissenschaften',
  'Naturwissenschaften',
  'Medizin / Gesundheit',
  'Recht',
  'Lehramt',
  'Sozialwissenschaften',
  'Design / Kunst',
  'Geisteswissenschaften',
  'Sonstiges',
]

const degreeOptions = [
  'Ausbildung',
  'Bachelor',
  'Master',
  'Promotion',
  'Kein Abschluss',
  'Sonstiges',
]

const levelBySlug: Record<LevelSlug, Level> = {
  neugieriger: 1,
  einsteiger: 2,
  fortgeschritten: 3,
  pro: 4,
  expert: 5,
}

function isLevelSlug(value: string | null): value is LevelSlug {
  return (
    value === 'neugieriger' ||
    value === 'einsteiger' ||
    value === 'fortgeschritten' ||
    value === 'pro' ||
    value === 'expert'
  )
}

function normalizeApplicantStatus(value: unknown): ApplicantStatus {
  if (value === 'student' || value === 'early_career' || value === 'other') {
    return value
  }
  if (value === 'working' || value === 'alumni') return 'early_career'
  return 'student'
}

function isApplicantStatus(value: unknown): value is LegacyApplicantStatus {
  return (
    value === 'student' ||
    value === 'early_career' ||
    value === 'working' ||
    value === 'alumni' ||
    value === 'other'
  )
}

function readDraft(): FormDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormDraft> & {
      name?: unknown
      study_program?: unknown
    }
    const parsedName = typeof parsed.name === 'string' ? parsed.name : ''
    const [fallbackFirstName = '', ...fallbackLastParts] = parsedName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      first_name:
        typeof parsed.first_name === 'string'
          ? parsed.first_name
          : fallbackFirstName,
      last_name:
        typeof parsed.last_name === 'string'
          ? parsed.last_name
          : fallbackLastParts.join(' '),
      birth_year:
        typeof parsed.birth_year === 'string' ? parsed.birth_year : '',
      status: normalizeApplicantStatus(parsed.status),
      university:
        typeof parsed.university === 'string' ? parsed.university : '',
      university_other:
        typeof parsed.university_other === 'string'
          ? parsed.university_other
          : '',
      study_field:
        typeof parsed.study_field === 'string'
          ? parsed.study_field
          : typeof parsed.study_program === 'string'
            ? parsed.study_program
            : '',
      study_field_other:
        typeof parsed.study_field_other === 'string'
          ? parsed.study_field_other
          : '',
      highest_degree:
        typeof parsed.highest_degree === 'string' ? parsed.highest_degree : '',
      career_field:
        typeof parsed.career_field === 'string' ? parsed.career_field : '',
      context: typeof parsed.context === 'string' ? parsed.context : '',
      marketing_opt_in:
        typeof parsed.marketing_opt_in === 'boolean'
          ? parsed.marketing_opt_in
          : false,
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface JoinFormCardProps {
  compact?: boolean
  onSuccess: (name: string) => void
}

export function JoinFormCard({ compact = false, onSuccess }: JoinFormCardProps) {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const redirectAfter = searchParams.get('redirect_after') ?? ''
  const source = searchParams.get('source')
  const pre = searchParams.get('pre')
  const skills = searchParams.get('skills')

  // --- Controlled form state ---
  // Start from emptyDraft to keep SSR markup deterministic, then hydrate
  // from sessionStorage in a mount-only useEffect (avoids hydration mismatch).
  const [draft, setDraft] = useState<FormDraft>(emptyDraft)
  const [hydrated, setHydrated] = useState(false)
  const [storedTestResultPayload, setStoredTestResultPayload] = useState('')

  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<WaitlistFieldErrors>({})
  const fullName = `${draft.first_name.trim()} ${draft.last_name.trim()}`
    .trim()
    .replace(/\s+/g, ' ')
  const needsUniversity =
    draft.status === 'student' || draft.status === 'early_career'
  const hasCustomUniversity =
    !!draft.university && !UNIVERSITIES.includes(draft.university)
  const showUniversityOther =
    draft.university === OTHER_UNIVERSITY || hasCustomUniversity
  const showStudyFieldOther =
    draft.status === 'student' && draft.study_field === 'Sonstiges'
  // R4.7 — Hydrate from sessionStorage on mount (client-only, post-SSR)
  useEffect(() => {
    const stored = readDraft()
    if (stored) setDraft(stored)
    const storedTestResult = readStoredAssessmentResult()
    if (storedTestResult) {
      setStoredTestResultPayload(JSON.stringify(storedTestResult))
    }
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

  const updateField = <K extends keyof FormDraft>(
    key: K,
    value: FormDraft[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const updateStatus = (status: ApplicantStatus) => {
    setDraft((prev) => ({
      ...prev,
      status,
      university: status === 'other' ? '' : prev.university,
      university_other: status === 'other' ? '' : prev.university_other,
      study_field: status === 'student' ? prev.study_field : '',
      study_field_other: status === 'student' ? prev.study_field_other : '',
      highest_degree:
        status === 'early_career' ? prev.highest_degree : '',
      career_field: status === 'early_career' ? prev.career_field : '',
      context: status === 'other' ? prev.context : '',
    }))
    setFieldErrors((prev) => ({
      ...prev,
      status: undefined,
      university: undefined,
    }))
  }

  const updateStudyField = (studyField: string) => {
    setDraft((prev) => ({
      ...prev,
      study_field: studyField,
      study_field_other:
        studyField === 'Sonstiges' ? prev.study_field_other : '',
    }))
  }

  const validateField = (name: string, value: string): string => {
    if (name === 'email') {
      const trimmed = value.trim()
      if (!trimmed) return 'Das Feld darf nicht leer sein.'
      // WR-02: use a permissive "looks like an email" check — the server-side
      // Zod `.email()` schema is authoritative (see waitlist.ts). Diverging
      // regexes cause UX confusion when the client accepts something the
      // server rejects (or vice versa). HTML5 `type="email"` already gates
      // browser-level validity; this is only for inline feedback before
      // submit. The server re-validates everything.
      if (!/^\S+@\S+\.\S+$/.test(trimmed))
        return 'Hmm, die Mail-Adresse passt noch nicht ganz.'
    }
    if (name === 'name' && !value.trim())
      return 'Das Feld darf nicht leer sein.'
    if (name === 'first_name' && !value.trim())
      return 'Das Feld darf nicht leer sein.'
    if (name === 'last_name' && !value.trim())
      return 'Das Feld darf nicht leer sein.'
    if (name === 'birth_year') {
      const trimmed = value.trim()
      if (!trimmed) return 'Das Feld darf nicht leer sein.'
      const year = Number(trimmed)
      const maxYear = new Date().getFullYear() - 12
      if (!Number.isInteger(year) || year < 1940 || year > maxYear) {
        return 'Gib ein plausibles Geburtsjahr ein.'
      }
    }
    if (name === 'university' && needsUniversity && !value.trim())
      return 'Das Feld darf nicht leer sein.'
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
    formData.set('name', fullName)
    const universityRaw = ((formData.get('university') as string) ?? '').trim()
    const normalizedUniversity =
      universityRaw && !UNIVERSITIES.includes(universityRaw)
        ? OTHER_UNIVERSITY
        : universityRaw

    if (normalizedUniversity !== universityRaw) {
      formData.set('university', normalizedUniversity)
      formData.set('university_other', universityRaw)
    } else if (normalizedUniversity !== OTHER_UNIVERSITY) {
      formData.delete('university_other')
    }

    const studyField = ((formData.get('study_field') as string) ?? '').trim()
    const studyFieldOther = (
      (formData.get('study_field_other') as string) ?? ''
    ).trim()
    const highestDegree = (
      (formData.get('highest_degree') as string) ?? ''
    ).trim()
    const careerField = ((formData.get('career_field') as string) ?? '').trim()
    const context = ((formData.get('context') as string) ?? '').trim()
    const universityOther = (
      (formData.get('university_other') as string) ?? ''
    ).trim()
    const contextParts = [
      draft.status === 'student' && studyField === 'Sonstiges' && studyFieldOther
        ? `Studienfeld: ${studyFieldOther}`
        : '',
      draft.status === 'early_career' && highestDegree
        ? `Abschluss: ${highestDegree}`
        : '',
      draft.status === 'early_career' && careerField
        ? `Berufsfeld: ${careerField}`
        : '',
      draft.status === 'other' && context ? `Kontext: ${context}` : '',
      normalizedUniversity === OTHER_UNIVERSITY && universityOther
        ? `Hochschule: ${universityOther}`
        : '',
    ].filter(Boolean)

    formData.set(
      'study_program',
      contextParts.length > 0 ? contextParts.join(' | ') : studyField,
    )
    if (studyField !== 'Sonstiges') formData.delete('study_field_other')

    // Client-side pre-check required fields (server revalidates anyway)
    const email = (formData.get('email') as string) ?? ''
    const firstName = (formData.get('first_name') as string) ?? ''
    const lastName = (formData.get('last_name') as string) ?? ''
    const birthYear = (formData.get('birth_year') as string) ?? ''
    const uni = (formData.get('university') as string) ?? ''
    const status = (formData.get('status') as string) ?? ''
    const consent =
      formData.get('consent') === 'on' || formData.get('consent') === 'true'

    const clientErrors: WaitlistFieldErrors = {}
    const e1 = validateField('email', email)
    if (e1) clientErrors.email = e1
    const e2 = validateField('first_name', firstName)
    if (e2) clientErrors.first_name = e2
    const e3 = validateField('last_name', lastName)
    if (e3) clientErrors.last_name = e3
    const e4 = validateField('birth_year', birthYear)
    if (e4) clientErrors.birth_year = e4
    if (!isApplicantStatus(status))
      clientErrors.status = 'Wähl eine Option aus.'
    const e5 = validateField('university', uni)
    if (e5) clientErrors.university = e5
    if (!consent)
      clientErrors.consent =
        'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      // Focus first invalid field (A11y: WCAG 2.4.3)
      const firstErrorName = Object.keys(clientErrors)[0]
      const input = form.querySelector<HTMLElement>(
        `[name="${firstErrorName}"]`,
      )
      input?.focus()
      return
    }

    setFieldErrors({})
    setServerError(null)

    startTransition(async () => {
      const result = await submitJoinWaitlist(formData)
      if (result.ok) {
        clearDraft()
        onSuccess(fullName)
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
      className={
        compact
          ? 'space-y-2.5 rounded-2xl border border-[var(--border)]/60 bg-bg-card px-4 py-4 shadow-sm sm:space-y-3 sm:px-5 sm:py-5'
          : 'space-y-6 rounded-2xl border border-[var(--border)]/60 bg-bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10'
      }
      aria-label="Beitrittsformular"
    >
      {/* === E-Mail (required) === */}
      <div>
        <label
          htmlFor={`${formId}-email`}
          id={`${formId}-email-label`}
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
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
          className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
          style={{
            fontSize: 'var(--fs-body)',
            minHeight: compact ? '40px' : '44px',
          }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={
            fieldErrors.email ? `${formId}-email-error` : undefined
          }
        />
        {fieldErrors.email && (
          <p
            id={`${formId}-email-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* === Name (required, split for cleaner onboarding copy) === */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${formId}-first-name`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            VORNAME
          </label>
          <input
            id={`${formId}-first-name`}
            name="first_name"
            type="text"
            required
            disabled={isPending}
            value={draft.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
            onBlur={handleTextBlur}
            autoComplete="given-name"
            placeholder="Luca"
            className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
            style={{
              fontSize: 'var(--fs-body)',
              minHeight: compact ? '40px' : '44px',
            }}
            aria-invalid={!!fieldErrors.first_name}
            aria-describedby={
              fieldErrors.first_name
                ? `${formId}-first-name-error`
                : undefined
            }
          />
          {fieldErrors.first_name && (
            <p
              id={`${formId}-first-name-error`}
              role="alert"
              className="mt-1 text-sm"
              style={{ color: 'var(--status-error)' }}
            >
              {fieldErrors.first_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${formId}-last-name`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            NACHNAME
          </label>
          <input
            id={`${formId}-last-name`}
            name="last_name"
            type="text"
            required
            disabled={isPending}
            value={draft.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
            onBlur={handleTextBlur}
            autoComplete="family-name"
            placeholder="Schweigmann"
            className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
            style={{
              fontSize: 'var(--fs-body)',
              minHeight: compact ? '40px' : '44px',
            }}
            aria-invalid={!!fieldErrors.last_name}
            aria-describedby={
              fieldErrors.last_name ? `${formId}-last-name-error` : undefined
            }
          />
          {fieldErrors.last_name && (
            <p
              id={`${formId}-last-name-error`}
              role="alert"
              className="mt-1 text-sm"
              style={{ color: 'var(--status-error)' }}
            >
              {fieldErrors.last_name}
            </p>
          )}
        </div>
        <input type="hidden" name="name" value={fullName} />
      </div>

      {/* === Birth year (required for aggregate audience targeting) === */}
      <div>
        <label
          htmlFor={`${formId}-birth-year`}
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
        >
          GEBURTSJAHR
        </label>
        <input
          id={`${formId}-birth-year`}
          name="birth_year"
          type="number"
          inputMode="numeric"
          min={1940}
          max={new Date().getFullYear() - 12}
          required
          disabled={isPending}
          value={draft.birth_year}
          onChange={(e) => updateField('birth_year', e.target.value)}
          onBlur={handleTextBlur}
          autoComplete="bday-year"
          placeholder="2001"
          className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
          style={{
            fontSize: 'var(--fs-body)',
            minHeight: compact ? '40px' : '44px',
          }}
          aria-invalid={!!fieldErrors.birth_year}
          aria-describedby={
            fieldErrors.birth_year ? `${formId}-birth-year-error` : undefined
          }
        />
        {fieldErrors.birth_year && (
          <p
            id={`${formId}-birth-year-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.birth_year}
          </p>
        )}
      </div>

      {/* === Status-Switch (required, Phase 22.8-06) === */}
      <fieldset>
        <legend
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-2' : 'mb-3'}`}
        >
          STATUS
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup">
          {statusOptions.map((option) => {
            const selected = draft.status === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isPending}
                onClick={() => updateStatus(option.value)}
                className={`rounded-2xl border px-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-300 hover:scale-[1.015] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none ${compact ? 'py-2 sm:py-2.5' : 'py-3'}`}
                style={{
                  borderColor: selected
                    ? 'var(--border-accent)'
                    : 'color-mix(in srgb, var(--border) 70%, transparent)',
                  background: selected ? 'var(--accent-soft)' : 'var(--bg)',
                }}
              >
                <span className="block font-mono text-[12px] font-bold uppercase tracking-[0.02em] text-text">
                  {option.label}
                </span>
                <span
                  className={`mt-1 block font-sans text-text-secondary ${compact ? 'text-[12px] leading-[1.2] sm:text-[13px] sm:leading-[1.25]' : 'text-sm leading-[1.35]'}`}
                >
                  {option.helper}
                </span>
              </button>
            )
          })}
        </div>
        <input type="hidden" name="status" value={draft.status} />
        {fieldErrors.status && (
          <p
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.status}
          </p>
        )}
      </fieldset>

      {/* === Hochschule (Student + Early Career) === */}
      {needsUniversity && (
        <div>
          <label
            htmlFor={`${formId}-university`}
            id={`${formId}-university-label`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            HOCHSCHULE
          </label>
          <UniCombobox
            id={`${formId}-university`}
            name="university"
            value={draft.university}
            onChange={(v) => updateField('university', v)}
            onBlur={() => {
              const err = validateField('university', draft.university)
              setFieldErrors((prev) => ({
                ...prev,
                university: err || undefined,
              }))
            }}
            required={needsUniversity}
            disabled={isPending}
            error={fieldErrors.university}
            labelId={`${formId}-university-label`}
            describedById={
              fieldErrors.university ? `${formId}-university-error` : undefined
            }
            placeholder={
              draft.status === 'early_career'
                ? 'Such deine Hochschule oder wähl Andere'
                : 'Such deine Hochschule'
            }
          />
          {fieldErrors.university && (
            <p
              id={`${formId}-university-error`}
              role="alert"
              className="mt-1 text-sm"
              style={{ color: 'var(--status-error)' }}
            >
              {fieldErrors.university}
            </p>
          )}
        </div>
      )}

      {showUniversityOther && (
        <div>
          <label
            htmlFor={`${formId}-university-other`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            Welche Hochschule?
            <span className="ml-2 opacity-60">OPTIONAL</span>
          </label>
          <input
            id={`${formId}-university-other`}
            name="university_other"
            type="text"
            disabled={isPending}
            value={
              hasCustomUniversity ? draft.university : draft.university_other
            }
            onChange={(e) =>
              hasCustomUniversity
                ? updateField('university', e.target.value)
                : updateField('university_other', e.target.value)
            }
            placeholder="z.B. HdM Stuttgart"
            className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
            style={{
              fontSize: 'var(--fs-body)',
              minHeight: compact ? '40px' : '44px',
            }}
          />
        </div>
      )}

      {/* === Student-specific study field === */}
      {draft.status === 'student' && (
        <div>
          <label
            htmlFor={`${formId}-study_field`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            STUDIENFELD
          </label>
          <select
            id={`${formId}-study_field`}
            name="study_field"
            disabled={isPending}
            value={draft.study_field}
            onChange={(e) => updateStudyField(e.target.value)}
            className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
            style={{
              fontSize: 'var(--fs-body)',
              minHeight: compact ? '40px' : '44px',
            }}
          >
            <option value="">Auswählen</option>
            {studyFieldOptions.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          {showStudyFieldOther && (
            <div className={compact ? 'mt-2' : 'mt-3'}>
              <label
                htmlFor={`${formId}-study-field-other`}
                className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
              >
                Welches Studienfeld?
                <span className="ml-2 opacity-60">OPTIONAL</span>
              </label>
              <input
                id={`${formId}-study-field-other`}
                name="study_field_other"
                type="text"
                disabled={isPending}
                value={draft.study_field_other}
                onChange={(e) =>
                  updateField('study_field_other', e.target.value)
                }
                placeholder="z.B. Data Science, Psychologie"
                className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
                style={{
                  fontSize: 'var(--fs-body)',
                  minHeight: compact ? '40px' : '44px',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* === Early-career fields === */}
      {draft.status === 'early_career' && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${formId}-highest-degree`}
              className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
            >
              HÖCHSTER ABSCHLUSS
            </label>
            <select
              id={`${formId}-highest-degree`}
              name="highest_degree"
              disabled={isPending}
              value={draft.highest_degree}
              onChange={(e) =>
                updateField('highest_degree', e.target.value)
              }
              className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
              style={{
                fontSize: 'var(--fs-body)',
                minHeight: compact ? '40px' : '44px',
              }}
            >
              <option value="">Auswählen</option>
              {degreeOptions.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`${formId}-career-field`}
              className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
            >
              BERUFSFELD
            </label>
            <input
              id={`${formId}-career-field`}
              name="career_field"
              type="text"
              disabled={isPending}
              value={draft.career_field}
              onChange={(e) => updateField('career_field', e.target.value)}
              placeholder="z.B. Consulting, Produkt, Data"
              className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
              style={{
                fontSize: 'var(--fs-body)',
                minHeight: compact ? '40px' : '44px',
              }}
            />
          </div>
        </div>
      )}

      {/* === Other context === */}
      {draft.status === 'other' && (
        <div>
          <label
            htmlFor={`${formId}-context`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            KONTEXT
            <span className="ml-2 opacity-60">OPTIONAL</span>
          </label>
          <input
            id={`${formId}-context`}
            name="context"
            type="text"
            disabled={isPending}
            value={draft.context}
            onChange={(e) => updateField('context', e.target.value)}
            placeholder="z.B. Gründer, Schüler, Quereinsteiger"
            className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
            style={{
              fontSize: 'var(--fs-body)',
              minHeight: compact ? '40px' : '44px',
            }}
          />
        </div>
      )}

      <input
        type="hidden"
        name="study_program"
        value={
          draft.status === 'student'
            ? showStudyFieldOther && draft.study_field_other.trim()
              ? `Studienfeld: ${draft.study_field_other.trim()}`
              : draft.study_field
            : draft.status === 'early_career'
              ? [
                  draft.highest_degree
                    ? `Abschluss: ${draft.highest_degree}`
                    : '',
                  draft.career_field
                    ? `Berufsfeld: ${draft.career_field}`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' | ')
              : draft.context
                ? `Kontext: ${draft.context}`
                : ''
        }
      />

      {/* === DSGVO-Consent (required, D-14) === */}
      <div>
        <label
          htmlFor={`${formId}-consent`}
          className={`flex cursor-pointer items-start gap-3 ${compact ? 'min-h-0' : 'min-h-[44px]'}`}
        >
          <input
            id={`${formId}-consent`}
            name="consent"
            type="checkbox"
            required
            disabled={isPending}
            aria-required="true"
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border border-[var(--border)] bg-bg checked:bg-[var(--accent-soft)] checked:border-[var(--border-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]"
          />
          <span
            className="text-text-secondary leading-[1.5]"
            style={{ fontSize: compact ? '15px' : 'var(--fs-body)' }}
          >
            Ich habe die{' '}
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener"
              className="underline hover:no-underline"
              style={{ color: 'var(--accent)' }}
            >
              Datenschutzerklärung
            </a>{' '}
            gelesen und stimme ihr zu.
          </span>
        </label>
        {fieldErrors.consent && (
          <p
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.consent}
          </p>
        )}
      </div>

      {/*
        === Marketing-Opt-in (optional, default off, D-14) ===
        NOTE: field name is `marketing_opt_in` — matches Zod schema in
        Plan 23-03 + DB column in Plan 23-01. UI-SPEC line 337 has a typo
        (`marketing_consent`) — this plan is source of truth for the `name`.
        Checkbox state is tracked in draft.marketing_opt_in so R4.7
        SessionStorage hydration restores it on reload.
      */}
      <div>
        <label
          htmlFor={`${formId}-marketing`}
          className={`flex cursor-pointer items-start gap-3 ${compact ? 'min-h-0' : 'min-h-[44px]'}`}
        >
          <input
            id={`${formId}-marketing`}
            name="marketing_opt_in"
            type="checkbox"
            disabled={isPending}
            checked={draft.marketing_opt_in}
            onChange={(e) => updateField('marketing_opt_in', e.target.checked)}
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border border-[var(--border)] bg-bg checked:bg-[var(--accent-soft)] checked:border-[var(--border-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]"
          />
          <span
            className="text-text-secondary leading-[1.5]"
            style={{ fontSize: compact ? '15px' : 'var(--fs-body)' }}
          >
            Ich möchte über Events und Neuigkeiten per E-Mail informiert werden.
          </span>
        </label>
      </div>

      {/* === Honeypot (spam protection) === */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        autoComplete="off"
      />

      {/*
        === redirect_after passthrough (D-03) ===
        WR-06: `redirect_after` is captured from the URL query param and
        persisted to the `waitlist` row by the Server Action (see
        app/actions/waitlist.ts). V1 does NOT consume it in the success UX
        (JoinSuccessCard hardcodes `/test` per D-15). Phase 25 Circle-Auth-
        Sync is the intended consumer: it reads the stored value during user
        activation to route the user back to the page they originally came
        from (e.g. `/events/[slug]` from the Phase 22.5 events gate).
        Validation against open-redirect is done server-side in CR-01; the
        consumer in Phase 25 MUST still re-validate the origin before
        navigating (`new URL(v, 'https://generation-ai.org').origin`).
      */}
      {redirectAfter && (
        <input type="hidden" name="redirect_after" value={redirectAfter} />
      )}

      {source === 'test' && <input type="hidden" name="source" value="test" />}
      {isLevelSlug(pre) && (
        <>
          <input type="hidden" name="pre" value={pre} />
          <input type="hidden" name="level" value={levelBySlug[pre]} />
        </>
      )}
      {source === 'test' && skills && (
        <input type="hidden" name="skills" value={skills} />
      )}
      {storedTestResultPayload && (
        <input
          type="hidden"
          name="test_result"
          value={storedTestResultPayload}
        />
      )}

      {/* === Server error banner === */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'var(--status-error)',
            color: 'var(--status-error)',
            background: 'rgba(220, 38, 38, 0.08)',
          }}
        >
          {serverError}
        </div>
      )}

      {/* === Submit === */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full rounded-full bg-[var(--accent)] px-6 font-mono text-[14px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-[box-shadow,opacity,transform] duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none ${compact ? 'mt-1 py-2.5' : 'mt-2 py-3'}`}
        style={{
          minHeight: '44px',
        }}
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="4"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
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
