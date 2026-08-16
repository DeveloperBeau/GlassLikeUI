import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { scrollEdge } from '../../src/lib/actions/scrollEdge';

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	return el;
}

/**
 * Round-trip the intended CSS through the same style engine the assertions read
 * from. The engine normalises gradients (jsdom drops the default `to bottom`),
 * so comparing raw source strings would fail for reasons unrelated to the action.
 */
function asCss(value: string): string {
	const probe = document.createElement('div');
	probe.style.maskImage = value;
	return probe.style.maskImage;
}

/** The exact masks the action is specified to produce. */
const topMask = (size: string) =>
	asCss(`linear-gradient(to bottom, transparent 0, black ${size})`);
const bottomMask = (size: string) =>
	asCss(`linear-gradient(to top, transparent 0, black ${size})`);
const bothMask = (size: string) =>
	asCss(
		`linear-gradient(to bottom, transparent 0, black ${size}, black 85%, transparent 100%)`
	);

describe('scrollEdge action', () => {
	let node: HTMLElement;

	beforeEach(() => {
		node = makeNode();
	});

	describe('lifecycle', () => {
		it('returns update + destroy hooks', () => {
			const handle = scrollEdge(node, { edges: 'bottom', effect: 'soft' });
			expect(typeof handle.update).toBe('function');
			expect(typeof handle.destroy).toBe('function');
			handle.destroy();
		});

		it('applies the mask immediately, before any update', () => {
			scrollEdge(node, { edges: 'top' });
			expect(node.style.maskImage).toBe(topMask('32px'));
		});

		it('works with no options at all', () => {
			scrollEdge(node);
			expect(node.style.maskImage).toBe(bottomMask('32px'));
		});
	});

	describe('edge selection', () => {
		// Exact strings, not toContain: `to bottom` vs `to top` is the whole
		// difference between the top and bottom masks.
		it('masks the top edge with a downward gradient', () => {
			scrollEdge(node, { edges: 'top' });
			expect(node.style.maskImage).toBe(topMask('32px'));
		});

		it('masks the bottom edge with an upward gradient', () => {
			scrollEdge(node, { edges: 'bottom' });
			expect(node.style.maskImage).toBe(bottomMask('32px'));
		});

		it('masks both edges with a mirrored gradient', () => {
			scrollEdge(node, { edges: 'both' });
			expect(node.style.maskImage).toBe(bothMask('32px'));
		});

		it('defaults to the bottom edge when edges is omitted', () => {
			scrollEdge(node, { effect: 'soft' });
			expect(node.style.maskImage).toBe(bottomMask('32px'));
		});

		it('produces a different mask for each edge value', () => {
			const masks = (['top', 'bottom', 'both'] as const).map((edges) => {
				const el = makeNode();
				scrollEdge(el, { edges });
				return el.style.maskImage;
			});
			expect(new Set(masks).size).toBe(3);
		});

		it('clears the mask entirely when edges is none', () => {
			scrollEdge(node, { edges: 'none' });
			expect(node.style.maskImage).toBe('');
			expect(node.style.webkitMaskImage).toBe('');
		});

		it('clears a previously applied mask when switching to none', () => {
			const handle = scrollEdge(node, { edges: 'both' });
			expect(node.style.maskImage).not.toBe('');
			handle.update({ edges: 'none' });
			expect(node.style.maskImage).toBe('');
			expect(node.style.webkitMaskImage).toBe('');
		});
	});

	describe('effect and size', () => {
		it('uses a 32px fade for the soft effect', () => {
			scrollEdge(node, { edges: 'bottom', effect: 'soft' });
			expect(node.style.maskImage).toBe(bottomMask('32px'));
		});

		it('uses a 4px fade for the hard effect', () => {
			scrollEdge(node, { edges: 'bottom', effect: 'hard' });
			expect(node.style.maskImage).toBe(bottomMask('4px'));
		});

		it('defaults to the soft effect when effect is omitted', () => {
			scrollEdge(node, { edges: 'bottom' });
			expect(node.style.maskImage).toBe(bottomMask('32px'));
		});

		it('lets an explicit size override the soft default', () => {
			scrollEdge(node, { edges: 'bottom', size: '60px' });
			expect(node.style.maskImage).toBe(bottomMask('60px'));
		});

		it('lets an explicit size override the hard default', () => {
			scrollEdge(node, { edges: 'bottom', effect: 'hard', size: '2rem' });
			expect(node.style.maskImage).toBe(bottomMask('2rem'));
		});

		it('applies the size to the both-edges mask', () => {
			scrollEdge(node, { edges: 'both', size: '10px' });
			expect(node.style.maskImage).toBe(bothMask('10px'));
		});
	});

	describe('vendor prefix', () => {
		// Safari still needs -webkit-mask-image; setting only the standard
		// property would silently drop the effect there.
		it.each(['top', 'bottom', 'both'] as const)(
			'mirrors the %s mask onto the webkit property',
			(edges) => {
				scrollEdge(node, { edges });
				expect(node.style.webkitMaskImage).toBe(node.style.maskImage);
				expect(node.style.webkitMaskImage).not.toBe('');
			}
		);
	});

	describe('update', () => {
		it('re-applies with the new options', () => {
			const handle = scrollEdge(node, { edges: 'bottom' });
			handle.update({ edges: 'top', effect: 'hard' });
			expect(node.style.maskImage).toBe(topMask('4px'));
		});

		// update replaces rather than merges, so a previously set option must
		// revert to its default instead of persisting.
		it('replaces options rather than merging them', () => {
			const handle = scrollEdge(node, { edges: 'top', effect: 'hard', size: '9px' });
			handle.update({});
			expect(node.style.maskImage).toBe(bottomMask('32px'));
		});

		it('updates the webkit property too', () => {
			const handle = scrollEdge(node, { edges: 'bottom' });
			handle.update({ edges: 'top' });
			expect(node.style.webkitMaskImage).toBe(topMask('32px'));
		});
	});

	describe('destroy', () => {
		it('removes both mask properties', () => {
			const handle = scrollEdge(node, { edges: 'both' });
			handle.destroy();
			expect(node.style.maskImage).toBe('');
			expect(node.style.webkitMaskImage).toBe('');
		});

		it('is safe to call when the mask was already cleared', () => {
			const handle = scrollEdge(node, { edges: 'none' });
			expect(() => handle.destroy()).not.toThrow();
			expect(node.style.maskImage).toBe('');
		});
	});

	describe('fuzz', () => {
		const edges = fc.constantFrom('top', 'bottom', 'both', 'none' as const);
		const effect = fc.constantFrom('soft', 'hard' as const);
		const size = fc.constantFrom('1px', '32px', '2rem', '5%', '0px');

		// FALSE NEGATIVE validation: every non-none configuration must produce a
		// mask, and it must always embed the resolved size.
		it('always produces a gradient containing the resolved size', () => {
			fc.assert(
				fc.property(
					fc.constantFrom('top', 'bottom', 'both' as const),
					effect,
					fc.option(size, { nil: undefined }),
					(e, eff, s) => {
						const el = makeNode();
						scrollEdge(el, { edges: e, effect: eff, size: s });
						const expected = s ?? (eff === 'hard' ? '4px' : '32px');
						expect(el.style.maskImage).toContain(`black ${expected}`);
						expect(el.style.maskImage.startsWith('linear-gradient(')).toBe(true);
					}
				),
				{ numRuns: 300 }
			);
		});

		// FALSE POSITIVE validation: `none` must never leave a mask behind,
		// whatever else is configured.
		it('never leaves a mask when edges is none', () => {
			fc.assert(
				fc.property(effect, fc.option(size, { nil: undefined }), (eff, s) => {
					const el = makeNode();
					scrollEdge(el, { edges: 'none', effect: eff, size: s });
					expect(el.style.maskImage).toBe('');
					expect(el.style.webkitMaskImage).toBe('');
				}),
				{ numRuns: 200 }
			);
		});

		it('always leaves the standard and webkit properties in agreement', () => {
			fc.assert(
				fc.property(edges, effect, fc.option(size, { nil: undefined }), (e, eff, s) => {
					const el = makeNode();
					const handle = scrollEdge(el, { edges: e, effect: eff, size: s });
					expect(el.style.webkitMaskImage).toBe(el.style.maskImage);
					handle.destroy();
					expect(el.style.maskImage).toBe('');
					expect(el.style.webkitMaskImage).toBe('');
				}),
				{ numRuns: 300 }
			);
		});

		it('is idempotent across repeated updates with the same options', () => {
			fc.assert(
				fc.property(edges, effect, (e, eff) => {
					const el = makeNode();
					const handle = scrollEdge(el, { edges: e, effect: eff });
					const first = el.style.maskImage;
					handle.update({ edges: e, effect: eff });
					expect(el.style.maskImage).toBe(first);
				}),
				{ numRuns: 200 }
			);
		});
	});
});
