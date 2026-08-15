import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ListWrapper from '../wrappers/ListWrapper.svelte';

describe('List Component', () => {
	describe('Rendering', () => {
		it('should render its children', () => {
			render(ListWrapper, { props: { text: 'Row content' } });
			expect(screen.getByText('Row content')).toBeInTheDocument();
		});

		it('should always carry the base list class', () => {
			const { container } = render(ListWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.list')).toBeInTheDocument();
		});
	});

	describe('Styles', () => {
		it('should default to insetGrouped', () => {
			const { container } = render(ListWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.list-insetGrouped')).toBeInTheDocument();
		});

		it.each(['inset', 'grouped', 'insetGrouped'] as const)(
			'should apply the %s style class',
			(style) => {
				const { container } = render(ListWrapper, { props: { style } });
				expect(container.querySelector(`.list-${style}`)).toBeInTheDocument();
			}
		);

		it('should render a plain list without a style modifier class', () => {
			const { container } = render(ListWrapper, { props: { style: 'plain' } });
			expect(container.querySelector('.list-plain')).toBeInTheDocument();
			expect(container.querySelector('.list-insetGrouped')).toBeNull();
		});

		// plain renders a bare div; every other style wraps in Glass.
		it('should not wrap a plain list in glass', () => {
			const { container } = render(ListWrapper, { props: { style: 'plain' } });
			expect(container.querySelector('.glass-content')).toBeNull();
		});

		it.each(['inset', 'grouped', 'insetGrouped'] as const)(
			'should wrap the %s style in glass',
			(style) => {
				const { container } = render(ListWrapper, { props: { style } });
				expect(container.querySelector('.glass-content')).toBeInTheDocument();
			}
		);
	});

	describe('Custom Props', () => {
		it('should apply a custom class to a plain list', () => {
			const { container } = render(ListWrapper, {
				props: { style: 'plain', class: 'my-list' }
			});
			expect(container.querySelector('.list')).toHaveClass('my-list');
		});

		it('should apply a custom class to a glass list', () => {
			const { container } = render(ListWrapper, {
				props: { style: 'inset', class: 'my-list' }
			});
			expect(container.querySelector('.list')).toHaveClass('my-list');
		});
	});
});
