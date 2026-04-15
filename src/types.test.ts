import { describe, it, expect } from 'vitest';
import { isValidTheme, VALID_THEMES, ThemePalette } from './types';

describe('types.ts utilities', () => {
  describe('isValidTheme', () => {
    it('should return true for valid theme names', () => {
      expect(isValidTheme('default')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('ocean')).toBe(true);
      expect(isValidTheme('sunset')).toBe(true);
    });

    it('should return false for invalid theme names', () => {
      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme('light')).toBe(false);
      expect(isValidTheme('')).toBe(false);
      expect(isValidTheme('DEFAULT')).toBe(false); // case-sensitive
    });

    it('should work as type guard', () => {
      const value: string = 'ocean';
      if (isValidTheme(value)) {
        // TypeScript should narrow to ThemePalette
        const theme: ThemePalette = value;
        expect(theme).toBe('ocean');
      }
    });
  });

  describe('VALID_THEMES', () => {
    it('should contain all valid theme names', () => {
      expect(VALID_THEMES).toContain('default');
      expect(VALID_THEMES).toContain('dark');
      expect(VALID_THEMES).toContain('ocean');
      expect(VALID_THEMES).toContain('sunset');
    });

    it('should have 4 themes', () => {
      expect(VALID_THEMES.length).toBe(4);
    });
  });
});