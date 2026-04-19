/**
 * Email design tokens — inline-usable JS values derived from brand/tokens.json.
 * No CSS variables, no Tailwind. All values are plain strings for direct inline style use.
 * Matches brand/tokens.json theme.light + theme.dark exactly.
 */

export const tokens = {
  light: {
    bg: '#F6F6F6',
    bgCard: '#FFFFFF',
    accent: '#F5133B',
    accentHover: '#D9102F',
    text: '#141414',
    textMuted: '#555555',
    textOnAccent: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    bg: '#141414',
    bgCard: '#1C1C1C',
    accent: '#CEFF32',
    accentHover: '#D4FF4D',
    text: '#F6F6F6',
    textMuted: '#8A8A8A',
    textOnAccent: '#141414',
    border: 'rgba(255, 255, 255, 0.08)',
  },
} as const

export const radius = {
  full: '9999px',
  '2xl': '16px',
} as const

export const space = {
  2: '8px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
} as const

export const fontStack = {
  sans: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'Geist Mono', ui-monospace, Menlo, monospace",
} as const
