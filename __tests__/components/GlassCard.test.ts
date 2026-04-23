import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlassCardWrapper from '../wrappers/GlassCardWrapper.svelte';
import GlassCardWithHeaderWrapper from '../wrappers/GlassCardWithHeaderWrapper.svelte';
import GlassCardWithFooterWrapper from '../wrappers/GlassCardWithFooterWrapper.svelte';
import GlassCardFullWrapper from '../wrappers/GlassCardFullWrapper.svelte';

describe('GlassCard', () => {
	describe('Rendering', () => {
		it('renders with glass-card class', () => {
			const { container } = render(GlassCardWrapper, { props: { content: 'Content' } });
			expect(container.querySelector('.glass-card')).toBeInTheDocument();
		});

		it('renders card body with content', () => {
			const { container } = render(GlassCardWrapper, { props: { content: 'Card Body Content' } });
			expect(container.querySelector('.card-body')).toBeInTheDocument();
			expect(container.textContent).toContain('Card Body Content');
		});
	});

	describe('Header', () => {
		it('does not render header by default', () => {
			const { container } = render(GlassCardWrapper, { props: { content: 'Content' } });
			expect(container.querySelector('.card-header')).not.toBeInTheDocument();
		});

		it('renders header when snippet provided', () => {
			const { container } = render(GlassCardWithHeaderWrapper, {
				props: { content: 'Content', headerText: 'Card Title' }
			});
			const header = container.querySelector('.card-header');
			expect(header).toBeInTheDocument();
			expect(header?.textContent).toContain('Card Title');
		});
	});

	describe('Footer', () => {
		it('does not render footer by default', () => {
			const { container } = render(GlassCardWrapper, { props: { content: 'Content' } });
			expect(container.querySelector('.card-footer')).not.toBeInTheDocument();
		});

		it('renders footer when snippet provided', () => {
			const { container } = render(GlassCardWithFooterWrapper, {
				props: { content: 'Content', footerText: 'Footer Text' }
			});
			const footer = container.querySelector('.card-footer');
			expect(footer).toBeInTheDocument();
			expect(footer?.textContent).toContain('Footer Text');
		});
	});

	describe('Header and Footer Combined', () => {
		it('renders both when both snippets provided', () => {
			const { container } = render(GlassCardFullWrapper, {
				props: { content: 'Body', headerText: 'Header', footerText: 'Footer' }
			});
			expect(container.querySelector('.card-header')).toBeInTheDocument();
			expect(container.querySelector('.card-body')).toBeInTheDocument();
			expect(container.querySelector('.card-footer')).toBeInTheDocument();
		});
	});

	describe('Variant + Intensity', () => {
		const variants = ['regular', 'clear'] as const;
		const intensities = ['subtle', 'standard', 'prominent'] as const;

		it.each(variants)('renders %s variant', (variant) => {
			const { container } = render(GlassCardWrapper, { props: { content: 'x', variant } });
			expect(container.querySelector('.glass-surface')).toBeInTheDocument();
		});

		it.each(intensities)('renders %s intensity', (intensity) => {
			const { container } = render(GlassCardWrapper, { props: { content: 'x', intensity } });
			expect(container.querySelector('.glass-surface')).toBeInTheDocument();
		});
	});

	describe('Interactive', () => {
		it('is not interactive by default', () => {
			const { container } = render(GlassCardWrapper, { props: { content: 'Content' } });
			const element = container.querySelector('.glass-surface');
			expect(element).not.toHaveClass('is-interactive');
		});

		it('is interactive when interactive prop is true', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content', interactive: true }
			});
			const element = container.querySelector('.glass-surface');
			expect(element).toHaveClass('is-interactive');
		});
	});

	describe('Custom Props', () => {
		it('applies custom class', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content', class: 'my-card' }
			});
			expect(container.querySelector('.glass-card')).toHaveClass('my-card');
		});
	});
});
