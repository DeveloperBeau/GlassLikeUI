import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { SymbolImage } from '$lib/liquidglass';
import { ICON_SIZES, TEXT_COLORS } from '$lib/liquidglass/constants';
import { ICONS } from '$lib/liquidglass/icons';

describe('SymbolImage Component', () => {
	describe('Rendering', () => {
		it('should render an SVG element', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'star' }
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});

		it('should have correct SVG attributes', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'star' }
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
			expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
			expect(svg).toHaveAttribute('fill', 'none');
			expect(svg).toHaveAttribute('stroke-width', '2');
			expect(svg).toHaveAttribute('stroke-linecap', 'round');
			expect(svg).toHaveAttribute('stroke-linejoin', 'round');
		});

		it('should render the correct icon path', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'chevron.left' }
			});

			const svg = container.querySelector('svg');
			expect(svg?.innerHTML).toContain('polyline');
		});
	});

	describe('Sizes', () => {
		const sizes = Object.keys(ICON_SIZES) as (keyof typeof ICON_SIZES)[];

		it.each(sizes)('should apply %s size', (size) => {
			const { container } = render(SymbolImage, {
				props: { name: 'star', size }
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', String(ICON_SIZES[size]));
			expect(svg).toHaveAttribute('height', String(ICON_SIZES[size]));
		});

		it('should default to md size', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'star' }
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', String(ICON_SIZES.md));
			expect(svg).toHaveAttribute('height', String(ICON_SIZES.md));
		});
	});

	describe('Colors', () => {
		const colors = Object.keys(TEXT_COLORS) as (keyof typeof TEXT_COLORS)[];

		it.each(colors)('should apply %s color', (color) => {
			const { container } = render(SymbolImage, {
				props: { name: 'star', color }
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('stroke', TEXT_COLORS[color]);
		});

		it('should default to primary color', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'star' }
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('stroke', TEXT_COLORS.primary);
		});
	});

	describe('Icon Names', () => {
		it('should render different icons', () => {
			const icons = ['star', 'moon', 'sun.max', 'chevron.left'];

			icons.forEach(iconName => {
				const { container } = render(SymbolImage, {
					props: { name: iconName }
				});

				const svg = container.querySelector('svg');
				expect(svg?.innerHTML).toBeTruthy();
			});
		});

		it('should fallback to star icon for unknown names', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'non-existent-icon' }
			});

			const svg = container.querySelector('svg');
			expect(svg?.innerHTML).toContain(ICONS['star']);
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(SymbolImage, {
				props: {
					name: 'star',
					class: 'my-icon-class'
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('my-icon-class');
		});

		it('should preserve symbol-image class with custom class', () => {
			const { container } = render(SymbolImage, {
				props: {
					name: 'star',
					class: 'custom'
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('symbol-image');
			expect(svg).toHaveClass('custom');
		});
	});

	describe('Security', () => {
		it('should not render script tags even if in name', () => {
			const { container } = render(SymbolImage, {
				props: { name: '<script>alert("xss")</script>' }
			});

			const svg = container.querySelector('svg');
			expect(svg?.innerHTML).not.toContain('<script>');
			// Should fallback to star
			expect(svg?.innerHTML).toContain('polygon');
		});

		it('should use predefined icons only', () => {
			const { container } = render(SymbolImage, {
				props: { name: 'javascript:alert(1)' }
			});

			const svg = container.querySelector('svg');
			// Should fallback to star icon
			expect(svg?.innerHTML).toContain(ICONS['star']);
		});
	});
});
