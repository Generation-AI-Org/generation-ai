'use client'

import { useEffect, useRef, useCallback } from 'react'

interface NetworkGridProps {
  /** Grid spacing in pixels */
  gridSpacing?: number
  /** Connection radius around mouse */
  connectionRadius?: number
  /** Dot size in pixels */
  dotSize?: number
  /** Base opacity of dots (0-1) */
  dotOpacity?: number
  /** Whether to show subtle ambient movement */
  ambientMovement?: boolean
  /** Additional class names */
  className?: string
}

export function NetworkGrid({
  gridSpacing = 50,
  connectionRadius = 120,
  dotSize = 2,
  dotOpacity = 0.4,
  ambientMovement = true,
  className = '',
}: NetworkGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const timeRef = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    const mouse = mouseRef.current
    timeRef.current += 0.01

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get CSS variable colors
    const computedStyle = getComputedStyle(document.documentElement)
    const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#CEFF32'
    const textMuted = computedStyle.getPropertyValue('--text-muted').trim() || '#666666'

    // Calculate grid
    const cols = Math.ceil(width / gridSpacing) + 1
    const rows = Math.ceil(height / gridSpacing) + 1
    const points: { x: number; y: number; baseX: number; baseY: number }[] = []

    // Generate grid points with subtle movement
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = col * gridSpacing
        const baseY = row * gridSpacing

        let x = baseX
        let y = baseY

        // Subtle ambient wave movement
        if (ambientMovement) {
          const waveX = Math.sin(timeRef.current + col * 0.3 + row * 0.2) * 2
          const waveY = Math.cos(timeRef.current * 0.8 + row * 0.3 + col * 0.2) * 2
          x += waveX
          y += waveY
        }

        points.push({ x, y, baseX, baseY })
      }
    }

    // Draw connections near mouse
    const nearbyPoints = points.filter(p => {
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      return Math.sqrt(dx * dx + dy * dy) < connectionRadius
    })

    // Draw connections between nearby points
    for (let i = 0; i < nearbyPoints.length; i++) {
      for (let j = i + 1; j < nearbyPoints.length; j++) {
        const p1 = nearbyPoints[i]
        const p2 = nearbyPoints[j]
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Only connect adjacent grid points (diagonal or straight)
        if (dist < gridSpacing * 1.5) {
          // Fade based on distance from mouse
          const p1Dist = Math.sqrt((p1.x - mouse.x) ** 2 + (p1.y - mouse.y) ** 2)
          const p2Dist = Math.sqrt((p2.x - mouse.x) ** 2 + (p2.y - mouse.y) ** 2)
          const avgDist = (p1Dist + p2Dist) / 2
          const opacity = Math.max(0, 1 - avgDist / connectionRadius) * 0.6

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = accentColor
          ctx.globalAlpha = opacity
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    }

    // Draw all dots
    points.forEach(point => {
      const dx = point.x - mouse.x
      const dy = point.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const isNearMouse = dist < connectionRadius

      // Calculate opacity based on distance from mouse
      let opacity = dotOpacity
      let size = dotSize

      if (isNearMouse) {
        const proximity = 1 - dist / connectionRadius
        opacity = dotOpacity + proximity * (1 - dotOpacity)
        size = dotSize + proximity * 2
      }

      ctx.beginPath()
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
      ctx.fillStyle = isNearMouse ? accentColor : textMuted
      ctx.globalAlpha = opacity
      ctx.fill()
      ctx.globalAlpha = 1
    })

    animationRef.current = requestAnimationFrame(draw)
  }, [gridSpacing, connectionRadius, dotSize, dotOpacity, ambientMovement])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
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
    }

    // Listen on window for better tracking
    window.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // Start animation
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  )
}
