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