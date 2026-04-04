import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import VStackWrapper from '../wrappers/VStackWrapper.svelte';

describe('VStack Component', () => {
	describe('Rendering', () => {
		it('should render a div with vstack class', () => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.vstack');
			expect(element).toBeInTheDocument();
		});

		it('should render children content', () => {
			const { container } = render(VStackWrapper, {
				props: { content: 'VStack Content' }
			});

			expect(container.textContent).toContain('VStack Content');
		});
	});

	describe('Spacing', () => {
		const spacings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(spacings)('should apply %s spacing', (spacing) => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content', spacing }
			});

			const element = container.querySelector('.vstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--vstack-spacing:');
		});

		it('should default to md spacing', () => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.vstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--vstack-spacing: var(--spacing-md)');
		});
	});

	describe('Alignment', () => {
		const alignments = [
			{ name: 'leading' as const, css: 'flex-start' },
			{ name: 'center' as const, css: 'center' },
			{ name: 'trailing' as const, css: 'flex-end' },
			{ name: 'stretch' as const, css: 'stretch' }
		];

		it.each(alignments)('should apply $name alignment as $css', ({ name, css }) => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content', alignment: name }
			});

			const element = container.querySelector('.vstack');
			const style = element?.getAttribute('style');
			expect(style).toContain(`--vstack-alignment: ${css}`);
		});

		it('should default to stretch alignment', () => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.vstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--vstack-alignment: stretch');
		});
	});

	describe('Padding', () => {
		const paddings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(paddings)('should apply %s padding', (padding) => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content', padding }
			});

			const element = container.querySelector('.vstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--vstack-padding:');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(VStackWrapper, {
				props: { content: 'Content', class: 'custom-vstack' }
			});

			const element = container.querySelector('.vstack');
			expect(element).toHaveClass('custom-vstack');
		});
	});
});
