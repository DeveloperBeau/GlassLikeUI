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
	target?: HTMLElement | null | undefined;
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

export interface PointerSample {
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

	function applyFraction(fraction: number, animate: boolean) {
		// target() falls back to `node`, so there is always an element.
		const el = target();
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

		const newFraction = applyRubberBand(
			startFraction + fractionDelta,
			Math.min(...options.detents),
			Math.max(...options.detents),
			options.rubberBand ?? 0.3
		);

		applyFraction(newFraction, false);
		samples = pushSample(samples, { y: event.clientY, t: performance.now() });
		options.onDrag?.(deltaY, newFraction);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		dragging = false;
		pointerId = null;

		const viewportH = window.innerHeight || 1;
		const finalFraction = startFraction + -(event.clientY - startY) / viewportH;

		currentIndex = chooseNextIndex(
			currentIndex,
			computeVelocity(samples),
			options.velocityThreshold ?? 500,
			finalFraction,
			options.detents
		);
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
	el.style.transition = 'none';
	el.style.setProperty('--sheet-y', '100vh');
	const raf =
		typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb: () => void) => cb();
	raf(() => applyFraction(detentAt(options.detents, currentIndex), true));

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

/** Clamp a detent index into range; 0 when there are no detents. */
export function clampIndex(i: number, len: number): number {
	// An empty list yields 0: Math.min(i, -1) then Math.max(0, ...) collapses there.
	return Math.max(0, Math.min(i, len - 1));
}

/** The fraction at an index, falling back to the first detent then 0. */
export function detentAt(detents: number[], index: number): number {
	return detents[index] ?? detents[0] ?? 0;
}

/**
 * Rubber-band a fraction dragged beyond the detent range, so overshoot moves
 * at a reduced rate instead of tracking the pointer one-to-one.
 */
export function applyRubberBand(
	fraction: number,
	minDetent: number,
	maxDetent: number,
	rubber: number
): number {
	if (fraction > maxDetent) return maxDetent + (fraction - maxDetent) * rubber;
	if (fraction < minDetent) return minDetent - (minDetent - fraction) * rubber;
	return fraction;
}

/**
 * Pick the detent to settle on: a flick faster than the threshold moves one
 * step in its direction, otherwise snap to whichever detent is nearest.
 */
export function chooseNextIndex(
	currentIndex: number,
	velocity: number,
	threshold: number,
	finalFraction: number,
	detents: number[]
): number {
	if (Math.abs(velocity) > threshold) {
		// Clamp the step: a currentIndex outside the list would otherwise step to
		// an unindexable position (e.g. -1) rather than a real detent.
		const stepped = velocity < 0 ? currentIndex + 1 : currentIndex - 1;
		return clampIndex(stepped, detents.length);
	}
	return nearestDetentIndex(finalFraction, detents);
}

/** Index of the detent closest to `fraction`; ties resolve to the lower index. */
export function nearestDetentIndex(fraction: number, detents: number[]): number {
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

/** How many pointer samples the velocity window keeps. */
export const SAMPLE_WINDOW = 5;

/**
 * Append a sample, keeping at most SAMPLE_WINDOW of them. Velocity is measured
 * across this window so a release reflects the recent flick rather than the
 * whole gesture. Returns a new array; the input is not mutated.
 */
export function pushSample(
	samples: PointerSample[],
	sample: PointerSample,
	max = SAMPLE_WINDOW
): PointerSample[] {
	const next = [...samples, sample];
	return next.length > max ? next.slice(next.length - max) : next;
}

/** Average pointer velocity in px/s across the sample window; 0 if unknowable. */
export function computeVelocity(samples: PointerSample[]): number {
	if (samples.length < 2) return 0;
	const first = samples[0];
	const last = samples[samples.length - 1];
	if (!first || !last) return 0;
	const dt = (last.t - first.t) / 1000;
	if (dt <= 0) return 0;
	const velocity = (last.y - first.y) / dt;
	// A vanishingly small dt overflows the division to Infinity, which would
	// then clear every velocity threshold and force a flick snap.
	return Number.isFinite(velocity) ? velocity : 0;
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
