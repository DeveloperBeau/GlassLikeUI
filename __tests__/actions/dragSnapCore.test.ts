import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
	clampIndex,
	detentAt,
	nearestDetentIndex,
	computeVelocity,
	applyRubberBand,
	chooseNextIndex,
	pushSample,
	SAMPLE_WINDOW,
	type PointerSample
} from '../../src/lib/actions/dragSnap';

/** Arbitrary for a sorted, de-duplicated, usable detent list. */
const detentList = fc
	.uniqueArray(fc.integer({ min: 1, max: 100 }).map((n) => n / 100), {
		minLength: 1,
		maxLength: 5
	})
	.map((xs) => [...xs].sort((a, b) => a - b));

describe('clampIndex', () => {
	describe('success cases', () => {
		it.each([
			[0, 3, 0],
			[1, 3, 1],
			[2, 3, 2]
		])('leaves in-range index %i alone', (i, len, expected) => {
			expect(clampIndex(i, len)).toBe(expected);
		});
	});

	describe('failure cases', () => {
		it('clamps an index past the end to the last slot', () => {
			expect(clampIndex(99, 3)).toBe(2);
		});

		it('clamps a negative index to zero', () => {
			expect(clampIndex(-5, 3)).toBe(0);
		});

		it('returns 0 for an empty detent list rather than -1', () => {
			expect(clampIndex(0, 0)).toBe(0);
			expect(clampIndex(7, 0)).toBe(0);
		});
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: never return an index that would index
		// out of bounds.
		it('always returns a valid index for a non-empty list', () => {
			fc.assert(
				fc.property(fc.integer(), fc.integer({ min: 1, max: 50 }), (i, len) => {
					const out = clampIndex(i, len);
					expect(out).toBeGreaterThanOrEqual(0);
					expect(out).toBeLessThanOrEqual(len - 1);
				}),
				{ numRuns: 500 }
			);
		});

		// FALSE NEGATIVE validation: never move an index that was already valid.
		it('is the identity on in-range indices', () => {
			fc.assert(
				fc.property(fc.integer({ min: 1, max: 50 }), (len) => {
					for (let i = 0; i < len; i++) expect(clampIndex(i, len)).toBe(i);
				}),
				{ numRuns: 200 }
			);
		});

		it('is idempotent', () => {
			fc.assert(
				fc.property(fc.integer(), fc.integer({ min: 0, max: 50 }), (i, len) => {
					expect(clampIndex(clampIndex(i, len), len)).toBe(clampIndex(i, len));
				}),
				{ numRuns: 500 }
			);
		});
	});
});

describe('detentAt', () => {
	it('returns the fraction at the index', () => {
		expect(detentAt([0.25, 0.5, 0.9], 1)).toBe(0.5);
	});

	it('falls back to the first detent for an out-of-range index', () => {
		expect(detentAt([0.25, 0.5], 9)).toBe(0.25);
		expect(detentAt([0.25, 0.5], -1)).toBe(0.25);
	});

	it('returns 0 when there are no detents', () => {
		expect(detentAt([], 0)).toBe(0);
	});

	describe('fuzz', () => {
		it('returns a member of the list whenever the list is non-empty', () => {
			fc.assert(
				fc.property(detentList, fc.integer(), (detents, i) => {
					expect(detents).toContain(detentAt(detents, i));
				}),
				{ numRuns: 500 }
			);
		});
	});
});

