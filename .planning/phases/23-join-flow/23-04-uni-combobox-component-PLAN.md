---
phase: 23
plan: 04
slug: uni-combobox-component
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/lib/universities.ts
  - apps/website/components/join/uni-combobox.tsx
autonomous: true
requirements:
  - R4.6
must_haves:
  truths:
    - "Combobox-Komponente existiert, die User-Input akzeptiert und aus einer Uni-Liste filtert"
    - "Keyboard-Navigation funktioniert: ArrowDown/Up durchläuft Optionen, Enter wählt, Escape schliesst"
    - "Freitext-Eingabe wird akzeptiert (Non-Student-Fallback, D-12)"
    - "ARIA-konform: role=combobox, aria-autocomplete=list, aria-expanded, aria-controls, role=listbox, role=option, aria-selected"
    - "Uni-Liste enthält ≥30 deutsche Hochschulen + Freitext-Fallback-Optionen (Andere Hochschule / Ausbildung / Berufstätig / Kein Studium)"
  artifacts:
    - path: "apps/website/lib/universities.ts"
      provides: "Exportierte Liste deutscher Hochschulen für Autocomplete"
      exports: ["UNIVERSITIES", "type University"]
      min_lines: 40
    - path: "apps/website/components/join/uni-combobox.tsx"
      provides: "UniCombobox React-Komponente mit Autocomplete + Freitext + Keyboard-Nav"
      exports: ["UniCombobox", "type UniComboboxProps"]
      min_lines: 120
  key_links:
    - from: "apps/website/components/join/uni-combobox.tsx"
      to: "apps/website/lib/universities.ts"
      via: "import { UNIVERSITIES } from '@/lib/universities'"
      pattern: "UNIVERSITIES"
    - from: "UniCombobox"
      to: "Parent Form (Plan 23-05 join-form-card.tsx)"
      via: "value/onChange/onBlur props + name attribute (controlled input)"
      pattern: "onChange|onValueChange"
---

<objective>
Reusable UniCombobox-Komponente mit Autocomplete über deutsche Hochschulen + Freitext-Option (D-12).

Purpose: Das `university`-Feld ist D-02 required aber D-12 locked "Combobox mit Autocomplete über deutsche Unis + Freitext-Option für Andere/Ausbildung/Berufstätig". Ein nativer `<select>` reicht nicht, weil Non-Students frei tippen können müssen.
Output: Wiederverwendbare Combobox + Universities-Datenliste.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/23-join-flow/23-CONTEXT.md
@.planning/phases/23-join-flow/23-UI-SPEC.md
@apps/website/components/partner/partner-contact-form.tsx
@apps/website/components/ui/dropdown-menu.tsx

<interfaces>
<!-- UI-SPEC Section "Field: Uni / Ausbildungsstand (required) — Combobox" — verbatim -->
<!-- Expected props shape for parent (Plan 23-05): -->
```typescript
interface UniComboboxProps {
  id: string                         // unique id from useId() in parent
  name: string                       // form field name (e.g. "university")
  value: string                      // controlled value
  onChange: (value: string) => void  // fires on every input change (typing + selection)
  onBlur?: () => void                // for validation trigger
  required?: boolean                 // forwarded to aria-required + native required
  disabled?: boolean                 // forwarded to input
  error?: string                     // inline error from parent
  labelId?: string                   // aria-labelledby target (the <label htmlFor={id}>)
  describedById?: string             // aria-describedby target (the error <p id=...>)
}
```

