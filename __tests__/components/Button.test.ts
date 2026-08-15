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

		it('should not set a type attribute by default', () => {
			render(ButtonWrapper, { props: { text: 'Click me' } });

			expect(screen.getByRole('button')).not.toHaveAttribute('type');
		});

		it.each(['button', 'submit', 'reset'] as const)(
			'should apply type="%s" when provided',
			(type) => {
				render(ButtonWrapper, { props: { text: 'Click me', type } });

				expect(screen.getByRole('button')).toHaveAttribute('type', type);
			}
		);

		it('should apply target and a safe default rel for _blank links', () => {
			render(ButtonWrapper, {
				props: { text: 'Link', href: 'https://example.com', target: '_blank' }
			});

			const link = screen.getByRole('link');
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});

		it('should let an explicit rel override the default', () => {
			render(ButtonWrapper, {
				props: { text: 'Link', href: 'https://example.com', target: '_blank', rel: 'noopener' }
			});

			expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener');
		});

		it('should not set rel for same-tab links', () => {
			render(ButtonWrapper, {
				props: { text: 'Link', href: 'https://example.com' }
			});

			expect(screen.getByRole('link')).not.toHaveAttribute('rel');
		});
	});

	describe('Glass variants', () => {
		const glassVariants = ['glass', 'glassProminent'] as const;
		const solidVariants = ['filled', 'outlined', 'plain', 'tinted', 'destructive'] as const;

		it.each(glassVariants)('should mark %s as a glass button', (variant) => {
			const { container } = render(ButtonWrapper, { props: { text: 'Button', variant } });

			const button = container.querySelector('.button');
			expect(button).toHaveClass(`variant-${variant}`);
			expect(button).toHaveClass('is-glass');
		});

		it.each(solidVariants)('should not mark %s as a glass button', (variant) => {
			const { container } = render(ButtonWrapper, { props: { text: 'Button', variant } });

			expect(container.querySelector('.button')).not.toHaveClass('is-glass');
		});

		it('should emit the subtle blur token for glass', () => {
			const { container } = render(ButtonWrapper, { props: { text: 'Button', variant: 'glass' } });

			const style = container.querySelector('.button')!.getAttribute('style') || '';
			expect(style).toContain('--btn-glass-blur: 10px');
			expect(style).toContain('--btn-glass-saturation: 1.4');
		});

		it('should emit the standard blur token for glassProminent', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button', variant: 'glassProminent' }
			});

			const style = container.querySelector('.button')!.getAttribute('style') || '';
			expect(style).toContain('--btn-glass-blur: 20px');
			expect(style).toContain('--btn-glass-saturation: 1.8');
		});

		// A backdrop-filter layer on a solid button costs a compositing pass and
		// washes out the fill, so the variables must be absent, not just unused.
		it.each(solidVariants)('should emit no glass variables for %s', (variant) => {
			const { container } = render(ButtonWrapper, { props: { text: 'Button', variant } });

			const style = container.querySelector('.button')!.getAttribute('style') || '';
			expect(style).not.toContain('--btn-glass-blur');
			expect(style).not.toContain('--btn-glass-saturation');
			expect(style).not.toContain('--btn-glass-opacity');
		});

		it('should tint only the prominent glass style', () => {
			const { container: plain } = render(ButtonWrapper, {
				props: { text: 'Button', variant: 'glass' }
			});
			const { container: prominent } = render(ButtonWrapper, {
				props: { text: 'Button', variant: 'glassProminent' }
			});

			expect(plain.querySelector('.button')).not.toHaveClass('is-tinted');
			expect(prominent.querySelector('.button')).toHaveClass('is-tinted');
		});

		// Button renders two separate markup branches; glass must reach both.
		it.each(glassVariants)('should apply %s to link buttons too', (variant) => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Link', href: '/somewhere', variant }
			});

			const link = container.querySelector('a.button');
			expect(link).toHaveClass('is-glass');
			expect(link!.getAttribute('style')).toContain('--btn-glass-blur');
		});

		it('should keep size padding alongside the glass variables', () => {
			const { container } = render(ButtonWrapper, {
				props: { text: 'Button', variant: 'glass', size: 'lg' }
			});

			const style = container.querySelector('.button')!.getAttribute('style') || '';
			expect(style).toContain('--btn-padding: 16px 32px');
			expect(style).toContain('--btn-glass-blur');
		});

		it('should still disable a glass button', () => {
			render(ButtonWrapper, { props: { text: 'Button', variant: 'glass', disabled: true } });

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('should still fire onclick on a glass button', async () => {
			const onclick = vi.fn();
			render(ButtonWrapper, { props: { text: 'Button', variant: 'glass', onclick } });

			await fireEvent.click(screen.getByRole('button'));

			expect(onclick).toHaveBeenCalledTimes(1);
		});
	});

	describe('Variants', () => {
		const variants = [
			'filled',
			'outlined',
			'plain',
			'tinted',
			'destructive',
			'glass',
			'glassProminent'
		] as const;

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
