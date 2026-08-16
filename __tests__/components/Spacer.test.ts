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

	// Rendering once only proves the initial paint. These exercise the reactive
	// update path, where the compiler patches the DOM in place.
	describe('Reactivity', () => {
		it('should update the min length when the prop changes', async () => {
			const { container, rerender } = render(Spacer, { props: { minLength: 10 } });
			expect(container.querySelector('.spacer')).toHaveStyle({ '--spacer-min': '10px' });

			await rerender({ minLength: 40 });

			expect(container.querySelector('.spacer')).toHaveStyle({ '--spacer-min': '40px' });
		});

		// A default only applies to undefined, so an explicit null reaches the
		// interpolation directly. It must not print "null" into the markup.
		it('should not print null into the class attribute', () => {
			const { container } = render(Spacer, {
				props: { class: null as unknown as string }
			});
			const element = container.querySelector('.spacer')!;
			expect(element.className).not.toContain('null');
			expect(element).toHaveClass('spacer');
		});

		it('should not print null into the min-length style', () => {
			const { container } = render(Spacer, {
				props: { minLength: null as unknown as number }
			});
			expect(container.querySelector('.spacer')!.getAttribute('style')).not.toContain('null');
		});

		it('should swap the custom class when it changes', async () => {
			const { container, rerender } = render(Spacer, { props: { class: 'first' } });
			expect(container.querySelector('.spacer')).toHaveClass('first');

			await rerender({ class: 'second' });

			const element = container.querySelector('.spacer');
			expect(element).toHaveClass('second');
			expect(element).not.toHaveClass('first');
			expect(element).toHaveClass('spacer');
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
