import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import HStackWrapper from '../wrappers/HStackWrapper.svelte';

describe('HStack Component', () => {
	describe('Rendering', () => {
		it('should render a div with hstack class', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.hstack');
			expect(element).toBeInTheDocument();
		});

		it('should render children content', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'HStack Content' }
			});

			expect(container.textContent).toContain('HStack Content');
		});
	});

	describe('Spacing', () => {
		const spacings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(spacings)('should apply %s spacing', (spacing) => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content', spacing }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--hstack-spacing:');
		});

		it('should default to md spacing', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--hstack-spacing: var(--spacing-md)');
		});
	});

	describe('Alignment', () => {
		const alignments = [
			{ name: 'top' as const, css: 'flex-start' },
			{ name: 'center' as const, css: 'center' },
			{ name: 'bottom' as const, css: 'flex-end' },
			{ name: 'stretch' as const, css: 'stretch' }
		];

		it.each(alignments)('should apply $name alignment as $css', ({ name, css }) => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content', alignment: name }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain(`--hstack-alignment: ${css}`);
		});

		it('should default to center alignment', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--hstack-alignment: center');
		});
	});

	describe('Justify', () => {
		const justifications = [
			{ name: 'start' as const, css: 'flex-start' },
			{ name: 'center' as const, css: 'center' },
			{ name: 'end' as const, css: 'flex-end' },
			{ name: 'between' as const, css: 'space-between' },
			{ name: 'around' as const, css: 'space-around' },
			{ name: 'evenly' as const, css: 'space-evenly' }
		];

		it.each(justifications)('should apply $name justify as $css', ({ name, css }) => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content', justify: name }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain(`--hstack-justify: ${css}`);
		});

		it('should default to start justify', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--hstack-justify: flex-start');
		});
	});

	describe('Wrap', () => {
		it('should not have wrap class by default', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.hstack');
			expect(element).not.toHaveClass('wrap');
		});

		it('should have wrap class when wrap is true', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content', wrap: true }
			});

			const element = container.querySelector('.hstack');
			expect(element).toHaveClass('wrap');
		});
	});

	describe('Padding', () => {
		const paddings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(paddings)('should apply %s padding', (padding) => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content', padding }
			});

			const element = container.querySelector('.hstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--hstack-padding:');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(HStackWrapper, {
				props: { content: 'Content', class: 'custom-hstack' }
			});

			const element = container.querySelector('.hstack');
			expect(element).toHaveClass('custom-hstack');
		});
	});
});
