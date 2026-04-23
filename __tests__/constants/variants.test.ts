import { describe, it, expect } from 'vitest';
import {
	INTENSITY_CONFIG,
	VARIANT_CONFIG,
	DEFAULT_VARIANT,
	DEFAULT_INTENSITY
} from '../../src/lib/constants/variants';

describe('variants', () => {
	describe('INTENSITY_CONFIG', () => {
		it('exposes subtle, standard, prominent', () => {
			expect(Object.keys(INTENSITY_CONFIG)).toEqual(['subtle', 'standard', 'prominent']);
		});

		it('monotonically increases blur with intensity', () => {
			expect(INTENSITY_CONFIG.subtle.blur).toBeLessThan(INTENSITY_CONFIG.standard.blur);
			expect(INTENSITY_CONFIG.standard.blur).toBeLessThan(INTENSITY_CONFIG.prominent.blur);
		});

		it('monotonically increases displacement with intensity', () => {
			expect(INTENSITY_CONFIG.subtle.displacementScale).toBeLessThan(
				INTENSITY_CONFIG.standard.displacementScale
			);
			expect(INTENSITY_CONFIG.standard.displacementScale).toBeLessThan(
				INTENSITY_CONFIG.prominent.displacementScale
			);
		});

		it('monotonically increases saturation with intensity', () => {
			expect(INTENSITY_CONFIG.subtle.saturation).toBeLessThan(INTENSITY_CONFIG.standard.saturation);
			expect(INTENSITY_CONFIG.standard.saturation).toBeLessThan(
				INTENSITY_CONFIG.prominent.saturation
			);
		});
	});

	describe('VARIANT_CONFIG', () => {
		it('exposes regular and clear', () => {
			expect(Object.keys(VARIANT_CONFIG)).toEqual(['regular', 'clear']);
		});

		it('regular is opaquer than clear', () => {
			expect(VARIANT_CONFIG.regular.opacityDark).toBeGreaterThan(VARIANT_CONFIG.clear.opacityDark);
			expect(VARIANT_CONFIG.regular.opacityLight).toBeGreaterThan(
				VARIANT_CONFIG.clear.opacityLight
			);
		});

		it('clear requires a dim layer companion', () => {
			expect(VARIANT_CONFIG.clear.requiresDimLayer).toBe(true);
			expect(VARIANT_CONFIG.regular.requiresDimLayer).toBe(false);
		});
	});

	describe('defaults', () => {
		it('defaults to regular variant and standard intensity', () => {
			expect(DEFAULT_VARIANT).toBe('regular');
			expect(DEFAULT_INTENSITY).toBe('standard');
		});
	});
});
