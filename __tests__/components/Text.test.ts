import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TextWrapper from '../wrappers/TextWrapper.svelte';

describe('Text Component', () => {
	describe('Rendering', () => {
		it('should render as a span element', () => {
			const { container } = render(TextWrapper, {
				props: { content: 'Hello World' }
			});

			const text = container.querySelector('.text');
			expect(text?.tagName).toBe('SPAN');
		});

		it('should render content', () => {
			render(TextWrapper, {
				props: { content: 'Test content' }
			});

			expect(screen.getByText('Test content')).toBeInTheDocument();
		});

		it('should apply id when provided', () => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text', id: 'my-text' }
			});

			const text = container.querySelector('#my-text');
			expect(text).toBeInTheDocument();
		});
	});

	describe('Sizes', () => {
		const sizes = ['xs', 'sm', 'body', 'callout', 'headline', 'title3', 'title2', 'title1', 'largeTitle', 'hero'] as const;

		it.each(sizes)('should apply %s size styles', (size) => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text', size }
			});

			const text = container.querySelector('.text');
			expect(text).toHaveAttribute('style');
			expect(text?.getAttribute('style')).toContain('--text-size:');
		});

		it('should default to body size', () => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text' }
			});

			const text = container.querySelector('.text');
			const style = text?.getAttribute('style');
			expect(style).toContain('--text-size: 1rem');
		});
	});

	describe('Weights', () => {
		const weights = [
			{ name: 'regular' as const, value: 400 },
			{ name: 'medium' as const, value: 500 },
			{ name: 'semibold' as const, value: 600 },
			{ name: 'bold' as const, value: 700 },
			{ name: 'heavy' as const, value: 800 }
		];

		it.each(weights)('should apply $name weight ($value)', ({ name, value }) => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text', weight: name }
			});

			const text = container.querySelector('.text');
			const style = text?.getAttribute('style');
			expect(style).toContain(`--text-weight: ${value}`);
		});
	});

	describe('Colors', () => {
		const colors = ['primary', 'secondary', 'tertiary', 'accent', 'white'] as const;

		it.each(colors)('should apply %s color', (color) => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text', color }
			});

			const text = container.querySelector('.text');
			expect(text).toHaveAttribute('style');
			expect(text?.getAttribute('style')).toContain('--text-color:');
		});
	});

	describe('Alignment', () => {
		const alignments = [
			{ name: 'leading' as const, css: 'left' },
			{ name: 'center' as const, css: 'center' },
			{ name: 'trailing' as const, css: 'right' }
		];

		it.each(alignments)('should apply $name alignment as $css', ({ name, css }) => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text', alignment: name }
			});

			const text = container.querySelector('.text');
			const style = text?.getAttribute('style');
			expect(style).toContain(`--text-align: ${css}`);
		});
	});

	describe('Gradient', () => {
		it('should apply gradient class when gradient is true', () => {
			const { container } = render(TextWrapper, {
				props: { content: 'Gradient Text', gradient: true }
			});

			const text = container.querySelector('.text');
			expect(text).toHaveClass('gradient');
		});

		it('should not apply gradient class by default', () => {
			const { container } = render(TextWrapper, {
				props: { content: 'Normal Text' }
			});

			const text = container.querySelector('.text');
			expect(text).not.toHaveClass('gradient');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(TextWrapper, {
				props: { content: 'Text', class: 'custom-text-class' }
			});

			const text = container.querySelector('.text');
			expect(text).toHaveClass('custom-text-class');
		});
	});
});
