/**
 * Svelte action: swipe a row aside to reveal actions, mirroring SwiftUI's
 * `.swipeActions(edge:allowsFullSwipe:)`.
 *
 * The node is translated by the `--swipe-x` custom property and tagged with
 * `data-swipe-state`; the action strip itself is the caller's markup.
 *
 * Usage:
 *   <div use:swipeActions={{
 *     edge: 'trailing',
 *     actionsWidth: 160,
 *     allowsFullSwipe: true,
 *     onFullSwipe: () => remove(item)
 *   }}>...</div>
 */

// The velocity helpers are axis-agnostic -- `y` is simply "position along the
// drag axis", so the x-axis gesture reuses them rather than cloning them.
import { computeVelocity, pushSample, type PointerSample } from './dragSnap';

export type SwipeEdge = 'leading' | 'trailing';
export type SwipeState = 'closed' | 'open' | 'fullSwipe';

export interface SwipeGeometry {
	edge: SwipeEdge;
	/** Total width of the revealed action strip, in px. */
	actionsWidth: number;
	/** Width of the row. 0 means "not measured yet". */
	rowWidth: number;
	allowsFullSwipe: boolean;
}

export interface SwipeActionsOptions {
	edge?: SwipeEdge | undefined;
	/** Explicit strip width. Omit to measure `actionsElement` at gesture start. */
	actionsWidth?: number | undefined;
	/** The action strip. Measured lazily, so it needs no layout on first paint. */
	actionsElement?: HTMLElement | null | undefined;
	/** Overrides the measured row width; needed where layout is unavailable. */
	rowWidth?: number | undefined;
	allowsFullSwipe?: boolean | undefined;
	disabled?: boolean | undefined;
	onStateChange?: ((state: SwipeState) => void) | undefined;
	onFullSwipe?: (() => void) | undefined;
}

/** Fraction of the row that must be crossed to arm a full swipe. */
export const DEFAULT_FULL_SWIPE_THRESHOLD = 0.5;
/** How much of an overshoot past the limit is tracked. */
export const DEFAULT_SWIPE_RUBBER_BAND = 0.35;
/** px/s past which a release counts as a flick. */
export const DEFAULT_SWIPE_VELOCITY = 500;
/** px of travel before the gesture is claimed from the scroller. */
export const SWIPE_SLOP = 4;

/** Direction the content travels to reveal this edge's actions. */
export function edgeSign(edge: SwipeEdge): number {
	// Unknown edges fall back to trailing, matching SwiftUI's default.
	return edge === 'leading' ? 1 : -1;
}

/**
 * Constrain a raw pointer delta to the row's travel: one-to-one up to the
 * limit, damped beyond it, and zero against the configured edge.
 */
export function clampSwipeOffset(rawDx: number, geo: SwipeGeometry): number {
	if (!Number.isFinite(rawDx)) return 0;

	const sign = edgeSign(geo.edge);
	const magnitude = rawDx * sign;
	// Negative magnitude means the drag opposes this edge.
	if (magnitude <= 0) return 0;
	if (geo.actionsWidth <= 0) return 0;

	// A full swipe may travel the whole row; otherwise the strip is the limit.
	// rowWidth 0 means unmeasured, so it cannot raise the limit.
	const limit =
		geo.allowsFullSwipe && geo.rowWidth > 0
			? Math.max(geo.actionsWidth, geo.rowWidth)
			: geo.actionsWidth;

	const travel =
		magnitude <= limit ? magnitude : limit + (magnitude - limit) * DEFAULT_SWIPE_RUBBER_BAND;

	return travel * sign;
}

