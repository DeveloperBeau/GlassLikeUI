import { describe, it, expect, beforeEach } from 'vitest';
import { scrollEdge } from '../../src/lib/actions/scrollEdge';

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	return el;
}

describe('scrollEdge action', () => {
	let node: HTMLElement;

	beforeEach(() => {
		node = makeNode();
	});

	it('returns update + destroy hooks', () => {
		const handle = scrollEdge(node, { edges: 'bottom', effect: 'soft' });
		expect(typeof handle.update).toBe('function');
		expect(typeof handle.destroy).toBe('function');
		handle.destroy();
	});

	it('applies a linear-gradient mask-image for bottom edge', () => {
		const handle = scrollEdge(node, { edges: 'bottom', effect: 'soft' });
		expect(node.style.maskImage).toContain('linear-gradient');
		handle.destroy();
	});

	it('applies a non-empty mask for top edge', () => {
		const handle = scrollEdge(node, { edges: 'top', effect: 'soft' });
		expect(node.style.maskImage).not.toBe('');
		expect(node.style.maskImage).toContain('transparent');
		handle.destroy();
	});

	it('uses default soft size of 32px', () => {
		const handle = scrollEdge(node, { edges: 'bottom' });
		expect(node.style.maskImage).toContain('32px');
		handle.destroy();
	});

	it('uses hard-edge size of 4px', () => {
		const handle = scrollEdge(node, { edges: 'bottom', effect: 'hard' });
		expect(node.style.maskImage).toContain('4px');
		handle.destroy();
	});

	it('applies a non-empty gradient for both edges', () => {
		const handle = scrollEdge(node, { edges: 'both', effect: 'soft' });
		const mask = node.style.maskImage;
		expect(mask).not.toBe('');
		expect(mask).toContain('transparent');
		expect(mask).toContain('black');
		handle.destroy();
	});

	it('clears mask when edges=none', () => {
		const handle = scrollEdge(node, { edges: 'none' });
		expect(node.style.maskImage).toBe('');
		handle.destroy();
	});

	it('accepts custom size override', () => {
		const handle = scrollEdge(node, { edges: 'bottom', size: '60px' });
		expect(node.style.maskImage).toContain('60px');
		handle.destroy();
	});

	it('update() re-applies with new options', () => {
		const handle = scrollEdge(node, { edges: 'bottom' });
		expect(node.style.maskImage).toContain('32px');
		handle.update({ edges: 'top', effect: 'hard' });
		expect(node.style.maskImage).toContain('4px');
		handle.destroy();
	});

	it('destroy() removes the mask', () => {
		const handle = scrollEdge(node, { edges: 'bottom' });
		handle.destroy();
		expect(node.style.maskImage).toBe('');
	});
});
