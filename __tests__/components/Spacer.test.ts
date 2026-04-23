import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Spacer } from '$lib';

describe('Spacer Component', () => {
	describe('Rendering', () => {
		it('should render a div with spacer class', () => {
			const { container } = render(Spacer);

			const element = container.querySelector('.spacer');
			expect(element).toBeInTheDocument();
		});
	});

	describe('Min Length', () => {
		it('should default to 0px min length', () => {
			const { container } = render(Spacer);

			const element = container.querySelector('.spacer');
			const style = element?.getAttribute('style');
			expect(style).toContain('--spacer-min: 0px');
		});

		it('should apply custom min length', () => {
			const { container } = render(Spacer, {
				props: { minLength: 100 }
			});

			const element = container.querySelector('.spacer');
			const style = element?.getAttribute('style');
			expect(style).toContain('--spacer-min: 100px');
		});

		it('should apply various min lengths', () => {
			const lengths = [10, 50, 200, 500];

			lengths.forEach((minLength) => {
				const { container } = render(Spacer, {
					props: { minLength }
				});

				const element = container.querySelector('.spacer');
				const style = element?.getAttribute('style');
				expect(style).toContain(`--spacer-min: ${minLength}px`);
			});
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(Spacer, {
				props: { class: 'custom-spacer' }
			});

			const element = container.querySelector('.spacer');
			expect(element).toHaveClass('custom-spacer');
		});

		it('should preserve spacer class with custom class', () => {
			const { container } = render(Spacer, {
				props: { class: 'my-spacer' }
			});

			const element = container.querySelector('.spacer');
			expect(element).toHaveClass('spacer');
			expect(element).toHaveClass('my-spacer');
		});
	});
});
