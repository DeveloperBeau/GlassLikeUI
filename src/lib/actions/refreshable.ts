/**
 * Svelte action: pull-to-refresh, mirroring SwiftUI's `.refreshable`.
 *
 * Drives `--refresh-pull` (px of travel) and `data-refresh-phase` on the node;
 * the indicator itself is the caller's markup.
 *
 * Usage:
 *   <div use:refreshable={{ onRefresh: async () => reload() }}>
 *     ... scrolling content ...
 *   </div>
 */

export type RefreshPhase = 'idle' | 'pulling' | 'ready' | 'refreshing';

export interface RefreshableOptions {
	/** Awaited if it returns a promise; the phase stays `refreshing` until it settles. */
	onRefresh: () => void | Promise<void>;
	/** Px of resisted travel needed to arm the refresh. */
	threshold?: number | undefined;
	/** Fraction of pointer travel the content follows. */
	resistance?: number | undefined;
	disabled?: boolean | undefined;
	onPhaseChange?: ((phase: RefreshPhase) => void) | undefined;
}

export const DEFAULT_REFRESH_THRESHOLD = 64;
export const DEFAULT_REFRESH_RESISTANCE = 0.5;
/** Furthest the content travels, however hard the user pulls. */
export const MAX_PULL_DISTANCE = 150;

/** Damped travel for a raw pointer delta. Upward drags do not pull. */
export function resistPull(rawDy: number, resistance = DEFAULT_REFRESH_RESISTANCE): number {
	// NaN is meaningless; an infinite drag simply hits the cap below.
	if (Number.isNaN(rawDy) || rawDy <= 0) return 0;
	// A zero or negative factor would freeze or invert the indicator.
	const factor =
		Number.isFinite(resistance) && resistance > 0 ? resistance : DEFAULT_REFRESH_RESISTANCE;
	return Math.min(rawDy * factor, MAX_PULL_DISTANCE);
}

/** Whether releasing at this distance should start a refresh. */
export function shouldTriggerRefresh(distance: number, threshold: number): boolean {
	if (!Number.isFinite(distance) || !Number.isFinite(threshold)) return false;
	if (threshold <= 0) return false;
	return distance >= threshold;
}

/** The phase to render. An in-flight refresh outranks the gesture. */
export function refreshPhase(
	distance: number,
	threshold: number,
	isRefreshing: boolean
): RefreshPhase {
	if (isRefreshing) return 'refreshing';
	if (shouldTriggerRefresh(distance, threshold)) return 'ready';
	if (Number.isFinite(distance) && distance > 0) return 'pulling';
	return 'idle';
}

export function refreshable(node: HTMLElement, initialOptions: RefreshableOptions) {
	let options = { ...initialOptions };
	let pointerId: number | null = null;
	let startY = 0;
	let distance = 0;
	let refreshing = false;
	let phase: RefreshPhase = 'idle';
	let destroyed = false;

	const threshold = () => options.threshold ?? DEFAULT_REFRESH_THRESHOLD;

	function render() {
		if (destroyed) return;
		node.style.setProperty('--refresh-pull', `${distance}px`);
		const next = refreshPhase(distance, threshold(), refreshing);
		node.setAttribute('data-refresh-phase', next);
		// Report transitions only; a pointermove stream would otherwise repeat.
		if (next !== phase) {
			phase = next;
			options.onPhaseChange?.(next);
		}
	}

	function reset() {
		distance = 0;
		refreshing = false;
		render();
	}

	function onPointerDown(event: PointerEvent) {
		if (options.disabled || refreshing) return;
		if (event.button !== undefined && event.button !== 0) return;
		// Pull-to-refresh belongs to the top of the scroller.
		if (node.scrollTop > 0) return;

		pointerId = event.pointerId;
		startY = event.clientY;
	}

	function onPointerMove(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId || refreshing) return;

		distance = resistPull(event.clientY - startY, options.resistance);
		render();
		if (distance > 0 && event.cancelable) event.preventDefault();
	}

	function onPointerUp(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;
		pointerId = null;
		if (refreshing) return;

		if (!shouldTriggerRefresh(distance, threshold())) {
			reset();
			return;
		}

		refreshing = true;
		distance = threshold();
		render();

		// Called synchronously so the request starts on release. Settled either
		// way -- a rejected or throwing refresh must not strand the indicator.
		try {
			const result = options.onRefresh();
			if (result && typeof result.then === 'function') {
				result.then(reset, reset);
			} else {
				reset();
			}
		} catch {
			reset();
		}
	}

	function onPointerCancel(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;
		pointerId = null;
		if (refreshing) return;
		reset();
	}

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerCancel);

	render();

	return {
		update(newOptions: RefreshableOptions) {
			options = { ...newOptions };
			render();
		},
		destroy() {
			destroyed = true;
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerCancel);
			node.style.removeProperty('--refresh-pull');
			node.removeAttribute('data-refresh-phase');
		}
	};
}
