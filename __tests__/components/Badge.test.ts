import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { Badge } from '$lib';

describe('Badge Component', () => {
	describe('Rendering', () => {
		it('should render the badge with label text', () => {
			render(Badge, { props: { label: 'New' } });

			expect(screen.getByText('New')).toBeInTheDocument();
		});

		it('should render as a span element', () => {
			const { container } = render(Badge, { props: { label: 'Test' } });

			const badge = container.querySelector('.badge');
			expect(badge?.tagName).toBe('SPAN');
		});
	});

	describe('Variants', () => {
		const variants = ['default', 'accent'] as const;

		it.each(variants)('should apply %s variant class', (variant) => {
			const { container } = render(Badge, {
				props: { label: 'Badge', variant }
			});

			const badge = container.querySelector('.badge');
			expect(badge).toHaveClass(`variant-${variant}`);
		});

		it('should default to default variant', () => {
			const { container } = render(Badge, {
				props: { label: 'Badge' }
			});

			const badge = container.querySelector('.badge');
			expect(badge).toHaveClass('variant-default');
		});
	});

	describe('Sizes', () => {
		const sizes = ['sm', 'md'] as const;

		it.each(sizes)('should apply %s size class', (size) => {
			const { container } = render(Badge, {
				props: { label: 'Badge', size }
			});

			const badge = container.querySelector('.badge');
			expect(badge).toHaveClass(`size-${size}`);
		});

		it('should default to md size', () => {
			const { container } = render(Badge, {
				props: { label: 'Badge' }
			});

			const badge = container.querySelector('.badge');
			expect(badge).toHaveClass('size-md');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(Badge, {
				props: {
					label: 'Badge',
					class: 'my-custom-class'
				}
			});

			const badge = container.querySelector('.badge');
			expect(badge).toHaveClass('my-custom-class');
		});

		it('should preserve base badge class with custom class', () => {
			const { container } = render(Badge, {
				props: {
					label: 'Badge',
					class: 'custom'
				}
			});

			const badge = container.querySelector('.badge');
			expect(badge).toHaveClass('badge');
			expect(badge).toHaveClass('custom');
		});
	});

	describe('Content', () => {
		it('should display special characters', () => {
			render(Badge, { props: { label: '🎉 New!' } });

			expect(screen.getByText('🎉 New!')).toBeInTheDocument();
		});

		it('should display numeric labels', () => {
			render(Badge, { props: { label: '99+' } });

			expect(screen.getByText('99+')).toBeInTheDocument();
		});
	});
});
