import type { ReactNode } from 'react'

/**
 * StatusPill — Reusable success/error pill primitive for tools-app auth/settings flows.
 *
 * Maps to DS status tokens:
 *   - type='success' → --status-success
 *   - type='error'   → --status-error
 *
 * Both tokens have light + dark variants in packages/config/tailwind/base.css,
 * so the pill stays readable in both themes (the prior hardcoded
 * `text-red-400 / text-green-400` was invisible on white BG).
 *
 * Plan 22.8-02 / Cluster 1 (A-M01, A-M02, A-M03).
 */

export type StatusPillProps = {
  type: 'success' | 'error'
  children: ReactNode
  className?: string
}

export function StatusPill({ type, children, className }: StatusPillProps) {
  const tokenClasses =
    type === 'success'
      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)] border-[var(--status-success)]/20'
      : 'bg-[var(--status-error)]/10 text-[var(--status-error)] border-[var(--status-error)]/20'

  return (
    <div
      className={`border rounded-2xl px-4 py-3 text-sm ${tokenClasses} ${className ?? ''}`.trim()}
    >
      {children}
    </div>
  )
}
