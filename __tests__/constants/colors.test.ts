import { describe, it, expect } from 'vitest';
import { TEXT_COLORS, BG_COLORS } from '../../src/lib/constants/colors';

describe('Color Constants', () => {
	describe('TEXT_COLORS', () => {
		it('should have all expected color variants', () => {
			expect(TEXT_COLORS).toHaveProperty('primary');
			expect(TEXT_COLORS).toHaveProperty('secondary');
			expect(TEXT_COLORS).toHaveProperty('tertiary');
			expect(TEXT_COLORS).toHaveProperty('accent');
			expect(TEXT_COLORS).toHaveProperty('white');
		});

		it('should use CSS variables for theme colors', () => {
			expect(TEXT_COLORS.primary).toContain('var(--color-text');
			expect(TEXT_COLORS.secondary).toContain('var(--color-text-secondary');
			expect(TEXT_COLORS.tertiary).toContain('var(--color-text-tertiary');
			expect(TEXT_COLORS.accent).toContain('var(--color-accent');
		});

		it('should have white as hex value', () => {
			expect(TEXT_COLORS.white).toBe('#ffffff');
		});
	});

	describe('BG_COLORS', () => {
		it('should have all expected background variants', () => {
			expect(BG_COLORS).toHaveProperty('primary');
			expect(BG_COLORS).toHaveProperty('secondary');
			expect(BG_COLORS).toHaveProperty('tertiary');
			expect(BG_COLORS).toHaveProperty('accent');
			expect(BG_COLORS).toHaveProperty('transparent');
		});

		it('should have transparent value', () => {
			expect(BG_COLORS.transparent).toBe('transparent');
		});
	});
});
