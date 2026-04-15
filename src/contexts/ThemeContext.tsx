import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemePalette } from '../types';

const THEME_STORAGE_KEY = 'todo-app-theme';

const loadThemeFromStorage = (): ThemePalette => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return stored as ThemePalette;
    }
  } catch (e) {
    console.error('Failed to load theme from localStorage:', e);
  }
  return 'default';
};

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

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}