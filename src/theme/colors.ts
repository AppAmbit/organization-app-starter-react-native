export const Palette = {
  // Brand
  accent: '#6C63FF',
  accentLight: '#8B84FF',
  accentDark: '#4D45CC',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',

  // Dark mode surfaces
  dark: {
    background: '#0D0D0F',
    surface: '#18181C',
    surfaceElevated: '#222228',
    border: '#2A2A32',
    textPrimary: '#F0F0F5',
    textSecondary: '#9090A0',
    textTertiary: '#606070',
    overlay: 'rgba(0,0,0,0.6)',
  },

  // Light mode surfaces
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#F2F2F7',
    border: '#E5E5EA',
    textPrimary: '#0D0D0F',
    textSecondary: '#6B6B80',
    textTertiary: '#AEAEBE',
    overlay: 'rgba(0,0,0,0.45)',
  },

  // Category colors
  categories: {
    Design: '#FF6B6B',
    Technology: '#4ECDC4',
    Business: '#FFD93D',
    Lifestyle: '#C780FA',
    Development: '#6C63FF',
    Default: '#A0A0B0',
  },

  // Status
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
};

export type ColorScheme = 'light' | 'dark';

export const getColors = (scheme: 'light' | 'dark' | 'unspecified' | null | undefined) => {
  const s: ColorScheme = scheme === 'dark' ? 'dark' : 'light';
  return {
    accent: Palette.accent,
    accentLight: Palette.accentLight,
    accentDark: Palette.accentDark,
    background: s === 'dark' ? Palette.dark.background : Palette.light.background,
    surface: s === 'dark' ? Palette.dark.surface : Palette.light.surface,
    surfaceElevated: s === 'dark' ? Palette.dark.surfaceElevated : Palette.light.surfaceElevated,
    border: s === 'dark' ? Palette.dark.border : Palette.light.border,
    textPrimary: s === 'dark' ? Palette.dark.textPrimary : Palette.light.textPrimary,
    textSecondary: s === 'dark' ? Palette.dark.textSecondary : Palette.light.textSecondary,
    textTertiary: s === 'dark' ? Palette.dark.textTertiary : Palette.light.textTertiary,
    overlay: s === 'dark' ? Palette.dark.overlay : Palette.light.overlay,
    categories: Palette.categories,
    white: Palette.white,
    black: Palette.black,
    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    info: Palette.info,
  };
};

export type AppColors = ReturnType<typeof getColors>;

