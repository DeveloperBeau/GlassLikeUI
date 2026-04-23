import { describe, it, expect } from 'vitest';
import {
	INTENSITY_CONFIG,
	VARIANT_CONFIG,
	DEFAULT_VARIANT,
	DEFAULT_INTENSITY,
	type GlassIntensity,
	type GlassVariant
} from '../../src/lib/constants/variants';

describe('variants', () => {
	describe('INTENSITY_CONFIG shape', () => {
		it('exposes exactly subtle, standard, prominent', () => {
			expect(Object.keys(INTENSITY_CONFIG)).toEqual(['subtle', 'standard', 'prominent']);
		});

		const keys: GlassIntensity[] = ['subtle', 'standard', 'prominent'];
		it.each(keys)('%s config has blur/displacementScale/saturation numbers', (k) => {
			const cfg = INTENSITY_CONFIG[k];
			expect(typeof cfg.blur).toBe('number');
			expect(typeof cfg.displacementScale).toBe('number');
			expect(typeof cfg.saturation).toBe('number');
		});
	});

	describe('INTENSITY_CONFIG values', () => {
		it('subtle has expected token values', () => {
			expect(INTENSITY_CONFIG.subtle).toEqual({
				blur: 10,
				displacementScale: 4,
				saturation: 1.4
			});
		});

		it('standard has expected token values', () => {
			expect(INTENSITY_CONFIG.standard).toEqual({
				blur: 20,
				displacementScale: 8,
				saturation: 1.8
			});
		});

		it('prominent has expected token values', () => {
			expect(INTENSITY_CONFIG.prominent).toEqual({
				blur: 32,
				displacementScale: 14,
				saturation: 2.2
			});
		});
	});

	describe('INTENSITY_CONFIG monotonicity', () => {
		it('blur strictly increases', () => {
			expect(INTENSITY_CONFIG.subtle.blur).toBeLessThan(INTENSITY_CONFIG.standard.blur);
			expect(INTENSITY_CONFIG.standard.blur).toBeLessThan(INTENSITY_CONFIG.prominent.blur);
		});

		it('displacementScale strictly increases', () => {
			expect(INTENSITY_CONFIG.subtle.displacementScale).toBeLessThan(
				INTENSITY_CONFIG.standard.displacementScale
			);
			expect(INTENSITY_CONFIG.standard.displacementScale).toBeLessThan(
				INTENSITY_CONFIG.prominent.displacementScale
			);
		});

		it('saturation strictly increases', () => {
			expect(INTENSITY_CONFIG.subtle.saturation).toBeLessThan(INTENSITY_CONFIG.standard.saturation);
			expect(INTENSITY_CONFIG.standard.saturation).toBeLessThan(
				INTENSITY_CONFIG.prominent.saturation
			);
		});
	});

	describe('VARIANT_CONFIG shape', () => {
		it('exposes exactly regular and clear', () => {
			expect(Object.keys(VARIANT_CONFIG)).toEqual(['regular', 'clear']);
		});

		const keys: GlassVariant[] = ['regular', 'clear'];
		it.each(keys)('%s config has opacityDark/opacityLight/requiresDimLayer', (k) => {
			const cfg = VARIANT_CONFIG[k];
			expect(typeof cfg.opacityDark).toBe('number');
			expect(typeof cfg.opacityLight).toBe('number');
			expect(typeof cfg.requiresDimLayer).toBe('boolean');
		});
	});

	describe('VARIANT_CONFIG values', () => {
		it('regular has expected opacities', () => {
			expect(VARIANT_CONFIG.regular).toEqual({
				opacityDark: 0.30,
				opacityLight: 0.22,
				requiresDimLayer: false
			});
		});

		it('clear has expected opacities', () => {
			expect(VARIANT_CONFIG.clear).toEqual({
				opacityDark: 0.08,
				opacityLight: 0.06,
				requiresDimLayer: true
			});
		});
	});

	describe('VARIANT_CONFIG semantics', () => {
		it('regular is opaquer than clear in dark mode', () => {
			expect(VARIANT_CONFIG.regular.opacityDark).toBeGreaterThan(VARIANT_CONFIG.clear.opacityDark);
		});

		it('regular is opaquer than clear in light mode', () => {
			expect(VARIANT_CONFIG.regular.opacityLight).toBeGreaterThan(
				VARIANT_CONFIG.clear.opacityLight
			);
		});

		it('dark-mode opacity is equal or higher than light-mode for each variant', () => {
			expect(VARIANT_CONFIG.regular.opacityDark).toBeGreaterThanOrEqual(
				VARIANT_CONFIG.regular.opacityLight
			);
			expect(VARIANT_CONFIG.clear.opacityDark).toBeGreaterThanOrEqual(
				VARIANT_CONFIG.clear.opacityLight
			);
		});

		it('clear requires a dim layer companion', () => {
			expect(VARIANT_CONFIG.clear.requiresDimLayer).toBe(true);
		});

		it('regular does not require a dim layer', () => {
			expect(VARIANT_CONFIG.regular.requiresDimLayer).toBe(false);
		});

		it('opacities stay within 0..1 for every variant', () => {
			for (const key of Object.keys(VARIANT_CONFIG) as GlassVariant[]) {
				const cfg = VARIANT_CONFIG[key];
				expect(cfg.opacityDark).toBeGreaterThan(0);
				expect(cfg.opacityDark).toBeLessThanOrEqual(1);
				expect(cfg.opacityLight).toBeGreaterThan(0);
				expect(cfg.opacityLight).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('defaults', () => {
		it('default variant is regular', () => {
			expect(DEFAULT_VARIANT).toBe('regular');
		});

		it('default intensity is standard', () => {
			expect(DEFAULT_INTENSITY).toBe('standard');
		});

		it('default variant exists in VARIANT_CONFIG', () => {
			expect(VARIANT_CONFIG[DEFAULT_VARIANT]).toBeDefined();
		});

		it('default intensity exists in INTENSITY_CONFIG', () => {
			expect(INTENSITY_CONFIG[DEFAULT_INTENSITY]).toBeDefined();
		});
	});
});
