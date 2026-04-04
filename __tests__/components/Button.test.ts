import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ButtonWrapper from '../wrappers/ButtonWrapper.svelte';

describe('Button Component', () => {
	describe('Rendering', () => {
		it('should render a button element by default', () => {
			render(ButtonWrapper, { props: { text: 'Click me' } });

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
			expect(button.tagName).toBe('BUTTON');
		});

		it('should render button text', () => {
			render(ButtonWrapper, { props: { text: 'Click me' } });

			expect(screen.getByText('Click me')).toBeInTheDocument();
		});

		it('should render an anchor element when href is provided', () => {
			render(ButtonWrapper, {
				props: { text: 'Link', href: 'https://example.com' }
			});

			const link = screen.getByRole('link');
			expect(link).toBeInTheDocument();
			expect(link.tagName).toBe('A');
			expect(link).toHaveAttribute('href', 'https://example.com');
		});
	});

	describe('Variants', () => {
		const variants = ['filled', 'glass', 'outlined', 'plain', 'tinted'] as const;

		it.each(variants)('should apply %s variant class', (variant) => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button', variant }
			});

			const button = container.querySelector('.button');
			expect(button).toHaveClass(`variant-${variant}`);
		});

		it('should default to filled variant', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button' }
			});

			const button = container.querySelector('.button');
			expect(button).toHaveClass('variant-filled');
		});
	});

	describe('Sizes', () => {
		const sizes = ['sm', 'md', 'lg'] as const;

		it.each(sizes)('should apply %s size class', (size) => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button', size }
			});

			const button = container.querySelector('.button');
			expect(button).toHaveClass(`size-${size}`);
		});

		it('should default to md size', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button' }
			});

			const button = container.querySelector('.button');
			expect(button).toHaveClass('size-md');
		});
	});

	describe('States', () => {
		it('should apply full-width class when fullWidth is true', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button', fullWidth: true }
			});

			const button = container.querySelector('.button');
			expect(button).toHaveClass('full-width');
		});

		it('should disable the button when disabled is true', () => {
			render(ButtonWrapper, {
				props: { text: 'Button', disabled: true }
			});

			const button = screen.getByRole('button');
			expect(button).toBeDisabled();
		});

		it('should apply disabled class to link buttons', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Link', href: '/test', disabled: true }
			});

			const link = container.querySelector('.button');
			expect(link).toHaveClass('disabled');
		});
	});

	describe('Events', () => {
		it('should call onclick handler when clicked', async () => {
			const handleClick = vi.fn();

			render(ButtonWrapper, {
				props: { text: 'Click me', onclick: handleClick }
			});

			const button = screen.getByRole('button');
			await fireEvent.click(button);

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('should pass event to onclick handler', async () => {
			const handleClick = vi.fn();

			render(ButtonWrapper, {
				props: { text: 'Click me', onclick: handleClick }
			});

			const button = screen.getByRole('button');
			await fireEvent.click(button);

			expect(handleClick).toHaveBeenCalledWith(expect.any(MouseEvent));
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button', class: 'custom-class' }
			});

			const button = container.querySelector('.button');
			expect(button).toHaveClass('custom-class');
		});
	});
});
