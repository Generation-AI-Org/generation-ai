'use client'

import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
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

  // Progress stages:
  //   0.00 – 0.20  title fades in
  //   0.20 – 0.45  upper line draws + 3 dots
  //   0.45 – 0.70  lower line draws + 3 dots
  //   0.70 – 0.85  area fills + "DIE LÜCKE" label
  //   0.85 – 1.00  closer fades in
  //
  // Reduced-motion: all values pinned to final state (1).
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2],
    prefersReducedMotion ? [1, 1, 1] : [0, 0.5, 1],
  )

  const upperDraw = useTransform(
    scrollYProgress,
    [0.2, 0.45],
    prefersReducedMotion ? [0, 0] : [1, 0],
  )
  const upperDotsOpacity = useTransform(
    scrollYProgress,
    [0.35, 0.45],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )

  const lowerDraw = useTransform(
    scrollYProgress,
    [0.45, 0.7],
    prefersReducedMotion ? [0, 0] : [1, 0],
  )
  const lowerDotsOpacity = useTransform(
    scrollYProgress,
    [0.6, 0.7],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )

  const areaOpacity = useTransform(
    scrollYProgress,
    [0.7, 0.85],
    prefersReducedMotion ? [0.5, 0.5] : [0, 0.5],
  )
  const gapLabelOpacity = useTransform(
    scrollYProgress,
    [0.75, 0.85],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )

  const closerOpacity = useTransform(
    scrollYProgress,
    [0.85, 0.95],
    prefersReducedMotion ? [1, 1] : [0, 1],
  )
  const closerY = useTransform(
    scrollYProgress,
    [0.85, 0.95],
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
            viewBox={`0 0 ${CHART_W} ${CHART_H + 10}`}
            className="w-full h-auto"
            role="img"
            aria-label="Divergenz-Chart: Was die Wirtschaft will (steigend) versus was Studierende mitbringen (flach)"
          >
            <defs>
              {/* Gap fill gradient — neon top → red bottom */}
              <linearGradient id="gap-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-9)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--red-9)" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Area between lines — fades in after both lines drawn */}
            <motion.path
              d={AREA_PATH}
              fill="url(#gap-gradient)"
              style={{ opacity: areaOpacity }}
            />

            {/* Axis hint (symbolic, not time) */}
            <text
              x={2}
              y={CHART_H + 8}
              fill="var(--text-muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.2px" }}
            >
              Bedarf →
            </text>
            <text
              x={CHART_W - 2}
              y={CHART_H + 8}
              textAnchor="end"
              fill="var(--text-muted)"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2.2px" }}
            >
              ← Realität
            </text>

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
            {/* Upper line label */}
            <motion.text
              x={UPPER_POINTS[2][0] + 2}
              y={UPPER_POINTS[2][1] - 2}
              fill="var(--neon-9)"
              textAnchor="end"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "2.6px",
                fontWeight: 700,
                opacity: upperDotsOpacity,
              }}
            >
              Was die Wirtschaft will
            </motion.text>

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
            {/* Lower line label */}
            <motion.text
              x={LOWER_POINTS[2][0] + 2}
              y={LOWER_POINTS[2][1] + 4}
              fill="var(--red-9)"
              textAnchor="end"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "2.6px",
                fontWeight: 700,
                opacity: lowerDotsOpacity,
              }}
            >
              Was Studierende mitbringen
            </motion.text>

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
