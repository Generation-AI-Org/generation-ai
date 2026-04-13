'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'

interface KiwiMascotProps {
  isActive?: boolean
}

export default function KiwiMascot({ isActive = false }: KiwiMascotProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + 40

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      const maxOffset = 2
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 100, 1) * maxOffset : 0
      const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 100, 1) * maxOffset : 0

      setEyeOffset({ x: normalizedX, y: normalizedY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const colors = theme === 'dark'
    ? {
        skin: '#7A5C14',
        skinLight: '#9B7924',
        skinDark: '#5A4410',
        flesh: '#8BC34A',
        fleshLight: '#A4D465',
        seeds: '#2A2A2A',
        eye: '#FFFFFF',
        pupil: '#111111',
        accent: '#CEFF32',
        metal: '#4A4A4A',
        metalLight: '#6A6A6A',
        metalDark: '#333333',
      }
    : {
        skin: '#8B6C1F',
        skinLight: '#A8842F',
        skinDark: '#6B5215',
        flesh: '#7CB342',
        fleshLight: '#9CCC65',
        seeds: '#333333',
        eye: '#FFFFFF',
        pupil: '#111111',
        accent: '#D91040',
        metal: '#555555',
        metalLight: '#777777',
        metalDark: '#3A3A3A',
      }

  return (
    <div
      ref={containerRef}
      className={`absolute bottom-[58px] right-1 transition-all duration-500 hidden md:block ${
        isActive
          ? 'opacity-25 scale-[0.8] translate-y-6'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      {/* Humanoid Kiwi Robot - Kiwi head on robot body */}
      <svg
        width="130"
        height="195"
        viewBox="0 0 100 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* ========== KIWI HEAD ========== */}
        {/* Antenna */}
        <line x1="50" y1="8" x2="50" y2="0" stroke={colors.metal} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="50" cy="0" r="3" fill={colors.accent} filter="url(#glow)"/>

        {/* Kiwi fruit head - brown outer */}
        <ellipse cx="50" cy="32" rx="26" ry="24" fill={colors.skin}/>
        <ellipse cx="44" cy="26" rx="12" ry="10" fill={colors.skinLight} opacity="0.4"/>

        {/* Green inside */}
        <ellipse cx="50" cy="32" rx="20" ry="18" fill={colors.flesh}/>
        <ellipse cx="50" cy="32" rx="14" ry="12" fill={colors.fleshLight} opacity="0.4"/>

        {/* Core */}
        <ellipse cx="50" cy="32" rx="3" ry="5" fill={colors.skinLight}/>

        {/* Seeds */}
        <g opacity="0.6">
          <circle cx="42" cy="28" r="1.5" fill={colors.seeds}/>
          <circle cx="38" cy="34" r="1.5" fill={colors.seeds}/>
          <circle cx="42" cy="40" r="1.5" fill={colors.seeds}/>
          <circle cx="58" cy="28" r="1.5" fill={colors.seeds}/>
          <circle cx="62" cy="34" r="1.5" fill={colors.seeds}/>
          <circle cx="58" cy="40" r="1.5" fill={colors.seeds}/>
        </g>

        {/* Robot Eyes */}
        <g transform={`translate(${eyeOffset.x * 0.4}, ${eyeOffset.y * 0.4})`}>
          {/* Left eye */}
          <circle cx="42" cy="30" r="7" fill={colors.eye} stroke={colors.metalDark} strokeWidth="1.5"/>
          <circle cx="42" cy="30" r="7" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.5"/>
          <circle cx={42 + eyeOffset.x} cy={30 + eyeOffset.y} r="3.5" fill={colors.pupil}/>
          <circle cx={43.5 + eyeOffset.x * 0.3} cy={28.5 + eyeOffset.y * 0.3} r="1.2" fill="#FFF"/>

          {/* Right eye */}
          <circle cx="58" cy="30" r="7" fill={colors.eye} stroke={colors.metalDark} strokeWidth="1.5"/>
          <circle cx="58" cy="30" r="7" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.5"/>
          <circle cx={58 + eyeOffset.x} cy={30 + eyeOffset.y} r="3.5" fill={colors.pupil}/>
          <circle cx={59.5 + eyeOffset.x * 0.3} cy={28.5 + eyeOffset.y * 0.3} r="1.2" fill="#FFF"/>
        </g>

        {/* Smile */}
        <path d="M44 42 Q50 47 56 42" stroke={colors.skinDark} strokeWidth="2" strokeLinecap="round" fill="none"/>

        {/* ========== ROBOT NECK ========== */}
        <rect x="44" y="54" width="12" height="8" rx="2" fill={colors.metal}/>

        {/* ========== ROBOT BODY / TORSO ========== */}
        <rect x="30" y="60" width="40" height="35" rx="6" fill={colors.metal}/>
        <rect x="34" y="64" width="32" height="27" rx="4" fill={colors.metalLight} opacity="0.3"/>

        {/* Chest light */}
        <circle cx="50" cy="75" r="6" fill={colors.metalDark}/>
        <circle cx="50" cy="75" r="4" fill={colors.accent} filter="url(#glow)"/>

        {/* Chest details */}
        <rect x="38" y="85" width="8" height="3" rx="1" fill={colors.accent} opacity="0.6"/>
        <rect x="54" y="85" width="8" height="3" rx="1" fill={colors.accent} opacity="0.6"/>

        {/* ========== ROBOT ARMS ========== */}
        {/* Left arm */}
        <rect x="16" y="62" width="12" height="22" rx="4" fill={colors.metal}/>
        <rect x="18" y="66" width="8" height="14" rx="2" fill={colors.metalLight} opacity="0.3"/>
        {/* Left hand */}
        <circle cx="22" cy="88" r="6" fill={colors.metalLight}/>
        <circle cx="22" cy="88" r="4" fill={colors.metal}/>

        {/* Right arm */}
        <rect x="72" y="62" width="12" height="22" rx="4" fill={colors.metal}/>
        <rect x="74" y="66" width="8" height="14" rx="2" fill={colors.metalLight} opacity="0.3"/>
        {/* Right hand */}
        <circle cx="78" cy="88" r="6" fill={colors.metalLight}/>
        <circle cx="78" cy="88" r="4" fill={colors.metal}/>

        {/* ========== ROBOT LEGS ========== */}
        {/* Left leg */}
        <rect x="34" y="93" width="12" height="32" rx="4" fill={colors.metal}/>
        <rect x="36" y="97" width="8" height="24" rx="2" fill={colors.metalLight} opacity="0.3"/>
        {/* Left foot */}
        <ellipse cx="40" cy="130" rx="10" ry="5" fill={colors.metalDark}/>
        <ellipse cx="40" cy="128" rx="8" ry="4" fill={colors.metal}/>

        {/* Right leg */}
        <rect x="54" y="93" width="12" height="32" rx="4" fill={colors.metal}/>
        <rect x="56" y="97" width="8" height="24" rx="2" fill={colors.metalLight} opacity="0.3"/>
        {/* Right foot */}
        <ellipse cx="60" cy="130" rx="10" ry="5" fill={colors.metalDark}/>
        <ellipse cx="60" cy="128" rx="8" ry="4" fill={colors.metal}/>

        {/* ========== HIP JOINT ========== */}
        <rect x="36" y="91" width="28" height="6" rx="2" fill={colors.metalDark}/>
      </svg>
    </div>
  )
}
