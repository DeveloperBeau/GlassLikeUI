import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlassWrapper from '../wrappers/GlassWrapper.svelte';

describe('Glass', () => {
	describe('Rendering', () => {
		it('renders with glass-surface class', () => {
			const { container } = render(GlassWrapper, { props: { content: 'Hi' } });
			expect(container.querySelector('.glass-surface')).toBeInTheDocument();
		});

		it('renders slotted content', () => {
			const { container } = render(GlassWrapper, { props: { content: 'Hello Glass' } });
			expect(container.textContent).toContain('Hello Glass');
		});

		it('wraps content in a .glass-content slot', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			expect(container.querySelector('.glass-content')).toBeInTheDocument();
		});
	});

	describe('Variant', () => {
		const variants = ['regular', 'clear'] as const;

		it('defaults to regular variant', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			expect(container.querySelector('.glass-surface')).toHaveClass('regular');
		});

		it.each(variants)('renders %s variant class', (variant) => {
			const { container } = render(GlassWrapper, { props: { content: 'x', variant } });
			expect(container.querySelector('.glass-surface')).toHaveClass(variant);
		});
	});

	describe('Intensity', () => {
		const intensities = ['subtle', 'standard', 'prominent'] as const;

		it.each(intensities)('renders at %s intensity with lensing enabled', (intensity) => {
			const { container } = render(GlassWrapper, { props: { content: 'x', intensity } });
			const el = container.querySelector('.glass-surface');
			expect(el).toHaveClass('has-lensing');
		});

		it('writes intensity-driven blur custom property', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', intensity: 'prominent' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--glass-blur: 32px');
		});

		it('writes intensity-driven displacement scale', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', intensity: 'subtle' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--glass-displacement-scale: 4');
		});

		it('writes intensity-driven saturation', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', intensity: 'standard' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--glass-saturation: 1.8');
		});
	});

	describe('Variant × Intensity combinations', () => {
		const variants = ['regular', 'clear'] as const;
		const intensities = ['subtle', 'standard', 'prominent'] as const;

		for (const variant of variants) {
			for (const intensity of intensities) {
				it(`renders ${variant} + ${intensity}`, () => {
					const { container } = render(GlassWrapper, {
						props: { content: 'x', variant, intensity }
					});
					expect(container.querySelector('.glass-surface')).toHaveClass(variant);
					expect(container.querySelector('.glass-surface')).toHaveClass('has-lensing');
				});
			}
		}
	});

	describe('Opacity by variant', () => {
		it('writes clear variant opacity lower than regular', () => {
			const { container: r } = render(GlassWrapper, {
				props: { content: 'x', variant: 'regular' }
			});
			const { container: c } = render(GlassWrapper, {
				props: { content: 'x', variant: 'clear' }
			});
			const rStyle = (r.querySelector('.glass-surface') as HTMLElement).getAttribute('style') || '';
			const cStyle = (c.querySelector('.glass-surface') as HTMLElement).getAttribute('style') || '';
			const rOp = Number(rStyle.match(/--glass-opacity:\s*([\d.]+)/)?.[1]);
			const cOp = Number(cStyle.match(/--glass-opacity:\s*([\d.]+)/)?.[1]);
			expect(cOp).toBeLessThan(rOp);
		});
	});

	describe('Corner radius', () => {
		const radii = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

		it.each(radii)('accepts %s cornerRadius', (cornerRadius) => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', cornerRadius }
			});
			expect(container.querySelector('.glass-surface')).toBeInTheDocument();
		});

		it('writes --glass-radius custom property', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', cornerRadius: 'full' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--glass-radius');
		});
	});

	describe('Padding', () => {
		const paddings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(paddings)('accepts %s padding', (padding) => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', padding }
			});
			expect(container.querySelector('.glass-surface')).toBeInTheDocument();
		});

		it('applies inline padding style', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', padding: 'lg' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('padding');
		});
	});

	describe('Shadow', () => {
		it('applies has-shadow by default', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			expect(container.querySelector('.glass-surface')).toHaveClass('has-shadow');
		});

		it('omits has-shadow when shadow=false', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', shadow: false } });
			expect(container.querySelector('.glass-surface')).not.toHaveClass('has-shadow');
		});

		it('keeps has-shadow when shadow=true explicitly', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', shadow: true } });
			expect(container.querySelector('.glass-surface')).toHaveClass('has-shadow');
		});
	});

	describe('Interactive', () => {
		it('is not interactive by default', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			expect(container.querySelector('.glass-surface')).not.toHaveClass('is-interactive');
		});

		it('adds is-interactive when interactive=true', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', interactive: true } });
			expect(container.querySelector('.glass-surface')).toHaveClass('is-interactive');
		});
	});

	describe('Tint', () => {
		it('does not set surface bg override by default', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			const el = container.querySelector('.glass-surface') as HTMLElement;
			const style = el.getAttribute('style') || '';
			expect(style).not.toContain('--glass-surface-bg');
		});

		it('applies tint as --glass-surface-bg override', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', tint: 'rgba(255, 0, 0, 0.3)' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--glass-surface-bg: rgba(255, 0, 0, 0.3)');
		});
	});

	describe('Custom style prop', () => {
		it('appends custom inline style', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', style: 'margin-top: 10px;' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('margin-top: 10px');
		});
	});

	describe('Custom class', () => {
		it('merges custom class alongside glass-surface', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', class: 'my-glass' } });
			expect(container.querySelector('.glass-surface')).toHaveClass('my-glass');
		});

		it('still exposes variant class alongside custom class', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', class: 'my-glass', variant: 'clear' }
			});
			const el = container.querySelector('.glass-surface');
			expect(el).toHaveClass('clear');
			expect(el).toHaveClass('my-glass');
		});
	});
});
