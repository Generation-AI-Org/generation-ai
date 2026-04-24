'use client'

// apps/website/hooks/use-radio-group-keyboard.ts
// Phase 24 WR-03 — WAI-ARIA radio-group keyboard navigation.
// Implements roving tabindex + Arrow Up/Down/Left/Right focus movement
// and Home/End jumping, matching the WAI-ARIA "radio group" pattern.

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

export interface UseRadioGroupKeyboardResult {
  /** Ref to spread onto the radiogroup container. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Index currently owning tabindex=0. */
  focusedIndex: number
  /** Returns the tabindex that each option should set. */
  tabIndexFor: (index: number) => 0 | -1
  /** onKeyDown handler to attach to the radiogroup container. */
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void
  /** Call in each option's onFocus to keep roving state in sync. */
  onOptionFocus: (index: number) => void
}

export function useRadioGroupKeyboard(
  count: number,
  checkedIndex: number,
): UseRadioGroupKeyboardResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  // If nothing is checked, the first option is tabbable; otherwise the checked one is.
  const [focusedIndex, setFocusedIndex] = useState<number>(
    checkedIndex >= 0 ? checkedIndex : 0,
  )

  // Keep focus index in sync with a newly-checked option.
  useEffect(() => {
    if (checkedIndex >= 0) setFocusedIndex(checkedIndex)
  }, [checkedIndex])

  const focusOption = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return
    const options = container.querySelectorAll<HTMLElement>('[role="radio"]')
    const el = options[index]
    if (el) el.focus()
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (count <= 0) return
      let next = focusedIndex
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          next = (focusedIndex + 1) % count
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          next = (focusedIndex - 1 + count) % count
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = count - 1
          break
        default:
          return
      }
      e.preventDefault()
      setFocusedIndex(next)
      focusOption(next)
    },
    [count, focusOption, focusedIndex],
  )

  const tabIndexFor = useCallback(
    (index: number): 0 | -1 => (index === focusedIndex ? 0 : -1),
    [focusedIndex],
  )

  const onOptionFocus = useCallback((index: number) => {
    setFocusedIndex(index)
  }, [])

  return { containerRef, focusedIndex, tabIndexFor, onKeyDown, onOptionFocus }
}
