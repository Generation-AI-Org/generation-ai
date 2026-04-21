"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"

interface SignalGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /**
   * Node columns. Auto-responsive if omitted:
   *   desktop (>=768px): 20, mobile: 10
   */
  nodeCountX?: number
  /**
   * Node rows. Auto-responsive if omitted:
   *   desktop (>=768px): 12, mobile: 7
   */
  nodeCountY?: number
  className?: string
}

/**
 * SignalGrid — DS-spec Hero background.
 *
 * Design System: `brand/Generation AI Design System/DESIGN.md` + README.md
 *   §Visual Foundations → Backgrounds.
 *
 * Motif: "Connection / Signal over Noise" — Nodes + Linien, Propagation auf
 * Mouse-Move, Radial-Fade-Overlay schützt Text-Readability.
 *
 * Layers (z-stacked):
 *   z-0   <canvas>            Decorative Nodes + Linien (pointer-events-none)
 *   z-1   <div>               Radial-Fade-Overlay (pointer-events-none)
 *   z-10  <div>{children}     Content (interactive)
 *
 * Mouse ist am Container-Wrapper abgegriffen (onMouseMove/onMouseLeave), damit
 * Children ihre eigenen pointer-events behalten.
 *
 * Performance-Discipline:
 *   - Single rAF-Loop, ein Canvas-Pass pro Frame
 *   - IntersectionObserver pausiert Loop wenn Container offscreen
 *   - Mouse-Events throttled auf rAF (letzte Position cached, applied nächster Frame)
 *   - Retina/HiDPI: Canvas-Buffer * devicePixelRatio, CSS-Size separat
 *
 * Reduced-Motion:
 *   - `prefers-reduced-motion: reduce` → statischer Grid (keine Breathing,
 *     kein Mouse-Tracking, keine Linien), nur Nodes bei baseOpacity
 *
 * Theme-Awareness:
 *   - Nie hardcoded Hex. `--neon-9` (Node-Accent) + `--bg` via
 *     getComputedStyle(document.documentElement). MutationObserver auf
 *     html.class resolved Vars beim Theme-Toggle neu.
 */
