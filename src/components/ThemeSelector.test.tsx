import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSelector from './ThemeSelector';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('ThemeSelector', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render 4 theme options', () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
      expect(screen.getByText('기본')).toBeInTheDocument();
      expect(screen.getByText('다크')).toBeInTheDocument();
      expect(screen.getByText('오션')).toBeInTheDocument();
      expect(screen.getByText('선셋')).toBeInTheDocument();
    });

    it('should render color preview circles for each theme', () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
      // Each theme button has 3 color preview circles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);

      // Check that color preview divs exist (they're styled divs, not queryable by text)
      const container = screen.getByText('테마 선택').parentElement;
      if (container) {
        const colorDivs = container.querySelectorAll('.rounded-full');
        expect(colorDivs.length).toBeGreaterThanOrEqual(12); // 4 themes * 3 colors
      }
    });
  });

  describe('theme selection', () => {
    it('should highlight default theme as active initially', () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );
      const defaultButton = screen.getByText('기본').closest('button');
      expect(defaultButton).toHaveClass('bg-gradient-to-r');
    });

    it('should change theme on button click', async () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );

      const darkButton = screen.getByText('다크').closest('button');
      if (darkButton) {
        await userEvent.click(darkButton);
        expect(darkButton).toHaveClass('bg-gradient-to-r');
      }
    });

    it('should update localStorage on theme change', async () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );

      const oceanButton = screen.getByText('오션').closest('button');
      if (oceanButton) {
        await userEvent.click(oceanButton);
        expect(localStorage.getItem('todo-app-theme')).toBe('ocean');
      }
    });

    it('should update active highlighting when theme changes', async () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );

      // Initially, default is active
      const defaultButton = screen.getByText('기본').closest('button');
      expect(defaultButton).toHaveClass('bg-gradient-to-r');

      // Click sunset
      const sunsetButton = screen.getByText('선셋').closest('button');
      if (sunsetButton) {
        await userEvent.click(sunsetButton);

        // Sunset should now be active
        expect(sunsetButton).toHaveClass('bg-gradient-to-r');

        // Default should no longer be active
        expect(defaultButton).not.toHaveClass('bg-gradient-to-r');
      }
    });
  });

  describe('integration with ThemeProvider', () => {
    it('should work with pre-saved theme from localStorage', () => {
      localStorage.setItem('todo-app-theme', 'dark');
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );

      const darkButton = screen.getByText('다크').closest('button');
      expect(darkButton).toHaveClass('bg-gradient-to-r');
    });

    it('should allow switching between all themes', async () => {
      render(
        <ThemeProvider>
          <ThemeSelector />
        </ThemeProvider>
      );

      const themeNames = ['기본', '다크', '오션', '선셋'];

      for (const themeName of themeNames) {
        const button = screen.getByText(themeName).closest('button');
        if (button) {
          await userEvent.click(button);
          expect(button).toHaveClass('bg-gradient-to-r');
        }
      }
    });
  });
});