<!-- Styling tokens from 23-UI-SPEC Component 3 — use these EXACT values -->
<!-- Input: w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text -->
<!--        placeholder:text-text-muted focus-visible:outline-none -->
<!--        focus-visible:border-[var(--border-accent)] transition-colors -->
<!-- fontSize: var(--fs-body), minHeight: 44px -->
<!-- Dropdown: absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-2xl border -->
<!--           border-[var(--border)] bg-bg-elevated shadow-md -->
<!-- Option: px-4 py-2.5 text-text cursor-pointer hover:bg-[var(--bg-card)] -->
<!--         focus:bg-[var(--bg-card)] outline-none -->
<!-- Active option highlight (keyboard): bg-[var(--bg-card)] -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Uni-Liste erstellen (apps/website/lib/universities.ts)</name>
  <files>apps/website/lib/universities.ts</files>
  <read_first>
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` Component 3 (Combobox-Spec — "minimum 30 entries" + "Andere Hochschule / Ausbildung / Berufstätig / Kein Studium" als Fallback)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-12 (Freitext-Option für Non-Students)
  </read_first>
  <action>
Erstelle `apps/website/lib/universities.ts` mit einer kuratierten Liste der 40 grössten deutschen Hochschulen + Fallback-Optionen. Format:

```typescript
/**
 * Phase 23 — Uni-Dropdown-Liste für /join Waitlist-Form.
 *
 * Enthält die ~40 grössten deutschen Hochschulen (nach Studierendenzahl 2024/25),
 * gemischt Unis + HAWs, plus 4 Fallback-Optionen am Ende für Non-Students
 * (D-12: Combobox + Freitext-Option für Berufstätig / Ausbildung / Andere).
 *
 * Der Combobox akzeptiert ausserdem Freitext — diese Liste ist nur die
 * Autocomplete-Quelle, kein Whitelist-Filter. Validation erfolgt in der
 * Server-Action (Plan 23-03): jeder nicht-leere String ist erlaubt.
 */

export type University = string

export const UNIVERSITIES: University[] = [
  // Grosse Unis (Studierenden-top-15 2024/25)
  'FernUniversität in Hagen',
  'Universität zu Köln',
  'LMU München',
  'RWTH Aachen',
  'Goethe-Universität Frankfurt',
  'Universität Hamburg',
  'Universität Münster',
  'Universität Duisburg-Essen',
  'Humboldt-Universität zu Berlin',
  'Universität Bonn',
  'Freie Universität Berlin',
  'Technische Universität Berlin',
  'Technische Universität München',
  'Universität Würzburg',
  'Universität Heidelberg',

  // TUs + Elite
  'Karlsruher Institut für Technologie (KIT)',
  'Technische Universität Dresden',
  'Technische Universität Darmstadt',
  'Universität Stuttgart',
  'Universität Tübingen',
  'Universität Freiburg',
  'Universität Leipzig',
  'Universität Göttingen',
  'Universität Mannheim',
  'Universität Jena',

  // Weitere wichtige Standorte
  'Ruhr-Universität Bochum',
  'Universität Bremen',
  'Universität Hannover',
  'Universität Kiel',
  'Universität Rostock',
  'Universität Regensburg',
  'Universität Bayreuth',
  'Universität Bielefeld',
  'Universität Potsdam',
  'Universität Konstanz',

  // Ausgewählte grosse HAWs / Hochschulen
  'Hochschule München',
  'Hochschule für Angewandte Wissenschaften Hamburg (HAW)',
  'Technische Hochschule Köln',
  'Hochschule Niederrhein',
  'Frankfurt University of Applied Sciences',

  // Fallback-Optionen (immer am Ende, D-12)
  'Andere Hochschule',
  'Ausbildung / Berufstätig',
  'Kein Studium',
]
```

Notizen:
- Reihenfolge ist meaningful — grösste Unis zuerst, Fallbacks immer am Ende
- Echte Umlaute (kein "Universitaet"!) — Voice-Regel
- HAW-Bereich bewusst kleiner (die Liste ist kein vollständiges Uni-Verzeichnis, nur Top-Dropdown-Picks)
- `Andere Hochschule` als erstes Fallback — User der ohne Match tippt bekommt im UI automatisch einen "Andere / Freitext übernehmen"-Eintrag (siehe UI-SPEC), aber wer explizit "Andere Hochschule" selektieren will, soll das auch können
  </action>
  <verify>
    <automated>test -f apps/website/lib/universities.ts && grep -q "export const UNIVERSITIES" apps/website/lib/universities.ts && [ $(grep -c "'" apps/website/lib/universities.ts) -ge 40 ] && grep -q "Andere Hochschule" apps/website/lib/universities.ts && grep -q "Ausbildung / Berufstätig" apps/website/lib/universities.ts</automated>
  </verify>
  <acceptance_criteria>
    - File existiert und exportiert `UNIVERSITIES: University[]`
    - Mindestens 30 real existierende deutsche Hochschulen
    - Genau 4 Fallback-Einträge am Ende (Andere Hochschule, Ausbildung / Berufstätig, Kein Studium + optional 1 weiterer)
    - Echte Umlaute durchgängig (grep -E "ae|oe|ue|ss" zeigt keine künstlichen Transliterations)
    - Exportiert `type University` (String-Alias, keine separate Interface)
  </acceptance_criteria>
  <done>Uni-Liste ist eine canonical Datenquelle für die Combobox.</done>
</task>

<task type="auto">
  <name>Task 2: UniCombobox-Komponente bauen</name>
  <files>apps/website/components/join/uni-combobox.tsx</files>
  <read_first>
    - `apps/website/lib/universities.ts` (aus Task 1)
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` Component 3 (FULL combobox section — role/aria attributes, class strings, motion)
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` "Motion Contract / Combobox Dropdown Open/Close" (Motion-Spec)
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` "Accessibility Contract / Keyboard Navigation" (Tastatur-Spec)
    - `apps/website/components/partner/partner-contact-form.tsx` (Input-Styling-Pattern)
  </read_first>
  <action>
