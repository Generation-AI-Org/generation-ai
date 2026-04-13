'use client'

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-bg-card p-5 animate-pulse">
      {/* Top: Logo + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--border)]" />
        <div className="w-16 h-5 rounded-full bg-[var(--border)]" />
      </div>

      {/* Title */}
      <div className="h-4 w-3/4 rounded bg-[var(--border)] mb-2" />

      {/* Category */}
      <div className="h-3 w-1/3 rounded bg-[var(--border)] mb-3" />

      {/* Summary lines */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-[var(--border)]" />
        <div className="h-3 w-5/6 rounded bg-[var(--border)]" />
      </div>
    </div>
  )
}