/** Where the row settles once the pointer is released. */
export function resolveSwipeState(
	offset: number,
	velocity: number,
	geo: SwipeGeometry
): SwipeState {
	if (geo.actionsWidth <= 0) return 'closed';

	const sign = edgeSign(geo.edge);
	const magnitude = offset * sign;
	if (magnitude <= 0) return 'closed';

	const flick = Number.isFinite(velocity) && Math.abs(velocity) > DEFAULT_SWIPE_VELOCITY;
	const flickingOpen = flick && Math.sign(velocity) === sign;

	// A flick back cancels a pending full swipe: dragging past the trigger and
	// pulling away is a cancel, not a confirmation.
	if (
		geo.allowsFullSwipe &&
		geo.rowWidth > 0 &&
		!(flick && !flickingOpen) &&
		magnitude >= geo.rowWidth * DEFAULT_FULL_SWIPE_THRESHOLD
	) {
		return 'fullSwipe';
	}

	if (flick) return flickingOpen ? 'open' : 'closed';

	return magnitude >= geo.actionsWidth / 2 ? 'open' : 'closed';
}

/** The resting offset for a settled state. */
export function offsetForState(state: SwipeState, geo: SwipeGeometry): number {
	const sign = edgeSign(geo.edge);
	if (state === 'open') return geo.actionsWidth * sign;
	if (state === 'fullSwipe') return geo.rowWidth * sign;
	return 0;
}

function measureWidth(el: HTMLElement | null | undefined): number {
	return el ? el.getBoundingClientRect().width : 0;
}

export function swipeActions(node: HTMLElement, initialOptions: SwipeActionsOptions) {
	let options = { ...initialOptions };
	let state: SwipeState = 'closed';

	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let claimed = false;
	let abandoned = false;
	let samples: PointerSample[] = [];

	function geometry(): SwipeGeometry {
		return {
			edge: options.edge ?? 'trailing',
			actionsWidth: options.actionsWidth ?? measureWidth(options.actionsElement),
			rowWidth: options.rowWidth ?? node.getBoundingClientRect().width,
			allowsFullSwipe: options.allowsFullSwipe ?? false
		};
	}

	function applyOffset(offset: number) {
		node.style.setProperty('--swipe-x', `${offset}px`);
	}

	function settle(next: SwipeState) {
		state = next;
		node.setAttribute('data-swipe-state', next);
		applyOffset(offsetForState(next, geometry()));
	}

	function onPointerDown(event: PointerEvent) {
		if (options.disabled) return;
		if (event.button !== undefined && event.button !== 0) return;

		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		claimed = false;
		abandoned = false;
		samples = [{ y: event.clientX, t: performance.now() }];
	}

	function onPointerMove(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId || abandoned) return;

		const dx = event.clientX - startX;
		const dy = event.clientY - startY;

		if (!claimed) {
			// Let a vertical drag belong to the scroller.
			if (Math.abs(dy) > Math.abs(dx)) {
				abandoned = true;
				return;
			}
			if (Math.abs(dx) < SWIPE_SLOP) return;
			claimed = true;
		}

		const resting = offsetForState(state, geometry());
		applyOffset(clampSwipeOffset(resting + dx, geometry()));
		samples = pushSample(samples, { y: event.clientX, t: performance.now() });
		if (event.cancelable) event.preventDefault();
	}

	function onPointerUp(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;
		const wasClaimed = claimed;
		pointerId = null;
		claimed = false;
		if (!wasClaimed || abandoned) return;

		const geo = geometry();
		const offset = clampSwipeOffset(offsetForState(state, geo) + (event.clientX - startX), geo);
		const next = resolveSwipeState(offset, computeVelocity(samples), geo);

		settle(next);
		options.onStateChange?.(next);
		if (next === 'fullSwipe') options.onFullSwipe?.();
	}

	function onPointerCancel(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;
		pointerId = null;
		claimed = false;
		settle(state);
	}

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerCancel);

	settle('closed');

	return {
		update(newOptions: SwipeActionsOptions) {
			options = { ...newOptions };
			settle(state);
		},
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerCancel);
			node.style.removeProperty('--swipe-x');
			node.removeAttribute('data-swipe-state');
		}
	};
}