Erstelle `apps/website/components/join/uni-combobox.tsx` als Client-Component. Implementiere die Combobox hand-rolled (keine extra Library) — das Projekt nutzt bereits `motion/react` für Animationen und Lucide für Icons.

**Imports & Signature:**
```tsx
'use client'

import { useState, useRef, useEffect, useMemo, useCallback, useId } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { UNIVERSITIES } from '@/lib/universities'

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

export function UniCombobox(props: UniComboboxProps) { ... }
```

**State:**
```tsx
const prefersReducedMotion = useReducedMotion()
const [open, setOpen] = useState(false)
const [activeIndex, setActiveIndex] = useState<number>(-1)
const inputRef = useRef<HTMLInputElement>(null)
const listboxRef = useRef<HTMLUListElement>(null)
const listboxId = useId()
```

**Filtering logic:**
```tsx
const filtered = useMemo(() => {
  const q = props.value.trim().toLowerCase()
  if (!q) return UNIVERSITIES.slice(0, 15) // Show top 15 when input is empty + focused
  const matches = UNIVERSITIES.filter((u) => u.toLowerCase().includes(q))
  if (matches.length === 0) {
    // Non-student fallback (D-12): user can submit free-text value
    return [`Andere: ${props.value.trim()} übernehmen`]
  }
  return matches
}, [props.value])
```

**Handlers (Keyboard-Nav):**
```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open) setOpen(true)
    setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    setActiveIndex((i) => Math.max(i - 1, 0))
  } else if (e.key === 'Enter') {
    if (open && activeIndex >= 0 && filtered[activeIndex]) {
      e.preventDefault()
      selectOption(filtered[activeIndex])
    }
    // else: let form submit happen
  } else if (e.key === 'Escape') {
    e.preventDefault()
    setOpen(false)
    setActiveIndex(-1)
  }
}

const selectOption = (option: string) => {
  // Strip the "Andere: ... übernehmen" wrapper if present — keep raw typed text
  const free = option.match(/^Andere: (.+) übernehmen$/)
  const value = free ? free[1] : option
  props.onChange(value)
  setOpen(false)
  setActiveIndex(-1)
  inputRef.current?.focus()
}

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  props.onChange(e.target.value)
  if (!open) setOpen(true)
  setActiveIndex(-1) // Reset active index when user types
}

const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  // Only close dropdown if focus leaves the whole combobox (input + listbox)
  // Use setTimeout so that option clicks can register before blur closes dropdown.
  setTimeout(() => {
    setOpen(false)
    setActiveIndex(-1)
    props.onBlur?.()
  }, 150)
}
```

**Outside-click close:** `useEffect` listener on document mousedown — close if click target is outside input + listbox refs. Standard Pattern.

