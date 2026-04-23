import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlassEffectContainerWrapper from '../wrappers/GlassEffectContainerWrapper.svelte';

describe('GlassEffectContainer', () => {
	describe('Rendering', () => {
		it('renders container element', () => {
			const { container } = render(GlassEffectContainerWrapper);
			expect(container.querySelector('.glass-effect-container')).toBeInTheDocument();
		});

		it('renders all children', () => {
			const { container } = render(GlassEffectContainerWrapper, { props: { count: 3 } });
			const children = container.querySelectorAll('.glass-surface');
			expect(children.length).toBe(3);
		});

		it('renders zero children gracefully', () => {
			const { container } = render(GlassEffectContainerWrapper, { props: { count: 0 } });
			expect(container.querySelector('.glass-effect-container')).toBeInTheDocument();
			expect(container.querySelectorAll('.glass-surface').length).toBe(0);
		});
	});

	describe('Direction', () => {
		it('defaults to horizontal direction', () => {
			const { container } = render(GlassEffectContainerWrapper);
			expect(container.querySelector('.glass-effect-container')).toHaveClass('horizontal');
		});

		it('applies vertical direction class', () => {
			const { container } = render(GlassEffectContainerWrapper, {
				props: { direction: 'vertical' }
			});
			expect(container.querySelector('.glass-effect-container')).toHaveClass('vertical');
		});
	});

	describe('Spacing', () => {
		const spacings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(spacings)('accepts %s spacing', (spacing) => {
			const { container } = render(GlassEffectContainerWrapper, { props: { spacing } });
			const el = container.querySelector('.glass-effect-container') as HTMLElement;
			expect(el.getAttribute('style')).toContain('--container-gap');
		});
	});

	describe('Merge', () => {
		it('is merged by default', () => {
			const { container } = render(GlassEffectContainerWrapper);
			expect(container.querySelector('.glass-effect-container')).toHaveClass('is-merged');
		});

		it('drops merged class when merge=false', () => {
			const { container } = render(GlassEffectContainerWrapper, { props: { merge: false } });
			expect(container.querySelector('.glass-effect-container')).not.toHaveClass('is-merged');
		});
	});

	describe('Custom class', () => {
		it('appends custom class', () => {
			const { container } = render(GlassEffectContainerWrapper, {
				props: { class: 'my-container' }
			});
			expect(container.querySelector('.glass-effect-container')).toHaveClass('my-container');
		});
	});
});
