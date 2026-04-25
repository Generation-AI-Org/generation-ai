'use client'

// apps/website/hooks/use-is-touch.ts
// Phase 24 — Detect coarse primary pointer (touch/stylus) for widget fallbacks.
// WR-02: three-state return (null | true | false) so callers can render a
// neutral shell during SSR/first-client-render and avoid hydration mismatch
// on touch devices. `null` means "not yet resolved".

import { useEffect, useState } from 'react'

export function useIsTouch(): boolean | null {
  const [isTouch, setIsTouch] = useState<boolean | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      setIsTouch(false)
      return
    }
    const mq = window.matchMedia('(pointer: coarse)')
    setIsTouch(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isTouch
}