describe('nearestDetentIndex', () => {
	describe('success cases', () => {
		it.each([
			[0.24, 0],
			[0.26, 0],
			[0.49, 1],
			[0.88, 2],
			[5, 2],
			[-5, 0]
		])('maps fraction %f to index %i', (fraction, expected) => {
			expect(nearestDetentIndex(fraction, [0.25, 0.5, 0.9])).toBe(expected);
		});

		it('resolves an exact tie to the lower index', () => {
			// 0.5 is equidistant from 0.25 and 0.75.
			expect(nearestDetentIndex(0.5, [0.25, 0.75])).toBe(0);
		});
	});

	describe('failure cases', () => {
		it('returns 0 for an empty detent list', () => {
			expect(nearestDetentIndex(0.5, [])).toBe(0);
		});
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: the returned index must genuinely be the
		// closest - no other detent may be nearer.
		it('never returns an index when a nearer detent exists', () => {
			fc.assert(
				fc.property(detentList, fc.double({ min: -2, max: 3, noNaN: true }), (detents, f) => {
					const idx = nearestDetentIndex(f, detents);
					const chosen = Math.abs(detents[idx]! - f);
					for (const d of detents) {
						expect(chosen).toBeLessThanOrEqual(Math.abs(d - f) + Number.EPSILON);
					}
				}),
				{ numRuns: 500 }
			);
		});

		// FALSE NEGATIVE validation: landing exactly on a detent must select it.
		it('selects a detent exactly when the fraction equals it', () => {
			fc.assert(
				fc.property(detentList, fc.nat(), (detents, seed) => {
					const i = seed % detents.length;
					const value = detents[i]!;
					expect(detents[nearestDetentIndex(value, detents)]).toBe(value);
				}),
				{ numRuns: 500 }
			);
		});

		it('always returns an in-range index', () => {
			fc.assert(
				fc.property(detentList, fc.double({ min: -9, max: 9, noNaN: true }), (detents, f) => {
					const idx = nearestDetentIndex(f, detents);
					expect(idx).toBeGreaterThanOrEqual(0);
					expect(idx).toBeLessThan(detents.length);
				}),
				{ numRuns: 500 }
			);
		});
	});
});

describe('computeVelocity', () => {
	describe('success cases', () => {
		it('computes downward (positive) velocity in px/s', () => {
			expect(computeVelocity([{ y: 0, t: 0 }, { y: 100, t: 1000 }])).toBe(100);
		});

		it('computes upward drag as negative velocity', () => {
			expect(computeVelocity([{ y: 100, t: 0 }, { y: 0, t: 1000 }])).toBe(-100);
		});

		// Dividing by the elapsed seconds, not multiplying: with dt != 1 the two
		// give different answers.
		it('divides by the elapsed time', () => {
			expect(computeVelocity([{ y: 0, t: 0 }, { y: 100, t: 500 }])).toBe(200);
		});

		it('reports a larger velocity for the same distance covered faster', () => {
			const slow = computeVelocity([{ y: 0, t: 0 }, { y: 100, t: 2000 }]);
			const fast = computeVelocity([{ y: 0, t: 0 }, { y: 100, t: 250 }]);
			expect(fast).toBeGreaterThan(slow);
			expect(slow).toBe(50);
			expect(fast).toBe(400);
		});

		it('measures across the whole window, not just the last pair', () => {
			expect(
				computeVelocity([{ y: 0, t: 0 }, { y: 10, t: 500 }, { y: 200, t: 1000 }])
			).toBe(200);
		});
	});

	describe('failure cases', () => {
		it('returns 0 for an empty sample list', () => {
			expect(computeVelocity([])).toBe(0);
		});

		it('returns 0 for a single sample', () => {
			expect(computeVelocity([{ y: 5, t: 5 }])).toBe(0);
		});

		it('returns 0 when no time elapsed, rather than dividing by zero', () => {
			expect(computeVelocity([{ y: 0, t: 10 }, { y: 100, t: 10 }])).toBe(0);
		});

		it('returns 0 when timestamps go backwards', () => {
			expect(computeVelocity([{ y: 0, t: 100 }, { y: 100, t: 0 }])).toBe(0);
		});

		// A sub-nanosecond interval overflows the division; Infinity would clear
		// every velocity threshold and force a flick snap on a stationary finger.
		it('returns 0 rather than Infinity for an immeasurably small interval', () => {
			const v = computeVelocity([
				{ y: -8.881784197001252e-16, t: 0 },
				{ y: 0, t: 2.475e-321 }
			]);
			expect(Number.isFinite(v)).toBe(true);
			expect(v).toBe(0);
		});
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: never emit a non-finite velocity, which
		// would corrupt every downstream comparison.
		it('always returns a finite number', () => {
			fc.assert(
				fc.property(
					fc.array(
						fc.record({
							y: fc.double({ min: -1e4, max: 1e4, noNaN: true }),
							t: fc.double({ min: 0, max: 1e6, noNaN: true })
						})
					),
					(samples) => {
						expect(Number.isFinite(computeVelocity(samples))).toBe(true);
					}
				),
				{ numRuns: 500 }
			);
		});

		// FALSE NEGATIVE validation: the sign must track the direction of travel.
		it('sign matches the direction between first and last sample', () => {
			fc.assert(
				fc.property(
					fc.double({ min: -1e3, max: 1e3, noNaN: true }),
					fc.double({ min: -1e3, max: 1e3, noNaN: true }),
					fc.double({ min: 1, max: 1e4, noNaN: true }),
					(y0, y1, dt) => {
						// Skip deltas so small that dividing by dt underflows to +/-0,
						// where Math.sign can no longer report a direction.
						fc.pre(Math.abs(y1 - y0) > 1e-6);
						const v = computeVelocity([{ y: y0, t: 0 }, { y: y1, t: dt }]);
						expect(Math.sign(v)).toBe(Math.sign(y1 - y0));
					}
				),
				{ numRuns: 500 }
			);
		});
	});
});

