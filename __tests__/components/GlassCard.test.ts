import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlassCardWrapper from '../wrappers/GlassCardWrapper.svelte';
import GlassCardWithHeaderWrapper from '../wrappers/GlassCardWithHeaderWrapper.svelte';
import GlassCardWithFooterWrapper from '../wrappers/GlassCardWithFooterWrapper.svelte';
import GlassCardFullWrapper from '../wrappers/GlassCardFullWrapper.svelte';

describe('GlassCard Component', () => {
	describe('Rendering', () => {
		it('should render with glass-card class', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.glass-card');
			expect(element).toBeInTheDocument();
		});

		it('should render card-body with content', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Card Body Content' }
			});

			const body = container.querySelector('.card-body');
			expect(body).toBeInTheDocument();
			expect(container.textContent).toContain('Card Body Content');
		});
	});

	describe('Header', () => {
		it('should not render header by default', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content' }
			});

			const header = container.querySelector('.card-header');
			expect(header).not.toBeInTheDocument();
		});

		it('should render header when header snippet is provided', () => {
			const { container } = render(GlassCardWithHeaderWrapper, {
				props: { content: 'Content', headerText: 'Card Title' }
			});

			const header = container.querySelector('.card-header');
			expect(header).toBeInTheDocument();
			expect(header?.textContent).toContain('Card Title');
		});
	});

	describe('Footer', () => {
		it('should not render footer by default', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content' }
			});

			const footer = container.querySelector('.card-footer');
			expect(footer).not.toBeInTheDocument();
		});

		it('should render footer when footer snippet is provided', () => {
			const { container } = render(GlassCardWithFooterWrapper, {
				props: { content: 'Content', footerText: 'Footer Text' }
			});

			const footer = container.querySelector('.card-footer');
			expect(footer).toBeInTheDocument();
			expect(footer?.textContent).toContain('Footer Text');
		});
	});

	describe('Header and Footer Combined', () => {
		it('should render both header and footer when both snippets are provided', () => {
			const { container } = render(GlassCardFullWrapper, {
				props: {
					content: 'Body',
					headerText: 'Header',
					footerText: 'Footer'
				}
			});

			expect(container.querySelector('.card-header')).toBeInTheDocument();
			expect(container.querySelector('.card-body')).toBeInTheDocument();
			expect(container.querySelector('.card-footer')).toBeInTheDocument();
		});
	});

	describe('Material', () => {
		const materials = ['ultraThin', 'thin', 'regular', 'thick', 'ultraThick', 'chrome'] as const;

		it.each(materials)('should pass %s material to LiquidGlass', (material) => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content', material }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toBeInTheDocument();
		});
	});

	describe('Interactive', () => {
		it('should not be interactive by default', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).not.toHaveClass('interactive');
		});

		it('should be interactive when interactive is true', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content', interactive: true }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toHaveClass('interactive');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(GlassCardWrapper, {
				props: { content: 'Content', class: 'my-card' }
			});

			const element = container.querySelector('.glass-card');
			expect(element).toHaveClass('my-card');
		});
	});
});
