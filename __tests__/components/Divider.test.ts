import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Divider } from '$lib';

describe('Divider Component', () => {
	describe('Rendering', () => {
		it('should render a div with divider class', () => {
			const { container } = render(Divider);

			const element = container.querySelector('.divider');
			expect(element).toBeInTheDocument();
		});
	});

	describe('Orientation', () => {
		it('should default to horizontal orientation', () => {
			const { container } = render(Divider);

			const element = container.querySelector('.divider');
			expect(element).toHaveClass('horizontal');
		});

		it('should apply horizontal orientation', () => {
			const { container } = render(Divider, {
				props: { orientation: 'horizontal' }
			});

			const element = container.querySelector('.divider');
			expect(element).toHaveClass('horizontal');
			expect(element).not.toHaveClass('vertical');
		});

		it('should apply vertical orientation', () => {
			const { container } = render(Divider, {
				props: { orientation: 'vertical' }
			});

			const element = container.querySelector('.divider');
			expect(element).toHaveClass('vertical');
			expect(element).not.toHaveClass('horizontal');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(Divider, {
				props: { class: 'custom-divider' }
			});

			const element = container.querySelector('.divider');
			expect(element).toHaveClass('custom-divider');
		});

		it('should preserve divider and orientation classes with custom class', () => {
			const { container } = render(Divider, {
				props: { class: 'my-divider', orientation: 'vertical' }
			});

			const element = container.querySelector('.divider');
			expect(element).toHaveClass('divider');
			expect(element).toHaveClass('vertical');
			expect(element).toHaveClass('my-divider');
		});
	});
});