describe('applyRubberBand', () => {
	describe('success cases', () => {
		it('leaves a fraction inside the range untouched', () => {
			expect(applyRubberBand(0.5, 0.25, 0.9, 0.3)).toBe(0.5);
		});

		it('leaves the exact bounds untouched', () => {
			expect(applyRubberBand(0.25, 0.25, 0.9, 0.3)).toBe(0.25);
			expect(applyRubberBand(0.9, 0.25, 0.9, 0.3)).toBe(0.9);
		});

		it('damps overshoot above the maximum', () => {
			// 0.1 past the max, damped to 0.03.
			expect(applyRubberBand(1.0, 0.25, 0.9, 0.3)).toBeCloseTo(0.93, 10);
		});

		it('damps undershoot below the minimum', () => {
			expect(applyRubberBand(0.15, 0.25, 0.9, 0.3)).toBeCloseTo(0.22, 10);
		});

		it('pins to the bound when the coefficient is 0', () => {
			expect(applyRubberBand(5, 0.25, 0.9, 0)).toBe(0.9);
			expect(applyRubberBand(-5, 0.25, 0.9, 0)).toBe(0.25);
		});

		it('tracks the pointer one-to-one when the coefficient is 1', () => {
			expect(applyRubberBand(1.5, 0.25, 0.9, 1)).toBeCloseTo(1.5, 10);
		});
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: overshoot must always be damped toward the
		// bound, never amplified past the raw pointer position.
		it('never returns a value beyond the raw fraction', () => {
			fc.assert(
				fc.property(
					fc.double({ min: -3, max: 4, noNaN: true }),
					fc.double({ min: 0, max: 1, noNaN: true }),
					(fraction, rubber) => {
						const out = applyRubberBand(fraction, 0.25, 0.9, rubber);
						if (fraction > 0.9) {
							expect(out).toBeLessThanOrEqual(fraction + Number.EPSILON);
							expect(out).toBeGreaterThanOrEqual(0.9 - Number.EPSILON);
						} else if (fraction < 0.25) {
							expect(out).toBeGreaterThanOrEqual(fraction - Number.EPSILON);
							expect(out).toBeLessThanOrEqual(0.25 + Number.EPSILON);
						}
					}
				),
				{ numRuns: 500 }
			);
		});

		// FALSE NEGATIVE validation: anything inside the range is never altered.
		it('is the identity within the detent range', () => {
			fc.assert(
				fc.property(
					fc.double({ min: 0.25, max: 0.9, noNaN: true }),
					fc.double({ min: 0, max: 1, noNaN: true }),
					(fraction, rubber) => {
						expect(applyRubberBand(fraction, 0.25, 0.9, rubber)).toBe(fraction);
					}
				),
				{ numRuns: 500 }
			);
		});

		it('is monotonic in the input fraction', () => {
			fc.assert(
				fc.property(
					fc.double({ min: -2, max: 3, noNaN: true }),
					fc.double({ min: 0.01, max: 1, noNaN: true }),
					fc.double({ min: 0.01, max: 1, noNaN: true }),
					(a, delta, rubber) => {
						const lo = applyRubberBand(a, 0.25, 0.9, rubber);
						const hi = applyRubberBand(a + delta, 0.25, 0.9, rubber);
						expect(hi).toBeGreaterThanOrEqual(lo - 1e-9);
					}
				),
				{ numRuns: 500 }
			);
		});
	});
});

