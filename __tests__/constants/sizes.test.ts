import { describe, it, expect } from 'vitest';
import {
	ICON_SIZES,
	CORNER_RADIUS,
	PADDING,
	SPACING
} from '../../src/lib/constants/sizes';

describe('Size Constants', () => {
	describe('ICON_SIZES', () => {
		it('should have all expected size variants', () => {
			expect(ICON_SIZES).toHaveProperty('xs');
			expect(ICON_SIZES).toHaveProperty('sm');
			expect(ICON_SIZES).toHaveProperty('md');
			expect(ICON_SIZES).toHaveProperty('lg');
			expect(ICON_SIZES).toHaveProperty('xl');
		});

		it('should have correct pixel values', () => {
			expect(ICON_SIZES.xs).toBe(12);
			expect(ICON_SIZES.sm).toBe(16);
			expect(ICON_SIZES.md).toBe(20);
			expect(ICON_SIZES.lg).toBe(24);
			expect(ICON_SIZES.xl).toBe(32);
		});

		it('should be in ascending order', () => {
			expect(ICON_SIZES.xs).toBeLessThan(ICON_SIZES.sm);
			expect(ICON_SIZES.sm).toBeLessThan(ICON_SIZES.md);
			expect(ICON_SIZES.md).toBeLessThan(ICON_SIZES.lg);
			expect(ICON_SIZES.lg).toBeLessThan(ICON_SIZES.xl);
		});
	});

	describe('CORNER_RADIUS', () => {
		it('should have all expected radius variants', () => {
			expect(CORNER_RADIUS).toHaveProperty('none');
			expect(CORNER_RADIUS).toHaveProperty('sm');
			expect(CORNER_RADIUS).toHaveProperty('md');
			expect(CORNER_RADIUS).toHaveProperty('lg');
			expect(CORNER_RADIUS).toHaveProperty('xl');
			expect(CORNER_RADIUS).toHaveProperty('full');
		});

		it('should have none as 0', () => {
			expect(CORNER_RADIUS.none).toBe('0');
		});

		it('should use CSS variables for sizes', () => {
			expect(CORNER_RADIUS.sm).toContain('var(--glass-radius');
			expect(CORNER_RADIUS.md).toContain('var(--glass-radius');
			expect(CORNER_RADIUS.lg).toContain('var(--glass-radius');
		});
	});

	describe('PADDING', () => {
		it('should have all expected padding variants', () => {
			expect(PADDING).toHaveProperty('none');
			expect(PADDING).toHaveProperty('xs');
			expect(PADDING).toHaveProperty('sm');
			expect(PADDING).toHaveProperty('md');
			expect(PADDING).toHaveProperty('lg');
			expect(PADDING).toHaveProperty('xl');
		});

		it('should have none as 0', () => {
			expect(PADDING.none).toBe('0');
		});

		it('should use CSS variables for spacing', () => {
			expect(PADDING.sm).toContain('var(--spacing');
			expect(PADDING.md).toContain('var(--spacing');
		});
	});

	describe('SPACING', () => {
		it('should have 2xl variant for extra large spacing', () => {
			expect(SPACING).toHaveProperty('2xl');
			expect(SPACING['2xl']).toContain('var(--spacing-2xl');
		});
	});
});
