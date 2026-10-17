export const Colors = {
  // Greens
  primary: '#2A5C2E',
  primaryLight: '#3D7A42',
  primaryDark: '#1A3D1C',
  secondary: '#6B8F47',
  sage: '#A8C5A0',
  sageMuted: '#C5D9BF',
  sageDark: '#7A9B72',

  // Warm neutrals
  background: '#F2EDE4',
  backgroundDark: '#E8E0D2',
  card: '#FEFCF8',
  cardBorder: '#E4DDD0',

  // Accent
  accent: '#C9A84C',
  accentLight: '#E8C96B',
  accentDark: '#A68830',

  // Text
  text: '#1C2B1C',
  textSecondary: '#4E624E',
  textMuted: '#7A8E7A',

  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Status
  error: '#B03A2E',
  success: '#1E8449',
  warning: '#D68910',

  // Overlays
  overlay: 'rgba(26, 43, 26, 0.65)',
  overlayLight: 'rgba(26, 43, 26, 0.25)',
  overlayCard: 'rgba(255, 252, 248, 0.85)',
} as const;

export type ColorKey = keyof typeof Colors;
