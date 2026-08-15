import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import {
	swipeActions,
	edgeSign,
	clampSwipeOffset,
	resolveSwipeState,
	offsetForState,
	DEFAULT_FULL_SWIPE_THRESHOLD,
	DEFAULT_SWIPE_RUBBER_BAND,
	DEFAULT_SWIPE_VELOCITY,
	SWIPE_SLOP,
	type SwipeEdge,
	type SwipeGeometry,
	type SwipeState
} from '../../src/lib/actions/swipeActions';

function geo(over: Partial<SwipeGeometry> = {}): SwipeGeometry {
	return {
		edge: 'trailing',
		actionsWidth: 80,
		rowWidth: 320,
		allowsFullSwipe: true,
		...over
	};
}

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	(el as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture = vi.fn();
	(el as unknown as { releasePointerCapture: (id: number) => void }).releasePointerCapture =
		vi.fn();
	return el;
}

function firePointerEvent(target: HTMLElement, type: string, init: PointerEventInit) {
	const ev = new Event(type, { bubbles: true, cancelable: true }) as unknown as PointerEvent;
	Object.assign(ev, { pointerId: 1, button: 0, clientX: 0, clientY: 0, ...init });
	target.dispatchEvent(ev as unknown as Event);
	return ev;
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

const offsetOf = (el: HTMLElement) => parseFloat(el.style.getPropertyValue('--swipe-x') || '0');

describe('defaults', () => {
	it('triggers a full swipe at half the row width', () => {
		expect(DEFAULT_FULL_SWIPE_THRESHOLD).toBe(0.5);
	});

	it('rubber-bands overshoot to roughly a third', () => {
		expect(DEFAULT_SWIPE_RUBBER_BAND).toBe(0.35);
	});

	it('matches the drag-snap flick threshold', () => {
		expect(DEFAULT_SWIPE_VELOCITY).toBe(500);
	});

	it('keeps the threshold inside the row', () => {
		expect(DEFAULT_FULL_SWIPE_THRESHOLD).toBeGreaterThan(0);
		expect(DEFAULT_FULL_SWIPE_THRESHOLD).toBeLessThanOrEqual(1);
	});

	it('damps rather than amplifies overshoot', () => {
		expect(DEFAULT_SWIPE_RUBBER_BAND).toBeGreaterThan(0);
		expect(DEFAULT_SWIPE_RUBBER_BAND).toBeLessThan(1);
	});
});

describe('edgeSign', () => {
	it('slides content left for trailing actions', () => {
		expect(edgeSign('trailing')).toBe(-1);
	});

	it('slides content right for leading actions', () => {
		expect(edgeSign('leading')).toBe(1);
	});

	// SwiftUI's .swipeActions defaults to the trailing edge.
	it('defaults an unknown edge to trailing', () => {
		expect(edgeSign('sideways' as SwipeEdge)).toBe(-1);
	});

	it('only ever returns a unit sign', () => {
		fc.assert(
			fc.property(fc.string(), (s) => {
				expect([-1, 1]).toContain(edgeSign(s as SwipeEdge));
			}),
			{ numRuns: 500 }
		);
	});
});

describe('clampSwipeOffset', () => {
	describe('trailing edge', () => {
		it('tracks the pointer one-to-one inside the action width', () => {
			expect(clampSwipeOffset(-40, geo())).toBe(-40);
		});

		it('reaches exactly the action width', () => {
			expect(clampSwipeOffset(-80, geo())).toBe(-80);
		});

		it('keeps tracking to the row width when a full swipe is allowed', () => {
			expect(clampSwipeOffset(-200, geo())).toBe(-200);
		});

		it('rubber-bands past the row width', () => {
			// 320 + (400 - 320) * 0.35
			expect(clampSwipeOffset(-400, geo())).toBeCloseTo(-348, 5);
		});

		it('rubber-bands past the action width when full swipe is off', () => {
			// 80 + (200 - 80) * 0.35
			expect(clampSwipeOffset(-200, geo({ allowsFullSwipe: false }))).toBeCloseTo(-122, 5);
		});

		// Dragging the wrong way must not reveal the opposite edge's actions.
		it('refuses movement towards the leading edge', () => {
			expect(clampSwipeOffset(50, geo())).toBe(0);
		});
	});

	describe('leading edge', () => {
		const lead = geo({ edge: 'leading' });

		it('tracks a rightward drag', () => {
			expect(clampSwipeOffset(40, lead)).toBe(40);
		});

		it('refuses a leftward drag', () => {
			expect(clampSwipeOffset(-40, lead)).toBe(0);
		});

		it('mirrors the trailing rubber band', () => {
			expect(clampSwipeOffset(400, lead)).toBeCloseTo(348, 5);
		});
	});

	describe('degenerate geometry', () => {
		it('returns zero at rest', () => {
			expect(clampSwipeOffset(0, geo())).toBe(0);
		});

		// Object.is distinguishes -0 from 0, and a -0 offset would serialise as
		// "-0px". The early return must be taken at exactly zero, not fallen past.
		it('returns positive zero, not negative zero, at rest', () => {
			expect(Object.is(clampSwipeOffset(0, geo()), 0)).toBe(true);
			expect(Object.is(clampSwipeOffset(0, geo({ edge: 'leading' })), 0)).toBe(true);
		});

		it('stays closed when there are no actions to reveal', () => {
			expect(clampSwipeOffset(-200, geo({ actionsWidth: 0, allowsFullSwipe: false }))).toBe(0);
		});

		it('does not use an unmeasured row width as the limit', () => {
			// rowWidth 0 with full swipe on must not collapse the limit to zero.
			expect(clampSwipeOffset(-40, geo({ rowWidth: 0 }))).toBe(-40);
		});

		it('never returns NaN for a NaN delta', () => {
			expect(clampSwipeOffset(Number.NaN, geo())).toBe(0);
		});

		it('never returns Infinity', () => {
			expect(Number.isFinite(clampSwipeOffset(-Infinity, geo()))).toBe(true);
		});
	});

	describe('fuzz', () => {
		const finite = fc.double({ min: -5000, max: 5000, noNaN: true });
		const g = fc.record({
			edge: fc.constantFrom<SwipeEdge>('leading', 'trailing'),
			actionsWidth: fc.double({ min: 0, max: 400, noNaN: true }),
			rowWidth: fc.double({ min: 0, max: 1200, noNaN: true }),
			allowsFullSwipe: fc.boolean()
		});

		// FALSE POSITIVE validation: the row must never slide the wrong way, which
		// would expose an edge the caller supplied no actions for.
		it('never produces an offset opposing the configured edge', () => {
			fc.assert(
				fc.property(finite, g, (dx, cfg) => {
					const out = clampSwipeOffset(dx, cfg);
					const s = edgeSign(cfg.edge);
					expect(out === 0 || Math.sign(out) === s).toBe(true);
				}),
				{ numRuns: 1000 }
			);
		});

		// FALSE NEGATIVE validation: any drag in the right direction must move the
		// row -- a swipe that silently does nothing reads as a dead control.
		it('always moves for a real drag towards the actions', () => {
			fc.assert(
				fc.property(
					fc.double({ min: 1, max: 500, noNaN: true }),
					g.filter((c) => c.actionsWidth > 0),
					(m, cfg) => {
						const out = clampSwipeOffset(m * edgeSign(cfg.edge), cfg);
						expect(Math.abs(out)).toBeGreaterThan(0);
					}
				),
				{ numRuns: 1000 }
			);
		});

		it('is always finite', () => {
			fc.assert(
				fc.property(finite, g, (dx, cfg) => {
					expect(Number.isFinite(clampSwipeOffset(dx, cfg))).toBe(true);
				}),
				{ numRuns: 1000 }
			);
		});

		// Overshoot is damped, never amplified: |offset| <= |raw input|.
		it('never travels further than the pointer did', () => {
			fc.assert(
				fc.property(finite, g, (dx, cfg) => {
					expect(Math.abs(clampSwipeOffset(dx, cfg))).toBeLessThanOrEqual(Math.abs(dx) + 1e-9);
				}),
				{ numRuns: 1000 }
			);
		});

		it('is monotonic in the drag distance', () => {
			fc.assert(
				fc.property(
					fc.double({ min: 0, max: 2000, noNaN: true }),
					fc.double({ min: 0, max: 2000, noNaN: true }),
					g,
					(a, b, cfg) => {
						const s = edgeSign(cfg.edge);
						const lo = Math.min(a, b);
						const hi = Math.max(a, b);
						expect(Math.abs(clampSwipeOffset(lo * s, cfg))).toBeLessThanOrEqual(
							Math.abs(clampSwipeOffset(hi * s, cfg)) + 1e-9
						);
					}
				),
				{ numRuns: 1000 }
			);
		});
	});
});

describe('resolveSwipeState', () => {
	describe('by displacement', () => {
		it('settles open past half the action width', () => {
			expect(resolveSwipeState(-50, 0, geo())).toBe('open');
		});

		it('springs closed short of half the action width', () => {
			expect(resolveSwipeState(-30, 0, geo())).toBe('closed');
		});

		it('settles open exactly at half the action width', () => {
			expect(resolveSwipeState(-40, 0, geo())).toBe('open');
		});

		it('triggers a full swipe past half the row', () => {
			expect(resolveSwipeState(-170, 0, geo())).toBe('fullSwipe');
		});

		it('does not trigger a full swipe just short of the threshold', () => {
			expect(resolveSwipeState(-159, 0, geo())).toBe('open');
		});

		// The trigger is inclusive: landing exactly on it commits the swipe.
		it('triggers a full swipe exactly at the threshold', () => {
			const cfg = geo();
			const exact = cfg.rowWidth * DEFAULT_FULL_SWIPE_THRESHOLD;
			expect(resolveSwipeState(-exact, 0, cfg)).toBe('fullSwipe');
			expect(resolveSwipeState(-(exact - 0.5), 0, cfg)).toBe('open');
		});
	});

	describe('by velocity', () => {
		it('opens on a fast flick towards the actions', () => {
			expect(resolveSwipeState(-10, -900, geo())).toBe('open');
		});

		it('closes on a fast flick away from the actions', () => {
			expect(resolveSwipeState(-70, 900, geo())).toBe('closed');
		});

		it('ignores a flick slower than the threshold', () => {
			expect(resolveSwipeState(-10, -100, geo())).toBe('closed');
		});

		// Exactly at the threshold is not yet a flick: the comparison is strict,
		// so the displacement decides.
		it('treats exactly the threshold velocity as no flick', () => {
			expect(resolveSwipeState(-10, -DEFAULT_SWIPE_VELOCITY, geo())).toBe('closed');
			expect(resolveSwipeState(-50, -DEFAULT_SWIPE_VELOCITY, geo())).toBe('open');
		});

		// Dragging past the trigger then flicking back is a cancel, not a delete.
		it('lets a fast flick back cancel a pending full swipe', () => {
			expect(resolveSwipeState(-200, 900, geo())).toBe('closed');
		});

		it('still full-swipes when the flick continues in the same direction', () => {
			expect(resolveSwipeState(-200, -900, geo())).toBe('fullSwipe');
		});
	});

	describe('guards', () => {
		it('never full-swipes when the caller disallows it', () => {
			expect(resolveSwipeState(-300, 0, geo({ allowsFullSwipe: false }))).toBe('open');
		});

		// rowWidth is 0 until the row is measured; a 0 threshold would fire a
		// destructive action on the first pixel of movement.
		it('never full-swipes against an unmeasured row', () => {
			expect(resolveSwipeState(-5, 0, geo({ rowWidth: 0 }))).not.toBe('fullSwipe');
		});

		// Opening to reveal nothing leaves an empty gap the user cannot dismiss.
		it('stays closed when there are no actions', () => {
			expect(resolveSwipeState(-300, 0, geo({ actionsWidth: 0, allowsFullSwipe: false }))).toBe(
				'closed'
			);
		});

		it('stays closed at rest', () => {
			expect(resolveSwipeState(0, 0, geo())).toBe('closed');
		});

		it('treats a NaN velocity as no flick', () => {
			expect(resolveSwipeState(-50, Number.NaN, geo())).toBe('open');
		});
	});

	describe('leading edge', () => {
		const lead = geo({ edge: 'leading' });

		it('opens on a positive displacement', () => {
			expect(resolveSwipeState(50, 0, lead)).toBe('open');
		});

		it('opens on a rightward flick', () => {
			expect(resolveSwipeState(10, 900, lead)).toBe('open');
		});

		it('closes on a leftward flick', () => {
			expect(resolveSwipeState(70, -900, lead)).toBe('closed');
		});

		it('full-swipes past half the row', () => {
			expect(resolveSwipeState(170, 0, lead)).toBe('fullSwipe');
		});
	});

	describe('fuzz', () => {
		const g = fc.record({
			edge: fc.constantFrom<SwipeEdge>('leading', 'trailing'),
			actionsWidth: fc.double({ min: 0, max: 400, noNaN: true }),
			rowWidth: fc.double({ min: 0, max: 1200, noNaN: true }),
			allowsFullSwipe: fc.boolean()
		});
		const offset = fc.double({ min: -2000, max: 2000, noNaN: true });
		const velocity = fc.double({ min: -6000, max: 6000, noNaN: true });

		// FALSE NEGATIVE validation: the resolver must always name a state the
		// caller can act on.
		it('always returns one of the three known states', () => {
			fc.assert(
				fc.property(offset, velocity, g, (o, v, cfg) => {
					expect(['closed', 'open', 'fullSwipe']).toContain(resolveSwipeState(o, v, cfg));
				}),
				{ numRuns: 2000 }
			);
		});

		// FALSE POSITIVE validation: fullSwipe fires a destructive action, so it
		// must be impossible whenever the caller has not opted in.
		it('never reports fullSwipe unless allowed and measured', () => {
			fc.assert(
				fc.property(offset, velocity, g, (o, v, cfg) => {
					const state = resolveSwipeState(o, v, cfg);
					if (state === 'fullSwipe') {
						expect(cfg.allowsFullSwipe).toBe(true);
						expect(cfg.rowWidth).toBeGreaterThan(0);
						expect(Math.abs(o)).toBeGreaterThanOrEqual(
							cfg.rowWidth * DEFAULT_FULL_SWIPE_THRESHOLD
						);
					}
				}),
				{ numRuns: 2000 }
			);
		});

		// FALSE POSITIVE validation: never open onto zero-width actions.
		it('never reports open when there is nothing to reveal', () => {
			fc.assert(
				fc.property(offset, velocity, g, (o, v, cfg) => {
					if (cfg.actionsWidth <= 0) {
						expect(resolveSwipeState(o, v, cfg)).not.toBe('open');
					}
				}),
				{ numRuns: 2000 }
			);
		});

		// An offset opposing the edge means the user dragged the other way; the row
		// must return to rest rather than open.
		it('closes for any displacement opposing the edge', () => {
			fc.assert(
				fc.property(fc.double({ min: 1, max: 2000, noNaN: true }), g, (m, cfg) => {
					const wrongWay = -edgeSign(cfg.edge) * m;
					expect(resolveSwipeState(wrongWay, 0, cfg)).toBe('closed');
				}),
				{ numRuns: 1000 }
			);
		});

		it('is deterministic', () => {
			fc.assert(
				fc.property(offset, velocity, g, (o, v, cfg) => {
					expect(resolveSwipeState(o, v, cfg)).toBe(resolveSwipeState(o, v, cfg));
				}),
				{ numRuns: 500 }
			);
		});
	});
});

describe('offsetForState', () => {
	it('rests at zero when closed', () => {
		expect(offsetForState('closed', geo())).toBe(0);
	});

	it('rests at the action width when open', () => {
		expect(offsetForState('open', geo())).toBe(-80);
	});

	it('rests at the full row width on a full swipe', () => {
		expect(offsetForState('fullSwipe', geo())).toBe(-320);
	});

	it('mirrors for the leading edge', () => {
		expect(offsetForState('open', geo({ edge: 'leading' }))).toBe(80);
		expect(offsetForState('fullSwipe', geo({ edge: 'leading' }))).toBe(320);
	});

	it('falls back to closed for an unknown state', () => {
		expect(offsetForState('wobbling' as SwipeState, geo())).toBe(0);
	});

	describe('fuzz', () => {
		const g = fc.record({
			edge: fc.constantFrom<SwipeEdge>('leading', 'trailing'),
			actionsWidth: fc.double({ min: 0, max: 400, noNaN: true }),
			rowWidth: fc.double({ min: 0, max: 1200, noNaN: true }),
			allowsFullSwipe: fc.boolean()
		});

		// Round trip: the resting offset for a state must resolve back to that
		// state, or a released row would immediately disagree with itself.
		it('round-trips open and closed through resolveSwipeState', () => {
			fc.assert(
				fc.property(
					g.filter((c) => c.actionsWidth > 0),
					(cfg) => {
						expect(resolveSwipeState(offsetForState('closed', cfg), 0, cfg)).toBe('closed');
						const open = offsetForState('open', cfg);
						const settled = resolveSwipeState(open, 0, cfg);
						// An action strip wider than the full-swipe threshold legitimately
						// resolves straight to fullSwipe.
						const past =
							cfg.allowsFullSwipe &&
							cfg.rowWidth > 0 &&
							Math.abs(open) >= cfg.rowWidth * DEFAULT_FULL_SWIPE_THRESHOLD;
						expect(settled).toBe(past ? 'fullSwipe' : 'open');
					}
				),
				{ numRuns: 1000 }
			);
		});

		it('never opposes the configured edge', () => {
			fc.assert(
				fc.property(
					fc.constantFrom<SwipeState>('closed', 'open', 'fullSwipe'),
					g,
					(state, cfg) => {
						const out = offsetForState(state, cfg);
						expect(out === 0 || Math.sign(out) === edgeSign(cfg.edge)).toBe(true);
					}
				),
				{ numRuns: 1000 }
			);
		});
	});
});

describe('swipeActions action', () => {
	let node: HTMLElement;

	// Pointer events fire back-to-back here, so real clocks give dt ~= 0 and an
	// absurd velocity. Freezing the clock makes velocity 0 unless a test
	// deliberately advances it, so displacement and flick paths stay separable.
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['performance'] });
		node = makeNode();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns update and destroy lifecycle hooks', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		expect(typeof handle.update).toBe('function');
		expect(typeof handle.destroy).toBe('function');
		handle.destroy();
	});

	it('starts closed', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		expect(node.getAttribute('data-swipe-state')).toBe('closed');
		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	it('tracks a horizontal drag', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 160, clientY: 100 });

		expect(offsetOf(node)).toBe(-40);
		handle.destroy();
	});

	it('opens when released past the halfway point', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 140, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 140, clientY: 100 });

		expect(node.getAttribute('data-swipe-state')).toBe('open');
		expect(offsetOf(node)).toBe(-80);
		expect(onStateChange).toHaveBeenCalledWith('open');
		handle.destroy();
	});

	it('springs back when released short of the halfway point', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 185, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 185, clientY: 100 });

		expect(node.getAttribute('data-swipe-state')).toBe('closed');
		expect(offsetOf(node)).toBe(0);
		expect(onStateChange).toHaveBeenCalledWith('closed');
		handle.destroy();
	});

	it('fires onFullSwipe when dragged past the trigger', () => {
		const onFullSwipe = vi.fn();
		const handle = swipeActions(node, {
			actionsWidth: 80,
			rowWidth: 320,
			allowsFullSwipe: true,
			onFullSwipe
		});

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 100, clientY: 100 });

		expect(onFullSwipe).toHaveBeenCalledTimes(1);
		expect(node.getAttribute('data-swipe-state')).toBe('fullSwipe');
		handle.destroy();
	});

	it('does not fire onFullSwipe for an ordinary open', () => {
		const onFullSwipe = vi.fn();
		const handle = swipeActions(node, {
			actionsWidth: 80,
			rowWidth: 320,
			allowsFullSwipe: true,
			onFullSwipe
		});

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 240, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 240, clientY: 100 });

		expect(onFullSwipe).not.toHaveBeenCalled();
		handle.destroy();
	});

	// A vertical drag is the user scrolling the list; hijacking it makes the list
	// feel stuck.
	it('ignores a predominantly vertical drag', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 195, clientY: 180 });
		firePointerEvent(node, 'pointermove', { clientX: 120, clientY: 260 });

		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	it('opens on a fast flick that barely moves', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		vi.advanceTimersByTime(10);
		firePointerEvent(node, 'pointermove', { clientX: 190, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 190, clientY: 100 });

		// -10px in 10ms is 1000px/s, past the 500px/s flick threshold.
		expect(node.getAttribute('data-swipe-state')).toBe('open');
		handle.destroy();
	});

	it('closes on a fast flick back from a deep drag', () => {
		const onFullSwipe = vi.fn();
		const handle = swipeActions(node, {
			actionsWidth: 80,
			rowWidth: 320,
			allowsFullSwipe: true,
			onFullSwipe
		});

		// Real pointermove events arrive every few ms, so the velocity window
		// reflects the recent reversal rather than the whole gesture.
		firePointerEvent(node, 'pointerdown', { clientX: 400, clientY: 100 });
		for (const x of [325, 250, 175, 100, 130, 160, 190, 220]) {
			vi.advanceTimersByTime(10);
			firePointerEvent(node, 'pointermove', { clientX: x, clientY: 100 });
		}
		firePointerEvent(node, 'pointerup', { clientX: 220, clientY: 100 });

		expect(node.getAttribute('data-swipe-state')).toBe('closed');
		expect(onFullSwipe).not.toHaveBeenCalled();
		handle.destroy();
	});

	it('does not claim the gesture below the movement threshold', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 198, clientY: 100 });

		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	it('does nothing when disabled', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, {
			actionsWidth: 80,
			rowWidth: 320,
			disabled: true,
			onStateChange
		});

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 100, clientY: 100 });

		expect(offsetOf(node)).toBe(0);
		expect(onStateChange).not.toHaveBeenCalled();
		handle.destroy();
	});

	it('returns to rest when the gesture is cancelled', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 130, clientY: 100 });
		firePointerEvent(node, 'pointercancel', { clientX: 130, clientY: 100 });

		expect(offsetOf(node)).toBe(0);
		expect(node.getAttribute('data-swipe-state')).toBe('closed');
		handle.destroy();
	});

	it('ignores pointer events from a second finger', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100, pointerId: 1 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100, pointerId: 2 });

		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	it('drags from an already-open row back to closed', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100 });
		expect(node.getAttribute('data-swipe-state')).toBe('open');

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 290, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 290, clientY: 100 });

		expect(node.getAttribute('data-swipe-state')).toBe('closed');
		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	it('removes every listener it added', () => {
		const tracked = trackListeners(node);
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });
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

	it('removes its state attribute on destroy', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });
		expect(node.getAttribute('data-swipe-state')).toBe('closed');

		handle.destroy();

		expect(node.getAttribute('data-swipe-state')).toBeNull();
		expect(node.getAttributeNames().filter((n) => n.startsWith('data-'))).toEqual([]);
	});

	// Without this the browser scrolls the list while the row is being swiped.
	it('claims the gesture from the scroller once swiping', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		const move = new Event('pointermove', { bubbles: true, cancelable: true });
		Object.assign(move, { pointerId: 1, clientX: 140, clientY: 100 });
		node.dispatchEvent(move);

		expect(move.defaultPrevented).toBe(true);
		handle.destroy();
	});

	it('leaves a vertical drag to the scroller', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		const move = new Event('pointermove', { bubbles: true, cancelable: true });
		Object.assign(move, { pointerId: 1, clientX: 198, clientY: 300 });
		node.dispatchEvent(move);

		expect(move.defaultPrevented).toBe(false);
		handle.destroy();
	});

	it('ignores a non-primary button', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100, button: 2 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 100, clientY: 100 });

		expect(offsetOf(node)).toBe(0);
		expect(onStateChange).not.toHaveBeenCalled();
		handle.destroy();
	});

	// Synthetic and legacy pointer events may carry no `button` at all; the
	// guard must treat that as the primary button, not reject the gesture.
	it('accepts a pointer event with no button property', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		const down = new Event('pointerdown', { bubbles: true, cancelable: true });
		Object.assign(down, { pointerId: 1, clientX: 300, clientY: 100 });
		node.dispatchEvent(down);
		firePointerEvent(node, 'pointermove', { clientX: 240, clientY: 100 });

		expect(offsetOf(node)).toBe(-60);
		handle.destroy();
	});

	it('defaults to the trailing edge when none is given', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100 });

		expect(offsetOf(node)).toBe(-80);
		handle.destroy();
	});

	// allowsFullSwipe must default to off: opting in to a destructive gesture
	// should be explicit.
	it('does not allow a full swipe unless asked', () => {
		const onFullSwipe = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onFullSwipe });

		firePointerEvent(node, 'pointerdown', { clientX: 400, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 20, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 20, clientY: 100 });

		expect(onFullSwipe).not.toHaveBeenCalled();
		expect(node.getAttribute('data-swipe-state')).toBe('open');
		handle.destroy();
	});

	it('measures the row from the node when no width is given', () => {
		node.getBoundingClientRect = () => ({ width: 200 }) as DOMRect;
		const onFullSwipe = vi.fn();
		const handle = swipeActions(node, {
			actionsWidth: 40,
			allowsFullSwipe: true,
			onFullSwipe
		});

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 180, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 180, clientY: 100 });

		// 120px of travel is past half of the measured 200px row.
		expect(onFullSwipe).toHaveBeenCalledTimes(1);
		handle.destroy();
	});

	it('ignores a pointerup from a second finger', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100, pointerId: 1 });
		firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100, pointerId: 1 });
		firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100, pointerId: 2 });

		expect(onStateChange).not.toHaveBeenCalled();
		expect(node.getAttribute('data-swipe-state')).toBe('closed');
		handle.destroy();
	});

	it('ignores a pointercancel from a second finger', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100, pointerId: 1 });
		firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100, pointerId: 1 });
		firePointerEvent(node, 'pointercancel', { clientX: 200, clientY: 100, pointerId: 2 });

		// Still mid-drag, so the offset must survive the stray cancel.
		// 100px of drag past an 80px strip rubber-bands to 80 + 20 * 0.35.
		expect(offsetOf(node)).toBe(-87);
		handle.destroy();
	});

	it('ignores a pointermove with no preceding pointerdown', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });

		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	it('does not settle when the pointer is released without moving', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100 });

		expect(onStateChange).not.toHaveBeenCalled();
		handle.destroy();
	});

	// Once the swipe owns the gesture it keeps it: a wobble into the vertical
	// must not hand the row back to the scroller mid-drag.
	it('keeps the gesture once claimed, even if the drag turns vertical', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 140, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 300 });

		expect(offsetOf(node)).toBe(-87);
		handle.destroy();
	});

	// Ties go to the swipe: at exactly 45 degrees the drag is horizontal enough.
	it('claims a drag at exactly 45 degrees', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 160, clientY: 140 });

		expect(offsetOf(node)).toBe(-40);
		handle.destroy();
	});

	// Once abandoned the gesture stays abandoned; otherwise a vertical scroll
	// that drifts sideways would suddenly grab the row.
	it('stays abandoned once the drag has gone vertical', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 198, clientY: 200 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 210 });

		expect(offsetOf(node)).toBe(0);
		handle.destroy();
	});

	// The boundary is inclusive: exactly SWIPE_SLOP of travel claims the gesture,
	// one pixel less does not.
	it('claims the gesture at exactly the slop distance', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 200 - (SWIPE_SLOP - 1), clientY: 100 });
		expect(offsetOf(node)).toBe(0);

		firePointerEvent(node, 'pointermove', { clientX: 200 - SWIPE_SLOP, clientY: 100 });
		expect(offsetOf(node)).toBe(-SWIPE_SLOP);
		handle.destroy();
	});

	it('re-settles an open row when the strip width changes', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 240, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 240, clientY: 100 });
		expect(offsetOf(node)).toBe(-80);

		handle.update({ actionsWidth: 160, rowWidth: 320 });

		expect(offsetOf(node)).toBe(-160);
		expect(node.getAttribute('data-swipe-state')).toBe('open');
		handle.destroy();
	});

	it('applies new options on update', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });

		handle.update({ actionsWidth: 160, rowWidth: 320 });
		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100 });

		expect(offsetOf(node)).toBe(-160);
		handle.destroy();
	});

	it('stops responding after destroy', () => {
		const onStateChange = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320, onStateChange });
		handle.destroy();

		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 100, clientY: 100 });

		expect(onStateChange).not.toHaveBeenCalled();
	});

	it('clears its inline offset on destroy', () => {
		const handle = swipeActions(node, { actionsWidth: 80, rowWidth: 320 });
		firePointerEvent(node, 'pointerdown', { clientX: 200, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 140, clientY: 100 });

		handle.destroy();

		expect(node.style.getPropertyValue('--swipe-x')).toBe('');
	});

	// jsdom measures every element as 0 wide. Full swipe must not fire on a row
	// whose width is unknown -- that would delete rows in a headless render.
	it('does not full-swipe when the row cannot be measured', () => {
		const onFullSwipe = vi.fn();
		const handle = swipeActions(node, { actionsWidth: 80, allowsFullSwipe: true, onFullSwipe });

		firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
		firePointerEvent(node, 'pointermove', { clientX: 10, clientY: 100 });
		firePointerEvent(node, 'pointerup', { clientX: 10, clientY: 100 });

		expect(onFullSwipe).not.toHaveBeenCalled();
		handle.destroy();
	});

	describe('measuring the action strip', () => {
		function stripOfWidth(width: number): HTMLElement {
			const el = document.createElement('div');
			el.getBoundingClientRect = () => ({ width }) as DOMRect;
			return el;
		}

		it('measures the strip element when no width is given', () => {
			const handle = swipeActions(node, {
				actionsElement: stripOfWidth(120),
				rowWidth: 320
			});

			firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100 });
			firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100 });

			expect(offsetOf(node)).toBe(-120);
			handle.destroy();
		});

		// Measured at gesture start, not attach time: the strip has no layout on
		// the first frame, and its width can change with the content.
		it('re-measures on each gesture', () => {
			const strip = stripOfWidth(80);
			const handle = swipeActions(node, { actionsElement: strip, rowWidth: 320 });

			strip.getBoundingClientRect = () => ({ width: 200 }) as DOMRect;
			firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientX: 150, clientY: 100 });
			firePointerEvent(node, 'pointerup', { clientX: 150, clientY: 100 });

			expect(offsetOf(node)).toBe(-200);
			handle.destroy();
		});

		it('prefers an explicit width over the element', () => {
			const handle = swipeActions(node, {
				actionsWidth: 60,
				actionsElement: stripOfWidth(200),
				rowWidth: 320
			});

			firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientX: 200, clientY: 100 });
			firePointerEvent(node, 'pointerup', { clientX: 200, clientY: 100 });

			expect(offsetOf(node)).toBe(-60);
			handle.destroy();
		});

		it('stays inert when neither a width nor an element is given', () => {
			const onStateChange = vi.fn();
			const handle = swipeActions(node, { rowWidth: 320, onStateChange });

			firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });
			firePointerEvent(node, 'pointerup', { clientX: 100, clientY: 100 });

			expect(offsetOf(node)).toBe(0);
			expect(onStateChange).toHaveBeenCalledWith('closed');
			handle.destroy();
		});

		it('stays inert for a null element', () => {
			const handle = swipeActions(node, { actionsElement: null, rowWidth: 320 });

			firePointerEvent(node, 'pointerdown', { clientX: 300, clientY: 100 });
			firePointerEvent(node, 'pointermove', { clientX: 100, clientY: 100 });
			firePointerEvent(node, 'pointerup', { clientX: 100, clientY: 100 });

			expect(offsetOf(node)).toBe(0);
			handle.destroy();
		});
	});

	describe('fuzz', () => {
		// FALSE NEGATIVE validation: every completed gesture must leave the row in
		// a declared resting position -- never mid-drag.
		it('always settles on a resting offset', () => {
			fc.assert(
				fc.property(
					fc.double({ min: -400, max: 400, noNaN: true }),
					fc.constantFrom<SwipeEdge>('leading', 'trailing'),
					(dx, edge) => {
						const el = makeNode();
						const handle = swipeActions(el, {
							edge,
							actionsWidth: 80,
							rowWidth: 320,
							allowsFullSwipe: true
						});

						firePointerEvent(el, 'pointerdown', { clientX: 400, clientY: 100 });
						firePointerEvent(el, 'pointermove', { clientX: 400 + dx, clientY: 100 });
						firePointerEvent(el, 'pointerup', { clientX: 400 + dx, clientY: 100 });

						const state = el.getAttribute('data-swipe-state') as SwipeState;
						expect(offsetOf(el)).toBeCloseTo(
							offsetForState(state, { edge, actionsWidth: 80, rowWidth: 320, allowsFullSwipe: true }),
							5
						);
						handle.destroy();
						el.remove();
					}
				),
				{ numRuns: 300 }
			);
		});

		// FALSE POSITIVE validation: a destructive full swipe must never fire from
		// a gesture that stayed inside the action strip.
		it('never fires onFullSwipe for a short drag', () => {
			fc.assert(
				fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (m) => {
					const el = makeNode();
					const onFullSwipe = vi.fn();
					const handle = swipeActions(el, {
						actionsWidth: 80,
						rowWidth: 320,
						allowsFullSwipe: true,
						onFullSwipe
					});

					firePointerEvent(el, 'pointerdown', { clientX: 400, clientY: 100 });
					firePointerEvent(el, 'pointermove', { clientX: 400 - m, clientY: 100 });
					firePointerEvent(el, 'pointerup', { clientX: 400 - m, clientY: 100 });

					expect(onFullSwipe).not.toHaveBeenCalled();
					handle.destroy();
					el.remove();
				}),
				{ numRuns: 300 }
			);
		});

		it('reports each settled state exactly once per gesture', () => {
			fc.assert(
				fc.property(fc.double({ min: -400, max: 400, noNaN: true }), (dx) => {
					const el = makeNode();
					const onStateChange = vi.fn();
					const handle = swipeActions(el, {
						actionsWidth: 80,
						rowWidth: 320,
						allowsFullSwipe: true,
						onStateChange
					});

					firePointerEvent(el, 'pointerdown', { clientX: 400, clientY: 100 });
					firePointerEvent(el, 'pointermove', { clientX: 400 + dx, clientY: 100 });
					firePointerEvent(el, 'pointerup', { clientX: 400 + dx, clientY: 100 });

					expect(onStateChange.mock.calls.length).toBeLessThanOrEqual(1);
					handle.destroy();
					el.remove();
				}),
				{ numRuns: 300 }
			);
		});
	});
});
