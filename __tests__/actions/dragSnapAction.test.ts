import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dragSnap } from '../../src/lib/actions/dragSnap';

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	(el as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture = vi.fn();
	(el as unknown as { releasePointerCapture: (id: number) => void }).releasePointerCapture =
		vi.fn();
	return el;
}

function firePointer(target: HTMLElement, type: string, init: Record<string, unknown>) {
	const ev = new Event(type, { bubbles: true, cancelable: true });
	Object.assign(ev, { pointerId: 1, button: 0, clientY: 0, ...init });
	target.dispatchEvent(ev);
}

/** Read the numeric vh value written to --sheet-y. */
function sheetY(el: HTMLElement): number {
	return parseFloat(el.style.getPropertyValue('--sheet-y'));
}

const DETENTS = [0.25, 0.5, 0.9];

describe('dragSnap action behaviour', () => {
	let node: HTMLElement;
	let target: HTMLElement;

	beforeEach(() => {
		node = makeNode();
		target = makeNode();
		// A stable viewport makes fraction maths predictable.
		Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('initial placement', () => {
		it('starts fully closed at 100vh before the entry frame', () => {
			const raf = vi
				.spyOn(globalThis, 'requestAnimationFrame')
				.mockImplementation(() => 0 as unknown as number);
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			expect(target.style.getPropertyValue('--sheet-y')).toBe('100vh');
			// Explicitly 'none': the closed position must not animate in from
			// wherever the element happened to be.
			expect(target.style.transition).toBe('none');
			raf.mockRestore();
		});

		it('animates into the initial detent on the next frame', async () => {
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			await new Promise((r) => requestAnimationFrame(r));
			// fraction 0.5 -> (1 - 0.5) * 100 = 50vh
			expect(sheetY(target)).toBeCloseTo(50, 5);
		});

		it('uses a spring transition for the entry animation', async () => {
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			await new Promise((r) => requestAnimationFrame(r));
			expect(target.style.transition).toBe('transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)');
		});

		it('clamps an out-of-range initial index', async () => {
			dragSnap(node, { detents: DETENTS, target, initial: 99 });
			await new Promise((r) => requestAnimationFrame(r));
			// Clamped to the last detent, 0.9 -> 10vh
			expect(sheetY(target)).toBeCloseTo(10, 5);
		});

		it('falls back to the node itself when no target is given', () => {
			dragSnap(node, { detents: DETENTS, initial: 0 });
			expect(node.style.getPropertyValue('--sheet-y')).not.toBe('');
		});

		it('treats an explicitly null target as the node itself', () => {
			dragSnap(node, { detents: DETENTS, target: null, initial: 0 });
			expect(node.style.getPropertyValue('--sheet-y')).not.toBe('');
		});

		// Older embedded webviews have no rAF; the sheet must still open rather
		// than sitting at 100vh forever.
		it('positions immediately when requestAnimationFrame is unavailable', () => {
			const originalRaf = globalThis.requestAnimationFrame;
			(globalThis as unknown as { requestAnimationFrame: unknown }).requestAnimationFrame =
				undefined;
			try {
				dragSnap(node, { detents: DETENTS, target, initial: 1 });
				expect(sheetY(target)).toBeCloseTo(50, 5);
			} finally {
				(globalThis as unknown as { requestAnimationFrame: unknown }).requestAnimationFrame =
					originalRaf;
			}
		});
	});

	describe('pointerdown gating', () => {
		it('ignores a secondary mouse button', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			firePointer(node, 'pointerdown', { button: 2, clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 100 });
			// No drag started, so the move must not reposition the sheet.
			expect(onDrag).not.toHaveBeenCalled();
		});

		it('accepts an event with no button property at all', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			const ev = new Event('pointerdown', { bubbles: true });
			Object.assign(ev, { pointerId: 1, clientY: 500 });
			node.dispatchEvent(ev);

			firePointer(node, 'pointermove', { clientY: 400 });
			expect(onDrag).toHaveBeenCalled();
		});

		it('does not start a drag while disabled', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, disabled: true, onDrag });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });
			expect(onDrag).not.toHaveBeenCalled();
		});

		it('captures the pointer so the drag survives leaving the handle', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 500, pointerId: 7 });
			expect(node.setPointerCapture).toHaveBeenCalledWith(7);
		});

		it('survives a environment without pointer capture', () => {
			(node as unknown as { setPointerCapture: () => void }).setPointerCapture = () => {
				throw new Error('unsupported');
			};
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			expect(() => firePointer(node, 'pointerdown', { clientY: 500 })).not.toThrow();
		});
	});

	describe('scroll deference', () => {
		/** A scrollable child, as a sheet's scrolling content would be. */
		function scrollableChild(scrollTop: number, overflowY = 'auto'): HTMLElement {
			const child = document.createElement('div');
			child.style.overflowY = overflowY;
			Object.defineProperty(child, 'scrollHeight', { value: 500, configurable: true });
			Object.defineProperty(child, 'clientHeight', { value: 100, configurable: true });
			Object.defineProperty(child, 'scrollTop', { value: scrollTop, configurable: true });
			node.appendChild(child);
			return child;
		}

		it('defers to an overflow-y: scroll ancestor too, not just auto', () => {
			const onDrag = vi.fn();
			const child = scrollableChild(50, 'scroll');
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });

			firePointer(child, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).not.toHaveBeenCalled();
		});

		it('ignores an ancestor whose overflow is visible', () => {
			const onDrag = vi.fn();
			const child = scrollableChild(50, 'visible');
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });

			firePointer(child, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalled();
		});

		// An overflow container that is not actually overflowing cannot be
		// scrolled, so it must not block the drag.
		it('ignores a scrollable ancestor that has nothing to scroll', () => {
			const onDrag = vi.fn();
			const child = document.createElement('div');
			child.style.overflowY = 'auto';
			Object.defineProperty(child, 'scrollHeight', { value: 100, configurable: true });
			Object.defineProperty(child, 'clientHeight', { value: 100, configurable: true });
			Object.defineProperty(child, 'scrollTop', { value: 50, configurable: true });
			node.appendChild(child);

			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			firePointer(child, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalled();
		});

		it('stops searching at the handle node itself', () => {
			const onDrag = vi.fn();
			node.style.overflowY = 'auto';
			Object.defineProperty(node, 'scrollHeight', { value: 500, configurable: true });
			Object.defineProperty(node, 'clientHeight', { value: 100, configurable: true });
			Object.defineProperty(node, 'scrollTop', { value: 50, configurable: true });

			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalled();
		});

		it('does not drag when the content underneath is scrolled', () => {
			const onDrag = vi.fn();
			const child = scrollableChild(50);
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });

			firePointer(child, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).not.toHaveBeenCalled();
		});

		it('drags when the content underneath is at the top', () => {
			const onDrag = vi.fn();
			const child = scrollableChild(0);
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });

			firePointer(child, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalled();
		});

		it('drags regardless of scroll when respectScroll is false', () => {
			const onDrag = vi.fn();
			const child = scrollableChild(50);
			dragSnap(node, { detents: DETENTS, target, initial: 0, respectScroll: false, onDrag });

			firePointer(child, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalled();
		});
	});

	describe('pointermove', () => {
		it('ignores a move that was never preceded by a down', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			firePointer(node, 'pointermove', { clientY: 400 });
			expect(onDrag).not.toHaveBeenCalled();
		});

		it('ignores a move from a different pointer', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			firePointer(node, 'pointerdown', { clientY: 500, pointerId: 1 });
			firePointer(node, 'pointermove', { clientY: 400, pointerId: 2 });
			expect(onDrag).not.toHaveBeenCalled();
		});

		it('grows the sheet when dragged upward', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			// Up 100px on a 1000px viewport => +0.1 fraction => 0.35 => 65vh
			firePointer(node, 'pointermove', { clientY: 400 });
			expect(sheetY(target)).toBeCloseTo(65, 5);
		});

		it('shrinks the sheet when dragged downward', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			firePointer(node, 'pointerdown', { clientY: 400 });
			// Down 100px => -0.1 => 0.4 => 60vh
			firePointer(node, 'pointermove', { clientY: 500 });
			expect(sheetY(target)).toBeCloseTo(60, 5);
		});

		it('tracks without a transition so the sheet follows the finger', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });
			expect(target.style.transition).toBe('none');
		});

		it('reports the raw delta and resolved fraction to onDrag', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalledTimes(1);
			const [delta, fraction] = onDrag.mock.calls[0]!;
			expect(delta).toBe(-100);
			expect(fraction).toBeCloseTo(0.35, 10);
		});

		it('rubber-bands past the largest detent', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 2 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			// Up 200px => raw 1.1, which is 0.2 past max 0.9 => 0.9 + 0.2*0.3 = 0.96
			firePointer(node, 'pointermove', { clientY: 300 });
			expect(sheetY(target)).toBeCloseTo(4, 5);
		});

		it('honours a custom rubber-band coefficient', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 2, rubberBand: 1 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 300 });
			// Coefficient 1 tracks the finger exactly: 1.1 => -10vh
			expect(sheetY(target)).toBeCloseTo(-10, 5);
		});

		it('treats a zero viewport height as 1 rather than dividing by zero', () => {
			Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true });
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 5 });
			firePointer(node, 'pointermove', { clientY: 4 });
			expect(Number.isFinite(sheetY(target))).toBe(true);
		});
	});

	describe('pointerup', () => {
		it('ignores a release that was never preceded by a down', () => {
			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onSnap });
			firePointer(node, 'pointerup', { clientY: 400 });
			expect(onSnap).not.toHaveBeenCalled();
		});

		it('ignores a release from a different pointer', () => {
			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onSnap });
			firePointer(node, 'pointerdown', { clientY: 500, pointerId: 1 });
			firePointer(node, 'pointerup', { clientY: 400, pointerId: 2 });
			expect(onSnap).not.toHaveBeenCalled();
		});

		it('reports both the index and the fraction it settled on', () => {
			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onSnap });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointerup', { clientY: 250 });

			expect(onSnap).toHaveBeenCalledTimes(1);
			const [index, fraction] = onSnap.mock.calls[0]!;
			expect(index).toBe(1);
			expect(fraction).toBe(0.5);
		});

		it('animates into the snapped position', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointerup', { clientY: 250 });
			expect(target.style.transition).toBe('transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)');
			expect(sheetY(target)).toBeCloseTo(50, 5);
		});

		it('releases the pointer capture', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 500, pointerId: 7 });
			firePointer(node, 'pointerup', { clientY: 500, pointerId: 7 });
			expect(node.releasePointerCapture).toHaveBeenCalledWith(7);
		});

		it('survives an environment without pointer capture release', () => {
			(node as unknown as { releasePointerCapture: () => void }).releasePointerCapture = () => {
				throw new Error('unsupported');
			};
			dragSnap(node, { detents: DETENTS, target, initial: 0 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			expect(() => firePointer(node, 'pointerup', { clientY: 500 })).not.toThrow();
		});

		it('a second release does nothing because the drag already ended', () => {
			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onSnap });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointerup', { clientY: 250 });
			firePointer(node, 'pointerup', { clientY: 100 });
			expect(onSnap).toHaveBeenCalledTimes(1);
		});

		it('honours a custom velocity threshold', () => {
			const now = vi.spyOn(performance, 'now');
			now.mockReturnValueOnce(0).mockReturnValueOnce(100);

			const onSnap = vi.fn();
			// A very high threshold forces the position-based path.
			dragSnap(node, {
				detents: DETENTS,
				target,
				initial: 0,
				velocityThreshold: 1e9,
				onSnap
			});
			firePointer(node, 'pointerdown', { clientY: 900 });
			firePointer(node, 'pointermove', { clientY: 100 });
			firePointer(node, 'pointerup', { clientY: 100 });

			// Position wins: raw fraction 0.25 + 0.8 = 1.05, nearest is 0.9.
			expect(onSnap.mock.calls[0]![0]).toBe(2);
		});
	});

	describe('velocity sampling', () => {
		// The sample buffer is capped so velocity reflects the recent flick, not
		// the whole gesture. Without the cap, a fast start would keep counting.
		it('measures only the most recent samples, not the whole drag', () => {
			const now = vi.spyOn(performance, 'now');
			// pointerdown, then six moves.
			now.mockReturnValueOnce(0)
				.mockReturnValueOnce(100)
				.mockReturnValueOnce(200)
				.mockReturnValueOnce(300)
				.mockReturnValueOnce(400)
				.mockReturnValueOnce(500)
				.mockReturnValueOnce(600);

			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 1, onSnap });

			firePointer(node, 'pointerdown', { clientY: 0 });
			// A huge first jump, then near-stationary movement.
			for (const y of [1000, 1010, 1020, 1030, 1040, 1050]) {
				firePointer(node, 'pointermove', { clientY: y });
			}
			firePointer(node, 'pointerup', { clientY: 1050 });

			// Retained window spans ~40px over 0.4s = ~100px/s, under the 500
			// threshold, so the snap is decided by position, not velocity.
			// Position: 0.5 - 1.05 is far below the smallest detent => index 0.
			expect(onSnap.mock.calls[0]![0]).toBe(0);
		});

		// The pointerdown itself seeds the window. Without that seed the first
		// move has nothing to measure against and the flick is misread.
		it('counts the pointerdown position as the first sample', () => {
			vi.spyOn(performance, 'now')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(100)
				.mockReturnValueOnce(110);

			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 1, onSnap });

			firePointer(node, 'pointerdown', { clientY: 900 });
			firePointer(node, 'pointermove', { clientY: 100 });
			firePointer(node, 'pointermove', { clientY: 150 });
			firePointer(node, 'pointerup', { clientY: 150 });

			// Seeded window spans 900 -> 150 over 0.11s: a fast upward flick,
			// so the sheet grows one detent. Dropping the seed would measure
			// 100 -> 150 instead, a fast *downward* flick, and shrink it.
			expect(onSnap.mock.calls[0]![0]).toBe(2);
		});

		it('uses the sample values, not placeholders', () => {
			vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(50);

			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 0, onSnap });

			firePointer(node, 'pointerdown', { clientY: 900 });
			firePointer(node, 'pointermove', { clientY: 800 });
			firePointer(node, 'pointerup', { clientY: 800 });

			// -100px over 0.05s = -2000px/s, comfortably past the threshold.
			expect(onSnap.mock.calls[0]![0]).toBe(1);
		});

		it('reports zero velocity when no time passes between samples', () => {
			const now = vi.spyOn(performance, 'now').mockReturnValue(1234);
			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 1, onSnap });

			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 100 });
			firePointer(node, 'pointerup', { clientY: 100 });

			// Zero velocity forces the position path: 0.5 + 0.4 = 0.9 => index 2.
			expect(onSnap.mock.calls[0]![0]).toBe(2);
			now.mockRestore();
		});
	});

	describe('pointercancel', () => {
		it('returns to the current detent', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 300 });
			firePointer(node, 'pointercancel', {});
			expect(sheetY(target)).toBeCloseTo(50, 5);
		});

		it('animates back rather than snapping instantly', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 300 });
			firePointer(node, 'pointercancel', {});
			expect(target.style.transition).toBe('transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)');
		});

		it('does not fire onSnap, because nothing was chosen', () => {
			const onSnap = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 1, onSnap });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointercancel', {});
			expect(onSnap).not.toHaveBeenCalled();
		});

		it('ignores a cancel that was never preceded by a down', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			target.style.transition = 'sentinel';
			firePointer(node, 'pointercancel', {});
			expect(target.style.transition).toBe('sentinel');
		});

		it('ignores a cancel from a different pointer', () => {
			dragSnap(node, { detents: DETENTS, target, initial: 1 });
			firePointer(node, 'pointerdown', { clientY: 500, pointerId: 1 });
			target.style.transition = 'sentinel';
			firePointer(node, 'pointercancel', { pointerId: 2 });
			expect(target.style.transition).toBe('sentinel');
		});

		it('ends the drag so later moves are ignored', () => {
			const onDrag = vi.fn();
			dragSnap(node, { detents: DETENTS, target, initial: 1, onDrag });
			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointercancel', {});
			onDrag.mockClear();
			firePointer(node, 'pointermove', { clientY: 100 });
			expect(onDrag).not.toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('repositions to the new initial detent', () => {
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0 });
			handle.update({ detents: DETENTS, target, initial: 2 });
			expect(sheetY(target)).toBeCloseTo(10, 5);
		});

		it('animates to the new position rather than jumping', () => {
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0 });
			target.style.transition = 'none';
			handle.update({ detents: DETENTS, target, initial: 2 });
			expect(target.style.transition).toBe('transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)');
		});

		it('keeps the current index when the new options omit initial', () => {
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 2 });
			handle.update({ detents: DETENTS, target });
			expect(sheetY(target)).toBeCloseTo(10, 5);
		});

		it('clamps the index against a shorter detent list', () => {
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 2 });
			handle.update({ detents: [0.4], target });
			expect(sheetY(target)).toBeCloseTo(60, 5);
		});

		it('replaces options rather than merging them', () => {
			const onDrag = vi.fn();
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0, disabled: true });
			handle.update({ detents: DETENTS, target, initial: 0, onDrag });

			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });

			expect(onDrag).toHaveBeenCalled();
		});
	});

	describe('destroy', () => {
		it('stops responding to every pointer event', () => {
			const onDrag = vi.fn();
			const onSnap = vi.fn();
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0, onDrag, onSnap });
			handle.destroy();

			firePointer(node, 'pointerdown', { clientY: 500 });
			firePointer(node, 'pointermove', { clientY: 400 });
			firePointer(node, 'pointerup', { clientY: 400 });
			firePointer(node, 'pointercancel', {});

			expect(onDrag).not.toHaveBeenCalled();
			expect(onSnap).not.toHaveBeenCalled();
		});

		it('detaches the cancel listener specifically', () => {
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 1 });
			firePointer(node, 'pointerdown', { clientY: 500 });
			handle.destroy();
			target.style.transition = 'sentinel';
			firePointer(node, 'pointercancel', {});
			expect(target.style.transition).toBe('sentinel');
		});

		it('is safe to call twice', () => {
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0 });
			handle.destroy();
			expect(() => handle.destroy()).not.toThrow();
		});

		// Removing a listener registered under a different name silently leaks
		// it, so assert the exact event names rather than just the net effect.
		it('detaches every pointer event it attached, by name', () => {
			const spy = vi.spyOn(node, 'removeEventListener');
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0 });

			handle.destroy();

			expect(spy.mock.calls.map(([type]) => type)).toEqual([
				'pointerdown',
				'pointermove',
				'pointerup',
				'pointercancel'
			]);
			spy.mockRestore();
		});

		it('detaches the very handlers it attached', () => {
			const added = vi.spyOn(node, 'addEventListener');
			const handle = dragSnap(node, { detents: DETENTS, target, initial: 0 });
			const attached = new Map(added.mock.calls.map(([type, fn]) => [type, fn]));

			const removed = vi.spyOn(node, 'removeEventListener');
			handle.destroy();

			for (const [type, fn] of removed.mock.calls) {
				expect(attached.get(type as string)).toBe(fn);
			}
			added.mockRestore();
			removed.mockRestore();
		});
	});
});
