import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import IconButtonWrapper from '../wrappers/IconButtonWrapper.svelte';

describe('IconButton Component', () => {
	describe('Rendering', () => {
		it('should render a button element', () => {
			render(IconButtonWrapper, {
				props: { icon: 'star', label: 'Star' }
			});

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});

		it('should have icon-button class', () => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star' }
			});

			const button = container.querySelector('.icon-button');
			expect(button).toBeInTheDocument();
		});

		it('should render icon inside button', () => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star' }
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});
	});

	describe('Variants', () => {
		const variants = ['plain', 'glass', 'filled'] as const;

		it.each(variants)('should apply %s variant class', (variant) => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star', variant }
			});

			const button = container.querySelector('.icon-button');
			expect(button).toHaveClass(`variant-${variant}`);
		});

		it('should default to plain variant', () => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star' }
			});

			const button = container.querySelector('.icon-button');
			expect(button).toHaveClass('variant-plain');
		});
	});

	describe('Sizes', () => {
		const sizes = [
			{ name: 'sm' as const, value: 32 },
			{ name: 'md' as const, value: 40 },
			{ name: 'lg' as const, value: 48 }
		];

		it.each(sizes)('should apply $name size ($value px)', ({ name, value }) => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star', size: name }
			});

			const button = container.querySelector('.icon-button');
			expect(button).toHaveClass(`size-${name}`);
			expect(button?.getAttribute('style')).toContain(`--btn-size: ${value}px`);
		});

		it('should default to md size', () => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star' }
			});

			const button = container.querySelector('.icon-button');
			expect(button).toHaveClass('size-md');
		});
	});

	describe('Accessibility', () => {
		it('should have aria-label', () => {
			render(IconButtonWrapper, {
				props: { icon: 'star', label: 'Favorite' }
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-label', 'Favorite');
		});

		it('should have title attribute', () => {
			render(IconButtonWrapper, {
				props: { icon: 'star', label: 'Add to favorites' }
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('title', 'Add to favorites');
		});
	});

	describe('Events', () => {
		it('should call onclick handler when clicked', async () => {
			const handleClick = vi.fn();

			render(IconButtonWrapper, {
				props: { icon: 'star', onclick: handleClick }
			});

			const button = screen.getByRole('button');
			await fireEvent.click(button);

			expect(handleClick).toHaveBeenCalledTimes(1);
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(IconButtonWrapper, {
				props: { icon: 'star', class: 'custom-icon-btn' }
			});

			const button = container.querySelector('.icon-button');
			expect(button).toHaveClass('custom-icon-btn');
		});
	});
});
