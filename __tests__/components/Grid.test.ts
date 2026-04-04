import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GridWrapper from '../wrappers/GridWrapper.svelte';

describe('Grid Component', () => {
	describe('Rendering', () => {
		it('should render a div with grid class', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.grid');
			expect(element).toBeInTheDocument();
		});

		it('should render children content', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Grid Content' }
			});

			expect(container.textContent).toContain('Grid Content');
		});
	});

	describe('Columns', () => {
		it('should use auto-fit by default', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.grid');
			const style = element?.getAttribute('style');
			expect(style).toContain('repeat(auto-fit');
		});

		it('should use minItemWidth with auto columns', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content', minItemWidth: '250px' }
			});

			const element = container.querySelector('.grid');
			const style = element?.getAttribute('style');
			expect(style).toContain('minmax(250px, 1fr)');
		});

		it('should use fixed columns when number is provided', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content', columns: 3 }
			});

			const element = container.querySelector('.grid');
			const style = element?.getAttribute('style');
			expect(style).toContain('repeat(3, 1fr)');
		});

		it('should support different column counts', () => {
			const columnCounts = [2, 4, 6];

			columnCounts.forEach((columns) => {
				const { container } = render(GridWrapper, {
					props: { content: 'Content', columns }
				});

				const element = container.querySelector('.grid');
				const style = element?.getAttribute('style');
				expect(style).toContain(`repeat(${columns}, 1fr)`);
			});
		});
	});

	describe('Spacing', () => {
		const spacings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		it.each(spacings)('should apply %s spacing', (spacing) => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content', spacing }
			});

			const element = container.querySelector('.grid');
			const style = element?.getAttribute('style');
			expect(style).toContain('--grid-spacing:');
		});

		it('should default to md spacing', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.grid');
			const style = element?.getAttribute('style');
			expect(style).toContain('--grid-spacing: var(--spacing-md)');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(GridWrapper, {
				props: { content: 'Content', class: 'custom-grid' }
			});

			const element = container.querySelector('.grid');
			expect(element).toHaveClass('custom-grid');
		});
	});
});
