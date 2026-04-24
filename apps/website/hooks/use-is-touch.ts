'use client'

// apps/website/hooks/use-is-touch.ts
// Phase 24 — Detect coarse primary pointer (touch/stylus) for widget fallbacks.

import { useEffect, useState } from 'react'

export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    setIsTouch(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isTouch
}
