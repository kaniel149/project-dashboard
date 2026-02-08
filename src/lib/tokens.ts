// ===== Design Tokens - Premium Dark Theme =====

export const colors = {
  // Base
  bg: {
    primary: '#0a0a0f',
    secondary: '#0e0e14',
    tertiary: '#13131a',
    elevated: '#1a1a24',
  },
  // Glass
  glass: {
    bg: 'rgba(18, 18, 26, 0.85)',
    bgLight: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    highlight: 'rgba(255, 255, 255, 0.08)',
  },
  // Accent
  accent: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444',
    pink: '#ec4899',
  },
  // Glow
  glow: {
    blue: 'rgba(59, 130, 246, 0.3)',
    purple: 'rgba(139, 92, 246, 0.25)',
    cyan: 'rgba(6, 182, 212, 0.25)',
    green: 'rgba(34, 197, 94, 0.25)',
  },
  // Text
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.60)',
    tertiary: 'rgba(255, 255, 255, 0.35)',
    muted: 'rgba(255, 255, 255, 0.20)',
  },
  // Status
  status: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    active: '#06b6d4',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const;

export const fonts = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
} as const;

export const shadows = {
  sm: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  md: '0 8px 24px -8px rgba(0, 0, 0, 0.4)',
  lg: '0 16px 48px -16px rgba(0, 0, 0, 0.5)',
  xl: '0 24px 64px -24px rgba(0, 0, 0, 0.6)',
  glow: {
    blue: '0 0 20px rgba(59, 130, 246, 0.3)',
    purple: '0 0 20px rgba(139, 92, 246, 0.3)',
    cyan: '0 0 20px rgba(6, 182, 212, 0.3)',
  },
  glass: `0 0 0 1px rgba(255, 255, 255, 0.05),
    0 25px 50px -12px rgba(0, 0, 0, 0.8),
    0 0 100px -20px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
  card: `0 0 0 1px rgba(255, 255, 255, 0.04),
    0 4px 16px -4px rgba(0, 0, 0, 0.3)`,
  cardHover: `0 0 0 1px rgba(255, 255, 255, 0.08),
    0 20px 40px -15px rgba(0, 0, 0, 0.5),
    0 0 30px -10px rgba(59, 130, 246, 0.15)`,
} as const;

export const transitions = {
  fast: '0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  spring: { type: 'spring' as const, stiffness: 300, damping: 25 },
  springStiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring' as const, stiffness: 400, damping: 17 },
} as const;

export const duration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const blur = {
  sm: '8px',
  md: '16px',
  lg: '40px',
} as const;

export const borderWidth = {
  thin: '1px',
  default: '1.5px',
  thick: '2px',
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const zIndex = {
  base: 0,
  sidebar: 40,
  topbar: 45,
  bottomNav: 48,
  modal: 50,
  commandPalette: 60,
  toast: 70,
  tooltip: 80,
} as const;