**JSX structure:**
```tsx
<div className="relative">
  <input
    ref={inputRef}
    id={props.id}
    name={props.name}
    type="text"
    autoComplete="off"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded={open}
    aria-controls={listboxId}
    aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
    aria-required={props.required}
    aria-invalid={!!props.error}
    aria-labelledby={props.labelId}
    aria-describedby={props.describedById}
    required={props.required}
    disabled={props.disabled}
    value={props.value}
    placeholder={props.placeholder ?? 'Such deine Hochschule oder tipp frei'}
    onChange={handleInputChange}
    onKeyDown={handleKeyDown}
    onFocus={() => setOpen(true)}
    onBlur={handleBlur}
    className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 pr-10 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
    style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
  />

  {/* ChevronDown indicator */}
  <ChevronDown
    aria-hidden="true"
    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-transform"
    style={{ transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)` }}
  />

  <AnimatePresence>
    {open && filtered.length > 0 && (
      <motion.ul
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-2xl border border-[var(--border)] bg-bg-elevated shadow-md"
      >
        {filtered.map((option, idx) => {
          const isActive = idx === activeIndex
          const isFreetext = /^Andere: .+ übernehmen$/.test(option)
          return (
            <li
              key={`${option}-${idx}`}
              id={`${listboxId}-opt-${idx}`}
              role="option"
              aria-selected={isActive}
              onMouseDown={(e) => {
                // onMouseDown (not onClick) so we fire BEFORE input blur closes dropdown
                e.preventDefault()
                selectOption(option)
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`px-4 py-2.5 text-text cursor-pointer outline-none ${isActive ? 'bg-[var(--bg-card)]' : 'hover:bg-[var(--bg-card)]'} ${isFreetext ? 'italic text-text-secondary' : ''}`}
              style={{ fontSize: 'var(--fs-body)' }}
            >
              {option}
            </li>
          )
        })}
      </motion.ul>
    )}
  </AnimatePresence>
</div>
```

**Scroll-Active-Option-Into-View:** Wenn `activeIndex` sich durch Keyboard-Nav ändert, scrolle das aktive Listenelement in den sichtbaren Bereich:
```tsx
useEffect(() => {
  if (activeIndex < 0 || !listboxRef.current) return
  const el = listboxRef.current.querySelector<HTMLElement>(`#${listboxId}-opt-${activeIndex}`)
  el?.scrollIntoView({ block: 'nearest' })
}, [activeIndex, listboxId])
```

**Wichtig:**
- `'use client'` ganz oben
- `useReducedMotion()`-Guard auf allen Animationen
- `onMouseDown` statt `onClick` auf Options (verhindert Blur-Race)
- Outside-Click-Close via `useEffect` document listener
- Keine zusätzlichen Dependencies — nur `motion/react` + `lucide-react` (beide schon da)
  </action>
  <verify>
    <automated>test -f apps/website/components/join/uni-combobox.tsx && grep -q "'use client'" apps/website/components/join/uni-combobox.tsx && grep -q "export function UniCombobox" apps/website/components/join/uni-combobox.tsx && grep -q 'role="combobox"' apps/website/components/join/uni-combobox.tsx && grep -q 'role="listbox"' apps/website/components/join/uni-combobox.tsx && grep -q 'role="option"' apps/website/components/join/uni-combobox.tsx && grep -q "useReducedMotion" apps/website/components/join/uni-combobox.tsx && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - `'use client'` directive vorhanden
    - `export function UniCombobox(props: UniComboboxProps)` 
    - `role="combobox"` + `aria-autocomplete="list"` + `aria-expanded` + `aria-controls` auf Input
    - `role="listbox"` auf Dropdown-UL
    - `role="option"` + `aria-selected` auf jeder Option
    - `aria-activedescendant` auf Input wenn activeIndex ≥ 0
    - Keyboard-Handler für ArrowDown/Up/Enter/Escape
    - `useReducedMotion()` wird importiert und verwendet
    - `onMouseDown` (nicht `onClick`) auf Options
    - Outside-click-close via document-event-listener
    - Freitext-Fallback: wenn keine Matches, zeigt `"Andere: {typedValue} übernehmen"` als einzige Option
    - Import aus `@/lib/universities`
    - `pnpm --filter @genai/website exec tsc --noEmit` grün
    - File ≥120 Zeilen (Indikator für vollständige Implementation)
  </acceptance_criteria>
  <done>UniCombobox ist standalone kompilierbar + in Plan 23-05 einbettbar via `<UniCombobox id={...} name="university" value={...} onChange={...} />`.</done>
</task>

</tasks>

<verification>
- Universities-Liste mit ≥30 deutschen Hochschulen + 4 Fallback-Optionen
- Combobox ARIA-konform laut WAI-ARIA Authoring Practices 1.2 Combobox-Pattern
- Keyboard-Navigation funktional
- Reduced-Motion geschützt
- TSC clean
</verification>

<success_criteria>
- Plan 23-05 kann `<UniCombobox />` einbauen ohne weitere Wrapper
- User kann frei tippen + Dropdown-Option wählen ODER eigenen Text einreichen
- Screen-Reader hört Listbox-Role + Active-Option
- Tab verlässt die Combobox, Escape schliesst Dropdown
</success_criteria>

<output>
Create `.planning/phases/23-join-flow/23-04-SUMMARY.md` with:
- Files created
- Universities count
- ARIA-attributes overview
- Keyboard-shortcuts demo table
</output>
