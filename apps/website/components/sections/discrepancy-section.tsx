'use client'

import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react"

// Plan 06 Task 2 (UAT Option A) — Sticky-Scroll Split-Line-Chart for the
// Discrepancy section. Replaces Plan-03 Bento-Split (kept LOCKED numbers
// per D-09) with a scroll-driven SVG divergent-line visualisation.
//
// LOCKED Daten aus .planning/phases/20-navigation-landing-skeleton/20-RESEARCH.md
// § Component Recipes D-09 (die 6 Kernzahlen duerfen NICHT geaendert werden).
//
// Layout:
//   - Outer <section> gives scroll distance (h-[200vh] / h-[150vh] mobile)
//   - Inner sticky container (top-0, h-screen) holds the chart
//   - useScroll + useTransform maps scrollYProgress → line draw + opacity
//
// Reduced-motion:
//   - useTransform outputs are bypassed — everything renders in final state
//   - motion-entries skip to final state
//   - SVG paths render fully drawn (no stroke-dashoffset animation)

const wirtschaftStats = [
  { value: "7×",     label: "KI-Talent-Nachfrage",      xPct: 12 },
  { value: "56 %",   label: "Lohnaufschlag",            xPct: 50 },
  { value: "73 %",   label: "ungenutztes Potenzial",    xPct: 86 },
] as const

const studisStats = [
  { value: "83,5 %", label: "auf Anfänger-Level",       xPct: 12 },
  { value: "75 %",   label: "„Studium bereitet nicht vor.“", xPct: 50 },
  { value: "6,4 %",  label: "intensive KI-Lehre",       xPct: 86 },
] as const

// SVG viewBox in logical units — chart surface is 100 × 50
// Upper line (Wirtschaft): rises steeply left→right
// Lower line (Studis): stays near-flat, slight downward
const CHART_W = 100
const CHART_H = 50
const UPPER_POINTS: Array<[number, number]> = [
  [12, 38], // start low-left
  [50, 22], // climbs mid
  [86, 6],  // steep top-right
]
const LOWER_POINTS: Array<[number, number]> = [
  [12, 40], // start
  [50, 42], // slight dip
  [86, 45], // slight decline further
]

// Build a smooth-ish path through 3 points with cubic curves.
function buildPath(points: Array<[number, number]>): string {
  const [p0, p1, p2] = points
  // two cubic Bezier segments for an organic curve
  const c1x = (p0[0] + p1[0]) / 2
  const c2x = (p1[0] + p2[0]) / 2
  return `M ${p0[0]} ${p0[1]} C ${c1x} ${p0[1]}, ${c1x} ${p1[1]}, ${p1[0]} ${p1[1]} C ${c2x} ${p1[1]}, ${c2x} ${p2[1]}, ${p2[0]} ${p2[1]}`
}

const UPPER_PATH = buildPath(UPPER_POINTS)
const LOWER_PATH = buildPath(LOWER_POINTS)

// Area-between-lines polygon (upper forward, lower reversed)
const AREA_PATH = `${UPPER_PATH} L ${LOWER_POINTS[2][0]} ${LOWER_POINTS[2][1]} C ${(LOWER_POINTS[2][0] + LOWER_POINTS[1][0]) / 2} ${LOWER_POINTS[2][1]}, ${(LOWER_POINTS[2][0] + LOWER_POINTS[1][0]) / 2} ${LOWER_POINTS[1][1]}, ${LOWER_POINTS[1][0]} ${LOWER_POINTS[1][1]} C ${(LOWER_POINTS[1][0] + LOWER_POINTS[0][0]) / 2} ${LOWER_POINTS[1][1]}, ${(LOWER_POINTS[1][0] + LOWER_POINTS[0][0]) / 2} ${LOWER_POINTS[0][1]}, ${LOWER_POINTS[0][0]} ${LOWER_POINTS[0][1]} Z`

interface ChartDotProps {
  x: number
  y: number
  value: string
  label: string
  opacity: MotionValue<number>
  color: "neon" | "red"
  align: "top" | "bottom"
}

