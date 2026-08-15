import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
	GLASS_SHAPES,
	DEFAULT_GLASS_SHAPE,
	glassShapeStyle,
	type GlassShape
} from '../../src/lib/constants/shapes';
import { CORNER_RADIUS, type CornerRadius } from '../../src/lib/constants/sizes';

const RADII: CornerRadius[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

describe('shapes', () => {
	describe('GLASS_SHAPES', () => {
		it('exposes exactly rect, capsule and circle', () => {
			expect(GLASS_SHAPES).toEqual(['rect', 'capsule', 'circle']);
		});

		it('defaults to rect, preserving the pre-shape behaviour', () => {
			expect(DEFAULT_GLASS_SHAPE).toBe('rect');
		});

		it('lists the default shape', () => {
			expect(GLASS_SHAPES).toContain(DEFAULT_GLASS_SHAPE);
		});
	});

	describe('glassShapeStyle — rect', () => {
		it.each(RADII)('passes the %s corner-radius token straight through', (r) => {
			expect(glassShapeStyle('rect', r).radius).toBe(CORNER_RADIUS[r]);
		});

		it('resolves md to the documented token value', () => {
			expect(glassShapeStyle('rect', 'md').radius).toBe('var(--glass-radius-md)');
		});

		it('does not constrain the aspect ratio', () => {
			expect(glassShapeStyle('rect', 'md').aspectRatio).toBeNull();
		});
	});

	describe('glassShapeStyle — capsule', () => {
		it('pins the radius to the full token regardless of cornerRadius', () => {
			for (const r of RADII) {
				expect(glassShapeStyle('capsule', r).radius).toBe('var(--glass-radius-full)');
			}
		});

		it('does not constrain the aspect ratio', () => {
			expect(glassShapeStyle('capsule', 'sm').aspectRatio).toBeNull();
		});
	});

	describe('glassShapeStyle — circle', () => {
		it('uses a 50% radius regardless of cornerRadius', () => {
			for (const r of RADII) {
				expect(glassShapeStyle('circle', r).radius).toBe('50%');
			}
		});

		// Without a square box a 50% radius renders an ellipse, not a circle.
		it('locks the box to a 1:1 aspect ratio', () => {
			expect(glassShapeStyle('circle', 'md').aspectRatio).toBe('1 / 1');
		});
	});

	describe('glassShapeStyle — failure cases', () => {
		it('falls back to the rect radius for an unknown shape', () => {
			expect(glassShapeStyle('blob' as GlassShape, 'md')).toEqual({
				radius: 'var(--glass-radius-md)',
				aspectRatio: null
			});
		});

		// An unmapped key would otherwise interpolate the string "undefined" into
		// border-radius, silently squaring off the surface.
		it('falls back to the lg token for an unknown corner radius', () => {
			expect(glassShapeStyle('rect', 'huge' as CornerRadius).radius).toBe(
				'var(--glass-radius-lg)'
			);
		});

		it('never throws on unknown input', () => {
			expect(() =>
				glassShapeStyle(undefined as unknown as GlassShape, undefined as unknown as CornerRadius)
			).not.toThrow();
		});

		it('ignores inherited Object keys as shapes', () => {
			expect(glassShapeStyle('toString' as GlassShape, 'sm').radius).toBe(CORNER_RADIUS.sm);
		});

		it('ignores inherited Object keys as corner radii', () => {
			expect(glassShapeStyle('rect', 'constructor' as CornerRadius).radius).toBe(
				'var(--glass-radius-lg)'
			);
		});
	});

	describe('fuzz', () => {
		const shape = fc.constantFrom<GlassShape>(...GLASS_SHAPES);
		const radius = fc.constantFrom<CornerRadius>(...RADII);

		// FALSE NEGATIVE validation: every declared combination must yield a
		// usable CSS length -- never undefined, null or an empty string.
		it('always produces a non-empty radius for declared inputs', () => {
			fc.assert(
				fc.property(shape, radius, (s, r) => {
					const out = glassShapeStyle(s, r);
					expect(typeof out.radius).toBe('string');
					expect(out.radius.length).toBeGreaterThan(0);
					expect(out.radius).not.toContain('undefined');
					expect(out.radius).not.toContain('null');
				}),
				{ numRuns: 500 }
			);
		});

		// FALSE POSITIVE validation: arbitrary junk must never be echoed into the
		// stylesheet -- that would be a CSS injection through a prop.
		it('never echoes arbitrary input into the radius', () => {
			fc.assert(
				fc.property(fc.string(), fc.string(), (s, r) => {
					const out = glassShapeStyle(s as GlassShape, r as CornerRadius);
					const allowed = [
						...Object.values(CORNER_RADIUS),
						'var(--glass-radius-full)',
						'50%'
					];
					expect(allowed).toContain(out.radius);
					expect([null, '1 / 1']).toContain(out.aspectRatio);
				}),
				{ numRuns: 1000 }
			);
		});

		// Only the circle constrains the box; a stray aspect-ratio would collapse
		// wide cards into squares.
		it('constrains the aspect ratio for the circle shape alone', () => {
			fc.assert(
				fc.property(shape, radius, (s, r) => {
					expect(glassShapeStyle(s, r).aspectRatio).toBe(s === 'circle' ? '1 / 1' : null);
				}),
				{ numRuns: 500 }
			);
		});

		// cornerRadius is meaningless once a shape is chosen; proving it is ignored
		// stops the two knobs fighting each other.
		it('ignores cornerRadius entirely for capsule and circle', () => {
			fc.assert(
				fc.property(fc.constantFrom<GlassShape>('capsule', 'circle'), radius, radius, (s, a, b) => {
					expect(glassShapeStyle(s, a)).toEqual(glassShapeStyle(s, b));
				}),
				{ numRuns: 500 }
			);
		});

		it('is a pure function of its two arguments', () => {
			fc.assert(
				fc.property(shape, radius, (s, r) => {
					expect(glassShapeStyle(s, r)).toEqual(glassShapeStyle(s, r));
				}),
				{ numRuns: 300 }
			);
		});
	});
});
