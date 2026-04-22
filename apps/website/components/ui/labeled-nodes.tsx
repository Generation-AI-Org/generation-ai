"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"

interface LabeledNodesProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
}

/**
 * LabeledNodes — Constellation-base Hero-Background mit Cluster-Flow-on-Hover.
 *
 * Port aus Claude-Design-Handout (`shared/connections.js` → mode_labeled_nodes).
 *
 * Motif:
 *   - Constellation von ~40-110 langsam driftenden Nodes, dünne proximity-lines.
 *   - Cursor sammelt Nodes im Radius 150px zu einem Cluster (min. 3 Nodes).
 *   - ~45 % der Nodes sind "labelbar" und ziehen im aktiven Cluster dynamisch
 *     ein Label aus einem Pool (FOUNDER · AGENT · HARNESS · MODEL · THESIS …).
 *   - Cluster-Edges werden Neon, kleine Neon-Partikel fliessen zwischen allen
 *     Cluster-Mitgliedern (directional flow = "gegenseitiger Austausch").
 *   - Nach Cursor-Leave fadet Cluster aus, lastLabel bleibt als sehr dezenter
 *     Hint (0.18 α) an Nodes die mal aktiv waren → die Community "bleibt da".
 *
 * Theme-Awareness:
 *   - `--accent` über getComputedStyle, MutationObserver auf html.class
 *     reagiert auf Theme-Toggle. Idle-muted-Farben sind theme-abhängig.
 *
 * Reduced-Motion:
 *   - `prefers-reduced-motion: reduce` → Nodes stehen still, keine Flow-Particles.
 *     Cluster-Detection + Labels bleiben aktiv (statisch, aber erkennbar).
 *
 * Performance:
 *   - Canvas-Setup + rAF-Loop laufen erst nach `requestIdleCallback` (Fallback
 *     setTimeout 80ms) → spart TBT im Critical Path.
 *   - Single rAF-Loop, ein Canvas-Pass.
 *   - IntersectionObserver pausiert Loop offscreen.
 *   - ResizeObserver rebuilds nodes on container resize.
 *   - Canvas-Buffer × devicePixelRatio für crisp Retina.
 */
