'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SignalGridProps {
  /** Grid spacing in pixels */
  gridSpacing?: number
  /** Base dot size in pixels */
  dotSize?: number
  /** Base opacity of dots (0-1) */
  dotOpacity?: number
  /** Additional class names */
  className?: string
}

interface GridPoint {
  x: number
  y: number
  baseX: number
  baseY: number
  col: number
  row: number
  size: number // random size multiplier
  activation: number
  sparkTime: number // when this point should spark
}

export function SignalGrid({
  gridSpacing = 30,
  dotSize = 1.5,
  dotOpacity = 0.35,
  className = '',
}: SignalGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<GridPoint[][]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const lastMouseCell = useRef({ col: -1, row: -1 })
  const animationRef = useRef<number | undefined>(undefined)
  const lastFrameTimeRef = useRef<number>(0)
  const TARGET_FPS = 30
  const FRAME_INTERVAL = 1000 / TARGET_FPS

  const initGrid = useCallback((width: number, height: number) => {
    const cols = Math.ceil(width / gridSpacing) + 1
    const rows = Math.ceil(height / gridSpacing) + 1
    const grid: GridPoint[][] = []

    for (let row = 0; row < rows; row++) {
      grid[row] = []
      for (let col = 0; col < cols; col++) {
        // Slight random offset for organic feel (not perfect grid)
        const jitterX = (Math.random() - 0.5) * 8
        const jitterY = (Math.random() - 0.5) * 8
        const baseX = col * gridSpacing
        const baseY = row * gridSpacing

        grid[row][col] = {
          x: baseX + jitterX,
          y: baseY + jitterY,
          baseX,
          baseY,
          col,
          row,
          size: 0.5 + Math.random() * 1.0, // Random size: 0.5x to 1.5x
          activation: 0,
          sparkTime: Math.random() * 20000 + 5000, // Random spark between 5-25s
        }
      }
    }
    pointsRef.current = grid
  }, [gridSpacing])

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Throttle to TARGET_FPS
    const elapsed = timestamp - lastFrameTimeRef.current
    if (elapsed < FRAME_INTERVAL) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }
    lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    const grid = pointsRef.current
    const now = performance.now()

    ctx.clearRect(0, 0, width, height)

    // Get CSS variable colors
    const computedStyle = getComputedStyle(document.documentElement)
    const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#CEFF32'
    const textMuted = computedStyle.getPropertyValue('--text-muted').trim() || '#666666'

    // Check mouse position for activation
    const mouse = mouseRef.current
    const currentCol = Math.round(mouse.x / gridSpacing)
    const currentRow = Math.round(mouse.y / gridSpacing)

    // Activate on mouse move to new cell
    if (currentCol !== lastMouseCell.current.col || currentRow !== lastMouseCell.current.row) {
      if (grid[currentRow]?.[currentCol]) {
        // Activate current point
        grid[currentRow][currentCol].activation = 0.9

        // Randomly activate 1-2 neighbors
        const neighbors = [
          [-1, 0], [1, 0], [0, -1], [0, 1],
          [-1, -1], [1, 1], [-1, 1], [1, -1],
        ]
        const shuffled = neighbors.sort(() => Math.random() - 0.5)
        const count = 1 + Math.floor(Math.random() * 2)

        shuffled.slice(0, count).forEach(([dc, dr]) => {
          const neighbor = grid[currentRow + dr]?.[currentCol + dc]
          if (neighbor) {
            neighbor.activation = 0.4 + Math.random() * 0.4
          }
        })

        lastMouseCell.current = { col: currentCol, row: currentRow }
      }
    }

    // Draw all points
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const point = grid[row][col]

        // Decay (slower = longer glow)
        point.activation = Math.max(0, point.activation - 0.008)

        // Draw connections to activated neighbors
        if (point.activation > 0.15) {
          const rightNeighbor = grid[row]?.[col + 1]
          const bottomNeighbor = grid[row + 1]?.[col]
          const diagNeighbor = grid[row + 1]?.[col + 1]

          const drawLine = (neighbor: GridPoint | undefined) => {
            if (neighbor && neighbor.activation > 0.15) {
              const strength = Math.min(point.activation, neighbor.activation)
              ctx.beginPath()
              ctx.moveTo(point.x, point.y)
              ctx.lineTo(neighbor.x, neighbor.y)
              ctx.strokeStyle = accentColor
              ctx.globalAlpha = strength * 0.4
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }

          drawLine(rightNeighbor)
          drawLine(bottomNeighbor)
          if (Math.random() > 0.7) drawLine(diagNeighbor) // occasional diagonal
        }

        // Draw the dot
        const size = dotSize * point.size * (1 + point.activation * 0.8)
        const isActive = point.activation > 0.1

        ctx.beginPath()
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? accentColor : textMuted
        ctx.globalAlpha = dotOpacity + point.activation * 0.6
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [gridSpacing, dotSize, dotOpacity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        initGrid(canvas.width, canvas.height)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
      lastMouseCell.current = { col: -1, row: -1 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initGrid, draw])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  )
}
