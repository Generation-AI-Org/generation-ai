import type { CSSProperties } from 'react';

export type LogoColorway =
  | 'auto'
  | 'red'
  | 'neon'
  | 'black'
  | 'white'
  | 'pink'
  | 'blue'
  | 'pink-red'
  | 'red-on-pink'
  | 'blue-neon'
  | 'neon-on-blue'
  | 'sand';

export type LogoContext = 'header' | 'footer' | 'mail';
export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoTheme = 'light' | 'dark';

export interface LogoProps {
  variant?: 'wide';
  colorway?: LogoColorway;
  context?: LogoContext;
  size?: LogoSize;
  height?: number;
  theme?: LogoTheme;
  className?: string;
  alt?: string;
}

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

const MIN_HEIGHT_PX = 32;

// colorway="auto" resolution matrix — matches UI-SPEC.md Phase 16 §Logo Component Contract
function resolveAutoColorway(
  context: LogoContext,
  theme: LogoTheme
): Exclude<LogoColorway, 'auto'> {
  if (context === 'header') return theme === 'dark' ? 'neon' : 'red';
  if (context === 'footer') return theme === 'dark' ? 'white' : 'black';
  if (context === 'mail') return theme === 'dark' ? 'neon' : 'red';
  return 'red';
}

// Detect theme from DOM (client-side only). Project convention: dark is default (:root),
// light is applied via `.light` class on <html>.
function detectTheme(): LogoTheme {
  if (typeof document === 'undefined') return 'light'; // SSR fallback — caller should pass theme prop for SSR correctness
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export function Logo({
  variant = 'wide',
  colorway = 'auto',
  context = 'header',
  size = 'md',
  height,
  theme,
  className,
  alt = 'Generation AI',
}: LogoProps) {
  const resolvedHeight = height ?? SIZE_MAP[size];

  if (resolvedHeight < MIN_HEIGHT_PX) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Logo] height ${resolvedHeight}px is below minimum 32px per brand/DESIGN.md §F. Use size="sm" or height={32} or higher.`
    );
  }

  const resolvedTheme: LogoTheme = theme ?? detectTheme();
  const resolvedColorway =
    colorway === 'auto' ? resolveAutoColorway(context, resolvedTheme) : colorway;

  const src = `/brand/logos/logo-${variant}-${resolvedColorway}.svg`;

  const style: CSSProperties = { margin: 0, height: resolvedHeight, width: 'auto' };

  return (
    <img
      src={src}
      alt={alt}
      height={resolvedHeight}
      className={className}
      style={style}
      draggable={false}
    />
  );
}
