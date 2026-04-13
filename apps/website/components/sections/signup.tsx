'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const universities = [
  'Universität Mannheim',
  'Universität Heidelberg',
  'KIT Karlsruhe',
  'TU München',
  'LMU München',
  'TU Berlin',
  'HU Berlin',
  'Universität Wien',
  'ETH Zürich',
  'Andere',
]

const studyFields = [
  'Informatik / IT',
  'Wirtschaftswissenschaften',
  'Ingenieurwesen',
  'Naturwissenschaften',
  'Medizin',
  'Jura',
  'Geisteswissenschaften',
  'Sozialwissenschaften',
  'Andere',
]

const interests = [
  { id: 'tools', label: 'KI-Tools entdecken' },
  { id: 'prompting', label: 'Prompting lernen' },
  { id: 'coding', label: 'KI + Coding' },
  { id: 'research', label: 'Recherche & Papers' },
  { id: 'productivity', label: 'Produktivität' },
  { id: 'creative', label: 'Kreative Projekte' },
]

const kiLevels = [
  { level: 1, label: 'Noch nie genutzt' },
  { level: 2, label: 'Mal ausprobiert' },
  { level: 3, label: 'Nutze es gelegentlich' },
  { level: 4, label: 'Nutze es regelmäßig' },
  { level: 5, label: 'Power User' },
]

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function Signup() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [studyField, setStudyField] = useState('')
  const [kiLevel, setKiLevel] = useState<number | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !name || !university || !studyField || !kiLevel) {
      setErrorMessage('Bitte fülle alle Pflichtfelder aus.')
      setFormState('error')
      return
    }

    setFormState('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          university,
          studyField,
          kiLevel,
          interests: selectedInterests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ein Fehler ist aufgetreten.')
      }

      setFormState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <section id="signup" className="py-20 md:py-28 px-4 bg-bg">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-text mb-4">
            Check deine Emails!
          </h2>
          <p className="text-text-secondary text-lg">
            Wir haben dir einen Magic Link an <span className="text-text font-medium">{email}</span> geschickt.
            Klick auf den Link um der Community beizutreten.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="signup" className="py-20 md:py-28 px-4 bg-bg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            Kostenlos beitreten
          </h2>
          <p className="text-text-secondary text-lg">
            Ein paar kurze Fragen, dann bist du dabei.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8" aria-label="Anmeldung zur Community">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* University & Study Field */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-text mb-2">
                Hochschule *
              </label>
              <select
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-text focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                required
                aria-required="true"
              >
                <option value="">Wähle deine Hochschule</option>
                {universities.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="studyField" className="block text-sm font-medium text-text mb-2">
                Studienrichtung *
              </label>
              <select
                id="studyField"
                value={studyField}
                onChange={(e) => setStudyField(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-text focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                required
                aria-required="true"
              >
                <option value="">Wähle deine Richtung</option>
                {studyFields.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>

          {/* KI Level */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Dein KI-Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {kiLevels.map(({ level, label }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setKiLevel(level)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    kiLevel === level
                      ? 'bg-accent text-text-on-accent border-accent'
                      : 'bg-bg-card border-border text-text hover:border-accent/50'
                  }`}
                >
                  <span className="block text-lg mb-1">{level}</span>
                  <span className="block text-xs opacity-80">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Was interessiert dich? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {interests.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleInterest(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(id)
                      ? 'bg-accent text-text-on-accent'
                      : 'bg-bg-card border border-border text-text hover:border-accent/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {formState === 'error' && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={formState === 'loading'}
            className="w-full py-4 px-8 bg-accent text-text-on-accent rounded-full font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_var(--accent-glow)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {formState === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Wird verarbeitet...
              </span>
            ) : (
              'Kostenlos beitreten'
            )}
          </button>

          <p className="text-center text-text-muted text-sm">
            Mit der Anmeldung akzeptierst du unsere{' '}
            <a href="/datenschutz" className="text-accent hover:underline">
              Datenschutzerklärung
            </a>.
          </p>
        </form>
      </div>
    </section>
  )
}
