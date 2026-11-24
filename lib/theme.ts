import { DefaultTheme } from 'expo-router/react-navigation';

// Native navigation and artwork colors. Keep semantic tokens aligned with global.css.
export const theme = {
  colors: {
    background: '#F5F9FF',
    foreground: '#1D3557',
    card: '#FFFFFF',
    cardForeground: '#1D3557',
    popover: '#FFFFFF',
    popoverForeground: '#1D3557',
    primary: '#A8C8F0',
    primaryForeground: '#1D3557',
    secondary: '#E9F2FF',
    secondaryForeground: '#1D3557',
    muted: '#E9F2FF',
    mutedForeground: '#526780',
    accent: '#E9F2FF',
    accentForeground: '#1D3557',
    destructive: '#B13F48',
    border: '#D9E5F3',
    input: '#D9E5F3',
    ring: '#396799',
    navy: '#1D3557',
    brandNavy: '#102E4E',
    brandBlue: '#2F7DD5',
  },
  radius: 10,
} as const;

export const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.navy,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.foreground,
    border: theme.colors.border,
    notification: theme.colors.ring,
  },
};
