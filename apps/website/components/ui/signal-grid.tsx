"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"

interface SignalGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /**
   * Node columns. Auto-responsive if omitted:
   *   desktop (>=768px): 32, mobile: 16
   */
  nodeCountX?: number
  /**
   * Node rows. Auto-responsive if omitted:
   *   desktop (>=768px): 18, mobile: 10
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
 * Motif: "Connection / Signal over Noise" — Nodes + Linien, mini-net
 * Propagation auf Mouse-Move, Radial-Fade-Overlay schützt Text-Readability.
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
 *   - k-NN pre-computed at grid-build (k=4, O(n²) einmalig, dann O(1) lookup)
 *
 * Reduced-Motion:
 *   - `prefers-reduced-motion: reduce` → statischer Grid (keine Breathing,
 *     kein Drift, kein Mouse-Tracking, keine Linien, kein Parallax),
 *     nur Nodes bei baseOpacity
 *
 * Theme-Awareness:
 *   - Nie hardcoded Hex. `--neon-9` (Node-Accent) + `--bg` via
 *     getComputedStyle(document.documentElement). MutationObserver auf
 *     html.class resolved Vars beim Theme-Toggle neu.
 *
 * Interaction-Model (UAT-revised):
 *   - Mini-Net Propagation statt Ring-Falloff: Cursor findet EINEN seed-node
 *     (<100px desktop / <70px mobile). Seed aktiviert graph-neighbors mit
 *     140ms-Hop-Delay, max 2 hops tief, max ~5 nodes gleichzeitig aktiv.
 *   - Activation-Timestamps werden per-node getrackt → decay über 1500ms
 *     unabhängig voneinander → Trails bleiben sichtbar, wenn Cursor weiter-
 *     wandert und neuen Seed findet.
 *   - Idle: jeder Node hat eigene Drift-Phase (±3px X / ±2px Y, 10-18s Periode).
 *   - 3D: jeder Node hat zDepth (0.2-1.0) → Parallax-Offset auf mousemove,
 *     leichte Größen/Opacity-Staffelung, Linien-Alpha nach min(zDepth).
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
      // Base position in CSS-px (grid-slot + seeded jitter)
      baseX: number
      baseY: number
      // Current rendered position (base + drift + parallax) — recomputed per frame
      x: number
      y: number
      baseOpacity: number       // 0.15-0.25, organic variance
      phase: number             // breathing phase offset (0..2π)
      // Drift (idle self-motion)
      driftPhaseX: number       // 0..2π
      driftPhaseY: number
      driftFreqX: number        // rad/s, ~2π/(10..18s)
      driftFreqY: number
      driftAmpX: number         // px, ~3 desktop / ~2 mobile
      driftAmpY: number         // px, ~2 desktop / ~1.5 mobile
      // 3D depth (0.2 = far, 1.0 = near)
      zDepth: number
      // Mini-net: pre-computed k-nearest-neighbor indices (k=4)
      neighbors: number[]
      // Activation timestamp in ms (performance.now). 0 = not active.
      activationStart: number
      // Hop-depth of the last activation (0 = seed, 1-2 = propagated)
      activationDepth: number
    }>
  >([])

  // Grid geometry cache — used by line-threshold + resize logic
  const gridMetricsRef = useRef({ cellW: 0, cellH: 0, cols: 0, rows: 0 })

  // Cursor position in canvas CSS-px coords; active=false means "not over container"
  const cursorRef = useRef({ x: -9999, y: -9999, active: false })

  // Container center (for parallax reference). Recomputed per frame from rect.
  const centerRef = useRef({ x: 0, y: 0 })

  // Track the currently-seeded node index (-1 = none) and when propagation fired
  // so hops fire once per seed-cycle, not every frame.
  const seedRef = useRef<{
    index: number             // -1 = no active seed
    hop1Fired: boolean        // depth-1 neighbors enqueued?
    hop2Fired: boolean        // depth-2 neighbors enqueued?
    seededAt: number          // performance.now() when seed was set
  }>({ index: -1, hop1Fired: false, hop2Fired: false, seededAt: 0 })

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

    // ─── 3. Node-Grid builder (responsive, deterministic jitter, k-NN) ───
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
      const cols = nodeCountX ?? (isMobile ? 16 : 32)
      const rows = nodeCountY ?? (isMobile ? 10 : 18)

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
          // Drift: per-node seeded phase + period (10-18s)
          const driftPhaseX = pseudoRandom(idx * 7 + 13) * Math.PI * 2
          const driftPhaseY = pseudoRandom(idx * 7 + 17) * Math.PI * 2
          const periodX = 10 + pseudoRandom(idx * 11 + 19) * 8 // 10-18s
          const periodY = 10 + pseudoRandom(idx * 11 + 23) * 8
          const driftFreqX = (Math.PI * 2) / periodX
          const driftFreqY = (Math.PI * 2) / periodY
          const driftAmpX = isMobile ? 2 : 3
          const driftAmpY = isMobile ? 1.5 : 2
          // zDepth 0.2..1.0 (seeded)
          const zDepth = 0.2 + pseudoRandom(idx * 13 + 29) * 0.8

          nodes.push({
            baseX: (rx + 1) * cellW + jitterX,
            baseY: (ry + 1) * cellH + jitterY,
            x: 0, // computed in tick
            y: 0,
            baseOpacity,
            phase,
            driftPhaseX,
            driftPhaseY,
            driftFreqX,
            driftFreqY,
            driftAmpX,
            driftAmpY,
            zDepth,
            neighbors: [],
            activationStart: 0,
            activationDepth: 0,
          })
        }
      }

      // ─── k-nearest-neighbor pre-computation (k=4, base positions only) ───
      // Einmalig pro buildGrid — O(n²) über base-positions (drift/parallax sind
      // klein genug um Nachbarschaft nicht zu ändern).
      const k = 4
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!
        const dists: Array<{ idx: number; d: number }> = []
        for (let j = 0; j < nodes.length; j++) {
          if (j === i) continue
          const b = nodes[j]!
          const dx = a.baseX - b.baseX
          const dy = a.baseY - b.baseY
          dists.push({ idx: j, d: dx * dx + dy * dy })
        }
        dists.sort((x, y) => x.d - y.d)
        a.neighbors = dists.slice(0, k).map((e) => e.idx)
      }

      nodesRef.current = nodes
      // Reset seed tracking on rebuild
      seedRef.current = { index: -1, hop1Fired: false, hop2Fired: false, seededAt: 0 }
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
      // Seed clears; existing activations decay naturally via timestamps
      seedRef.current.index = -1
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

    // ─── Constants for mini-net propagation ───
    const HOP_DELAY_MS = 140       // Δt between graph-hops
    const ACTIVATION_MS = 1500     // decay window per node
    const SEED_RADIUS_DESKTOP = 100
    const SEED_RADIUS_MOBILE = 70
    const PARALLAX_FACTOR = 0.04   // mouse-delta × zDepth × factor

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

      centerRef.current.x = width / 2
      centerRef.current.y = height / 2

      ctx.clearRect(0, 0, width, height)

      const reduced = reducedMotionRef.current
      const cursor = cursorRef.current
      const nowSec = t / 1000 // for breathing/drift (seconds)
      const nowMs = t         // for activation timestamps (ms)
      const isMobile = width < 768
      const nodes = nodesRef.current

      // Parallax delta: offset from container center. Zero if reduced or no cursor.
      let mouseDx = 0
      let mouseDy = 0
      if (!reduced && cursor.active) {
        mouseDx = cursor.x - centerRef.current.x
        mouseDy = cursor.y - centerRef.current.y
      }

      // ─── PHASE A: Seed detection & mini-net propagation ─────────────────
      // Find the nearest node to the cursor within SEED_RADIUS. If a new seed
      // is found (or existing seed), enqueue hops at HOP_DELAY intervals.
      // Activations are timestamps → they decay naturally, independent of seed.
      if (!reduced && cursor.active) {
        const seedRadius = isMobile ? SEED_RADIUS_MOBILE : SEED_RADIUS_DESKTOP
        const seedRadiusSq = seedRadius * seedRadius

        // Find closest node within seedRadius (base position — drift is tiny)
        let nearestIdx = -1
        let nearestDSq = seedRadiusSq
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          const dx = n.baseX - cursor.x
          const dy = n.baseY - cursor.y
          const dSq = dx * dx + dy * dy
          if (dSq < nearestDSq) {
            nearestDSq = dSq
            nearestIdx = i
          }
        }

        const seed = seedRef.current
        if (nearestIdx !== -1) {
          // New seed? (different index or first activation) → stamp + reset hops
          if (nearestIdx !== seed.index) {
            seed.index = nearestIdx
            seed.hop1Fired = false
            seed.hop2Fired = false
            seed.seededAt = nowMs
            // Activate seed now (depth 0)
            const n = nodes[nearestIdx]!
            n.activationStart = nowMs
            n.activationDepth = 0
          }

          // Hop 1: after HOP_DELAY_MS, activate seed's 2 nearest neighbors
          if (!seed.hop1Fired && nowMs - seed.seededAt >= HOP_DELAY_MS) {
            const seedNode = nodes[seed.index]!
            const hop1 = seedNode.neighbors.slice(0, 2)
            for (const idx of hop1) {
              const n = nodes[idx]!
              // Only (re)activate if not already fresh — avoid resetting a
              // still-hot node (keeps decay monotonic)
              if (nowMs - n.activationStart > HOP_DELAY_MS) {
                n.activationStart = nowMs
                n.activationDepth = 1
              }
            }
            seed.hop1Fired = true
          }

          // Hop 2: after 2×HOP_DELAY, activate depth-2 neighbors (cap total ~5)
          if (
            !seed.hop2Fired &&
            seed.hop1Fired &&
            nowMs - seed.seededAt >= HOP_DELAY_MS * 2
          ) {
            const seedNode = nodes[seed.index]!
            const hop1 = seedNode.neighbors.slice(0, 2)
            // From each hop-1 node, pick its nearest neighbor that isn't already
            // seed or hop-1 → gives us ~2 fresh nodes (total so far: 1 + 2 + 2 = 5)
            const usedSet = new Set<number>([seed.index, ...hop1])
            for (const h1idx of hop1) {
              const h1 = nodes[h1idx]!
              for (const cand of h1.neighbors) {
                if (!usedSet.has(cand)) {
                  const n = nodes[cand]!
                  if (nowMs - n.activationStart > HOP_DELAY_MS) {
                    n.activationStart = nowMs
                    n.activationDepth = 2
                  }
                  usedSet.add(cand)
                  break // one new per hop-1 node
                }
              }
            }
            seed.hop2Fired = true
          }
        } else {
          // Nothing in range — clear seed, but let decays finish
          seedRef.current.index = -1
        }
      }

      // ─── PHASE B: Per-node update (drift + parallax + activation decay) ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!

        // Drift (idle self-motion)
        let driftX = 0
        let driftY = 0
        if (!reduced) {
          driftX = Math.sin(nowSec * n.driftFreqX + n.driftPhaseX) * n.driftAmpX
          driftY = Math.sin(nowSec * n.driftFreqY + n.driftPhaseY) * n.driftAmpY
        }

        // Parallax (zero if reduced — zDepth effectively 1.0 there anyway)
        const zDepth = reduced ? 1.0 : n.zDepth
        const parallaxX = reduced ? 0 : mouseDx * zDepth * PARALLAX_FACTOR
        const parallaxY = reduced ? 0 : mouseDy * zDepth * PARALLAX_FACTOR

        n.x = n.baseX + driftX + parallaxX
        n.y = n.baseY + driftY + parallaxY
      }

      // ─── PHASE C: Render nodes ────────────────────────────────────────────
      // Idle breathing (skipped under reduced-motion): ±30% around baseOpacity,
      // Periode 4-6s pro Node, stagger via phase-offset → organisch.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!

        // Activation intensity: decays from 1.0 to 0 over ACTIVATION_MS
        let activation = 0
        if (!reduced && n.activationStart > 0) {
          const age = nowMs - n.activationStart
          if (age >= ACTIVATION_MS) {
            // Expired — clear timestamp so we skip future cycles
            n.activationStart = 0
          } else {
            activation = 1 - age / ACTIVATION_MS
          }
        }

        let breathing = 0
        if (!reduced) {
          breathing = Math.sin(nowSec * 1.2 + n.phase) * 0.3 * n.baseOpacity
        }

        const zDepth = reduced ? 1.0 : n.zDepth
        // Far nodes slightly dimmer, near nodes slightly brighter
        const zOpacity = 0.8 + 0.2 * zDepth
        // Far nodes slightly smaller, near nodes slightly larger
        const zRadius = 0.7 + 0.3 * zDepth

        // Activation bumps opacity toward 0.95 and radius ~2×
        const opacity = Math.min(
          1,
          (n.baseOpacity + breathing) * zOpacity + activation * 0.75,
        )
        const baseRadius = isMobile ? 1.1 : 1.4
        const radius = baseRadius * zRadius * (1 + activation * 1.0)

        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${neonRgb.r}, ${neonRgb.g}, ${neonRgb.b}, ${opacity})`
        ctx.fill()
      }

      // ─── PHASE D: Lines between active graph-adjacent nodes ──────────────
      // Only draw if not reduced. Adjacency = index ∈ other.neighbors AND
      // geometric distance ≤ cellDistance*1.5 (filters out wrap-arounds).
      if (!reduced) {
        const lineThreshold = cellDistance * 1.5
        const lineThresholdSq = lineThreshold * lineThreshold
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i]!
          if (a.activationStart === 0) continue
          const aAge = nowMs - a.activationStart
          if (aAge >= ACTIVATION_MS) continue
          const aAct = 1 - aAge / ACTIVATION_MS

          for (const jIdx of a.neighbors) {
            if (jIdx <= i) continue // dedupe pairs
            const b = nodes[jIdx]!
            if (b.activationStart === 0) continue
            const bAge = nowMs - b.activationStart
            if (bAge >= ACTIVATION_MS) continue
            const bAct = 1 - bAge / ACTIVATION_MS

            const dx = a.x - b.x
            const dy = a.y - b.y
            const dSq = dx * dx + dy * dy
            if (dSq > lineThresholdSq) continue

            // Line alpha: min of both activations, scaled by min zDepth (far
            // lines fade). Cap at ~0.55.
            const minZ = Math.min(a.zDepth, b.zDepth)
            const alpha = Math.min(aAct, bAct) * (0.6 + 0.4 * minZ) * 0.7
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