describe('pushSample', () => {
	const s = (y: number, t: number): PointerSample => ({ y, t });

	describe('success cases', () => {
		it('appends to an empty window', () => {
			expect(pushSample([], s(1, 10))).toEqual([s(1, 10)]);
		});

		it('appends while below the cap', () => {
			expect(pushSample([s(1, 1), s(2, 2)], s(3, 3))).toEqual([s(1, 1), s(2, 2), s(3, 3)]);
		});

		it('fills exactly up to the cap without dropping anything', () => {
			const four = [s(1, 1), s(2, 2), s(3, 3), s(4, 4)];
			expect(pushSample(four, s(5, 5))).toEqual([...four, s(5, 5)]);
		});

		it('drops the oldest sample once the cap is exceeded', () => {
			const full = [s(1, 1), s(2, 2), s(3, 3), s(4, 4), s(5, 5)];
			expect(pushSample(full, s(6, 6))).toEqual([s(2, 2), s(3, 3), s(4, 4), s(5, 5), s(6, 6)]);
		});

		it('keeps the newest sample last', () => {
			const full = [s(1, 1), s(2, 2), s(3, 3), s(4, 4), s(5, 5)];
			expect(pushSample(full, s(9, 9)).at(-1)).toEqual(s(9, 9));
		});

		it('honours an explicit smaller window', () => {
			expect(pushSample([s(1, 1), s(2, 2)], s(3, 3), 2)).toEqual([s(2, 2), s(3, 3)]);
		});

		it('trims an over-long window down to the cap in one call', () => {
			const tooMany = [s(1, 1), s(2, 2), s(3, 3), s(4, 4), s(5, 5), s(6, 6), s(7, 7)];
			expect(pushSample(tooMany, s(8, 8))).toHaveLength(SAMPLE_WINDOW);
		});
	});

	describe('failure cases', () => {
		it('does not mutate the array it was given', () => {
			const full = [s(1, 1), s(2, 2), s(3, 3), s(4, 4), s(5, 5)];
			const copy = [...full];
			pushSample(full, s(6, 6));
			expect(full).toEqual(copy);
		});

		it('keeps only the newest when the window is 1', () => {
			expect(pushSample([s(1, 1), s(2, 2)], s(3, 3), 1)).toEqual([s(3, 3)]);
		});
	});

	describe('fuzz', () => {
		const sample = fc.record({
			y: fc.double({ min: -1e4, max: 1e4, noNaN: true }),
			t: fc.double({ min: 0, max: 1e6, noNaN: true })
		});

		// FALSE POSITIVE validation: the window must never grow past the cap, or
		// velocity would drift toward the whole-gesture average.
		it('never exceeds the cap', () => {
			fc.assert(
				fc.property(fc.array(sample, { maxLength: 40 }), (samples) => {
					let window: PointerSample[] = [];
					for (const item of samples) window = pushSample(window, item);
					expect(window.length).toBeLessThanOrEqual(SAMPLE_WINDOW);
				}),
				{ numRuns: 300 }
			);
		});

		// FALSE NEGATIVE validation: the most recent samples must always survive,
		// in order.
		it('retains exactly the most recent samples in order', () => {
			fc.assert(
				fc.property(fc.array(sample, { minLength: 1, maxLength: 40 }), (samples) => {
					let window: PointerSample[] = [];
					for (const item of samples) window = pushSample(window, item);
					expect(window).toEqual(samples.slice(-SAMPLE_WINDOW));
				}),
				{ numRuns: 300 }
			);
		});

		it('grows by exactly one until the cap is reached', () => {
			fc.assert(
				fc.property(fc.array(sample, { maxLength: 40 }), (samples) => {
					let window: PointerSample[] = [];
					samples.forEach((item, i) => {
						window = pushSample(window, item);
						expect(window.length).toBe(Math.min(i + 1, SAMPLE_WINDOW));
					});
				}),
				{ numRuns: 300 }
			);
		});
	});
});

