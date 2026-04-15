import { useTheme } from '../contexts/ThemeContext';
import { ThemeConfig } from '../types';

const themeConfigs: ThemeConfig[] = [
  {
    name: 'default',
    label: '기본',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: '#4c1d95',
      surface: '#ffffff',
      text: '#1f2937',
      textMuted: '#6b7280',
      success: '#10b981',
      danger: '#ef4444',
    },
  },
  {
    name: 'dark',
    label: '다크',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#c084fc',
      background: '#0f0f23',
      surface: '#1e1e2e',
      text: '#e5e5e5',
      textMuted: '#9ca3af',
      success: '#22c55e',
      danger: '#f87171',
    },
  },
  {
    name: 'ocean',
    label: '오션',
    colors: {
      primary: '#0891b2',
      secondary: '#14b8a6',
      accent: '#06b6d4',
      background: '#164e63',
      surface: '#f0fdfa',
      text: '#134e4a',
      textMuted: '#5eead4',
      success: '#10b981',
      danger: '#f43f5e',
    },
  },
  {
    name: 'sunset',
    label: '선셋',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fbbf24',
      background: '#7c2d12',
      surface: '#fff7ed',
      text: '#431407',
      textMuted: '#fb923c',
      success: '#22c55e',
      danger: '#dc2626',
    },
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-white/95 rounded-2xl p-4 shadow-xl">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">테마 선택</h3>
      <div className="space-y-2">
        {themeConfigs.map((config) => (
          <button
            key={config.name}
            onClick={() => setTheme(config.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              theme === config.name
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg ring-2 ring-violet-400/50'
                : 'text-gray-600 hover:bg-violet-50'
            }`}
          >
            <div className="flex gap-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: config.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: config.colors.secondary }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: config.colors.accent }}
              />
            </div>
            <span className="font-medium">{config.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}