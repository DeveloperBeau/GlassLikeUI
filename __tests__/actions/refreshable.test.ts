import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
	refreshable,
	resistPull,
	refreshPhase,
	shouldTriggerRefresh,
	DEFAULT_REFRESH_THRESHOLD,
	DEFAULT_REFRESH_RESISTANCE,
	MAX_PULL_DISTANCE,
	type RefreshPhase
} from '../../src/lib/actions/refreshable';

function makeNode(scrollTop = 0): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	Object.defineProperty(el, 'scrollTop', { value: scrollTop, writable: true });
	(el as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture = vi.fn();
	(el as unknown as { releasePointerCapture: (id: number) => void }).releasePointerCapture =
		vi.fn();
	return el;
}

function firePointerEvent(target: HTMLElement, type: string, init: PointerEventInit) {
	const ev = new Event(type, { bubbles: true, cancelable: true }) as unknown as PointerEvent;
	Object.assign(ev, { pointerId: 1, button: 0, clientX: 0, clientY: 0, ...init });
	target.dispatchEvent(ev as unknown as Event);
}


/**
 * Records listener registration so teardown can be checked. A leaked listener
 * has no other observable symptom: the remaining handlers all guard on the
 * pointer id, so a stray one is silent -- and still retains the node.
 */
function trackListeners(el: HTMLElement) {
	const added: string[] = [];
	const removed: string[] = [];
	const origAdd = el.addEventListener.bind(el);
	const origRemove = el.removeEventListener.bind(el);
	el.addEventListener = (type: string, fn: never, opts?: never) => {
		added.push(type);
		origAdd(type, fn, opts);
	};
	el.removeEventListener = (type: string, fn: never, opts?: never) => {
		removed.push(type);
		origRemove(type, fn, opts);
	};
	return {
		added,
		removed,
		leaked: () => added.filter((t) => !removed.includes(t))
	};
}

const pullOf = (el: HTMLElement) => parseFloat(el.style.getPropertyValue('--refresh-pull') || '0');
const phaseOf = (el: HTMLElement) => el.getAttribute('data-refresh-phase');

describe('refresh defaults', () => {
	it('triggers at 64px of travel', () => {
		expect(DEFAULT_REFRESH_THRESHOLD).toBe(64);
	});

	it('halves the pointer travel', () => {
		expect(DEFAULT_REFRESH_RESISTANCE).toBe(0.5);
	});

	it('caps the pull well past the threshold', () => {
		expect(MAX_PULL_DISTANCE).toBeGreaterThan(DEFAULT_REFRESH_THRESHOLD);
	});

	it('damps rather than amplifies the pull', () => {
		expect(DEFAULT_REFRESH_RESISTANCE).toBeGreaterThan(0);
		expect(DEFAULT_REFRESH_RESISTANCE).toBeLessThanOrEqual(1);
	});
});