describe('chooseNextIndex', () => {
	const DETENTS = [0.25, 0.5, 0.9];

	describe('velocity-driven', () => {
		it('moves up one detent on a fast upward flick', () => {
			// Negative velocity is upward, which grows the sheet.
			expect(chooseNextIndex(0, -900, 500, 0.25, DETENTS)).toBe(1);
		});

		it('moves down one detent on a fast downward flick', () => {
			expect(chooseNextIndex(2, 900, 500, 0.9, DETENTS)).toBe(1);
		});

		it('does not advance past the last detent', () => {
			expect(chooseNextIndex(2, -900, 500, 0.9, DETENTS)).toBe(2);
		});

		it('does not retreat past the first detent', () => {
			expect(chooseNextIndex(0, 900, 500, 0.25, DETENTS)).toBe(0);
		});

		it('moves by exactly one step however fast the flick', () => {
			expect(chooseNextIndex(0, -99999, 500, 0.25, DETENTS)).toBe(1);
		});
	});

	describe('position-driven', () => {
		it('snaps to the nearest detent below the velocity threshold', () => {
			expect(chooseNextIndex(0, 10, 500, 0.88, DETENTS)).toBe(2);
		});

		it('treats velocity exactly at the threshold as position-driven', () => {
			// The check is a strict >, so the boundary falls through to nearest.
			expect(chooseNextIndex(0, 500, 500, 0.88, DETENTS)).toBe(2);
		});

		it('ignores the current index when snapping by position', () => {
			expect(chooseNextIndex(2, 0, 500, 0.25, DETENTS)).toBe(0);
		});
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: the result must always be indexable.
		it('always returns an in-range index', () => {
			fc.assert(
				fc.property(
					detentList,
					fc.integer({ min: -5, max: 10 }),
					fc.double({ min: -5000, max: 5000, noNaN: true }),
					fc.double({ min: -1, max: 2, noNaN: true }),
					(detents, current, velocity, fraction) => {
						const idx = chooseNextIndex(current, velocity, 500, fraction, detents);
						expect(idx).toBeGreaterThanOrEqual(0);
						expect(idx).toBeLessThan(detents.length);
					}
				),
				{ numRuns: 500 }
			);
		});

		// FALSE NEGATIVE validation: a flick past the threshold must always move
		// at most one step, and in the direction of the flick.
		it('moves at most one step, in the flick direction', () => {
			fc.assert(
				fc.property(
					detentList,
					fc.nat(),
					fc.double({ min: 501, max: 9000, noNaN: true }),
					fc.boolean(),
					(detents, seed, speed, upward) => {
						const current = seed % detents.length;
						const velocity = upward ? -speed : speed;
						const idx = chooseNextIndex(current, velocity, 500, 0, detents);
						expect(Math.abs(idx - current)).toBeLessThanOrEqual(1);
						if (upward) expect(idx).toBeGreaterThanOrEqual(current);
						else expect(idx).toBeLessThanOrEqual(current);
					}
				),
				{ numRuns: 500 }
			);
		});

		it('agrees with nearestDetentIndex below the threshold', () => {
			fc.assert(
				fc.property(
					detentList,
					fc.nat(),
					fc.double({ min: -499, max: 499, noNaN: true }),
					fc.double({ min: -1, max: 2, noNaN: true }),
					(detents, seed, velocity, fraction) => {
						const current = seed % detents.length;
						expect(chooseNextIndex(current, velocity, 500, fraction, detents)).toBe(
							nearestDetentIndex(fraction, detents)
						);
					}
				),
				{ numRuns: 500 }
			);
		});
	});
});
