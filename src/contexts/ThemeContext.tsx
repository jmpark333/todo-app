import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemePalette, isValidTheme } from '../types';

const THEME_STORAGE_KEY = 'todo-app-theme';

/**
 * Loads the saved theme preference from localStorage.
 * Returns the default theme if storage is empty, inaccessible, or contains an invalid value.
 */
const loadThemeFromStorage = (): ThemePalette => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidTheme(stored)) {
      return stored;
    }
  } catch (e) {
    console.error('Failed to load theme from localStorage:', e);
  }
  return 'default';
};

/**
 * Persists the current theme to localStorage.
 * Silently fails if storage is unavailable (e.g., private browsing, quota exceeded).
 */
const saveThemeToStorage = (theme: ThemePalette): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
};

interface ThemeContextType {
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Context provider for the theme system.
 *
 * Wraps the application to provide theme state via React Context.
 * Automatically loads saved theme preference from localStorage on mount,
 * and syncs current theme to DOM via `data-theme` attribute.
 *
 * @param children - React children to wrap with theme context
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemePalette>(() => loadThemeFromStorage());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveThemeToStorage(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the theme context.
 *
 * Must be called within a ThemeProvider wrapper. Returns current theme
 * state and setter function to change the theme palette.
 *
 * @returns Object containing `theme` and `setTheme`
 * @throws Error if called outside of ThemeProvider
 * @example
 * ```tsx
 * const { theme, setTheme } = useTheme();
 * setTheme('dark');
 * ```
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}