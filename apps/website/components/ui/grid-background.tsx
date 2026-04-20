"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"
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
 *   - Layer 2: radial "spotlight" glow that follows the cursor on desktop
 *     (~300 ms soft-delay via CSS transition on --spotlight-x/y) and falls
 *     back to the autonomous slow-loop keyframe when the mouse leaves or on
 *     touch/hover-less devices. Respects prefers-reduced-motion: spotlight
 *     pinned to center-upper, no cursor tracking, no loop.
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
  const containerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  // Track whether the cursor is currently over the container so we can
  // toggle the autonomous animation off/on smoothly.
  const trackingRef = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion) return
    const container = containerRef.current
    const spotlight = spotlightRef.current
    if (!container || !spotlight) return

    // Skip cursor tracking on touch / hover-less devices — keyframe loop
    // continues to play in that case (class stays on, see JSX below).
    const supportsHover = window.matchMedia("(hover: hover)").matches
    if (!supportsHover) return

    let rafId: number | null = null
    let pendingX = 50
    let pendingY = 35

    const flush = () => {
      rafId = null
      spotlight.style.setProperty("--spotlight-x", `${pendingX}%`)
      spotlight.style.setProperty("--spotlight-y", `${pendingY}%`)
    }

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      pendingX = ((e.clientX - rect.left) / rect.width) * 100
      pendingY = ((e.clientY - rect.top) / rect.height) * 100
      if (rafId === null) rafId = requestAnimationFrame(flush)
    }

    const handleEnter = () => {
      trackingRef.current = true
      // Switch off the autonomous loop while cursor drives the spotlight
      // and enable the soft-delay transition on the CSS custom props.
      spotlight.classList.remove("animate-grid-spotlight")
      spotlight.classList.add("grid-spotlight-tracking")
    }

    const handleLeave = () => {
      trackingRef.current = false
      // Hand control back to the autonomous keyframe loop.
      spotlight.classList.remove("grid-spotlight-tracking")
      spotlight.classList.add("animate-grid-spotlight")
    }

    container.addEventListener("mousemove", handleMove)
    container.addEventListener("mouseenter", handleEnter)
    container.addEventListener("mouseleave", handleLeave)

    return () => {
      container.removeEventListener("mousemove", handleMove)
      container.removeEventListener("mouseenter", handleEnter)
      container.removeEventListener("mouseleave", handleLeave)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [prefersReducedMotion])

  return (
    <div
      ref={containerRef}
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

      {/* Spotlight glow — follows cursor on hover-capable devices, falls back
          to the slow-drift keyframe loop otherwise. pointer-events-none so the
          grid stays purely decorative and children remain clickable. */}
      <div
        ref={spotlightRef}
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
