"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { useReducedMotion } from "motion/react"

interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * GridBackground — Raycast/Vercel/Linear-style animated grid backdrop.
 *
 * Brand direction: Terminal/hacker/tech-forward. Neon-green accent on
 * dark-default (brand-neon), pink/red on light (brand-red). No tailwind-default
 * palettes (cyan/violet/indigo/purple).
 *
 * Stack:
 *   - Layer 1: tiled linear-gradient grid lines (subtle, theme-aware via CSS vars)
 *   - Layer 2: slow-drifting radial "spotlight" glow (accent color) — respects
 *     prefers-reduced-motion (CSS media query in globals.css pauses the keyframe)
 *   - Radial mask fades everything to bg-color at the edges so the page feels
 *     contained, not wallpapered.
 *
 * Props mirror AuroraBackground for drop-in compatibility.
 */
export function GridBackground({
  className,
  children,
  ...props
}: GridBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={cn(
        "relative flex h-[100vh] flex-col items-center justify-center overflow-hidden bg-bg text-text",
        className,
      )}
      {...props}
    >
      {/* Grid lines layer — tiled via background-size */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line-color) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 85%)",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 85%)",
        }}
      />

      {/* Accent dots at intersections — denser, softer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          backgroundPosition: "0 0",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 40%, black 30%, transparent 80%)",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Spotlight glow — slow drift via keyframes, paused on reduced-motion */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          !prefersReducedMotion && "animate-grid-spotlight",
        )}
        style={{
          background:
            "radial-gradient(circle 520px at var(--spotlight-x, 50%) var(--spotlight-y, 35%), var(--grid-glow-color), transparent 70%)",
          // when static (reduced-motion) anchor spotlight center-upper
          ...(prefersReducedMotion
            ? { ["--spotlight-x" as string]: "50%", ["--spotlight-y" as string]: "35%" }
            : {}),
        }}
      />

      {/* Secondary accent glow (blue, subtle) - static, for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle 400px at 80% 75%, var(--grid-glow-color-secondary), transparent 65%)",
        }}
      />

      {/* Top + bottom fade to bg so section edges merge with next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
        }}
      />

      {children}
    </div>
  )
}
