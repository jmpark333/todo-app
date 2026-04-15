import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeContext';

// Helper component to access and display theme context
function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
      <button onClick={() => setTheme('ocean')} data-testid="set-ocean">Set Ocean</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('localStorage persistence', () => {
    it('should return default theme when localStorage is empty', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('default');
    });

    it('should restore saved theme from localStorage', () => {
      localStorage.setItem('todo-app-theme', 'ocean');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('ocean');
    });

    it('should fallback to default for invalid stored values', () => {
      localStorage.setItem('todo-app-theme', 'invalid-theme');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('default');
    });

    it('should handle localStorage getItem errors gracefully', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem');
      spy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('default');
      spy.mockRestore();
    });

    it('should handle localStorage setItem errors gracefully', async () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem');
      spy.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await userEvent.click(screen.getByTestId('set-dark'));

      // Theme should still update in state despite storage failure
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(consoleSpy).toHaveBeenCalled();

      spy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      function BadComponent() {
        useTheme();
        return null;
      }

      expect(() => render(<BadComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      );
    });

    it('should return theme context when used within ThemeProvider', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('default');
    });
  });

  describe('theme state changes', () => {
    it('should update theme state when setTheme is called', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('default');

      await userEvent.click(screen.getByTestId('set-dark'));
      expect(screen.getByTestId('theme').textContent).toBe('dark');

      await userEvent.click(screen.getByTestId('set-ocean'));
      expect(screen.getByTestId('theme').textContent).toBe('ocean');
    });

    it('should persist theme changes to localStorage', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await userEvent.click(screen.getByTestId('set-dark'));
      expect(localStorage.getItem('todo-app-theme')).toBe('dark');
    });
  });

  describe('data-theme DOM attribute', () => {
    it('should set data-theme attribute on document.documentElement', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(document.documentElement.getAttribute('data-theme')).toBe('default');
    });

    it('should update data-theme attribute when theme changes', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('default');

      await userEvent.click(screen.getByTestId('set-dark'));
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});