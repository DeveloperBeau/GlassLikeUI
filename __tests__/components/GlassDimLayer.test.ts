import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlassDimLayer from '../../src/lib/components/glass/GlassDimLayer.svelte';

describe('GlassDimLayer', () => {
	it('renders a dim-layer div', () => {
		const { container } = render(GlassDimLayer);
		expect(container.querySelector('.glass-dim-layer')).toBeInTheDocument();
	});

	it('is marked aria-hidden', () => {
		const { container } = render(GlassDimLayer);
		expect(container.querySelector('.glass-dim-layer')).toHaveAttribute('aria-hidden', 'true');
	});

	it('uses gradient by default (no solid class)', () => {
		const { container } = render(GlassDimLayer);
		expect(container.querySelector('.glass-dim-layer')).not.toHaveClass('solid');
	});

	it('applies solid class when gradient=false', () => {
		const { container } = render(GlassDimLayer, { props: { gradient: false } });
		expect(container.querySelector('.glass-dim-layer')).toHaveClass('solid');
	});

	it('writes custom opacity into inline style', () => {
		const { container } = render(GlassDimLayer, { props: { opacity: 0.6 } });
		const el = container.querySelector('.glass-dim-layer') as HTMLElement;
		expect(el.getAttribute('style')).toContain('--dim-opacity: 0.6');
	});

	it('accepts custom class', () => {
		const { container } = render(GlassDimLayer, { props: { class: 'my-dim' } });
		expect(container.querySelector('.glass-dim-layer')).toHaveClass('my-dim');
	});
});
