/**
 * View Transitions helper for glass morph.
 *
 * Wraps a DOM-updating callback in `document.startViewTransition` when the
 * browser supports it, so any elements marked with a matching
 * `view-transition-name` animate between their old and new positions.
 *
 * Falls through to invoking the callback directly when the API is
 * unavailable (SSR, older browsers, or Firefox behind a flag).
 */

type ViewTransitionLike = {
	finished: Promise<void>;
	ready: Promise<void>;
	updateCallbackDone: Promise<void>;
	skipTransition: () => void;
};

type DocumentWithTransition = Document & {
	startViewTransition?: (callback: () => void | Promise<void>) => ViewTransitionLike;
};

export interface GlassTransitionResult {
	supported: boolean;
	transition?: ViewTransitionLike;
}

export function withGlassTransition(
	callback: () => void | Promise<void>
): GlassTransitionResult | Promise<GlassTransitionResult> {
	if (typeof document === 'undefined') {
		const result = callback();
		if (result instanceof Promise) {
			return result.then(() => ({ supported: false }));
		}
		return { supported: false };
	}

	const doc = document as DocumentWithTransition;
	if (typeof doc.startViewTransition !== 'function') {
		const result = callback();
		if (result instanceof Promise) {
			return result.then(() => ({ supported: false }));
		}
		return { supported: false };
	}

	const transition = doc.startViewTransition(callback);
	return { supported: true, transition };
}

export function isViewTransitionsSupported(): boolean {
	if (typeof document === 'undefined') return false;
	return typeof (document as DocumentWithTransition).startViewTransition === 'function';
}