describe('resistPull', () => {
	it('halves a downward drag by default', () => {
		expect(resistPull(100)).toBe(50);
	});

	it('honours a custom resistance', () => {
		expect(resistPull(100, 0.25)).toBe(25);
	});

	// Pulling up is scrolling, not refreshing.
	it('ignores an upward drag', () => {
		expect(resistPull(-100)).toBe(0);
	});

	it('is zero at rest', () => {
		expect(resistPull(0)).toBe(0);
	});

	it('caps a very long pull', () => {
		expect(resistPull(100000)).toBe(MAX_PULL_DISTANCE);
	});

	it('returns zero for NaN', () => {
		expect(resistPull(Number.NaN)).toBe(0);
	});

	it('caps rather than returning Infinity', () => {
		expect(resistPull(Infinity)).toBe(MAX_PULL_DISTANCE);
	});

	it('treats a non-finite resistance as the default', () => {
		expect(resistPull(100, Number.NaN)).toBe(50);
	});

	// A negative or zero resistance would freeze or invert the indicator.
	it('treats a non-positive resistance as the default', () => {
		expect(resistPull(100, 0)).toBe(50);
		expect(resistPull(100, -2)).toBe(50);
	});

	describe('fuzz', () => {
		const dy = fc.double({ min: -10000, max: 10000, noNaN: true });

		// FALSE POSITIVE validation: never report travel the user did not make,
		// which would arm a refresh from an upward scroll.
		it('never returns a positive pull for a non-downward drag', () => {
			fc.assert(
				fc.property(fc.double({ min: -10000, max: 0, noNaN: true }), (d) => {
					expect(resistPull(d)).toBe(0);
				}),
				{ numRuns: 1000 }
			);
		});

		// FALSE NEGATIVE validation: any real downward drag must register.
		it('always returns a positive pull for a downward drag', () => {
			fc.assert(
				fc.property(fc.double({ min: 1, max: 10000, noNaN: true }), (d) => {
					expect(resistPull(d)).toBeGreaterThan(0);
				}),
				{ numRuns: 1000 }
			);
		});

		it('stays within 0 and the cap', () => {
			fc.assert(
				fc.property(dy, fc.double({ min: 0.01, max: 1, noNaN: true }), (d, r) => {
					const out = resistPull(d, r);
					expect(out).toBeGreaterThanOrEqual(0);
					expect(out).toBeLessThanOrEqual(MAX_PULL_DISTANCE);
					expect(Number.isFinite(out)).toBe(true);
				}),
				{ numRuns: 1000 }
			);
		});

		it('never travels further than the pointer did', () => {
			fc.assert(
				fc.property(dy, fc.double({ min: 0.01, max: 1, noNaN: true }), (d, r) => {
					expect(resistPull(d, r)).toBeLessThanOrEqual(Math.max(0, d) + 1e-9);
				}),
				{ numRuns: 1000 }
			);
		});

		it('is monotonic in the drag distance', () => {
			fc.assert(
				fc.property(
					fc.double({ min: 0, max: 5000, noNaN: true }),
					fc.double({ min: 0, max: 5000, noNaN: true }),
					(a, b) => {
						const [lo, hi] = a <= b ? [a, b] : [b, a];
						expect(resistPull(lo)).toBeLessThanOrEqual(resistPull(hi) + 1e-9);
					}
				),
				{ numRuns: 1000 }
			);
		});
	});
});

describe('shouldTriggerRefresh', () => {
	it('triggers exactly at the threshold', () => {
		expect(shouldTriggerRefresh(64, 64)).toBe(true);
	});

	it('triggers past the threshold', () => {
		expect(shouldTriggerRefresh(100, 64)).toBe(true);
	});

	it('does not trigger short of the threshold', () => {
		expect(shouldTriggerRefresh(63.9, 64)).toBe(false);
	});

	it('does not trigger at rest', () => {
		expect(shouldTriggerRefresh(0, 64)).toBe(false);
	});

	// A zero threshold would fire a network request on every touch.
	it('does not trigger against a zero threshold', () => {
		expect(shouldTriggerRefresh(0, 0)).toBe(false);
		expect(shouldTriggerRefresh(10, 0)).toBe(false);
	});

	it('does not trigger against a negative threshold', () => {
		expect(shouldTriggerRefresh(10, -5)).toBe(false);
	});

	it('does not trigger on NaN', () => {
		expect(shouldTriggerRefresh(Number.NaN, 64)).toBe(false);
		expect(shouldTriggerRefresh(100, Number.NaN)).toBe(false);
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: refresh usually means a network call, so it
		// must be impossible below the threshold.
		it('never triggers below the threshold', () => {
			fc.assert(
				fc.property(
					fc.double({ min: 0, max: 1000, noNaN: true }),
					fc.double({ min: 1, max: 1000, noNaN: true }),
					(d, t) => {
						if (d < t) expect(shouldTriggerRefresh(d, t)).toBe(false);
					}
				),
				{ numRuns: 2000 }
			);
		});

		// FALSE NEGATIVE validation: a completed pull must always be honoured.
		it('always triggers at or above a positive threshold', () => {
			fc.assert(
				fc.property(
					fc.double({ min: 1, max: 1000, noNaN: true }),
					fc.double({ min: 0, max: 1000, noNaN: true }),
					(t, extra) => {
						expect(shouldTriggerRefresh(t + extra, t)).toBe(true);
					}
				),
				{ numRuns: 2000 }
			);
		});

		it('returns a boolean for any input', () => {
			fc.assert(
				fc.property(
					fc.double({ noDefaultInfinity: false }),
					fc.double({ noDefaultInfinity: false }),
					(d, t) => {
						expect(typeof shouldTriggerRefresh(d, t)).toBe('boolean');
					}
				),
				{ numRuns: 1000 }
			);
		});
	});
});

