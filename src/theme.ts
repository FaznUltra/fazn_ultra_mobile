/** Shared design tokens. Same dark purple scheme as the admin web. */
export const colors = {
  background: '#0a0a0a',
  card: '#141414',
  surface: '#1c1c1c',
  primary: '#7c3aed',
  primaryLight: '#8b5cf6',
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: '#2a2a2a',
  error: '#ef4444',
  success: '#22c55e',
  inputBg: '#1c1c1c',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
