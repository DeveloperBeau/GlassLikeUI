/**
 * Svelte action: fade the edges of a scrollable container where it meets
 * glass chrome (nav bar, tab bar). Uses mask-image with a linear gradient.
 *
 * Usage:
 *   <div use:scrollEdge={{ edges: 'both', effect: 'soft' }}>
 *     ... scrolling content ...
 *   </div>
 */

export type ScrollEdgeWhich = 'top' | 'bottom' | 'both' | 'none';
export type ScrollEdgeEffect = 'soft' | 'hard';

export interface ScrollEdgeOptions {
	edges?: ScrollEdgeWhich;
	effect?: ScrollEdgeEffect;
	/** Fade distance in CSS length (e.g., '32px', '2rem'). Default 32px soft / 4px hard. */
	size?: string;
}

export function scrollEdge(node: HTMLElement, initialOptions: ScrollEdgeOptions = {}) {
	let options = { ...initialOptions };

	function apply() {
		const edges = options.edges ?? 'bottom';
		const effect = options.effect ?? 'soft';
		const size = options.size ?? (effect === 'hard' ? '4px' : '32px');

		if (edges === 'none') {
			node.style.maskImage = '';
			node.style.webkitMaskImage = '';
			return;
		}

		const top = `linear-gradient(to bottom, transparent 0, black ${size})`;
		const bottom = `linear-gradient(to top, transparent 0, black ${size})`;
		// Use a percentage mirror rather than calc() so older mask engines
		// (and jsdom) parse correctly. Browsers supporting calc() in
		// gradients still render the intended fade.
		const both = `linear-gradient(to bottom, transparent 0, black ${size}, black 85%, transparent 100%)`;

		let mask: string;
		if (edges === 'top') mask = top;
		else if (edges === 'bottom') mask = bottom;
		else mask = both;

		node.style.maskImage = mask;
		node.style.webkitMaskImage = mask;
	}

	apply();

	return {
		update(newOptions: ScrollEdgeOptions) {
			options = { ...newOptions };
			apply();
		},
		destroy() {
			node.style.maskImage = '';
			node.style.webkitMaskImage = '';
		}
	};
}
