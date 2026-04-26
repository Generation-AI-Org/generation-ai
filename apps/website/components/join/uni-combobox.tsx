'use client'

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useId,
} from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { OTHER_UNIVERSITY, UNIVERSITIES } from '@/lib/universities'

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

export function UniCombobox(props: UniComboboxProps) {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // WR-01: track pending blur timer so we can clear it on unmount + before
  // selectOption runs (prevents state-update-after-unmount + stale onBlur).
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listboxId = useId()

  // Filter universities based on typed input
  const filtered = useMemo(() => {
    const q = props.value.trim().toLowerCase()
    if (!q) return UNIVERSITIES.slice(0, 15) // Show top 15 when input is empty + focused
    const matches = UNIVERSITIES.filter((u) => u.toLowerCase().includes(q))
    if (matches.length === 0) return [OTHER_UNIVERSITY]
    if (!matches.includes(OTHER_UNIVERSITY)) return [...matches, OTHER_UNIVERSITY]
    return matches
  }, [props.value])

  // Scroll active option into view when navigating with keyboard
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return
    const el = listboxRef.current.querySelector<HTMLElement>(
      `#${CSS.escape(`${listboxId}-opt-${activeIndex}`)}`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, listboxId])

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // WR-01: clear pending blur timer on unmount to avoid state-update-after-
  // unmount warnings when the component is swapped out mid-blur (e.g. form
  // submit → success card swap in JoinFormSection).
  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    }
  }, [])

  // WR-03: depend only on onChange (destructured), not the whole `props`
  // object — `props` gets a new reference on every parent render, which
  // defeats useCallback memoization entirely.
  const { onChange } = props
  const selectOption = useCallback(
    (option: string) => {
      // WR-01: cancel any pending blur-close so it cannot clobber state
      // mid-selection (race between option onMouseDown and input blur).
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current)
        blurTimerRef.current = null
      }
      onChange(option)
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.focus()
    },
    [onChange],
  )

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
    } else if (e.key === 'Tab') {
      // Tab closes dropdown without preventing default (so focus moves to next field)
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.value)
    if (!open) setOpen(true)
    setActiveIndex(-1) // Reset active index when user types
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only close dropdown if focus leaves the whole combobox (input + listbox).
    // setTimeout so that option onMouseDown can register before blur closes dropdown.
    void e // suppress unused-variable lint warning
    // WR-01: store timer ID so we can clear it on unmount (see cleanup
    // useEffect above) and cancel it in selectOption (race condition).
    blurTimerRef.current = setTimeout(() => {
      setOpen(false)
      setActiveIndex(-1)
      props.onBlur?.()
    }, 150)
  }

  const activeDescendant =
    activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined

  return (
    <div ref={containerRef} className="relative">
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
        aria-activedescendant={activeDescendant}
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
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 text-text-muted transition-transform duration-150"
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
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
            }
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-2xl border border-[var(--border)] bg-bg-elevated shadow-md"
          >
            {filtered.map((option, idx) => {
              const isActive = idx === activeIndex
              const isOther = option === OTHER_UNIVERSITY
              return (
                <li
                  key={`${option}-${idx}`}
                  id={`${listboxId}-opt-${idx}`}
                  role="option"
                  // WR-04: aria-selected must reflect the *actual selection*,
                  // not keyboard-focus position. Keyboard focus is already
                  // communicated via aria-activedescendant on the input
                  // (see line above). Visual highlight for the active option
                  // stays via the className branch below.
                  aria-selected={option === props.value}
                  onMouseDown={(e) => {
                    // onMouseDown (not onClick) so we fire BEFORE input blur closes dropdown
                    e.preventDefault()
                    selectOption(option)
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`px-4 py-2.5 text-text cursor-pointer outline-none ${
                    isActive ? 'bg-[var(--bg-card)]' : 'hover:bg-[var(--bg-card)]'
                  } ${isOther ? 'italic text-text-secondary' : ''}`}
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
  )
}
