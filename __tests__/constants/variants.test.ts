import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
	INTENSITY_CONFIG,
	VARIANT_CONFIG,
	DEFAULT_VARIANT,
	DEFAULT_INTENSITY,
	BUTTON_GLASS_STYLE,
	isGlassButtonVariant,
	glassButtonVars,
	type GlassIntensity,
	type GlassVariant,
	type ButtonVariant,
	type GlassButtonVariant
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

	describe('BUTTON_GLASS_STYLE', () => {
		it('exposes exactly the two SwiftUI glass button styles', () => {
			expect(Object.keys(BUTTON_GLASS_STYLE)).toEqual(['glass', 'glassProminent']);
		});

		// Literal expectations, not lookups into the object under test: asserting
		// BUTTON_GLASS_STYLE.glass.intensity === BUTTON_GLASS_STYLE.glass.intensity
		// would hold for any value.
		it('maps .glass to a subtle regular surface with no tint', () => {
			expect(BUTTON_GLASS_STYLE.glass).toEqual({
				variant: 'regular',
				intensity: 'subtle',
				tinted: false
			});
		});

		it('maps .glassProminent to a standard regular surface with an accent tint', () => {
			expect(BUTTON_GLASS_STYLE.glassProminent).toEqual({
				variant: 'regular',
				intensity: 'standard',
				tinted: true
			});
		});

		it('references only intensities that exist in INTENSITY_CONFIG', () => {
			for (const style of Object.values(BUTTON_GLASS_STYLE)) {
				expect(INTENSITY_CONFIG[style.intensity]).toBeDefined();
			}
		});

		it('references only variants that exist in VARIANT_CONFIG', () => {
			for (const style of Object.values(BUTTON_GLASS_STYLE)) {
				expect(VARIANT_CONFIG[style.variant]).toBeDefined();
			}
		});
	});

	describe('isGlassButtonVariant', () => {
		it.each(['glass', 'glassProminent'] as const)('accepts %s', (v) => {
			expect(isGlassButtonVariant(v)).toBe(true);
		});

		it.each(['filled', 'outlined', 'plain', 'tinted', 'destructive'] as const)(
			'rejects the non-glass variant %s',
			(v) => {
				expect(isGlassButtonVariant(v)).toBe(false);
			}
		);

		it('rejects the empty string', () => {
			expect(isGlassButtonVariant('')).toBe(false);
		});

		// 'tinted' is a real button variant and BUTTON_GLASS_STYLE.glassProminent
		// carries a `tinted` flag; a prototype-walking or substring implementation
		// would confuse the two.
		it('rejects near-miss names', () => {
			for (const v of ['Glass', 'glassprominent', 'glass ', ' glass', 'glassProminentX']) {
				expect(isGlassButtonVariant(v)).toBe(false);
			}
		});

		it('rejects inherited Object properties', () => {
			for (const v of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
				expect(isGlassButtonVariant(v)).toBe(false);
			}
		});

		describe('fuzz', () => {
			// FALSE POSITIVE validation: no arbitrary string may be mistaken for a
			// glass variant, which would render a backdrop layer for a solid button.
			it('accepts nothing outside the two known names', () => {
				fc.assert(
					fc.property(fc.string(), (s) => {
						const known = s === 'glass' || s === 'glassProminent';
						expect(isGlassButtonVariant(s)).toBe(known);
					}),
					{ numRuns: 1000 }
				);
			});

			// FALSE NEGATIVE validation: the predicate must agree with the table it
			// guards, in both directions, for every declared button variant.
			it('agrees with BUTTON_GLASS_STYLE membership for every ButtonVariant', () => {
				const all: ButtonVariant[] = [
					'filled',
					'outlined',
					'plain',
					'tinted',
					'destructive',
					'glass',
					'glassProminent'
				];
				fc.assert(
					fc.property(fc.constantFrom(...all), (v) => {
						expect(isGlassButtonVariant(v)).toBe(
							Object.prototype.hasOwnProperty.call(BUTTON_GLASS_STYLE, v)
						);
					}),
					{ numRuns: 200 }
				);
			});
		});
	});

	describe('glassButtonVars', () => {
		it('resolves .glass to the subtle blur/saturation and regular opacity', () => {
			expect(glassButtonVars('glass')).toEqual({
				blur: 10,
				saturation: 1.4,
				opacity: 0.3,
				tinted: false
			});
		});

		it('resolves .glassProminent to the standard blur/saturation and regular opacity', () => {
			expect(glassButtonVars('glassProminent')).toEqual({
				blur: 20,
				saturation: 1.8,
				opacity: 0.3,
				tinted: true
			});
		});

		// The whole reason this function exists rather than hardcoded CSS: the
		// numbers must stay wired to the shared tokens, not copied beside them.
		it('reads its numbers from INTENSITY_CONFIG rather than a private copy', () => {
			for (const name of ['glass', 'glassProminent'] as const) {
				const cfg = INTENSITY_CONFIG[BUTTON_GLASS_STYLE[name].intensity];
				const vars = glassButtonVars(name);
				expect(vars?.blur).toBe(cfg.blur);
				expect(vars?.saturation).toBe(cfg.saturation);
			}
		});

		it('reads its opacity from VARIANT_CONFIG rather than a private copy', () => {
			for (const name of ['glass', 'glassProminent'] as const) {
				const cfg = VARIANT_CONFIG[BUTTON_GLASS_STYLE[name].variant];
				expect(glassButtonVars(name)?.opacity).toBe(cfg.opacityDark);
			}
		});

		it('gives the prominent style a stronger blur than the plain one', () => {
			const plain = glassButtonVars('glass');
			const prominent = glassButtonVars('glassProminent');
			expect(prominent!.blur).toBeGreaterThan(plain!.blur);
		});

		it.each(['filled', 'outlined', 'plain', 'tinted', 'destructive'] as const)(
			'returns null for the non-glass variant %s',
			(v) => {
				expect(glassButtonVars(v)).toBeNull();
			}
		);

		it('returns null rather than throwing for an unknown variant', () => {
			expect(() => glassButtonVars('nope' as ButtonVariant)).not.toThrow();
			expect(glassButtonVars('nope' as ButtonVariant)).toBeNull();
		});

		describe('fuzz', () => {
			const glassNames = fc.constantFrom<GlassButtonVariant>('glass', 'glassProminent');

			// FALSE NEGATIVE validation: a glass variant must always produce a
			// usable, renderable surface -- never null, NaN or a negative length.
			it('always produces finite, renderable values for glass variants', () => {
				fc.assert(
					fc.property(glassNames, (name) => {
						const vars = glassButtonVars(name);
						expect(vars).not.toBeNull();
						expect(Number.isFinite(vars!.blur)).toBe(true);
						expect(vars!.blur).toBeGreaterThan(0);
						expect(Number.isFinite(vars!.saturation)).toBe(true);
						expect(vars!.saturation).toBeGreaterThanOrEqual(1);
						expect(vars!.opacity).toBeGreaterThan(0);
						expect(vars!.opacity).toBeLessThanOrEqual(1);
						expect(typeof vars!.tinted).toBe('boolean');
					}),
					{ numRuns: 500 }
				);
			});

			// FALSE POSITIVE validation: nothing else may yield a glass surface.
			it('returns null for every string that is not a glass variant', () => {
				fc.assert(
					fc.property(
						fc.string().filter((s) => s !== 'glass' && s !== 'glassProminent'),
						(s) => {
							expect(glassButtonVars(s as ButtonVariant)).toBeNull();
						}
					),
					{ numRuns: 1000 }
				);
			});

			// Consistency across the seam: the predicate and the resolver must never
			// disagree, or Button would add a glass class with no glass variables.
			it('is non-null exactly when isGlassButtonVariant is true', () => {
				fc.assert(
					fc.property(fc.string(), (s) => {
						expect(glassButtonVars(s as ButtonVariant) !== null).toBe(isGlassButtonVariant(s));
					}),
					{ numRuns: 1000 }
				);
			});
		});
	});
});
