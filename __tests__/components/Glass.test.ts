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

		it('defaults to regular variant class', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			expect(container.querySelector('.glass-surface')).toHaveClass('regular');
		});

		it('renders clear variant class', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', variant: 'clear' } });
			expect(container.querySelector('.glass-surface')).toHaveClass('clear');
		});
	});

	describe('Intensity lensing', () => {
		it('enables lensing for standard intensity', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x' } });
			expect(container.querySelector('.glass-surface')).toHaveClass('has-lensing');
		});

		it('enables lensing for prominent intensity', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', intensity: 'prominent' }
			});
			expect(container.querySelector('.glass-surface')).toHaveClass('has-lensing');
		});

		it('enables lensing for subtle intensity (scale > 0)', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', intensity: 'subtle' }
			});
			expect(container.querySelector('.glass-surface')).toHaveClass('has-lensing');
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
	});

	describe('Interactive', () => {
		it('adds is-interactive when interactive=true', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', interactive: true } });
			expect(container.querySelector('.glass-surface')).toHaveClass('is-interactive');
		});
	});

	describe('Tint', () => {
		it('applies tint via inline style', () => {
			const { container } = render(GlassWrapper, {
				props: { content: 'x', tint: 'rgba(255, 0, 0, 0.3)' }
			});
			const el = container.querySelector('.glass-surface') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--glass-surface-bg');
		});
	});

	describe('Custom class', () => {
		it('merges custom class alongside glass-surface', () => {
			const { container } = render(GlassWrapper, { props: { content: 'x', class: 'my-glass' } });
			const el = container.querySelector('.glass-surface');
			expect(el).toHaveClass('my-glass');
		});
	});
});
