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
 * SignalGrid — DS-spec Hero background ("Universe"-Pass, Plan 20.5-02).
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
 * Motion-Model (universe-pass):
 *   - Jeder Node hat eine XY-Velocity (vx, vy) in px/s, die langsam zu einem
 *     seeded random Target-Velocity hin-lerpt (~2-3s glatter Richtungswechsel).
 *   - Alle 4-8s (per-node seeded) wird ein neues Target-Velocity (uniform
 *     random angle, magnitude ≤ MAX_SPEED) gewählt → Nodes drift "irgendwohin".
 *   - Zusätzlich hat jeder Node eine Z-Velocity (vz) in depth/sec, die alle
 *     8-14s ein frisches Target bekommt. Nodes driften also auch in der Tiefe,
 *     was das Universum "atmen" lässt. Clamped auf [Z_MIN, Z_MAX].
 *   - Boundary-Bounce mit 10% margin (XY) bzw. reflection (Z).
 *   - deltaTime bei tab-suspend auf 16ms geclampt.
 *
 * Interaction-Model (universe-pass):
 *   - Mini-Net Propagation: Cursor findet EINEN seed-node (<100px desktop /
 *     <70px mobile), aber NUR aus mid/near Band (zDepth ≥ SEED_Z_MIN = 0.3).
 *     Far-Stars sind nicht interaktiv → verstärkt das räumliche Gefühl, dass
 *     der Cursor auf der "near layer" ist.
 *   - Seed aktiviert on-demand 2 nearest neighbors mit 140ms-Hop-Delay, max
 *     2 hops tief, ~5 nodes gleichzeitig aktiv.
 *   - Activation-Pulse: bei Activation-Start speichert sich der Node einen
 *     pulseStart-Timestamp. Erste 300ms rendered er mit scale-bump
 *     (1.0 + 0.6 * (1 - t/300)) → fühlt sich wie "Signal trifft ein".
 *   - Decays: jede Activation über 1500ms unabhängig.
 *
 * Depth-Model (universe-pass) — "3D universe going back":
 *   - zDepth seeded distribution: 0.12..1.0 mit pow(0.7)-Skew → mehr Nodes
 *     im far/mid Band als im near Band → Horizont-Feel.
 *   - 3 Bands rendered mit unterschiedlicher Visual-Sprache:
 *       FAR  (z<0.35): klein, stark desaturated Richtung text-muted, low alpha
 *       MID  (0.35≤z<0.7): normal accent-color, normale radius/opacity
 *       NEAR (z≥0.7): größer, mit Halo (2-Pass: weicher halo + core), full alpha
 *   - Render-Reihenfolge: nodes werden per-frame nach zDepth ASC sortiert,
 *     damit near nodes über far nodes gezeichnet werden (Painter's Algorithm).
 *   - Linien: alpha ∝ min(za, zb) × activation. NEAR-NEAR Linien bekommen
 *     zusätzlich einen shadowBlur-Glow für extra Luminosität.
 *   - Parallax: factor 0.02 (halbiert ggü. v1) × zDepth × mouseDelta
 *     → max ±6px Offset. Subtil, nicht irritierend.
 *
 * Performance-Discipline:
 *   - Single rAF-Loop, ein Canvas-Pass pro Frame
 *   - IntersectionObserver pausiert Loop wenn Container offscreen
 *   - Mouse-Events throttled auf rAF (letzte Position cached, applied nächster Frame)
 *   - Retina/HiDPI: Canvas-Buffer * devicePixelRatio, CSS-Size separat
 *   - Color-Interpolation-Cache: accent + text-muted RGB werden pro Frame EINMAL
 *     aufgelöst (oder on theme change), NICHT im Render-Loop per Node geparst.
 *   - Sort per frame: 576 nodes × Array.sort ≈ 0.3ms
 *
 * Reduced-Motion:
 *   - `prefers-reduced-motion: reduce` → statischer Grid (keine XY-Wander, keine
 *     Z-Drift, kein Breathing, kein Mouse-Tracking, keine Linien, kein Parallax,
 *     keine Activation). Nodes bleiben auf initialen Grid-Positionen, zDepth
 *     bleibt am seeded Wert → Depth-Bänder sichtbar, aber statisch.
 *
 * Theme-Awareness:
 *   - Nie hardcoded Hex. `--accent` (theme-aware: neon in dark, red in light) +
 *     `--text-muted` (theme-aware) + `--bg` via getComputedStyle auf
 *     document.documentElement. MutationObserver auf html.class resolved Vars
 *     beim Theme-Toggle neu → Light/Dark Symmetrie automatisch.
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
      // Stable identity/sort-key: original grid index, used for tie-break in
      // depth-sort so flickering is eliminated when two nodes share zDepth.
      idx: number
      // Initial grid position (used only for reduced-motion static layout)
      initialX: number
      initialY: number
      // Seeded initial zDepth (used under reduced-motion so depth-bands stay
      // visible but static).
      initialZ: number
      // Current position in CSS-px (wander state, authoritative)
      x: number
      y: number
      // Velocity in px/s
      vx: number
      vy: number
      // Target velocity we lerp toward (refreshed every retargetIn seconds)
      targetVx: number
      targetVy: number
      // Time until next target-velocity reroll (seconds)
      retargetIn: number
      baseOpacity: number       // 0.15-0.25, organic variance
      phase: number             // breathing phase offset (0..2π)
      // 3D depth (Z_MIN..1.0) — drifts over time via vz
      zDepth: number
      // Z-velocity (depth per sec) — lerps toward targetVz
      vz: number
      targetVz: number
      retargetZIn: number       // seconds until next vz target reroll
      // Activation timestamp in ms (performance.now). 0 = not active.
      activationStart: number
      // Hop-depth of the last activation (0 = seed, 1-2 = propagated)
      activationDepth: number
      // Pulse-start ms: set = activationStart on activation. Used for the
      // first-300ms scale bump regardless of decay phase.
      pulseStart: number
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
    hop1Indices: number[]     // indices of hop-1 nodes for this seed
  }>({ index: -1, hop1Fired: false, hop2Fired: false, seededAt: 0, hop1Indices: [] })

  // Resolved CSS-var colors + pre-parsed RGB, re-read on theme change.
  // `accent` = theme-aware signal color (neon in dark, red in light).
  // `muted` = theme-aware desaturation target for far-band color-mix.
  const colorsRef = useRef({
    accent: "rgb(206, 255, 50)",
    muted: "rgb(138, 138, 138)",
    bg: "rgb(20, 20, 20)",
    accentRgb: { r: 206, g: 255, b: 50 },
    mutedRgb: { r: 138, g: 138, b: 138 },
  })

  // rAF handle for start/stop during offscreen / unmount
  const rafRef = useRef<number | null>(null)

  // Reduced-motion live flag (queried via media-query listener)
  const reducedMotionRef = useRef(false)

  // Previous frame timestamp in ms — used to compute deltaTime per frame.
  // Null on first tick (no dt yet).
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // ─── 1. Resolve CSS-Var colors once + on theme change ───
    // We read --accent (theme-aware: neon in dark, red in light) as the signal
    // color, and --text-muted (theme-aware) as the desaturation target for the
    // far-band. Falls zurück auf DS-Defaults wenn Vars noch nicht resolved.
    const resolveColors = () => {
      const styles = getComputedStyle(document.documentElement)
      const accent = styles.getPropertyValue("--accent").trim() || "#CEFF32"
      const muted = styles.getPropertyValue("--text-muted").trim() || "#8A8A8A"
      const bg = styles.getPropertyValue("--bg").trim() || "#141414"
      colorsRef.current = {
        accent,
        muted,
        bg,
        accentRgb: parseColorToRgb(accent),
        mutedRgb: parseColorToRgb(muted),
      }
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

    // ─── Depth-Model Constants ──────────────────────────────────────────────
    const Z_MIN = 0.12
    const Z_MAX = 1.0
    const Z_RANGE = Z_MAX - Z_MIN       // 0.88
    const Z_POW = 0.7                   // mild bias toward lower zDepth = more
                                        // far/mid nodes, fewer near nodes →
                                        // "horizon going back" feel.
    const FAR_MAX = 0.35                // z < 0.35 = far band
    const NEAR_MIN = 0.7                // z ≥ 0.7 = near band
    const SEED_Z_MIN = 0.3              // nodes below this can't be activated
    const Z_VEL_MAX = 0.03              // max |vz| in depth/sec
    const Z_LERP_PER_SEC = 0.33         // ~3s to reach target vz
    const PULSE_MS = 300                // activation-pulse duration

    // ─── 3. Node-Grid builder (responsive, deterministic jitter, velocities) ───
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

      // Slow wander bumped up: 18 px/s desktop, 12 px/s mobile (still drifting,
      // but noticeable) — v2 speed-bump per UAT "etwas schneller".
      const maxSpeed = isMobile ? 12 : 18

      const nodes: typeof nodesRef.current = []
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const idx = ry * cols + rx
          // Deterministic jitter (seeded per index) for initial placement
          const jitterX = (pseudoRandom(idx * 2 + 1) - 0.5) * 0.18 * cellW
          const jitterY = (pseudoRandom(idx * 2 + 2) - 0.5) * 0.18 * cellH
          const initialX = (rx + 1) * cellW + jitterX
          const initialY = (ry + 1) * cellH + jitterY
          const baseOpacity = 0.15 + pseudoRandom(idx * 3 + 7) * 0.1 // 0.15-0.25
          const phase = pseudoRandom(idx * 5 + 11) * Math.PI * 2

          // zDepth widened + pow-skewed: more nodes in far/mid band, fewer near
          // → "universe going back" horizon feel.
          const rawZ = pseudoRandom(idx * 13 + 29)
          const zDepth = Z_MIN + Z_RANGE * Math.pow(rawZ, Z_POW)

          // Seed initial target-velocity (random angle, half-speed so first
          // wander ramps up gently)
          const angle0 = pseudoRandom(idx * 17 + 31) * Math.PI * 2
          const speed0 = maxSpeed * (0.3 + pseudoRandom(idx * 19 + 37) * 0.4)
          const targetVx = Math.cos(angle0) * speed0
          const targetVy = Math.sin(angle0) * speed0
          // Stagger first retarget so nodes don't all change direction in sync
          const retargetIn = 4 + pseudoRandom(idx * 23 + 41) * 4 // 4-8s

          // Z-velocity seeded: start with calm target, slower retarget cycle
          const zSign = pseudoRandom(idx * 29 + 47) < 0.5 ? -1 : 1
          const zMag = Z_VEL_MAX * (0.3 + pseudoRandom(idx * 31 + 53) * 0.7)
          const targetVz = zSign * zMag
          const retargetZIn = 8 + pseudoRandom(idx * 37 + 59) * 6 // 8-14s

          nodes.push({
            idx,
            initialX,
            initialY,
            initialZ: zDepth,
            x: initialX,
            y: initialY,
            vx: 0,
            vy: 0,
            targetVx,
            targetVy,
            retargetIn,
            baseOpacity,
            phase,
            zDepth,
            vz: 0,
            targetVz,
            retargetZIn,
            activationStart: 0,
            activationDepth: 0,
            pulseStart: 0,
          })
        }
      }

      nodesRef.current = nodes
      // Reset seed tracking on rebuild
      seedRef.current = {
        index: -1,
        hop1Fired: false,
        hop2Fired: false,
        seededAt: 0,
        hop1Indices: [],
      }
      // Force fresh dt on next tick after rebuild (avoid huge dt jump)
      lastTickRef.current = null
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
      seedRef.current.hop1Indices = []
    }
    container.addEventListener("mousemove", handleMove)
    container.addEventListener("mouseleave", handleLeave)

    // ─── 6. IntersectionObserver — pause loop when offscreen ───
    let inView = true
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true
        if (inView && rafRef.current === null) {
          // Resume — reset last-tick to avoid huge dt after pause
          lastTickRef.current = null
          rafRef.current = requestAnimationFrame(tick)
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    // ─── Interaction/Motion Constants ───
    const HOP_DELAY_MS = 140            // Δt between graph-hops
    const ACTIVATION_MS = 1500          // decay window per node
    const SEED_RADIUS_DESKTOP = 100
    const SEED_RADIUS_MOBILE = 70
    const PARALLAX_FACTOR = 0.02        // halved ggü. v1 — subtiler aber da
    const VELOCITY_LERP_PER_SEC = 0.4   // ~63% toward target after 1s

    // Scratch buffer for the per-frame sort — allocated once, reused to avoid
    // GC pressure. Filled and sorted each frame (576 ints sort ≈ 0.3ms).
    let sortBuf: number[] = []

    // ─── Helper: find 2 nearest nodes to a point, excluding a set of indices ─
    // Used for on-demand mini-net propagation (hop-1 finds 2 from seed, each
    // hop-1 finds 1 fresh from itself). Far-band exclusion is handled at the
    // seed-detection phase only — once a seed is chosen, neighbors can be in
    // any band (gives the net depth-variety for the "3D" look).
    const findTwoNearest = (
      px: number,
      py: number,
      nodes: typeof nodesRef.current,
      exclude: Set<number>,
    ): number[] => {
      let firstIdx = -1
      let firstDSq = Infinity
      let secondIdx = -1
      let secondDSq = Infinity
      for (let i = 0; i < nodes.length; i++) {
        if (exclude.has(i)) continue
        const n = nodes[i]!
        const dx = n.x - px
        const dy = n.y - py
        const dSq = dx * dx + dy * dy
        if (dSq < firstDSq) {
          secondDSq = firstDSq
          secondIdx = firstIdx
          firstDSq = dSq
          firstIdx = i
        } else if (dSq < secondDSq) {
          secondDSq = dSq
          secondIdx = i
        }
      }
      const out: number[] = []
      if (firstIdx !== -1) out.push(firstIdx)
      if (secondIdx !== -1) out.push(secondIdx)
      return out
    }

    // ─── 7. rAF loop ───
    const tick = (t: number) => {
      if (!inView) {
        // Don't re-schedule — IO will resume us
        rafRef.current = null
        return
      }

      // deltaTime in seconds, clamped to 16ms if tab was backgrounded (prevent
      // teleport). 0 on first tick.
      let dtMs = 0
      if (lastTickRef.current !== null) {
        dtMs = t - lastTickRef.current
        if (dtMs > 100) dtMs = 16
      }
      lastTickRef.current = t
      const dt = dtMs / 1000

      const rect = container.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const { cellW, cellH } = gridMetricsRef.current
      const cellDistance = Math.min(cellW, cellH)
      const { accentRgb, mutedRgb } = colorsRef.current

      centerRef.current.x = width / 2
      centerRef.current.y = height / 2

      ctx.clearRect(0, 0, width, height)

      const reduced = reducedMotionRef.current
      const cursor = cursorRef.current
      const nowSec = t / 1000 // for breathing (seconds)
      const nowMs = t         // for activation timestamps (ms)
      const isMobile = width < 768
      const nodes = nodesRef.current
      const maxSpeed = isMobile ? 12 : 18

      // Parallax delta: offset from container center. Zero if reduced or no cursor.
      let mouseDx = 0
      let mouseDy = 0
      if (!reduced && cursor.active) {
        mouseDx = cursor.x - centerRef.current.x
        mouseDy = cursor.y - centerRef.current.y
      }

      // ─── PHASE A: XY Velocity update (target reroll + lerp toward target) ───
      if (!reduced && dt > 0) {
        // Lerp factor bounded to [0,1] to stay stable at any frame rate
        const lerpT = Math.min(1, VELOCITY_LERP_PER_SEC * dt)
        const zLerpT = Math.min(1, Z_LERP_PER_SEC * dt)
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          // XY velocity target reroll
          n.retargetIn -= dt
          if (n.retargetIn <= 0) {
            const angle = Math.random() * Math.PI * 2
            const speed = maxSpeed * (0.4 + Math.random() * 0.6) // 40-100%
            n.targetVx = Math.cos(angle) * speed
            n.targetVy = Math.sin(angle) * speed
            n.retargetIn = 4 + Math.random() * 4 // next reroll 4-8s out
          }
          // Smooth lerp toward target XY-velocity
          n.vx += (n.targetVx - n.vx) * lerpT
          n.vy += (n.targetVy - n.vy) * lerpT

          // Z velocity target reroll (slower cycle than XY → calmer depth drift)
          n.retargetZIn -= dt
          if (n.retargetZIn <= 0) {
            const zSign = Math.random() < 0.5 ? -1 : 1
            const zMag = Z_VEL_MAX * (0.3 + Math.random() * 0.7)
            n.targetVz = zSign * zMag
            n.retargetZIn = 8 + Math.random() * 6 // 8-14s
          }
          // Smooth lerp toward target Z-velocity
          n.vz += (n.targetVz - n.vz) * zLerpT
        }
      }

      // ─── PHASE B: Position update (integrate + soft boundary bounce; +Z) ───
      if (!reduced && dt > 0) {
        const marginX = width * 0.1 // BOUNDARY_MARGIN_FRAC
        const marginY = height * 0.1
        const minX = -marginX
        const maxX = width + marginX
        const minY = -marginY
        const maxY = height + marginY
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          n.x += n.vx * dt
          n.y += n.vy * dt
          // Soft XY bounce: reflect velocity (current + target) and clamp
          if (n.x < minX) {
            n.x = minX
            if (n.vx < 0) n.vx = -n.vx
            if (n.targetVx < 0) n.targetVx = -n.targetVx
          } else if (n.x > maxX) {
            n.x = maxX
            if (n.vx > 0) n.vx = -n.vx
            if (n.targetVx > 0) n.targetVx = -n.targetVx
          }
          if (n.y < minY) {
            n.y = minY
            if (n.vy < 0) n.vy = -n.vy
            if (n.targetVy < 0) n.targetVy = -n.targetVy
          } else if (n.y > maxY) {
            n.y = maxY
            if (n.vy > 0) n.vy = -n.vy
            if (n.targetVy > 0) n.targetVy = -n.targetVy
          }

          // Z integrate + clamp with reflection
          n.zDepth += n.vz * dt
          if (n.zDepth < Z_MIN) {
            n.zDepth = Z_MIN
            n.vz = -n.vz
            n.targetVz = -n.targetVz
          } else if (n.zDepth > Z_MAX) {
            n.zDepth = Z_MAX
            n.vz = -n.vz
            n.targetVz = -n.targetVz
          }
        }
      } else if (reduced) {
        // Static layout under reduced-motion — snap to initial grid positions
        // AND reset zDepth to seeded value (so bands stay visible but static).
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          n.x = n.initialX
          n.y = n.initialY
          n.vx = 0
          n.vy = 0
          n.zDepth = n.initialZ
          n.vz = 0
        }
      }

      // ─── PHASE C: Seed detection & mini-net propagation (on-demand NN) ───
      // Far-band nodes (zDepth < SEED_Z_MIN) are unreachable seeds → cursor
      // only interacts with mid/near layer. Once a seed is chosen, neighbors
      // can come from any band.
      if (!reduced && cursor.active) {
        const seedRadius = isMobile ? SEED_RADIUS_MOBILE : SEED_RADIUS_DESKTOP
        const seedRadiusSq = seedRadius * seedRadius

        let nearestIdx = -1
        let nearestDSq = seedRadiusSq
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          if (n.zDepth < SEED_Z_MIN) continue
          const dx = n.x - cursor.x
          const dy = n.y - cursor.y
          const dSq = dx * dx + dy * dy
          if (dSq < nearestDSq) {
            nearestDSq = dSq
            nearestIdx = i
          }
        }

        const seed = seedRef.current
        if (nearestIdx !== -1) {
          if (nearestIdx !== seed.index) {
            seed.index = nearestIdx
            seed.hop1Fired = false
            seed.hop2Fired = false
            seed.seededAt = nowMs
            seed.hop1Indices = []
            // Activate seed now (depth 0) — pulse starts
            const n = nodes[nearestIdx]!
            n.activationStart = nowMs
            n.activationDepth = 0
            n.pulseStart = nowMs
          }

          if (!seed.hop1Fired && nowMs - seed.seededAt >= HOP_DELAY_MS) {
            const seedNode = nodes[seed.index]!
            const exclude = new Set<number>([seed.index])
            const hop1 = findTwoNearest(seedNode.x, seedNode.y, nodes, exclude)
            for (const idx of hop1) {
              const n = nodes[idx]!
              if (nowMs - n.activationStart > HOP_DELAY_MS) {
                n.activationStart = nowMs
                n.activationDepth = 1
                n.pulseStart = nowMs
              }
            }
            seed.hop1Indices = hop1
            seed.hop1Fired = true
          }

          if (
            !seed.hop2Fired &&
            seed.hop1Fired &&
            nowMs - seed.seededAt >= HOP_DELAY_MS * 2
          ) {
            const usedSet = new Set<number>([seed.index, ...seed.hop1Indices])
            for (const h1idx of seed.hop1Indices) {
              const h1 = nodes[h1idx]!
              const found = findTwoNearest(h1.x, h1.y, nodes, usedSet)
              if (found.length > 0) {
                const cand = found[0]!
                const n = nodes[cand]!
                if (nowMs - n.activationStart > HOP_DELAY_MS) {
                  n.activationStart = nowMs
                  n.activationDepth = 2
                  n.pulseStart = nowMs
                }
                usedSet.add(cand)
              }
            }
            seed.hop2Fired = true
          }
        } else {
          seedRef.current.index = -1
          seedRef.current.hop1Indices = []
        }
      }

      // ─── PHASE D: Sort nodes far→near (painter's algorithm) ─────────────
      // Fill scratch buffer with indices, sort by zDepth ASC so near nodes are
      // drawn on top of far nodes. Tie-break on original idx for stability.
      if (sortBuf.length !== nodes.length) sortBuf = new Array(nodes.length)
      for (let i = 0; i < nodes.length; i++) sortBuf[i] = i
      sortBuf.sort((a, b) => {
        const za = nodes[a]!.zDepth
        const zb = nodes[b]!.zDepth
        if (za !== zb) return za - zb
        return nodes[a]!.idx - nodes[b]!.idx
      })

      // ─── PHASE E: Render nodes (3 depth bands) ──────────────────────────
      // Parallax ist Overlay ohne wander-Einfluss → smooth drift auch bei still
      // stehendem Cursor.
      const baseRadius = isMobile ? 1.1 : 1.4
      for (let s = 0; s < sortBuf.length; s++) {
        const i = sortBuf[s]!
        const n = nodes[i]!

        const zDepth = n.zDepth
        const parallaxX = reduced ? 0 : mouseDx * zDepth * PARALLAX_FACTOR
        const parallaxY = reduced ? 0 : mouseDy * zDepth * PARALLAX_FACTOR
        const rx = n.x + parallaxX
        const ry = n.y + parallaxY

        // Activation intensity: decays from 1.0 to 0 over ACTIVATION_MS
        let activation = 0
        if (!reduced && n.activationStart > 0) {
          const age = nowMs - n.activationStart
          if (age >= ACTIVATION_MS) {
            n.activationStart = 0
          } else {
            activation = 1 - age / ACTIVATION_MS
          }
        }

        // Activation-Pulse: first PULSE_MS after activation, scale bumps by up
        // to +60% → feels like "signal arriving".
        let pulse = 0
        if (!reduced && n.pulseStart > 0) {
          const pulseAge = nowMs - n.pulseStart
          if (pulseAge >= PULSE_MS) {
            n.pulseStart = 0
          } else {
            pulse = 0.6 * (1 - pulseAge / PULSE_MS)
          }
        }

        const breathing = reduced
          ? 0
          : Math.sin(nowSec * 1.2 + n.phase) * 0.3 * n.baseOpacity

        // ─── Band-aware render ─────────────────────────────────────────────
        if (zDepth < FAR_MAX) {
          // FAR band: klein, desaturated toward text-muted, low alpha,
          // kein Halo. Desaturations-Weight: 0 an FAR_MAX (= full accent),
          // max ~0.65 an Z_MIN (= sehr gräulich).
          const tFar = 1 - zDepth / FAR_MAX // 0..1 as zDepth goes FAR_MAX→Z_MIN
          const desaturate = 0.65 * tFar
          const r = Math.round(
            accentRgb.r * (1 - desaturate) + mutedRgb.r * desaturate,
          )
          const g = Math.round(
            accentRgb.g * (1 - desaturate) + mutedRgb.g * desaturate,
          )
          const b = Math.round(
            accentRgb.b * (1 - desaturate) + mutedRgb.b * desaturate,
          )
          const radius = baseRadius * 0.35 * (1 + pulse)
          const opacity = Math.min(
            1,
            (n.baseOpacity + breathing) * 0.35 + activation * 0.5,
          )
          ctx.beginPath()
          ctx.arc(rx, ry, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
          ctx.fill()
        } else if (zDepth < NEAR_MIN) {
          // MID band: full accent color, normale radius/opacity.
          const radius = baseRadius * (0.5 + 0.8 * zDepth) * (1 + pulse)
          const opacity = Math.min(
            1,
            (n.baseOpacity + breathing) * (0.7 + 0.3 * zDepth) +
              activation * 0.75,
          )
          ctx.beginPath()
          ctx.arc(rx, ry, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacity})`
          ctx.fill()
        } else {
          // NEAR band: glow halo + bright core. Two draws, no shadowBlur.
          //   Outer halo: ~2.2× radius, low alpha scaled by (zDepth - 0.5)
          //   Inner core: normal filled circle, full-ish alpha
          const radius = baseRadius * (0.9 + 0.7 * zDepth) * (1 + pulse)
          const haloRadius = radius * 2.2
          const haloAlpha =
            0.18 * (zDepth - 0.5) + activation * 0.25 // brighter when active
          const coreOpacity = Math.min(
            1,
            (n.baseOpacity + breathing) * (0.85 + 0.15 * zDepth) +
              activation * 0.9,
          )
          // Halo (soft outer glow)
          ctx.beginPath()
          ctx.arc(rx, ry, haloRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${Math.max(0, Math.min(1, haloAlpha))})`
          ctx.fill()
          // Core
          ctx.beginPath()
          ctx.arc(rx, ry, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${coreOpacity})`
          ctx.fill()
        }
      }

      // ─── PHASE F: Lines between active nodes (depth-aware + glow) ────────
      // With free wander, pre-computed neighbors are invalid. Iterate over
      // active pairs and draw a line if they're close enough. Threshold
      // stays 2.0× cellDistance to accommodate nodes drifted apart.
      // NEAR-NEAR pairs get shadowBlur for extra luminosity. MID/FAR stay flat.
      if (!reduced) {
        const lineThreshold = cellDistance * 2.0
        const lineThresholdSq = lineThreshold * lineThreshold

        const activeIdxs: number[] = []
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          if (n.activationStart === 0) continue
          if (nowMs - n.activationStart >= ACTIVATION_MS) continue
          activeIdxs.push(i)
        }

        for (let ai = 0; ai < activeIdxs.length; ai++) {
          const aIdx = activeIdxs[ai]!
          const a = nodes[aIdx]!
          const aAct = 1 - (nowMs - a.activationStart) / ACTIVATION_MS
          const aParallaxX = mouseDx * a.zDepth * PARALLAX_FACTOR
          const aParallaxY = mouseDy * a.zDepth * PARALLAX_FACTOR
          const aRx = a.x + aParallaxX
          const aRy = a.y + aParallaxY

          for (let bi = ai + 1; bi < activeIdxs.length; bi++) {
            const bIdx = activeIdxs[bi]!
            const b = nodes[bIdx]!
            const bAct = 1 - (nowMs - b.activationStart) / ACTIVATION_MS
            const bParallaxX = mouseDx * b.zDepth * PARALLAX_FACTOR
            const bParallaxY = mouseDy * b.zDepth * PARALLAX_FACTOR
            const bRx = b.x + bParallaxX
            const bRy = b.y + bParallaxY

            const dx = aRx - bRx
            const dy = aRy - bRy
            const dSq = dx * dx + dy * dy
            if (dSq > lineThresholdSq) continue

            // Depth-aware alpha: far-far lines barely visible, near-near bright.
            const minZ = Math.min(a.zDepth, b.zDepth)
            const alpha = Math.min(aAct, bAct) * (minZ * 0.8 + 0.2) * 0.7
            const bothNear = a.zDepth >= NEAR_MIN && b.zDepth >= NEAR_MIN

            ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha})`
            ctx.lineWidth = bothNear ? 1.2 : 0.8
            if (bothNear) {
              ctx.shadowBlur = 3
              ctx.shadowColor = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.7)`
            } else {
              ctx.shadowBlur = 0
            }
            ctx.beginPath()
            ctx.moveTo(aRx, aRy)
            ctx.lineTo(bRx, bRy)
            ctx.stroke()
          }
        }
        // Reset shadow so it doesn't bleed into the next frame's node pass.
        ctx.shadowBlur = 0
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