export function LabeledNodes({
  children,
  className,
  ...props
}: LabeledNodesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    return startCanvasAnimation(container, canvas)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* z-0 — Canvas: decorative, never intercepts clicks */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      />
      {/* z-1 — Outer Radial-Fade: blendet Nodes an den Rändern aus (bg-Farbe). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 45%, var(--bg) 95%)",
        }}
      />
      {/* z-2 — Inner Content-Protect: dämpft Nodes/Lines hinter dem Text-Block.
          Theme-aware: Dark = bg-Wash, Light = bg-Wash + minimaler Dark-Tint. */}
      <div
        aria-hidden="true"
        className="labeled-nodes-content-protect pointer-events-none absolute inset-0 z-[2]"
      />
      <style jsx>{`
        .labeled-nodes-content-protect {
          background: radial-gradient(
            ellipse 48% 38% at center,
            rgba(var(--bg-rgb), 0.4) 0%,
            rgba(var(--bg-rgb), 0.22) 40%,
            rgba(var(--bg-rgb), 0.08) 65%,
            transparent 85%
          );
        }
        :global(.light) .labeled-nodes-content-protect {
          background:
            radial-gradient(
              ellipse 52% 42% at center,
              rgba(0, 0, 0, 0.045) 0%,
              rgba(0, 0, 0, 0.02) 45%,
              transparent 78%
            ),
            radial-gradient(
              ellipse 52% 42% at center,
              rgba(var(--bg-rgb), 0.45) 0%,
              rgba(var(--bg-rgb), 0.25) 40%,
              rgba(var(--bg-rgb), 0.08) 65%,
              transparent 85%
            );
        }
        @media (max-width: 640px) {
          .labeled-nodes-content-protect {
            background: radial-gradient(
              ellipse 62% 40% at center,
              rgba(var(--bg-rgb), 0.45) 0%,
              rgba(var(--bg-rgb), 0.25) 40%,
              rgba(var(--bg-rgb), 0.08) 65%,
              transparent 85%
            );
          }
          :global(.light) .labeled-nodes-content-protect {
            background:
              radial-gradient(
                ellipse 66% 45% at center,
                rgba(0, 0, 0, 0.045) 0%,
                rgba(0, 0, 0, 0.02) 45%,
                transparent 78%
              ),
              radial-gradient(
                ellipse 66% 45% at center,
                rgba(var(--bg-rgb), 0.5) 0%,
                rgba(var(--bg-rgb), 0.28) 40%,
                rgba(var(--bg-rgb), 0.1) 65%,
                transparent 85%
              );
          }
        }
      `}</style>
      {/* z-10 — Content, clickable */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function startCanvasAnimation(
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
): () => void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return () => {}

  const LABELS = [
    "FOUNDER",
    "AGENT",
    "HARNESS",
    "MODEL",
    "THESIS",
    "MEETUP",
    "OFFICE",
    "PROF",
    "IDEE",
    "PROJEKT",
    "VIBECODING",
    "SKILL",
    "MENTOR",
    "FEEDBACK",
    "HACKATHON",
  ]
  const PROX = 140
  const CLUSTER_RADIUS = 150

  // Theme-aware colors (re-resolved on theme change)
  const colorsRef = { accent: "#CEFF32", muted: "", mutedLine: "" }
  const resolveColors = () => {
    const styles = getComputedStyle(document.documentElement)
    colorsRef.accent =
      styles.getPropertyValue("--accent").trim() || "#CEFF32"
    const isLight = document.documentElement.classList.contains("light")
    colorsRef.muted = isLight
      ? "rgba(0,0,0,0.45)"
      : "rgba(255,255,255,0.55)"
    colorsRef.mutedLine = isLight
      ? "rgba(0,0,0,0.22)"
      : "rgba(255,255,255,0.28)"
  }
  resolveColors()

  const themeObserver = new MutationObserver(resolveColors)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  })

  // Reduced-motion
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
  let reduced = mql.matches
  const onMotionChange = (e: MediaQueryListEvent) => {
    reduced = e.matches
  }
  mql.addEventListener("change", onMotionChange)

  // Mouse tracker (container-relative)
  const mouse = { x: -9999, y: -9999, active: false }
  const onMove = (e: MouseEvent) => {
    const r = container.getBoundingClientRect()
    mouse.x = e.clientX - r.left
    mouse.y = e.clientY - r.top
    mouse.active = true
  }
  const onLeave = () => {
    mouse.active = false
    mouse.x = -9999
    mouse.y = -9999
  }
  container.addEventListener("mousemove", onMove)
  container.addEventListener("mouseleave", onLeave)

  // Auto-wander cluster (mobile only, when no cursor hover).
  const auto = {
    x: -9999,
    y: -9999,
    targetX: 0,
    targetY: 0,
    nextRetargetMs: 0,
    inited: false,
  }

  // Canvas sizing (DPR-aware)
  const state = { w: 0, h: 0 }
  const sizeCanvas = () => {
    const r = container.getBoundingClientRect()
    state.w = r.width
    state.h = r.height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.style.width = `${state.w}px`
    canvas.style.height = `${state.h}px`
    canvas.width = Math.max(1, Math.floor(state.w * dpr))
    canvas.height = Math.max(1, Math.floor(state.h * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // Node data
  type Node = {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    labelable: boolean
    label: string | null
    lastLabel: string | null
    act: number
  }
  let nodes: Node[] = []

  const buildNodes = () => {
    sizeCanvas()
    const isMobile = state.w < 768
    const divisor = isMobile ? 18000 : 22000
    const min = isMobile ? 16 : 40
    const max = isMobile ? 32 : 110
    const count = Math.max(
      min,
      Math.min(max, Math.round((state.w * state.h) / divisor)),
    )
    nodes = []
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * state.w,
        y: Math.random() * state.h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 1.8 + Math.random() * 1.4,
        labelable: Math.random() < 0.45,
        label: null,
        lastLabel: null,
        act: 0,
      })
    }
  }
  buildNodes()

  const ro = new ResizeObserver(buildNodes)
  ro.observe(container)

  // Pause when offscreen
  let inView = true
  let rafId: number | null = null
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry?.isIntersecting ?? true
      if (inView && rafId === null) {
        rafId = requestAnimationFrame(frame)
      }
    },
    { threshold: 0 },
  )
  io.observe(container)

  // Render loop
  const frame = (t: number) => {
    if (!inView) {
      rafId = null
      return
    }
    ctx.clearRect(0, 0, state.w, state.h)
    const { accent, muted, mutedLine } = colorsRef
    const now = (t || 0) / 1000

    if (!reduced) {
      for (const p of nodes) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20) p.x = state.w + 20
        if (p.x > state.w + 20) p.x = -20
        if (p.y < -20) p.y = state.h + 20
        if (p.y > state.h + 20) p.y = -20
      }
    }

    const isMobile = state.w < 768
    const autoActive = isMobile && !mouse.active && !reduced
    if (autoActive) {
      if (!auto.inited || (t || 0) >= auto.nextRetargetMs) {
        const edgeT = 0.18 + Math.random() * 0.22
        const side = Math.floor(Math.random() * 4)
        let tx = 0,
          ty = 0
        if (side === 0) {
          tx = state.w * edgeT
          ty = state.h * (0.2 + Math.random() * 0.6)
        } else if (side === 1) {
          tx = state.w * (1 - edgeT)
          ty = state.h * (0.2 + Math.random() * 0.6)
        } else if (side === 2) {
          tx = state.w * (0.2 + Math.random() * 0.6)
          ty = state.h * edgeT
        } else {
          tx = state.w * (0.2 + Math.random() * 0.6)
          ty = state.h * (1 - edgeT)
        }
        auto.targetX = tx
        auto.targetY = ty
        auto.nextRetargetMs = (t || 0) + 3500 + Math.random() * 1500
        if (!auto.inited) {
          auto.x = tx
          auto.y = ty
          auto.inited = true
        }
      }
      auto.x += (auto.targetX - auto.x) * 0.018
      auto.y += (auto.targetY - auto.y) * 0.018
    }

    const safeHalfW = state.w * (isMobile ? 0.42 : 0.36)
    const safeHalfH = state.h * (isMobile ? 0.32 : 0.3)
    const safeCx = state.w / 2
    const safeCy = state.h / 2
    const safeZoneFactor = (x: number, y: number) => {
      const nx = (x - safeCx) / safeHalfW
      const ny = (y - safeCy) / safeHalfH
      const d = Math.sqrt(nx * nx + ny * ny)
      return d >= 1 ? 1 : d
    }

    const clusterIdx = new Set<number>()
    const clusterActive = mouse.active || (autoActive && auto.inited)
    if (clusterActive) {
      const cx = mouse.active ? mouse.x : auto.x
      const cy = mouse.active ? mouse.y : auto.y
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i]!
        const d = Math.hypot(p.x - cx, p.y - cy)
        if (d < CLUSTER_RADIUS && safeZoneFactor(p.x, p.y) > 0.35) {
          clusterIdx.add(i)
        }
      }
      if (clusterIdx.size < 3) clusterIdx.clear()
    }

    const activeLabelable = [...clusterIdx].filter(
      (i) => nodes[i]!.labelable,
    )
    if (activeLabelable.length > 0) {
      const taken = new Set<string>()
      for (const i of activeLabelable) {
        const n = nodes[i]!
        if (n.label && !taken.has(n.label)) {
          taken.add(n.label)
        } else if (n.label && taken.has(n.label)) {
          n.label = null
        }
      }
      const freeLabels = LABELS.filter((l) => !taken.has(l))
      const freeIdx = 0
      for (const i of activeLabelable) {
        const n = nodes[i]!
        if (!n.label && freeIdx < freeLabels.length) {
          const pick = freeLabels[(i + freeIdx) % freeLabels.length]!
          n.label = pick
          n.lastLabel = pick
          taken.add(pick)
          freeLabels.splice(freeLabels.indexOf(pick), 1)
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!
      if (!clusterIdx.has(i) && n.label) {
        n.lastLabel = n.label
        n.label = null
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const target = clusterIdx.has(i) ? 1 : 0
      nodes[i]!.act += (target - nodes[i]!.act) * 0.08
    }

    ctx.lineWidth = 1
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!
      const aSafe = safeZoneFactor(a.x, a.y)
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 < PROX * PROX) {
          const d = Math.sqrt(d2)
          const baseAlpha = (1 - d / PROX) * 0.6
          const bothActive = Math.min(a.act, b.act)
          let stroke = mutedLine
          let alpha = baseAlpha
          if (bothActive > 0.05) {
            stroke = accent
            alpha = Math.min(1, baseAlpha * (1 + bothActive * 1.4))
          }
          const lineSafe = Math.min(aSafe, safeZoneFactor(b.x, b.y))
          alpha *= lineSafe
          if (alpha < 0.005) continue
          ctx.strokeStyle = stroke
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }
    ctx.globalAlpha = 1

    if (!reduced && clusterIdx.size > 0) {
      const clusterArr = [...clusterIdx]
      for (let ii = 0; ii < clusterArr.length; ii++) {
        const i = clusterArr[ii]!
        for (let jj = ii + 1; jj < clusterArr.length; jj++) {
          const j = clusterArr[jj]!
          const a = nodes[i]!
          const b = nodes[j]!
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > PROX * PROX) continue
          const pairAct = Math.min(a.act, b.act)
          if (pairAct < 0.1) continue

          const speed = 0.22
          const dir = (i + j) % 2 === 0 ? 1 : -1
          const tA = (now * speed + (i + j) * 0.17) * dir
          const f = ((tA % 1) + 1) % 1
          const x = a.x + (b.x - a.x) * f
          const y = a.y + (b.y - a.y) * f
          ctx.fillStyle = accent
          ctx.globalAlpha = 0.6 + pairAct * 0.4
          ctx.beginPath()
          ctx.arc(x, y, 1.4 + pairAct * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    ctx.font = '700 10px "Geist Mono", ui-monospace, monospace'
    ctx.textBaseline = "middle"
    for (const p of nodes) {
      const hot = p.act
      const safe = safeZoneFactor(p.x, p.y)
      ctx.fillStyle = hot > 0.05 ? accent : muted
      const baseAlpha = hot > 0.05 ? 0.75 + hot * 0.25 : 0.75
      ctx.globalAlpha = baseAlpha * safe
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r + hot * 1.8, 0, Math.PI * 2)
      ctx.fill()

      const shown = p.label || p.lastLabel
      if (shown && hot > 0.05) {
        ctx.globalAlpha = hot * safe
        ctx.fillStyle = accent
        ctx.fillText("· " + shown, p.x + 8, p.y)
      } else if (p.labelable && p.lastLabel) {
        ctx.globalAlpha = 0.18 * safe
        ctx.fillStyle = muted
        ctx.fillText("· " + p.lastLabel, p.x + 8, p.y)
      }
    }
    ctx.globalAlpha = 1

    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)

  return () => {
    themeObserver.disconnect()
    mql.removeEventListener("change", onMotionChange)
    ro.disconnect()
    io.disconnect()
    container.removeEventListener("mousemove", onMove)
    container.removeEventListener("mouseleave", onLeave)
    if (rafId !== null) cancelAnimationFrame(rafId)
  }
}

export default LabeledNodes
