import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlassMorphWrapper from '../wrappers/GlassMorphWrapper.svelte';

describe('GlassMorph', () => {
	describe('Rendering', () => {
		it('renders wrapper with glass-morph class', () => {
			const { container } = render(GlassMorphWrapper);
			expect(container.querySelector('.glass-morph')).toBeInTheDocument();
		});

		it('renders slotted content', () => {
			const { container } = render(GlassMorphWrapper, {
				props: { content: 'Shared element' }
			});
			expect(container.textContent).toContain('Shared element');
		});
	});

	describe('view-transition-name', () => {
		it('writes view-transition-name derived from id', () => {
			const { container } = render(GlassMorphWrapper, { props: { id: 'hero' } });
			const el = container.querySelector('.glass-morph') as HTMLElement;
			expect(el.getAttribute('style')).toContain('view-transition-name: glass-hero');
		});

		it('encodes a different id uniquely', () => {
			const { container } = render(GlassMorphWrapper, { props: { id: 'card-42' } });
			const el = container.querySelector('.glass-morph') as HTMLElement;
			expect(el.getAttribute('style')).toContain('view-transition-name: glass-card-42');
		});
	});

	describe('Tag variants', () => {
		it('defaults to div element', () => {
			const { container } = render(GlassMorphWrapper);
			expect(container.querySelector('div.glass-morph')).toBeInTheDocument();
		});

		it('renders as span when tag=span', () => {
			const { container } = render(GlassMorphWrapper, { props: { tag: 'span' } });
			expect(container.querySelector('span.glass-morph')).toBeInTheDocument();
		});

		it('renders as section when tag=section', () => {
			const { container } = render(GlassMorphWrapper, { props: { tag: 'section' } });
			expect(container.querySelector('section.glass-morph')).toBeInTheDocument();
		});
	});

	describe('Custom class', () => {
		it('appends custom class', () => {
			const { container } = render(GlassMorphWrapper, {
				props: { class: 'hero-wrap' }
			});
			expect(container.querySelector('.glass-morph')).toHaveClass('hero-wrap');
		});
	});
});
