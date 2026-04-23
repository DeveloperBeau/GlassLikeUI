import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LensFilters from '../../src/lib/components/glass/LensFilters.svelte';

describe('LensFilters', () => {
	it('renders an SVG with the lens-defs class', () => {
		const { container } = render(LensFilters);
		expect(container.querySelector('svg.glass-lens-defs')).toBeInTheDocument();
	});

	it('provides the refraction filter def', () => {
		const { container } = render(LensFilters);
		expect(container.querySelector('filter#glass-lens-refract')).toBeInTheDocument();
	});

	it('filter includes a displacement map', () => {
		const { container } = render(LensFilters);
		expect(container.querySelector('filter#glass-lens-refract feDisplacementMap')).toBeInTheDocument();
	});

	it('filter includes turbulence noise source', () => {
		const { container } = render(LensFilters);
		expect(container.querySelector('filter#glass-lens-refract feTurbulence')).toBeInTheDocument();
	});

	it('provides the squircle clip path', () => {
		const { container } = render(LensFilters);
		expect(container.querySelector('clipPath#glass-squircle-path')).toBeInTheDocument();
	});

	it('squircle clipPath uses objectBoundingBox units', () => {
		const { container } = render(LensFilters);
		const clip = container.querySelector('clipPath#glass-squircle-path');
		expect(clip?.getAttribute('clipPathUnits')).toBe('objectBoundingBox');
	});

	it('is marked aria-hidden', () => {
		const { container } = render(LensFilters);
		expect(container.querySelector('svg.glass-lens-defs')).toHaveAttribute('aria-hidden', 'true');
	});
});
