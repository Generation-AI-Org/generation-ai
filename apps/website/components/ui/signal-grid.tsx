"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"

interface SignalGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /**
   * Node columns. Auto-responsive if omitted:
   *   desktop (>=768px): 34, mobile: 18
   */
  nodeCountX?: number
  /**
   * Node rows. Auto-responsive if omitted:
   *   desktop (>=768px): 19, mobile: 11
   */
  nodeCountY?: number
  className?: string
}

/**
 * SignalGrid — DS-spec Hero background (Plan 20.5-02, true-3D pass).
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
 * 3D-Model — "Volume-through-rotation" (research 20.5-DEPTH-RESEARCH.md):
 *   - Jeder Node lebt in echtem 3D-Worldspace (x, y, z), Origin = Cloud-Center.
 *     Cloud-Dimensionen: W = containerWidth, H = containerHeight, D = 0.75 × W.
 *   - Pro Frame: gesamte Wolke wird langsam um Y- (75s/Umdrehung) und X-Achse
 *     (130s/Umdrehung) rotiert. Kein Z-Roll (würde schwindelig machen).
 *   - Danach Pinhole-Perspective-Projektion: scale = FOV / (z - CAMERA_Z), mit
 *     FOV = 800, CAMERA_Z = -500. Vanishing Point zentriert (containerCenter).
 *   - `scale` treibt Render-Size (radius × scale) und Alpha-Faktor → Near-Nodes
 *     sind größer und leuchtender als Far-Nodes, aber honest-geometrisch,
 *     nicht als Skalar simuliert.
 *   - Kinetic Depth Effect: durch die gemeinsame Rotation schalten Hirne nach
 *     ~5-10s automatisch auf "3D-Volumen" — Nodes gleiten sichtbar voreinander
 *     her, occlusion flippt wenn sie sich überkreuzen.
 *
 * Motion-Model:
 *   - Jeder Node hat 3D-Velocity (vx, vy, vz) in worldspace-units/s, die
 *     langsam zu seeded random Target-Velocity hin-lerpen. Retarget alle 4-8s.
 *   - Position wird in Worldspace integriert, mit weicher Reflection an den
 *     Volumen-Grenzen (±W/2, ±H/2, ±D/2).
 *   - Wander-Speed skaliert mit projected scale → Near-Nodes wandern schneller,
 *     Far-Nodes langsamer (differential motion parallax).
 *   - Parallax: entfernt. Cursor bewegt den Hintergrund NICHT mehr mit.
 *
 * Interaction-Model:
 *   - Cursor findet den nearest Node in 2D-Screenspace (<60px desktop /
 *     <40px mobile), aber NUR aus der "Front-Half" des Volumens (rotiertes
 *     z < 0, also näher als Cloud-Center). Far-Nodes sind nicht interaktiv →
 *     Cursor fühlt sich "auf der near plane" an. Kleine Hitbox bewusst —
 *     die Kette wird durch Hop-Propagation in die Tiefe getragen, nicht durch
 *     einen breiten Cursor-Radius.
 *   - Nearest-Neighbor-Queries für Hop-Propagation laufen in 2D-Screenspace
 *     (projected sx, sy der Nodes nach Rotation+Projection). So bleibt die
 *     Kette visuell kohärent: kurze Linien auf dem Screen, auch wenn die
 *     3D-Worldspace-Distanz variiert. Kein "Chain wandert in den Hintergrund".
 *   - Seed aktiviert 2 nearest neighbors (hop-1 @ +120ms), dann je 1 weiterer
 *     pro hop-1 (hop-2 @ +240ms). Max 2 hops tief, max 5 aktive Nodes pro
 *     Kette. Ripple-Geschwindigkeit (120ms pro Level) lässt die Kette
 *     spürbar aber sichtbar cascaden — nicht instant.
 *   - Activation-Pulse: 300ms scale-bump, keine Halos.
 *   - Activation-Decay: 2800ms.
 *
 * Color-System (two colors):
 *   - Idle Nodes (activation < 0.05): rendern in `--text` (white dark / dark light).
 *   - Activated Nodes: lerpen von `--text` → `--accent` (neon-9 dark / red-9 light)
 *     proportional zu Activation-Intensity (threshold 0.05, ramp ×1.2).
 *   - Linien existieren nur zwischen aktiven Nodes → immer `--accent` gestroked.
 *   - Sanfte Color-Transition wenn Activation über 2800ms abklingt (neon → white).
 *
 * Line-Rendering:
 *   - Linien zwischen aktiven Nodes werden als `createLinearGradient` gestroked:
 *     Alpha fadet entlang der Strecke von Endpoint-A's scale-alpha zu
 *     Endpoint-B's scale-alpha → Depth-Cue entlang der Linien-Länge.
 *   - Farbe: `--accent` an beiden Endpunkten (nur Alpha variiert).
 *   - lineWidth basiert auf minimaler projected scale der Endpoints.
 *   - Keine shadowBlur, keine Halos — Farbe ist das einzige Activation-Signal.
 *
 * Performance-Discipline:
 *   - Single rAF-Loop, ein Canvas-Pass pro Frame.
 *   - rotY/rotX cos/sin werden EINMAL pro Frame gecached (nicht pro Node).
 *   - Pro Frame pro Node: rotate → project → sort → render = ~6 Mul + 1 Div.
 *   - IntersectionObserver pausiert Loop wenn Container offscreen.
 *   - Retina/HiDPI: Canvas-Buffer × devicePixelRatio.
 *   - Sort per frame: 286 nodes × Array.sort ≈ 0.15ms.
 *
 * Reduced-Motion:
 *   - `prefers-reduced-motion: reduce` → statische 3D-Cloud (keine Rotation,
 *     kein Wander, kein Breathing, keine Activation, keine Linien). Nodes
 *     bleiben an seeded 3D-Positionen → Depth via size+alpha bleibt sichtbar,
 *     aber eingefroren.
 *
 * Theme-Awareness:
 *   - `--text` als Idle-Node-Farbe (theme-aware: near-white dark / near-black light).
 *   - `--accent` als Activation-Farbe (theme-aware: neon-9 dark / red-9 light).
 *     Beide Vars via getComputedStyle auf document.documentElement; MutationObserver
 *     auf html.class resolved beide Vars beim Theme-Toggle neu.
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
  // Jeder Node hat echte 3D-Position (x,y,z) in cloud-local space, Origin =
  // Cloud-Center. Initial-Positionen werden unter reduced-motion gehalten
  // (damit Depth sichtbar bleibt, aber statisch).
  const nodesRef = useRef<
    Array<{
      idx: number
      // Stable 3D initial position (used under reduced-motion to snap back)
      x0: number
      y0: number
      z0: number
      // Live 3D position (worldspace, cloud-local)
      x: number
      y: number
      z: number
      // 3D velocity in worldspace-units/s
      vx: number
      vy: number
      vz: number
      // Target velocities we lerp toward
      targetVx: number
      targetVy: number
      targetVz: number
      retargetIn: number
      baseOpacity: number       // 0.38-0.52, organic variance
      phase: number             // breathing phase offset (0..2π)
      sizeVar: number           // 0.7-1.3 per-node seeded size variance
      // Activation timestamp in ms (performance.now). 0 = not active.
      activationStart: number
      activationDepth: number
      pulseStart: number
      // ─── Scratch — refilled per frame, read in downstream phases ───
      // After rotate+project: screen-space + scale factor for render & NN.
      screenX: number
      screenY: number
      scale: number
      // Rotated worldspace z (before projection) — used for painter sort
      // and front-half filter (z < 0 ≈ near-half).
      zRot: number
    }>
  >([])

  // Cursor position in canvas CSS-px coords; active=false means "not over container"
  const cursorRef = useRef({ x: -9999, y: -9999, active: false })

  // Track the currently-seeded node index (-1 = none) and when propagation fired.
  // hop1 indices carried between phases so hop-2 propagates from hop-1 nodes
  // (screen-space NN).
  const seedRef = useRef<{
    index: number
    hop1Fired: boolean
    hop2Fired: boolean
    seededAt: number
    hop1Indices: number[]
  }>({
    index: -1,
    hop1Fired: false,
    hop2Fired: false,
    seededAt: 0,
    hop1Indices: [],
  })

  // Resolved CSS-var color + pre-parsed RGB, re-read on theme change.
  // textRgb drives idle (unactivated) nodes — white in dark / dark in light.
  // accentRgb drives activated nodes + lines — neon-9 in dark / red-9 in light.
  const colorsRef = useRef({
    node: "rgb(246, 246, 246)",
    bg: "rgb(20, 20, 20)",
    accent: "rgb(0, 229, 255)",
    textRgb: { r: 246, g: 246, b: 246 },
    accentRgb: { r: 0, g: 229, b: 255 },
  })

  // rAF handle for start/stop during offscreen / unmount
  const rafRef = useRef<number | null>(null)

  // Reduced-motion live flag (queried via media-query listener)
  const reducedMotionRef = useRef(false)

  // Previous frame timestamp in ms — used to compute deltaTime per frame.
  const lastTickRef = useRef<number | null>(null)

  // Accumulated rotation angles (rad). Updated each frame, never reset.
  const rotRef = useRef({ y: 0, x: 0 })

  // Cloud volume dims + viewport center — refreshed on buildGrid/resize.
  const volumeRef = useRef({ W: 0, H: 0, D: 0, vpX: 0, vpY: 0 })

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // ─── 1. Resolve CSS-Var colors once + on theme change ───
    // Two-color system: text for idle nodes, accent (neon/red) for activated.
    const resolveColors = () => {
      const styles = getComputedStyle(document.documentElement)
      const node = styles.getPropertyValue("--text").trim() || "#F6F6F6"
      const bg = styles.getPropertyValue("--bg").trim() || "#141414"
      const accent = styles.getPropertyValue("--accent").trim() || "#00E5FF"
      colorsRef.current = {
        node,
        bg,
        accent,
        textRgb: parseColorToRgb(node),
        accentRgb: parseColorToRgb(accent),
      }
    }
    resolveColors()

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

    // ─── 3D Projection Constants ─────────────────────────────────────────────
    const FOV = 800
    const CAMERA_Z = -500
    // Cap projection scale so near-camera nodes can't explode into huge blobs.
    // scale = FOV / relZ → clamping relZ from below clamps scale from above.
    // MAX_PROJECTION_SCALE = 3.0 → MIN_REL_Z = FOV/3.0 ≈ 267. Nodes still MOVE
    // in full 3D (wander/rotation unaffected, sort still uses real zRot); only
    // the visual projection is capped. Raised from 2.2 to restore 3D feel —
    // let near-camera nodes grow meaningfully to sell the perspective.
    const MAX_PROJECTION_SCALE = 3.0
    const MIN_REL_Z = FOV / MAX_PROJECTION_SCALE
    // Rotation speeds: research-recommended sweet spot. No Z-roll.
    // Slowed (UAT): Luca wanted less horizontal "zischen" — calmer drift, KDE
    // still kicks in. Y 120s→200s, X 200s→260s.
    const ROT_SPEED_Y = (2 * Math.PI) / 200_000 // 200s per full Y rotation (ms)
    const ROT_SPEED_X = (2 * Math.PI) / 260_000 // 260s per full X rotation (ms)
    const PULSE_MS = 300

    // ─── 3. Node-Grid builder (responsive, deterministic jitter, 3D velocities) ───
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
      // UAT: +~25% density so chain propagation can reach more neighbors fast.
      // Desktop 30×17 (510) → 34×19 (646); mobile 16×10 (160) → 18×11 (198).
      const cols = nodeCountX ?? (isMobile ? 18 : 34)
      const rows = nodeCountY ?? (isMobile ? 11 : 19)

      // Cloud volume dimensions in worldspace units (1 unit = 1 CSS-px).
      // Depth = 0.75 × width → deeper cloud, stronger "vorne/hinten" range.
      const W = rect.width
      const H = rect.height
      const D = rect.width * 0.75
      const vpX = W / 2
      const vpY = H / 2
      volumeRef.current = { W, H, D, vpX, vpY }

      // Grid cell size — sets the structured-but-jittered XY layout.
      const cellW = W / (cols + 1)
      const cellH = H / (rows + 1)

      // Calm wander: 12 units/s desktop, 8 units/s mobile (3D magnitude cap).
      // Lowered from 18/12 → smoother continuous rotation read, less twitch.
      const maxSpeed = isMobile ? 8 : 12

      const reducedInit = reducedMotionRef.current
      const nodes: typeof nodesRef.current = []
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const idx = ry * cols + rx
          // Deterministic XY jitter (seeded per index), widened ±42% so nodes
          // break the lattice on first paint.
          const jitterX = (pseudoRandom(idx * 2 + 1) - 0.5) * 0.84 * cellW
          const jitterY = (pseudoRandom(idx * 2 + 2) - 0.5) * 0.84 * cellH
          // World-space XY: centered at cloud origin (0, 0)
          const gridX = (rx + 1) * cellW - vpX + jitterX
          const gridY = (ry + 1) * cellH - vpY + jitterY
          // Z seeded uniform in full volume depth [-D/2, +D/2]
          const zNorm = pseudoRandom(idx * 13 + 29) // 0..1
          const z0 = (zNorm - 0.5) * D

          const baseOpacity = 0.38 + pseudoRandom(idx * 3 + 7) * 0.14
          const phase = pseudoRandom(idx * 5 + 11) * Math.PI * 2
          const sizeVar = 0.7 + pseudoRandom(idx * 41 + 61) * 0.6 // 0.7..1.3

          // Seeded initial 3D target-velocity — random direction in 3D.
          // Use spherical-ish sampling (not perfectly uniform but visually fine).
          const theta = pseudoRandom(idx * 17 + 31) * Math.PI * 2
          const phiCos = pseudoRandom(idx * 19 + 37) * 2 - 1 // -1..1
          const phiSin = Math.sqrt(Math.max(0, 1 - phiCos * phiCos))
          const speed0 = maxSpeed * (0.3 + pseudoRandom(idx * 23 + 41) * 0.4)
          const tvx = Math.cos(theta) * phiSin * speed0
          const tvy = Math.sin(theta) * phiSin * speed0
          const tvz = phiCos * speed0
          // Stagger first retarget across [0, 4-8s]
          const retargetIn = pseudoRandom(idx * 29 + 47) * 8

          const startVx = reducedInit ? 0 : tvx
          const startVy = reducedInit ? 0 : tvy
          const startVz = reducedInit ? 0 : tvz

          nodes.push({
            idx,
            x0: gridX,
            y0: gridY,
            z0,
            x: gridX,
            y: gridY,
            z: z0,
            vx: startVx,
            vy: startVy,
            vz: startVz,
            targetVx: tvx,
            targetVy: tvy,
            targetVz: tvz,
            retargetIn,
            baseOpacity,
            phase,
            sizeVar,
            activationStart: 0,
            activationDepth: 0,
            pulseStart: 0,
            screenX: 0,
            screenY: 0,
            scale: 1,
            zRot: z0,
          })
        }
      }

      nodesRef.current = nodes
      seedRef.current = {
        index: -1,
        hop1Fired: false,
        hop2Fired: false,
        seededAt: 0,
        hop1Indices: [],
      }
      lastTickRef.current = null
    }
    buildGrid()

    // ─── 4. ResizeObserver — recompute grid on container resize ───
    const ro = new ResizeObserver(buildGrid)
    ro.observe(container)

    // ─── 5. Mouse tracking (cursor drives seed only; no parallax) ───
    const handleMove = (e: MouseEvent) => {
      if (reducedMotionRef.current) return
      const rect = container.getBoundingClientRect()
      cursorRef.current.x = e.clientX - rect.left
      cursorRef.current.y = e.clientY - rect.top
      cursorRef.current.active = true
    }
    const handleLeave = () => {
      cursorRef.current.active = false
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
          lastTickRef.current = null
          rafRef.current = requestAnimationFrame(tick)
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    // ─── Interaction/Motion Constants ───
    // UAT tuning: 2-hop cascade at 120/240 ms → ripple feels spürbar aber
    // visibly cascading, not instant. Seed radius tightened (desktop 100→60,
    // mobile 70→40) so only nodes really near the cursor become seeds —
    // propagation chain now carries the signal outward in screen-space
    // instead of activating whole cursor neighborhood.
    const HOP1_DELAY_MS = 120
    const HOP2_DELAY_MS = 240
    const HOP_RETRIGGER_GUARD_MS = 120 // min spacing before re-activating a node
    const ACTIVATION_MS = 2800
    const SEED_RADIUS_DESKTOP = 60
    const SEED_RADIUS_MOBILE = 40
    const VELOCITY_LERP_PER_SEC = 0.4

    // Scratch buffer for the per-frame painter sort
    let sortBuf: number[] = []

    // ─── Helpers: hybrid NN — one SCREEN-buddy + one WORLDSPACE-buddy per hop ──
    // Rationale (UAT): pure screen-NN kept chains on the near-plane and never
    // reached into the back cloud. We now propagate to BOTH:
    //   - screen-nearest → visual coherence (short on-screen line)
    //   - 3D-world-nearest → depth reach (pulls chain into z-volume)
    // Chain size stays ≤5 (seed + 2 hop-1 + 2 hop-2); just the spread is
    // balanced. If both helpers return the same idx (overlap), caller dedupes.
    //
    // Screen-buddy uses cached `screenX`/`screenY` (refreshed each frame in
    // PHASE C). Depth-buddy uses raw worldspace (x, y, z) — pre-rotation, since
    // we want the *intrinsic* 3D neighborhood, not the momentarily-projected
    // one. That keeps depth-buddies stable across rotation frames.
    const findOneNearestScreen = (
      sx: number,
      sy: number,
      nodes: typeof nodesRef.current,
      exclude: Set<number>,
    ): number | null => {
      let bestIdx = -1
      let bestDSq = Infinity
      for (let i = 0; i < nodes.length; i++) {
        if (exclude.has(i)) continue
        const n = nodes[i]!
        const dx = n.screenX - sx
        const dy = n.screenY - sy
        const dSq = dx * dx + dy * dy
        if (dSq < bestDSq) {
          bestDSq = dSq
          bestIdx = i
        }
      }
      return bestIdx === -1 ? null : bestIdx
    }

    const findOneNearestWorld = (
      wx: number,
      wy: number,
      wz: number,
      nodes: typeof nodesRef.current,
      exclude: Set<number>,
    ): number | null => {
      let bestIdx = -1
      let bestDSq = Infinity
      for (let i = 0; i < nodes.length; i++) {
        if (exclude.has(i)) continue
        const n = nodes[i]!
        const dx = n.x - wx
        const dy = n.y - wy
        const dz = n.z - wz
        const dSq = dx * dx + dy * dy + dz * dz
        if (dSq < bestDSq) {
          bestDSq = dSq
          bestIdx = i
        }
      }
      return bestIdx === -1 ? null : bestIdx
    }

    // ─── 7. rAF loop ───
    const tick = (t: number) => {
      if (!inView) {
        rafRef.current = null
        return
      }

      // deltaTime in ms, clamped to 16ms if tab was backgrounded. 0 on first tick.
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
      const { W, H, D, vpX, vpY } = volumeRef.current
      const { textRgb, accentRgb } = colorsRef.current

      ctx.clearRect(0, 0, width, height)

      const reduced = reducedMotionRef.current
      const cursor = cursorRef.current
      const nowSec = t / 1000
      const nowMs = t
      const isMobile = width < 768
      const nodes = nodesRef.current
      const maxSpeed = isMobile ? 8 : 12

      // ─── PHASE A: Global rotation accumulate ──────────────────────────────
      if (!reduced) {
        rotRef.current.y = (rotRef.current.y + ROT_SPEED_Y * dtMs) % (Math.PI * 2)
        rotRef.current.x = (rotRef.current.x + ROT_SPEED_X * dtMs) % (Math.PI * 2)
      }
      const cosY = Math.cos(rotRef.current.y)
      const sinY = Math.sin(rotRef.current.y)
      const cosX = Math.cos(rotRef.current.x)
      const sinX = Math.sin(rotRef.current.x)

      // ─── PHASE B: 3D velocity update + 3D position integration ─────────────
      if (!reduced && dt > 0) {
        const lerpT = Math.min(1, VELOCITY_LERP_PER_SEC * dt)
        const halfW = W / 2
        const halfH = H / 2
        const halfD = D / 2

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!

          // Retarget 3D velocity
          n.retargetIn -= dt
          if (n.retargetIn <= 0) {
            const theta = Math.random() * Math.PI * 2
            const phiCos = Math.random() * 2 - 1
            const phiSin = Math.sqrt(Math.max(0, 1 - phiCos * phiCos))
            const speed = maxSpeed * (0.4 + Math.random() * 0.6)
            n.targetVx = Math.cos(theta) * phiSin * speed
            n.targetVy = Math.sin(theta) * phiSin * speed
            n.targetVz = phiCos * speed
            n.retargetIn = 4 + Math.random() * 4
          }
          // Lerp current toward target
          n.vx += (n.targetVx - n.vx) * lerpT
          n.vy += (n.targetVy - n.vy) * lerpT
          n.vz += (n.targetVz - n.vz) * lerpT

          // Integrate position
          n.x += n.vx * dt
          n.y += n.vy * dt
          n.z += n.vz * dt

          // Soft reflection at volume boundaries
          if (n.x < -halfW) {
            n.x = -halfW
            if (n.vx < 0) n.vx = -n.vx
            if (n.targetVx < 0) n.targetVx = -n.targetVx
          } else if (n.x > halfW) {
            n.x = halfW
            if (n.vx > 0) n.vx = -n.vx
            if (n.targetVx > 0) n.targetVx = -n.targetVx
          }
          if (n.y < -halfH) {
            n.y = -halfH
            if (n.vy < 0) n.vy = -n.vy
            if (n.targetVy < 0) n.targetVy = -n.targetVy
          } else if (n.y > halfH) {
            n.y = halfH
            if (n.vy > 0) n.vy = -n.vy
            if (n.targetVy > 0) n.targetVy = -n.targetVy
          }
          if (n.z < -halfD) {
            n.z = -halfD
            if (n.vz < 0) n.vz = -n.vz
            if (n.targetVz < 0) n.targetVz = -n.targetVz
          } else if (n.z > halfD) {
            n.z = halfD
            if (n.vz > 0) n.vz = -n.vz
            if (n.targetVz > 0) n.targetVz = -n.targetVz
          }
        }
      } else {
        // Reduced-motion: snap all nodes back to seeded 3D origin
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          n.x = n.x0
          n.y = n.y0
          n.z = n.z0
          n.vx = 0
          n.vy = 0
          n.vz = 0
        }
      }

      // ─── PHASE C: Rotate + project each node → screen-space + scale ────────
      // Rotate around Y first (affects x+z), then X (affects y+z').
      // Pre-computed cosY/sinY/cosX/sinX per frame — no per-node trig.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        // Y-rotation
        const x1 = n.x * cosY + n.z * sinY
        const z1 = -n.x * sinY + n.z * cosY
        const y1 = n.y
        // X-rotation
        const y2 = y1 * cosX - z1 * sinX
        const z2 = y1 * sinX + z1 * cosX
        const x2 = x1
        // Perspective projection
        // Clamp relZ from below → scale from above (MAX_PROJECTION_SCALE).
        // Real zRot is preserved separately for painter sort + front-half NN,
        // so depth semantics stay intact; only the projected size is capped.
        const relZ = Math.max(z2 - CAMERA_Z, MIN_REL_Z)
        const scale = FOV / relZ
        n.screenX = x2 * scale + vpX
        n.screenY = y2 * scale + vpY
        n.scale = scale
        n.zRot = z2
      }

      // ─── PHASE D: Seed detection (2D screen-space, front-half only) ────────
      // Cursor finds nearest projected point, but only among nodes in front
      // half of the cloud (zRot < 0). Keeps activation on the near plane.
      if (!reduced && cursor.active) {
        const seedRadius = isMobile ? SEED_RADIUS_MOBILE : SEED_RADIUS_DESKTOP
        const seedRadiusSq = seedRadius * seedRadius

        let nearestIdx = -1
        let nearestDSq = seedRadiusSq
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          if (n.zRot >= 0) continue // front-half only (near the camera)
          const dx = n.screenX - cursor.x
          const dy = n.screenY - cursor.y
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
            const n = nodes[nearestIdx]!
            n.activationStart = nowMs
            n.activationDepth = 0
            n.pulseStart = nowMs
          }

          // Hop-1: 1 screen-buddy + 1 depth-buddy (hybrid NN).
          // Screen-buddy = visual coherence on-plane. Depth-buddy = pulls the
          // chain into z-volume, so back-cloud nodes actually get connections.
          if (!seed.hop1Fired && nowMs - seed.seededAt >= HOP1_DELAY_MS) {
            const seedNode = nodes[seed.index]!
            const exclude = new Set<number>([seed.index])
            const screenBuddy = findOneNearestScreen(
              seedNode.screenX,
              seedNode.screenY,
              nodes,
              exclude,
            )
            if (screenBuddy !== null) exclude.add(screenBuddy)
            const depthBuddy = findOneNearestWorld(
              seedNode.x,
              seedNode.y,
              seedNode.z,
              nodes,
              exclude,
            )
            const hop1: number[] = []
            if (screenBuddy !== null) hop1.push(screenBuddy)
            if (depthBuddy !== null && depthBuddy !== screenBuddy) {
              hop1.push(depthBuddy)
            }
            for (const idx of hop1) {
              const n = nodes[idx]!
              if (nowMs - n.activationStart > HOP_RETRIGGER_GUARD_MS) {
                n.activationStart = nowMs
                n.activationDepth = 1
                n.pulseStart = nowMs
              }
            }
            seed.hop1Indices = hop1
            seed.hop1Fired = true
          }

          // Hop-2: deterministic split — the "front-most" hop-1 node (smaller
          // zRot after rotation ≈ closer to camera) propagates via screen-NN
          // to stay visible; the "deeper" hop-1 node propagates via world-NN
          // to reach further into the back cloud. Natural division of labor:
          // near nodes stay on-plane, deep nodes pull depth further.
          if (
            !seed.hop2Fired &&
            seed.hop1Fired &&
            nowMs - seed.seededAt >= HOP2_DELAY_MS
          ) {
            const usedSet = new Set<number>([seed.index, ...seed.hop1Indices])

            // Sort hop-1 by zRot ASC → index 0 is front-most (most negative z),
            // last is deepest. Works for 1- or 2-element arrays.
            const h1Sorted = [...seed.hop1Indices].sort(
              (a, b) => nodes[a]!.zRot - nodes[b]!.zRot,
            )

            for (let i = 0; i < h1Sorted.length; i++) {
              const h1idx = h1Sorted[i]!
              const h1 = nodes[h1idx]!
              // Front hop-1 → screen-NN; deeper hop-1 → world-NN.
              // If only one hop-1 exists, treat it as the front one.
              const useWorld = i === h1Sorted.length - 1 && h1Sorted.length > 1
              const cand = useWorld
                ? findOneNearestWorld(h1.x, h1.y, h1.z, nodes, usedSet)
                : findOneNearestScreen(h1.screenX, h1.screenY, nodes, usedSet)
              if (cand !== null) {
                const n = nodes[cand]!
                if (nowMs - n.activationStart > HOP_RETRIGGER_GUARD_MS) {
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

      // ─── PHASE E: Painter sort by projected zRot DESC (far drawn first) ────
      if (sortBuf.length !== nodes.length) sortBuf = new Array(nodes.length)
      for (let i = 0; i < nodes.length; i++) sortBuf[i] = i
      sortBuf.sort((a, b) => {
        const za = nodes[a]!.zRot
        const zb = nodes[b]!.zRot
        if (za !== zb) return zb - za // DESC: larger z (farther) first
        return nodes[a]!.idx - nodes[b]!.idx
      })

      // ─── PHASE F: Render nodes — crisp single-fill, size+alpha from scale ──
      const baseRadius = isMobile ? 1.1 : 1.4
      for (let s = 0; s < sortBuf.length; s++) {
        const i = sortBuf[s]!
        const n = nodes[i]!

        // Activation intensity: decays 1→0 over ACTIVATION_MS
        let activation = 0
        if (!reduced && n.activationStart > 0) {
          const age = nowMs - n.activationStart
          if (age >= ACTIVATION_MS) {
            n.activationStart = 0
          } else {
            activation = 1 - age / ACTIVATION_MS
          }
        }

        // Activation-Pulse: first PULSE_MS → +50% scale-bump
        let pulse = 0
        if (!reduced && n.pulseStart > 0) {
          const pulseAge = nowMs - n.pulseStart
          if (pulseAge >= PULSE_MS) {
            n.pulseStart = 0
          } else {
            pulse = 0.5 * (1 - pulseAge / PULSE_MS)
          }
        }

        // Breathing: gentle opacity oscillation (±30% of baseOpacity)
        const breathing = reduced
          ? 0
          : Math.sin(nowSec * 1.2 + n.phase) * 0.3 * n.baseOpacity

        // Size + alpha from projected scale (honest 3D, not simulated).
        // scale typical range: ~0.55 (very far) .. 3.0 (near-cap from
        // MAX_PROJECTION_SCALE clamp). Defensive cap at baseRadius × 5.0 so
        // the multiplicative combo (scale × sizeVar × pulse) can't stack into
        // an oversized blob even if any factor drifts. Raised from 3.5 → 5.0
        // to match the higher projection-scale cap.
        const radius = Math.min(
          baseRadius * n.sizeVar * n.scale * (1 + pulse),
          baseRadius * 5.0,
        )
        // Scale-alpha factor: far nodes softer. Normalized bluntly: clamp 0.4..1.0.
        const scaleAlpha = Math.min(1, Math.max(0.4, 0.4 + 0.6 * (n.scale - 0.4)))
        const opacity = Math.min(
          1,
          (n.baseOpacity + breathing) * scaleAlpha + activation * 0.8,
        )

        // Two-color system: idle nodes render in --text (white in dark), active
        // nodes lerp toward --accent (neon). Threshold 0.05 → below = idle.
        // Lerp ramp: activation * 1.2 clamped to 1.0 → full neon slightly before
        // peak so the pulse moment reads as "fully activated" neon.
        let r: number
        let g: number
        let b: number
        if (activation < 0.05) {
          r = textRgb.r
          g = textRgb.g
          b = textRgb.b
        } else {
          const tMix = Math.min(1, activation * 1.2)
          r = textRgb.r + (accentRgb.r - textRgb.r) * tMix
          g = textRgb.g + (accentRgb.g - textRgb.g) * tMix
          b = textRgb.b + (accentRgb.b - textRgb.b) * tMix
        }

        ctx.beginPath()
        ctx.arc(n.screenX, n.screenY, Math.max(0.2, radius), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        ctx.fill()
      }

      // ─── PHASE G: Lines between active nodes — neon gradient stroke ────────
      // Lines only exist between active pairs → always rendered in --accent.
      // Alpha varies along the line from endpoint-A's scaleAlpha to endpoint-B's
      // scaleAlpha. Gives honest 3D depth across the segment length.
      if (!reduced) {
        // Line threshold in SCREEN-space: connect only when close on screen.
        // Tied to average cell size: cols-based → similar density feel.
        // Updated to match new default grid (34×19 desktop / 18×11 mobile).
        const lineCellsX = isMobile ? 19 : 35
        const lineCellsY = isMobile ? 12 : 20
        const cellW = W / lineCellsX
        const cellH = H / lineCellsY
        const lineThreshold = Math.min(cellW, cellH) * 2.0
        const lineThresholdSq = lineThreshold * lineThreshold

        const activeIdxs: number[] = []
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]!
          if (n.activationStart === 0) continue
          if (nowMs - n.activationStart >= ACTIVATION_MS) continue
          activeIdxs.push(i)
        }

        ctx.shadowBlur = 0

        for (let ai = 0; ai < activeIdxs.length; ai++) {
          const aIdx = activeIdxs[ai]!
          const a = nodes[aIdx]!
          const aAct = 1 - (nowMs - a.activationStart) / ACTIVATION_MS
          const aScaleAlpha = Math.min(1, Math.max(0.4, 0.4 + 0.6 * (a.scale - 0.4)))

          for (let bi = ai + 1; bi < activeIdxs.length; bi++) {
            const bIdx = activeIdxs[bi]!
            const b = nodes[bIdx]!
            const bAct = 1 - (nowMs - b.activationStart) / ACTIVATION_MS
            const bScaleAlpha = Math.min(
              1,
              Math.max(0.4, 0.4 + 0.6 * (b.scale - 0.4)),
            )

            const dx = a.screenX - b.screenX
            const dy = a.screenY - b.screenY
            const dSq = dx * dx + dy * dy
            if (dSq > lineThresholdSq) continue

            const activationIntensity = Math.min(aAct, bAct)
            const alphaA = Math.min(
              1,
              aScaleAlpha * 0.9 * activationIntensity + 0.05,
            )
            const alphaB = Math.min(
              1,
              bScaleAlpha * 0.9 * activationIntensity + 0.05,
            )

            // Line width scales with minimum endpoint scale
            const minScale = Math.min(a.scale, b.scale)
            const lineWidth = Math.max(0.3, 0.5 + 1.0 * Math.min(1, minScale))

            const grad = ctx.createLinearGradient(
              a.screenX,
              a.screenY,
              b.screenX,
              b.screenY,
            )
            grad.addColorStop(
              0,
              `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alphaA})`,
            )
            grad.addColorStop(
              1,
              `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alphaB})`,
            )

            ctx.strokeStyle = grad
            ctx.lineWidth = lineWidth
            ctx.beginPath()
            ctx.moveTo(a.screenX, a.screenY)
            ctx.lineTo(b.screenX, b.screenY)
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
 * Parse a CSS color string (hex or rgb/rgba) to {r,g,b}. Falls back to
 * near-white (dark-mode --text) on parse failure so we never crash.
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

  // Fallback — near-white (matches dark-mode --text)
  return { r: 246, g: 246, b: 246 }
}
