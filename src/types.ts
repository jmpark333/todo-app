export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';

export type ViewType = 'all' | 'today' | 'scheduled';

export type ThemePalette = 'default' | 'dark' | 'ocean' | 'sunset';

/** Array of valid theme palette values for runtime validation. */
export const VALID_THEMES: ThemePalette[] = ['default', 'dark', 'ocean', 'sunset'];

/**
 * Type guard to validate a string is a valid ThemePalette.
 * Use before casting localStorage or external input to ThemePalette.
 *
 * @param value - String to validate
 * @returns true if value is a valid theme name
 */
export function isValidTheme(value: string): value is ThemePalette {
  return VALID_THEMES.includes(value as ThemePalette);
}

/**
 * Configuration for a theme palette including display label and color tokens.
 * Each color property maps to a CSS custom property (--color-{name}).
 */
export interface ThemeConfig {
  name: ThemePalette;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    success: string;
    danger: string;
  };
}