export function SignalGrid({
  children,
  nodeCountX,
  nodeCountY,
  className,
  ...props
}: SignalGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ─── Node-Data-Struktur (imperative canvas, kein React-State) ───
  const nodesRef = useRef<
    Array<{
      x: number            // CSS-px relative to canvas
      y: number
      baseOpacity: number  // 0.15-0.25, organic variance
      phase: number        // breathing phase offset (0..2π)
      activation: number   // 0..1 — cursor-driven illumination, lerped per frame
    }>
  >([])

  // Grid geometry cache — used by line-threshold + resize logic
  const gridMetricsRef = useRef({ cellW: 0, cellH: 0, cols: 0, rows: 0 })

  // Cursor position in canvas CSS-px coords; -1 means "not over container"
  const cursorRef = useRef({ x: -9999, y: -9999, active: false })

  // Resolved CSS-var colors, re-read on theme change
  const colorsRef = useRef({ neon: "rgb(206, 255, 50)", bg: "rgb(20, 20, 20)" })

  // rAF handle for start/stop during offscreen / unmount
  const rafRef = useRef<number | null>(null)

  // Reduced-motion live flag (queried via media-query listener)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // ─── 1. Resolve CSS-Var colors once + on theme change ───
    const resolveColors = () => {
      const styles = getComputedStyle(document.documentElement)
      const neon = styles.getPropertyValue("--neon-9").trim() || "#CEFF32"
      const bg = styles.getPropertyValue("--bg").trim() || "#141414"
      colorsRef.current = { neon, bg }
    }
    resolveColors()

    // Theme-Toggle triggers html.class mutation → re-read vars
    const themeObserver = new MutationObserver(resolveColors)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })

    // ─── 2. Reduced-motion listener ───
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = mql.matches
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    mql.addEventListener("change", handleMotionChange)

    // ─── 3. Node-Grid builder (responsive + deterministic jitter per index) ───
    const buildGrid = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // CSS-size
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      // Buffer-size × dpr for crisp Retina
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const isMobile = rect.width < 768
      const cols = nodeCountX ?? (isMobile ? 10 : 20)
      const rows = nodeCountY ?? (isMobile ? 7 : 12)

      const cellW = rect.width / (cols + 1)
      const cellH = rect.height / (rows + 1)
      gridMetricsRef.current = { cellW, cellH, cols, rows }

      const nodes: typeof nodesRef.current = []
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const idx = ry * cols + rx
          // Deterministic jitter (seeded per index) → nodes wackeln nicht bei
          // jedem Render, fühlen sich aber organisch an
          const jitterX = (pseudoRandom(idx * 2 + 1) - 0.5) * 0.18 * cellW
          const jitterY = (pseudoRandom(idx * 2 + 2) - 0.5) * 0.18 * cellH
          const baseOpacity = 0.15 + pseudoRandom(idx * 3 + 7) * 0.1 // 0.15-0.25
          const phase = pseudoRandom(idx * 5 + 11) * Math.PI * 2
          nodes.push({
            x: (rx + 1) * cellW + jitterX,
            y: (ry + 1) * cellH + jitterY,
            baseOpacity,
            phase,
            activation: 0,
          })
        }
      }
      nodesRef.current = nodes
    }
    buildGrid()

    // ─── 4. ResizeObserver — recompute grid on container resize ───
    const ro = new ResizeObserver(buildGrid)
    ro.observe(container)

    // ─── 5. Mouse tracking (throttled via rAF; stored, applied next frame) ───
    const handleMove = (e: MouseEvent) => {
      if (reducedMotionRef.current) return
      const rect = container.getBoundingClientRect()
      cursorRef.current.x = e.clientX - rect.left
      cursorRef.current.y = e.clientY - rect.top
      cursorRef.current.active = true
    }
    const handleLeave = () => {
      cursorRef.current.active = false
    }
    container.addEventListener("mousemove", handleMove)
    container.addEventListener("mouseleave", handleLeave)

    // ─── 6. IntersectionObserver — pause loop when offscreen ───
    let inView = true
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true
        if (inView && rafRef.current === null) {
          // Resume
          rafRef.current = requestAnimationFrame(tick)
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    // ─── 7. rAF loop ───
    const tick = (t: number) => {
      if (!inView) {
        // Don't re-schedule — IO will resume us
        rafRef.current = null
        return
      }

      const rect = container.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const { cellW, cellH } = gridMetricsRef.current
      const cellDistance = Math.min(cellW, cellH)
      const { neon } = colorsRef.current
      const neonRgb = parseColorToRgb(neon)

      ctx.clearRect(0, 0, width, height)

      const reduced = reducedMotionRef.current
      const cursor = cursorRef.current
      const now = t / 1000 // seconds

      // ─── Propagation-Rings (3 layers) ───
      // Cursor-activation rippelt outward. Closer nodes reagieren sofort,
      // äußere Ringe mit Delay → visuelles "Signal läuft durch den Grid".
      //
      //   Ring 1: 0 .. R           → instant, full intensity
      //   Ring 2: R .. 1.5R        → ~80ms delay, 0.6× intensity
      //   Ring 3: 1.5R .. 2R       → ~160ms delay, 0.3× intensity
      //
      // In der aktuellen Frame-basierten Umsetzung: activation-Target per Ring
      // berechnet, dann per-frame Richtung Target gelerpt → natural ripple
      // durch den lerp-Decay.
      const isMobile = width < 768
      const activationRadius = isMobile ? 130 : 180

      const nodes = nodesRef.current
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!

        let target = 0
        if (!reduced && cursor.active) {
          const dx = n.x - cursor.x
          const dy = n.y - cursor.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < activationRadius) {
            // Ring 1 — direct
            target = 1 - dist / activationRadius
          } else if (dist < activationRadius * 1.5) {
            // Ring 2 — mid ripple, half intensity
            target = 0.6 * (1 - (dist - activationRadius) / (activationRadius * 0.5))
          } else if (dist < activationRadius * 2) {
            // Ring 3 — outer ripple, low intensity
            target = 0.3 * (1 - (dist - activationRadius * 1.5) / (activationRadius * 0.5))
          }
        }

        // Lerp activation → target. Slow decay when cursor leaves (~400-600ms)
        // handled by the small lerp-factor on decrease.
        const lerpFactor = target > n.activation ? 0.15 : 0.06
        n.activation += (target - n.activation) * lerpFactor
        if (n.activation < 0.001) n.activation = 0

        // ─── Node-rendering ───
        // Idle breathing (skipped under reduced-motion): ±30% around baseOpacity
        // Periode 4-6s pro Node, stagger via phase-offset → organisch, nicht im Gleichtakt
        let breathing = 0
        if (!reduced) {
          breathing = Math.sin(now * 1.2 + n.phase) * 0.3 * n.baseOpacity
        }

        const opacity = Math.min(
          1,
          n.baseOpacity + breathing + n.activation * 0.7,
        )
        const radius = (isMobile ? 1.5 : 2) * (1 + n.activation * 0.5)

        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${neonRgb.r}, ${neonRgb.g}, ${neonRgb.b}, ${opacity})`
        ctx.fill()
      }

      // ─── Linien zwischen nearest-neighbor illuminated Nodes ───
      // Nur wenn nicht reduced + mindestens ein Node aktiv. Threshold:
      // Nodes < 1.6 × cellDistance auseinander → kandidat.
      if (!reduced) {
        const lineThreshold = cellDistance * 1.6
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i]!
          if (a.activation < 0.15) continue
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j]!
            if (b.activation < 0.15) continue
            const dx = a.x - b.x
            const dy = a.y - b.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > lineThreshold) continue

            const alpha = Math.min(a.activation, b.activation) * 0.6
            ctx.strokeStyle = `rgba(${neonRgb.r}, ${neonRgb.g}, ${neonRgb.b}, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // ─── Cleanup ───
    return () => {
      themeObserver.disconnect()
      mql.removeEventListener("change", handleMotionChange)
      ro.disconnect()
      io.disconnect()
      container.removeEventListener("mousemove", handleMove)
      container.removeEventListener("mouseleave", handleLeave)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [nodeCountX, nodeCountY])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* z-0 — Canvas: decorative nodes + lines, never intercepts clicks */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      />
      {/* z-1 — Radial-Fade-Overlay: protects centered text-readability.
          Ellipse weil Hero quer-format ist. `var(--bg)` ist theme-aware. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 45%, var(--bg) 95%)",
        }}
      />
      {/* z-10 — Content, clickable */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default SignalGrid

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Deterministic pseudo-random (0..1) from integer seed — lets us jitter node
 * positions without React re-render jitter. Not cryptographic; just stable.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Parse a CSS color string (hex or rgb/rgba) to {r,g,b}. Falls back to neon
 * brand color on parse failure so we never crash.
 */
function parseColorToRgb(color: string): { r: number; g: number; b: number } {
  const trimmed = color.trim()

  // #RRGGBB or #RGB
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1)
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("")
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b }
      }
    }
  }

  // rgb(r,g,b) / rgba(r,g,b,a)
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    }
  }

  // Fallback — DS neon
  return { r: 206, g: 255, b: 50 }
}
