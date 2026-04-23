import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LiquidGlassWrapper from '../wrappers/LiquidGlassWrapper.svelte';
import { MATERIAL_CONFIG, CORNER_RADIUS, PADDING } from '$lib/constants';

describe('LiquidGlass Component', () => {
	describe('Rendering', () => {
		it('should render a div with liquid-glass class', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toBeInTheDocument();
		});

		it('should render content', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Glass Content' }
			});

			expect(container.textContent).toContain('Glass Content');
		});

		it('should have glass-content wrapper', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content' }
			});

			const content = container.querySelector('.glass-content');
			expect(content).toBeInTheDocument();
		});
	});

	describe('Materials', () => {
		const materials = Object.keys(MATERIAL_CONFIG) as (keyof typeof MATERIAL_CONFIG)[];

		it.each(materials)('should apply %s material CSS variables', (material) => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', material }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');
			const config = MATERIAL_CONFIG[material];

			expect(style).toContain(`--glass-blur: ${config.blur}px`);
			expect(style).toContain(`--glass-saturation: ${config.saturation}`);
			expect(style).toContain(`--glass-bg-opacity: ${config.bgOpacity}`);
			expect(style).toContain(`--glass-border-opacity: ${config.borderOpacity}`);
		});

		it('should default to regular material', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');
			const regularConfig = MATERIAL_CONFIG.regular;

			expect(style).toContain(`--glass-blur: ${regularConfig.blur}px`);
		});

		it('should apply chrome class for chrome material', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', material: 'chrome' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toHaveClass('chrome');
		});
	});

	describe('Corner Radius', () => {
		const radii = Object.keys(CORNER_RADIUS) as (keyof typeof CORNER_RADIUS)[];

		it.each(radii)('should apply %s corner radius', (cornerRadius) => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', cornerRadius }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');

			expect(style).toContain(`--glass-radius: ${CORNER_RADIUS[cornerRadius]}`);
		});
	});

	describe('Padding', () => {
		const paddings = Object.keys(PADDING) as (keyof typeof PADDING)[];

		it.each(paddings)('should apply %s padding', (padding) => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', padding }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');

			expect(style).toContain(`--glass-padding: ${PADDING[padding]}`);
		});
	});

	describe('Border and Shadow', () => {
		it('should have has-border class by default', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toHaveClass('has-border');
		});

		it('should not have has-border class when border is false', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', border: false }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).not.toHaveClass('has-border');
		});

		it('should have has-shadow class by default', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toHaveClass('has-shadow');
		});

		it('should not have has-shadow class when shadow is false', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', shadow: false }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).not.toHaveClass('has-shadow');
		});
	});

	describe('Interactive Mode', () => {
		it('should not have interactive class by default', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).not.toHaveClass('interactive');
		});

		it('should have interactive class when interactive is true', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', interactive: true }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toHaveClass('interactive');
		});
	});

	describe('Tint', () => {
		it('should apply tint CSS variable when tint is provided', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', tint: 'rgba(255, 0, 0, 0.5)' }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');

			expect(style).toContain('--glass-tint: rgba(255, 0, 0, 0.5)');
		});

		it('should not include tint variable when tint is empty', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', tint: '' }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');

			expect(style).not.toContain('--glass-tint');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', class: 'my-glass-class' }
			});

			const element = container.querySelector('.liquid-glass');
			expect(element).toHaveClass('my-glass-class');
		});

		it('should apply custom style', () => {
			const { container } = render(LiquidGlassWrapper, {
				props: { content: 'Content', style: 'margin-top: 20px;' }
			});

			const element = container.querySelector('.liquid-glass');
			const style = element?.getAttribute('style');

			expect(style).toContain('margin-top: 20px');
		});
	});
});
