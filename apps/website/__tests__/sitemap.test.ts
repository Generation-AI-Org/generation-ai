// apps/website/__tests__/sitemap.test.ts
// Phase 24 — Verify sitemap includes /test (canonical) and excludes noindex subroutes.

import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  const entries = sitemap()
  const urls = entries.map((e) => e.url)

  it('includes /test as indexed route', () => {
    expect(urls).toContain('https://generation-ai.org/test')
  })

  it('does NOT include /test/aufgabe/* paths (noindex)', () => {
    expect(urls.some((u) => u.includes('/test/aufgabe'))).toBe(false)
  })

  it('does NOT include /test/ergebnis (noindex)', () => {
    expect(urls).not.toContain('https://generation-ai.org/test/ergebnis')
  })
})