describe('refreshPhase', () => {
	it('is idle at rest', () => {
		expect(refreshPhase(0, 64, false)).toBe('idle');
	});

	it('is pulling part way', () => {
		expect(refreshPhase(30, 64, false)).toBe('pulling');
	});

	it('is ready at the threshold', () => {
		expect(refreshPhase(64, 64, false)).toBe('ready');
	});

	it('is ready past the threshold', () => {
		expect(refreshPhase(120, 64, false)).toBe('ready');
	});

	// The in-flight state outranks the gesture: releasing must not read as idle
	// while the request is still running.
	it('is refreshing whatever the distance', () => {
		expect(refreshPhase(0, 64, true)).toBe('refreshing');
		expect(refreshPhase(200, 64, true)).toBe('refreshing');
	});

	it('is idle for a negative distance', () => {
		expect(refreshPhase(-50, 64, false)).toBe('idle');
	});

	it('is idle for NaN', () => {
		expect(refreshPhase(Number.NaN, 64, false)).toBe('idle');
	});

	describe('fuzz', () => {
		const dist = fc.double({ min: -500, max: 500, noNaN: true });
		const thr = fc.double({ min: 1, max: 300, noNaN: true });

		// FALSE NEGATIVE validation: the indicator always has a phase to render.
		it('always returns a known phase', () => {
			fc.assert(
				fc.property(dist, thr, fc.boolean(), (d, t, r) => {
					expect(['idle', 'pulling', 'ready', 'refreshing']).toContain(refreshPhase(d, t, r));
				}),
				{ numRuns: 2000 }
			);
		});

		// FALSE POSITIVE validation: 'ready' promises the user a refresh on
		// release, so it must never appear below the threshold.
		it('never reports ready below the threshold', () => {
			fc.assert(
				fc.property(dist, thr, (d, t) => {
					if (refreshPhase(d, t, false) === 'ready') {
						expect(shouldTriggerRefresh(d, t)).toBe(true);
					}
				}),
				{ numRuns: 2000 }
			);
		});

		it('agrees with shouldTriggerRefresh in both directions', () => {
			fc.assert(
				fc.property(dist, thr, (d, t) => {
					expect(refreshPhase(d, t, false) === 'ready').toBe(shouldTriggerRefresh(d, t));
				}),
				{ numRuns: 2000 }
			);
		});

		it('always reports refreshing while a refresh is in flight', () => {
			fc.assert(
				fc.property(dist, thr, (d, t) => {
					expect(refreshPhase(d, t, true)).toBe('refreshing');
				}),
				{ numRuns: 1000 }
			);
		});
	});
});