function ChartDot({ x, y, value, label, opacity, color, align }: ChartDotProps) {
  const fillVar = color === "neon" ? "var(--neon-9)" : "var(--red-9)"
  const textVar = color === "neon" ? "var(--neon-9)" : "var(--red-9)"
  // Label offset above/below the point, in viewBox units
  const labelY = align === "top" ? y - 4 : y + 8

  return (
    <motion.g style={{ opacity }}>
      {/* Glow halo */}
      <circle cx={x} cy={y} r={2.4} fill={fillVar} opacity={0.25} />
      <circle cx={x} cy={y} r={1.2} fill={fillVar} />
      {/* Number */}
      <text
        x={x}
        y={labelY}
        textAnchor="middle"
        fill={textVar}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "4px",
          fontWeight: 700,
        }}
      >
        {value}
      </text>
      {/* Label */}
      <text
        x={x}
        y={labelY + (align === "top" ? -2.8 : 3)}
        textAnchor="middle"
        fill="var(--text-secondary)"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "2.2px",
          fontWeight: 400,
        }}
      >
        {label}
      </text>
    </motion.g>
  )
}

export function DiscrepancySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Dämpfung: scrollYProgress wird über eine Spring geglättet, damit die
  // Phasenübergänge nicht hart an den Stop-Punkten „einrasten". Plan-04
  // Polish: stiffness etwas höher (140) für Responsiveness, damping 32 gegen
  // Wobble, mass 0.4 für leichteres Gefühl. Keine rest-Settings → Defaults.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.4,
  })

  // Progress stages — Plan-04 Polish-Pass: overlapping bumps auf ≥0.05, so
  // dass keine Phase eine harte Step-Grenze zur nächsten hat. Previous-Phase
  // fadet noch aus während next-Phase schon beginnt → continuous flow.
  //
  //   0.00 – 0.22  title fades in
  //   0.15 – 0.50  upper line draws
  //   0.30 – 0.52  upper dots appear
  //   0.40 – 0.75  lower line draws
  //   0.55 – 0.78  lower dots appear
  //   0.65 – 0.90  area fills
  //   0.70 – 0.92  "DIE LÜCKE" label
  //   0.80 – 0.98  closer fades in
  //
  // Reduced-motion: all values pinned to final state (1).
  const titleOpacity = useTransform(
    smoothProgress,
    [0, 0.11, 0.22],
    prefersReducedMotion ? [1, 1, 1] : [0, 0.5, 1],
  )

  const upperDraw = useTransform(
    smoothProgress,
    [0.15, 0.5],
    prefersReducedMotion ? [0, 0] : [1, 0],
  )
  const upperDotsOpacity = useTransform(
    smoothProgress,
    [0.3, 0.52],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )

  const lowerDraw = useTransform(
    smoothProgress,
    [0.4, 0.75],
    prefersReducedMotion ? [0, 0] : [1, 0],
  )
  const lowerDotsOpacity = useTransform(
    smoothProgress,
    [0.55, 0.78],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )

  const areaOpacity = useTransform(
    smoothProgress,
    [0.65, 0.9],
    prefersReducedMotion ? [0.5, 0.5] : [0, 0.5],
  )
  const gapLabelOpacity = useTransform(
    smoothProgress,
    [0.7, 0.92],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )

  const closerOpacity = useTransform(
    smoothProgress,
    [0.8, 0.98],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )
  const closerY = useTransform(
    smoothProgress,
    [0.8, 0.98],
    prefersReducedMotion ? [0, 0] : [20, 0],
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby="discrepancy-heading"
      data-section="discrepancy"
      className="relative bg-bg border-b border-border h-[150vh] lg:h-[200vh]"
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Title cluster */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="text-center max-w-4xl mb-8 sm:mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-3">
            Die KI-Diskrepanz
          </p>
          <h2
            id="discrepancy-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text"
          >
            Was die Wirtschaft braucht — und was im Studium passiert.
          </h2>
        </motion.div>

        {/* Chart */}
        <div className="w-full max-w-[1200px] mx-auto">
          <svg
            viewBox="-10 -4 120 68"
            className="w-full h-auto"
            role="img"
            aria-labelledby="discrepancy-chart-title"
          >
            <title id="discrepancy-chart-title">
              Split-Line-Chart: Wirtschaftsbedarf (steigt) versus Studi-KI-Kompetenz (flach) über drei Datenpaare — Markt-Signal oben (neon), Studi-Realität unten (rot). Die Fläche zwischen den Linien ist die Lücke.
            </title>
            <defs>
              {/* Gap fill gradient — neon top → red bottom */}
              <linearGradient id="gap-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-9)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--red-9)" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* ─── Axes ────────────────────────────────────────────────────
                Render FIRST (below everything) so they read as structure,
                not as narrative. No fade-in — always visible.
                Chart surface spans x 0..100, y 0..50 (viewBox logical units).
                Axis lines sit just outside so they frame the data. */}
            {/* Horizontal gridlines */}
            <line
              x1={0} y1={2} x2={100} y2={2}
              stroke="var(--text-muted)" strokeWidth={0.2}
              strokeDasharray="1 1" opacity={0.3}
            />
            <line
              x1={0} y1={26} x2={100} y2={26}
              stroke="var(--text-muted)" strokeWidth={0.2}
              strokeDasharray="1 1" opacity={0.3}
            />
            {/* Y-axis line (left edge) */}
            <line
              x1={-1} y1={2} x2={-1} y2={50}
              stroke="var(--text-muted)" strokeWidth={0.3}
            />
            {/* Y-axis ticks */}
            <line x1={-1.8} y1={2}  x2={-1} y2={2}  stroke="var(--text-muted)" strokeWidth={0.3} />
            <line x1={-1.8} y1={26} x2={-1} y2={26} stroke="var(--text-muted)" strokeWidth={0.3} />
            <line x1={-1.8} y1={50} x2={-1} y2={50} stroke="var(--text-muted)" strokeWidth={0.3} />
            {/* Y-axis tick labels */}
            <text
              x={-2.6} y={2.8} textAnchor="end" fill="var(--text-muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.2px" }}
            >hoch</text>
            <text
              x={-2.6} y={26.8} textAnchor="end" fill="var(--text-muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.2px" }}
            >mittel</text>
            <text
              x={-2.6} y={50.8} textAnchor="end" fill="var(--text-muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.2px" }}
            >niedrig</text>
            {/* Y-axis rotated title */}
            <text
              transform="translate(-8, 26) rotate(-90)" textAnchor="middle"
              fill="var(--text-muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.4px", fontWeight: 700, letterSpacing: "0.15em" }}
            >LEVEL</text>

            {/* X-axis line (bottom) */}
            <line
              x1={-1} y1={51} x2={100} y2={51}
              stroke="var(--text-muted)" strokeWidth={0.3}
            />
            {/* X-axis ticks at the 3 anchor positions */}
            <line x1={12} y1={51} x2={12} y2={51.8} stroke="var(--text-muted)" strokeWidth={0.3} />
            <line x1={50} y1={51} x2={50} y2={51.8} stroke="var(--text-muted)" strokeWidth={0.3} />
            <line x1={86} y1={51} x2={86} y2={51.8} stroke="var(--text-muted)" strokeWidth={0.3} />
            {/* X-axis tick labels — Plan-04 Polish: neutral Paar-IDs "01/02/03"
                statt strapazierte Kategorien. Honest: das Chart zeigt 3 Paare,
                keine getreuen Dimensionen. Die Paar-Semantik trägt die Caption
                unter dem Chart.
                Mobile (<640px): dichte Ticks ausblenden via sr-only-Pattern —
                Pair-Caption unter Chart reicht dann als Orientierung. */}
            <text
              x={12} y={55} textAnchor="middle" fill="var(--text-muted)"
              className="max-sm:hidden"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.4px", fontWeight: 600, letterSpacing: "0.1em" }}
            >01</text>
            <text
              x={50} y={55} textAnchor="middle" fill="var(--text-muted)"
              className="max-sm:hidden"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.4px", fontWeight: 600, letterSpacing: "0.1em" }}
            >02</text>
            <text
              x={86} y={55} textAnchor="middle" fill="var(--text-muted)"
              className="max-sm:hidden"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.4px", fontWeight: 600, letterSpacing: "0.1em" }}
            >03</text>
            {/* X-axis title */}
            <text
              x={50} y={60.5} textAnchor="middle" fill="var(--text-muted)"
              className="max-sm:hidden"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.2px", letterSpacing: "0.15em" }}
            >PAAR</text>

            {/* Area between lines — fades in after both lines drawn */}
            <motion.path
              d={AREA_PATH}
              fill="url(#gap-gradient)"
              style={{ opacity: areaOpacity }}
            />

            {/* UPPER line: Was die Wirtschaft will (neon) */}
            <motion.path
              d={UPPER_PATH}
              stroke="var(--neon-9)"
              strokeWidth={0.9}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: upperDraw,
              }}
            />

            {/* LOWER line: Was Studierende mitbringen (red) */}
            <motion.path
              d={LOWER_PATH}
              stroke="var(--red-9)"
              strokeWidth={0.9}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: lowerDraw,
              }}
            />
            {/* End-of-line labels removed — redundant with the top-right legend
                that now identifies each line by colour + description. */}

            {/* Upper dots (number-ticker alternative: value text) */}
            {UPPER_POINTS.map((pt, i) => (
              <ChartDot
                key={`u-${i}`}
                x={pt[0]}
                y={pt[1]}
                value={wirtschaftStats[i].value}
                label={wirtschaftStats[i].label}
                opacity={upperDotsOpacity}
                color="neon"
                align="top"
              />
            ))}

            {/* Lower dots */}
            {LOWER_POINTS.map((pt, i) => (
              <ChartDot
                key={`l-${i}`}
                x={pt[0]}
                y={pt[1]}
                value={studisStats[i].value}
                label={studisStats[i].label}
                opacity={lowerDotsOpacity}
                color="red"
                align="bottom"
              />
            ))}

            {/* DIE LÜCKE label in the middle of gap */}
            <motion.text
              x={50}
              y={32}
              textAnchor="middle"
              fill="var(--text)"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "3.5px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                opacity: gapLabelOpacity,
              }}
            >
              DIE LÜCKE
            </motion.text>
          </svg>

          {/* ─── Chart-Caption + Legend (HTML, unter Chart) ──────────────────
              Plan-04 Polish: raus aus dem SVG für Mobile-Readability. Legend
              stackt unter Chart → keine Overlap-Gefahr auf <640px. Caption
              erklärt die 3 Paare (Markt-Signal vs. Studi-Realität) und macht
              die symbolische Y-Skala explizit (mischt × und %).             */}
          <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4 px-2">
            {/* Legend */}
            <div
              role="list"
              aria-label="Chart-Legende"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] sm:text-xs uppercase tracking-[0.12em] text-text-secondary"
            >
              <span role="listitem" className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--neon-9)" }}
                />
                Markt-Signal — Was die Wirtschaft will
              </span>
              <span role="listitem" className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--red-9)" }}
                />
                Studi-Realität — Was Studis mitbringen
              </span>
            </div>

            {/* Pair-Caption + Y-Scale-Disambiguation */}
            <p className="max-w-2xl text-center font-mono text-[11px] sm:text-xs leading-relaxed tracking-[0.05em] text-text-muted">
              Drei Paare gegenübergestellt:{" "}
              <span className="text-text-secondary">01</span> Bedarf vs. Anfänger-Level ·{" "}
              <span className="text-text-secondary">02</span> Vergütung vs. Vorbereitung ·{" "}
              <span className="text-text-secondary">03</span> Potenzial vs. Ausbildung.{" "}
              <span className="block mt-2 sm:mt-1">
                Y-Achse symbolisch (niedrig / mittel / hoch) — die Werte mischen × und %.
              </span>
            </p>
          </div>
        </div>

        {/* Closer */}
        <motion.p
          style={{ opacity: closerOpacity, y: closerY }}
          className="mt-8 sm:mt-12 text-center font-mono text-xl sm:text-2xl lg:text-3xl text-text max-w-3xl"
        >
          Generation AI schließt diese Lücke.
        </motion.p>
      </div>
    </section>
  )
}
