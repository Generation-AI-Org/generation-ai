"use client"

import { useTheme } from "@/components/ThemeProvider"

/**
 * BeispielBadge — Stub-Markierung für Demo/Dummy-Content.
 * Theme-aware: light → brand-red, dark → brand-neon.
 *
 * Extracted from `tool-showcase-section.tsx` in Phase 26 (Plan 26-04) to
 * decouple the badge from the upcoming Server-Component refactor of the
 * Tool-Showcase in Plan 26-05. Behavior is unchanged from the original
 * implementation — copy-paste 1:1.
 */
export function BeispielBadge({ className = "" }: { className?: string }) {
  const { theme } = useTheme()
  const tone =
    theme === "light"
      ? "bg-brand-red-3 text-brand-red-12"
      : "bg-brand-neon-3 text-brand-neon-12"
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${tone} ${className}`}
    >
      Beispiel
    </span>
  )
}