describe('refreshable action', () => {
	let node: HTMLElement;

	beforeEach(() => {
		node = makeNode(0);
	});

	it('returns update and destroy lifecycle hooks', () => {
		const handle = refreshable(node, { onRefresh: vi.fn() });

		expect(typeof handle.update).toBe('function');
		expect(typeof handle.destroy).toBe('function');
		handle.destroy();
	});

	it('starts idle with no pull', () => {
		const handle = refreshable(node, { onRefresh: vi.fn() });

		expect(phaseOf(node)).toBe('idle');
		expect(pullOf(node)).toBe(0);
		handle.destroy();
	});

	it('tracks a downward pull at the resisted rate', () => {
		const handle = refreshable(node, { onRefresh: vi.fn() });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 160 });

		expect(pullOf(node)).toBe(30);
		expect(phaseOf(node)).toBe('pulling');
		handle.destroy();
	});

	it('reports ready once the threshold is crossed', () => {
		const handle = refreshable(node, { onRefresh: vi.fn() });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 300 });

		expect(phaseOf(node)).toBe('ready');
		handle.destroy();
	});

	it('calls onRefresh when released past the threshold', async () => {
		const onRefresh = vi.fn();
		const handle = refreshable(node, { onRefresh });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 300 });
		firePointerEvent(node, 'pointerup', { clientY: 300 });

		expect(onRefresh).toHaveBeenCalledTimes(1);
		handle.destroy();
	});

	it('does not call onRefresh when released short of the threshold', () => {
		const onRefresh = vi.fn();
		const handle = refreshable(node, { onRefresh });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 140 });
		firePointerEvent(node, 'pointerup', { clientY: 140 });

		expect(onRefresh).not.toHaveBeenCalled();
		expect(phaseOf(node)).toBe('idle');
		expect(pullOf(node)).toBe(0);
		handle.destroy();
	});

	// Pull-to-refresh belongs to the top of the list; mid-scroll it would fight
	// the scroller.
	it('ignores a pull when the container is scrolled', () => {
		const scrolled = makeNode(120);
		const onRefresh = vi.fn();
		const handle = refreshable(scrolled, { onRefresh });

		firePointerEvent(scrolled, 'pointerdown', { clientY: 100 });
		firePointerEvent(scrolled, 'pointermove', { clientY: 300 });
		firePointerEvent(scrolled, 'pointerup', { clientY: 300 });

		expect(onRefresh).not.toHaveBeenCalled();
		expect(pullOf(scrolled)).toBe(0);
		handle.destroy();
	});

	it('ignores an upward drag', () => {
		const onRefresh = vi.fn();
		const handle = refreshable(node, { onRefresh });

		firePointerEvent(node, 'pointerdown', { clientY: 300 });
		firePointerEvent(node, 'pointermove', { clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientY: 100 });

		expect(onRefresh).not.toHaveBeenCalled();
		expect(pullOf(node)).toBe(0);
		handle.destroy();
	});

	it('does nothing when disabled', () => {
		const onRefresh = vi.fn();
		const handle = refreshable(node, { onRefresh, disabled: true });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 300 });
		firePointerEvent(node, 'pointerup', { clientY: 300 });

		expect(onRefresh).not.toHaveBeenCalled();
		expect(pullOf(node)).toBe(0);
		handle.destroy();
	});

	it('honours a custom threshold', () => {
		const onRefresh = vi.fn();
		const handle = refreshable(node, { onRefresh, threshold: 10 });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 130 });
		firePointerEvent(node, 'pointerup', { clientY: 130 });

		expect(onRefresh).toHaveBeenCalledTimes(1);
		handle.destroy();
	});

	it('resets to idle when the gesture is cancelled', () => {
		const onRefresh = vi.fn();
		const handle = refreshable(node, { onRefresh });

		firePointerEvent(node, 'pointerdown', { clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientY: 300 });
		firePointerEvent(node, 'pointercancel', { clientY: 300 });

		expect(onRefresh).not.toHaveBeenCalled();
		expect(phaseOf(node)).toBe('idle');
		expect(pullOf(node)).toBe(0);
		handle.destroy();
	});

	it('ignores a second pointer mid-gesture', () => {
		const handle = refreshable(node, { onRefresh: vi.fn() });

		firePointerEvent(node, 'pointerdown', { clientY: 100, pointerId: 1 });
		firePointerEvent(node, 'pointermove', { clientY: 300, pointerId: 2 });

		expect(pullOf(node)).toBe(0);
		handle.destroy();
	});

	describe('the in-flight refresh', () => {
		it('stays in the refreshing phase until the promise settles', async () => {
			let release!: () => void;
			const pending = new Promise<void>((r) => (release = r));
			const handle = refreshable(node, { onRefresh: () => pending });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(phaseOf(node)).toBe('refreshing');

			release();
			await pending;
			await Promise.resolve();

			expect(phaseOf(node)).toBe('idle');
			expect(pullOf(node)).toBe(0);
			handle.destroy();
		});

		// A failed refresh must not strand the spinner on screen forever.
		it('returns to idle when the refresh rejects', async () => {
			const handle = refreshable(node, {
				onRefresh: () => Promise.reject(new Error('network down'))
			});

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			await vi.waitFor(() => expect(phaseOf(node)).toBe('idle'));
			handle.destroy();
		});

		// A handler that throws before returning a promise must not strand the
		// indicator either.
		it('returns to idle when the handler throws synchronously', () => {
			const handle = refreshable(node, {
				onRefresh: () => {
					throw new Error('boom');
				}
			});

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			expect(() => firePointerEvent(node, 'pointerup', { clientY: 300 })).not.toThrow();

			expect(phaseOf(node)).toBe('idle');
			expect(pullOf(node)).toBe(0);
			handle.destroy();
		});

		it('allows a retry after the handler throws', () => {
			const onRefresh = vi.fn(() => {
				throw new Error('boom');
			});
			const handle = refreshable(node, { onRefresh });

			for (let i = 0; i < 2; i++) {
				firePointerEvent(node, 'pointerdown', { clientY: 100 });
				firePointerEvent(node, 'pointermove', { clientY: 300 });
				firePointerEvent(node, 'pointerup', { clientY: 300 });
			}

			expect(onRefresh).toHaveBeenCalledTimes(2);
			handle.destroy();
		});

		it('returns to idle after a synchronous handler', () => {
			const handle = refreshable(node, { onRefresh: () => {} });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(phaseOf(node)).toBe('idle');
			handle.destroy();
		});

		// Two overlapping requests would race and can double-charge an API.
		it('refuses to start a second refresh while one is in flight', async () => {
			let release!: () => void;
			const pending = new Promise<void>((r) => (release = r));
			const onRefresh = vi.fn(() => pending);
			const handle = refreshable(node, { onRefresh });

			for (let i = 0; i < 3; i++) {
				firePointerEvent(node, 'pointerdown', { clientY: 100 });
				firePointerEvent(node, 'pointermove', { clientY: 300 });
				firePointerEvent(node, 'pointerup', { clientY: 300 });
			}

			expect(onRefresh).toHaveBeenCalledTimes(1);

			release();
			await pending;
			await Promise.resolve();
			handle.destroy();
		});

		it('does not track a pull while refreshing', async () => {
			let release!: () => void;
			const pending = new Promise<void>((r) => (release = r));
			const handle = refreshable(node, { onRefresh: () => pending });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 400 });

			expect(phaseOf(node)).toBe('refreshing');

			release();
			await pending;
			await Promise.resolve();
			handle.destroy();
		});

		it('allows another refresh once the first has settled', async () => {
			const onRefresh = vi.fn(() => Promise.resolve());
			const handle = refreshable(node, { onRefresh });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });
			await vi.waitFor(() => expect(phaseOf(node)).toBe('idle'));

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(onRefresh).toHaveBeenCalledTimes(2);
			handle.destroy();
		});

		// The node may be torn down while the request is still running.
		it('does not touch the node after destroy', async () => {
			let release!: () => void;
			const pending = new Promise<void>((r) => (release = r));
			const handle = refreshable(node, { onRefresh: () => pending });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });
			handle.destroy();

			release();
			await pending;
			await Promise.resolve();

			expect(node.getAttribute('data-refresh-phase')).toBeNull();
			expect(node.style.getPropertyValue('--refresh-pull')).toBe('');
		});
	});

	describe('phase reporting', () => {
		it('reports each phase transition to the caller', () => {
			const onPhaseChange = vi.fn();
			const handle = refreshable(node, { onRefresh: () => {}, onPhaseChange });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 140 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(onPhaseChange.mock.calls.map((c) => c[0])).toEqual([
				'pulling',
				'ready',
				'refreshing',
				'idle'
			]);
			handle.destroy();
		});

		// Every pointermove would otherwise re-report the same phase.
		it('does not report the same phase twice in a row', () => {
			const onPhaseChange = vi.fn();
			const handle = refreshable(node, { onRefresh: () => {}, onPhaseChange });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			for (const y of [110, 120, 130, 140]) {
				firePointerEvent(node, 'pointermove', { clientY: y });
			}

			expect(onPhaseChange.mock.calls.map((c) => c[0])).toEqual(['pulling']);
			handle.destroy();
		});
	});

	describe('lifecycle', () => {
		it('removes every listener it added', () => {
			const tracked = trackListeners(node);
			const handle = refreshable(node, { onRefresh: vi.fn() });
			expect(tracked.added).toEqual([
				'pointerdown',
				'pointermove',
				'pointerup',
				'pointercancel'
			]);

			handle.destroy();

			expect(tracked.leaked()).toEqual([]);
			expect(tracked.removed.slice().sort()).toEqual(tracked.added.slice().sort());
		});

		it('removes its phase attribute on destroy', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });
			expect(node.getAttribute('data-refresh-phase')).toBe('idle');

			handle.destroy();

			expect(node.getAttribute('data-refresh-phase')).toBeNull();
			expect(node.getAttributeNames().filter((n) => n.startsWith('data-'))).toEqual([]);
		});

		// Without this the browser scrolls while the indicator is being pulled.
		it('claims the gesture from the scroller once pulling', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			const move = new Event('pointermove', { bubbles: true, cancelable: true });
			Object.assign(move, { pointerId: 1, clientY: 200 });
			node.dispatchEvent(move);

			expect(move.defaultPrevented).toBe(true);
			handle.destroy();
		});

		it('leaves an upward drag to the scroller', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });

			firePointerEvent(node, 'pointerdown', { clientY: 300 });
			const move = new Event('pointermove', { bubbles: true, cancelable: true });
			Object.assign(move, { pointerId: 1, clientY: 100 });
			node.dispatchEvent(move);

			expect(move.defaultPrevented).toBe(false);
			handle.destroy();
		});

		// Synthetic and legacy pointer events may carry no `button` at all; the
		// guard must treat that as the primary button, not reject the gesture.
		it('accepts a pointer event with no button property', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });

			const down = new Event('pointerdown', { bubbles: true, cancelable: true });
			Object.assign(down, { pointerId: 1, clientY: 0 });
			node.dispatchEvent(down);
			firePointerEvent(node, 'pointermove', { clientY: 60 });

			expect(pullOf(node)).toBe(30);
			handle.destroy();
		});

		it('ignores a non-primary button', () => {
			const onRefresh = vi.fn();
			const handle = refreshable(node, { onRefresh });

			firePointerEvent(node, 'pointerdown', { clientY: 100, button: 2 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(onRefresh).not.toHaveBeenCalled();
			expect(pullOf(node)).toBe(0);
			handle.destroy();
		});

		// The indicator parks at the threshold while the request runs, rather
		// than wherever the finger happened to stop.
		it('parks the indicator at the threshold while refreshing', async () => {
			let release!: () => void;
			const pending = new Promise<void>((r) => (release = r));
			const handle = refreshable(node, { onRefresh: () => pending, threshold: 40 });

			firePointerEvent(node, 'pointerdown', { clientY: 0 });
			firePointerEvent(node, 'pointermove', { clientY: 400 });
			expect(pullOf(node)).toBe(150);

			firePointerEvent(node, 'pointerup', { clientY: 400 });

			expect(pullOf(node)).toBe(40);

			release();
			await pending;
			await Promise.resolve();
			handle.destroy();
		});

		it('uses the default threshold when none is given', () => {
			const onRefresh = vi.fn();
			const handle = refreshable(node, { onRefresh });

			// 126px of travel resists to 63px, one short of the 64px default.
			firePointerEvent(node, 'pointerdown', { clientY: 0 });
			firePointerEvent(node, 'pointermove', { clientY: 126 });
			firePointerEvent(node, 'pointerup', { clientY: 126 });
			expect(onRefresh).not.toHaveBeenCalled();

			firePointerEvent(node, 'pointerdown', { clientY: 0 });
			firePointerEvent(node, 'pointermove', { clientY: 128 });
			firePointerEvent(node, 'pointerup', { clientY: 128 });
			expect(onRefresh).toHaveBeenCalledTimes(1);
			handle.destroy();
		});

		it('honours a custom resistance', () => {
			const handle = refreshable(node, { onRefresh: vi.fn(), resistance: 0.25 });

			firePointerEvent(node, 'pointerdown', { clientY: 0 });
			firePointerEvent(node, 'pointermove', { clientY: 100 });

			expect(pullOf(node)).toBe(25);
			handle.destroy();
		});

		it('ignores a pointermove with no preceding pointerdown', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });

			firePointerEvent(node, 'pointermove', { clientY: 400 });

			expect(pullOf(node)).toBe(0);
			expect(phaseOf(node)).toBe('idle');
			handle.destroy();
		});

		it('ignores a pointerup from a second finger', () => {
			const onRefresh = vi.fn();
			const handle = refreshable(node, { onRefresh });

			firePointerEvent(node, 'pointerdown', { clientY: 0, pointerId: 1 });
			firePointerEvent(node, 'pointermove', { clientY: 300, pointerId: 1 });
			firePointerEvent(node, 'pointerup', { clientY: 300, pointerId: 2 });

			expect(onRefresh).not.toHaveBeenCalled();
			expect(phaseOf(node)).toBe('ready');
			handle.destroy();
		});

		it('ignores a pointercancel from a second finger', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });

			firePointerEvent(node, 'pointerdown', { clientY: 0, pointerId: 1 });
			firePointerEvent(node, 'pointermove', { clientY: 300, pointerId: 1 });
			firePointerEvent(node, 'pointercancel', { clientY: 300, pointerId: 2 });

			// Still mid-pull, so the stray cancel must not collapse the indicator.
			expect(phaseOf(node)).toBe('ready');
			expect(pullOf(node)).toBe(150);
			handle.destroy();
		});

		// update() re-derives the phase, so a threshold change mid-pull is
		// reflected immediately rather than at the next pointer event.
		it('re-renders the phase when options change mid-pull', () => {
			const handle = refreshable(node, { onRefresh: vi.fn(), threshold: 200 });

			firePointerEvent(node, 'pointerdown', { clientY: 0 });
			firePointerEvent(node, 'pointermove', { clientY: 100 });
			expect(phaseOf(node)).toBe('pulling');

			handle.update({ onRefresh: vi.fn(), threshold: 10 });

			expect(phaseOf(node)).toBe('ready');
			handle.destroy();
		});

		it('applies new options on update', () => {
			const first = vi.fn();
			const second = vi.fn();
			const handle = refreshable(node, { onRefresh: first });

			handle.update({ onRefresh: second });
			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledTimes(1);
			handle.destroy();
		});

		it('stops responding after destroy', () => {
			const onRefresh = vi.fn();
			const handle = refreshable(node, { onRefresh });
			handle.destroy();

			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 300 });
			firePointerEvent(node, 'pointerup', { clientY: 300 });

			expect(onRefresh).not.toHaveBeenCalled();
		});

		it('clears its state on destroy', () => {
			const handle = refreshable(node, { onRefresh: vi.fn() });
			firePointerEvent(node, 'pointerdown', { clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientY: 200 });

			handle.destroy();

			expect(node.style.getPropertyValue('--refresh-pull')).toBe('');
			expect(node.getAttribute('data-refresh-phase')).toBeNull();
		});
	});

	describe('fuzz', () => {
		// FALSE POSITIVE validation: a refresh is a side effect, so no gesture
		// short of the threshold may cause one.
		it('never refreshes from a pull below the threshold', () => {
			fc.assert(
				fc.property(fc.double({ min: 0, max: 127, noNaN: true }), (dy) => {
					const el = makeNode(0);
					const onRefresh = vi.fn();
					const handle = refreshable(el, { onRefresh });

					firePointerEvent(el, 'pointerdown', { clientY: 0 });
					firePointerEvent(el, 'pointermove', { clientY: dy });
					firePointerEvent(el, 'pointerup', { clientY: dy });

					expect(onRefresh).not.toHaveBeenCalled();
					handle.destroy();
					el.remove();
				}),
				{ numRuns: 300 }
			);
		});

		// FALSE NEGATIVE validation: a completed pull must always refresh.
		it('always refreshes from a pull past the threshold', () => {
			fc.assert(
				fc.property(fc.double({ min: 129, max: 5000, noNaN: true }), (dy) => {
					const el = makeNode(0);
					const onRefresh = vi.fn();
					const handle = refreshable(el, { onRefresh });

					firePointerEvent(el, 'pointerdown', { clientY: 0 });
					firePointerEvent(el, 'pointermove', { clientY: dy });
					firePointerEvent(el, 'pointerup', { clientY: dy });

					expect(onRefresh).toHaveBeenCalledTimes(1);
					handle.destroy();
					el.remove();
				}),
				{ numRuns: 300 }
			);
		});

		it('never renders a pull outside the allowed range', () => {
			fc.assert(
				fc.property(fc.double({ min: -5000, max: 5000, noNaN: true }), (dy) => {
					const el = makeNode(0);
					const handle = refreshable(el, { onRefresh: vi.fn() });

					firePointerEvent(el, 'pointerdown', { clientY: 0 });
					firePointerEvent(el, 'pointermove', { clientY: dy });

					const pull = pullOf(el);
					expect(pull).toBeGreaterThanOrEqual(0);
					expect(pull).toBeLessThanOrEqual(MAX_PULL_DISTANCE);
					handle.destroy();
					el.remove();
				}),
				{ numRuns: 300 }
			);
		});

		it('always ends on a declared phase', () => {
			fc.assert(
				fc.property(fc.double({ min: -5000, max: 5000, noNaN: true }), (dy) => {
					const el = makeNode(0);
					const handle = refreshable(el, { onRefresh: () => {} });

					firePointerEvent(el, 'pointerdown', { clientY: 0 });
					firePointerEvent(el, 'pointermove', { clientY: dy });
					firePointerEvent(el, 'pointerup', { clientY: dy });

					expect(['idle', 'pulling', 'ready', 'refreshing']).toContain(
						phaseOf(el) as RefreshPhase
					);
					handle.destroy();
					el.remove();
				}),
				{ numRuns: 300 }
			);
		});
	});
});
