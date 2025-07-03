import { MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { Theme as NavigationTheme } from '@react-navigation/native';

/* ──────────────────────────────────────────────────────────
 * Design tokens – tweak just these values to reskin the app.
 * We start from MD3DarkTheme for correct default dark elevations.
 * ----------------------------------------------------------------*/
export const customTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF8870', // CTA accent
    secondary: '#9F6781',

    background: '#320A28',
    surface: '#511730',

    onSurface: '#FFFFFF',
    onPrimary: '#320A28',
    outline: '#544E72',

    error: '#BA4747',
  },
};

/* ──────────────────────────────────────────────────────────
 * React‑Navigation theme. Only required keys are provided –
 * fonts object is removed (RN Nav ignores it anyway).
 * ----------------------------------------------------------------*/
export const customNavigationTheme: NavigationTheme = {
    dark: true,
    colors: {
        primary: customTheme.colors.primary,
        background: customTheme.colors.background,
        card: customTheme.colors.surface,
        text: customTheme.colors.onSurface,
        border: customTheme.colors.outline,
        notification: customTheme.colors.secondary,
    },
    fonts: {
        regular: {
            fontFamily: '',
            fontWeight: 'bold'
        },
        medium: {
            fontFamily: '',
            fontWeight: 'bold'
        },
        bold: {
            fontFamily: '',
            fontWeight: 'bold'
        },
        heavy: {
            fontFamily: '',
            fontWeight: 'bold'
        }
    }
};
