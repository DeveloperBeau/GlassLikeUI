/**
 * Svelte action: drag-to-snap gesture.
 *
 * Attaches pointer handlers to a handle element and drags a target surface
 * between a set of named detent positions. Velocity-based snap on release,
 * rubber-band feel when dragged past bounds.
 *
 * Usage:
 *   <div use:dragSnap={{
 *     target: sheetEl,
 *     detents: [0.25, 0.5, 0.9],
 *     initial: 1,
 *     onSnap: (i) => currentDetent = i
 *   }}>...</div>
 */

export interface DragSnapOptions {
	/** Element whose transform is manipulated. If omitted, uses the node itself. */
	target?: HTMLElement | null;
	/** Detent positions as viewport-height fractions (0..1). Higher = taller sheet. */
	detents: number[];
	/** Initial detent index. */
	initial?: number;
	/** Called when drag snaps to a detent. */
	onSnap?: (index: number, fraction: number) => void;
	/** Called each animation frame during drag. */
	onDrag?: (offsetY: number, currentFraction: number) => void;
	/** Rubber-band coefficient when past max detent. Default 0.3. */
	rubberBand?: number;
	/** px/s threshold for velocity-based snap. Default 500. */
	velocityThreshold?: number;
	/** Skip drag when target is a scrollable container whose scrollTop > 0. Default true. */
	respectScroll?: boolean;
	/** Disable the gesture. */
	disabled?: boolean;
}

interface PointerSample {
	y: number;
	t: number;
}

export function dragSnap(node: HTMLElement, initialOptions: DragSnapOptions) {
	let options = { ...initialOptions };
	let currentIndex = clampIndex(options.initial ?? 0, options.detents.length);

	let dragging = false;
	let pointerId: number | null = null;
	let startY = 0;
	let startFraction = detentAt(options.detents, currentIndex);
	let samples: PointerSample[] = [];

	const target = () => options.target ?? node;

	function applyFraction(fraction: number, animate = false) {
		const el = target();
		if (!el) return;
		el.style.transition = animate
			? 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
			: 'none';
		const offset = (1 - fraction) * 100;
		el.style.setProperty('--sheet-y', `${offset}vh`);
	}

	function onPointerDown(event: PointerEvent) {
		if (options.disabled) return;
		if (event.button !== undefined && event.button !== 0) return;

		if (options.respectScroll !== false) {
			const scrollable = findScrollableAncestor(event.target as Element | null, node);
			if (scrollable && scrollable.scrollTop > 0) return;
		}

		dragging = true;
		pointerId = event.pointerId;
		startY = event.clientY;
		startFraction = detentAt(options.detents, currentIndex);
		samples = [{ y: event.clientY, t: performance.now() }];

		try {
			node.setPointerCapture(event.pointerId);
		} catch {
			/* jsdom / test env may not support */
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;

		const viewportH = window.innerHeight || 1;
		const deltaY = event.clientY - startY;
		const fractionDelta = -deltaY / viewportH;

		let newFraction = startFraction + fractionDelta;

		const maxDetent = Math.max(...options.detents);
		const minDetent = Math.min(...options.detents);
		const rubber = options.rubberBand ?? 0.3;

		if (newFraction > maxDetent) {
			const excess = newFraction - maxDetent;
			newFraction = maxDetent + excess * rubber;
		} else if (newFraction < minDetent) {
			const deficit = minDetent - newFraction;
			newFraction = minDetent - deficit * rubber;
		}

		applyFraction(newFraction, false);
		samples.push({ y: event.clientY, t: performance.now() });
		if (samples.length > 5) samples.shift();
		options.onDrag?.(deltaY, newFraction);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		dragging = false;
		pointerId = null;

		const velocity = computeVelocity(samples);
		const threshold = options.velocityThreshold ?? 500;

		let nextIndex = currentIndex;
		if (Math.abs(velocity) > threshold) {
			if (velocity < 0) {
				nextIndex = Math.min(currentIndex + 1, options.detents.length - 1);
			} else {
				nextIndex = Math.max(currentIndex - 1, 0);
			}
		} else {
			const viewportH = window.innerHeight || 1;
			const deltaY = event.clientY - startY;
			const fractionDelta = -deltaY / viewportH;
			const finalFraction = startFraction + fractionDelta;
			nextIndex = nearestDetentIndex(finalFraction, options.detents);
		}

		currentIndex = nextIndex;
		const snappedFraction = detentAt(options.detents, currentIndex);
		applyFraction(snappedFraction, true);
		options.onSnap?.(currentIndex, snappedFraction);

		try {
			node.releasePointerCapture(event.pointerId);
		} catch {
			/* noop */
		}
	}

	function onPointerCancel(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		dragging = false;
		pointerId = null;
		applyFraction(detentAt(options.detents, currentIndex), true);
	}

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerCancel);

	// Start at closed (100vh offset) then animate into the initial detent
	// on the next frame so the sheet's entry reads as a spring.
	const el = target();
	if (el) {
		el.style.transition = 'none';
		el.style.setProperty('--sheet-y', '100vh');
		const raf =
			typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb: () => void) => cb();
		raf(() => applyFraction(detentAt(options.detents, currentIndex), true));
	}

	return {
		update(newOptions: DragSnapOptions) {
			options = { ...newOptions };
			currentIndex = clampIndex(options.initial ?? currentIndex, options.detents.length);
			applyFraction(detentAt(options.detents, currentIndex), true);
		},
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerCancel);
		}
	};
}

function clampIndex(i: number, len: number): number {
	if (len === 0) return 0;
	return Math.max(0, Math.min(i, len - 1));
}

function detentAt(detents: number[], index: number): number {
	return detents[index] ?? detents[0] ?? 0;
}

function nearestDetentIndex(fraction: number, detents: number[]): number {
	let bestIndex = 0;
	let bestDistance = Infinity;
	for (let i = 0; i < detents.length; i++) {
		const value = detents[i];
		if (value === undefined) continue;
		const d = Math.abs(value - fraction);
		if (d < bestDistance) {
			bestDistance = d;
			bestIndex = i;
		}
	}
	return bestIndex;
}

function computeVelocity(samples: PointerSample[]): number {
	if (samples.length < 2) return 0;
	const first = samples[0];
	const last = samples[samples.length - 1];
	if (!first || !last) return 0;
	const dt = (last.t - first.t) / 1000;
	if (dt <= 0) return 0;
	return (last.y - first.y) / dt;
}

function findScrollableAncestor(el: Element | null, stopAt: Element): HTMLElement | null {
	let node: Element | null = el;
	while (node && node !== stopAt) {
		if (node instanceof HTMLElement) {
			const overflowY = getComputedStyle(node).overflowY;
			if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
				return node;
			}
		}
		node = node.parentElement;
	}
	return null;
}

export const DEFAULT_DETENT_FRACTIONS = {
	small: 0.25,
	medium: 0.5,
	large: 0.9,
	fullscreen: 1
} as const;

export type SheetDetentName = keyof typeof DEFAULT_DETENT_FRACTIONS;

export function detentFractions(names: readonly SheetDetentName[]): number[] {
	return names.map((n) => DEFAULT_DETENT_FRACTIONS[n]);
}
