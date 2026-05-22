import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import MenuItemWrapper from '../wrappers/MenuItemWrapper.svelte';

describe('MenuItem Component', () => {
	describe('Rendering', () => {
		it('renders a button by default', () => {
			render(MenuItemWrapper, { props: { label: 'Open' } });
			const item = screen.getByRole('menuitem');
			expect(item.tagName).toBe('BUTTON');
			expect(item).toHaveTextContent('Open');
		});

		it('renders an anchor when href is set', () => {
			render(MenuItemWrapper, { props: { label: 'Go', href: '/somewhere' } });
			const item = screen.getByRole('menuitem');
			expect(item.tagName).toBe('A');
			expect(item).toHaveAttribute('href', '/somewhere');
		});

		it('renders a leading icon when icon is set', () => {
			const { container } = render(MenuItemWrapper, {
				props: { label: 'Item', icon: 'star' }
			});
			expect(container.querySelector('.menu-item-icon')).toBeInTheDocument();
		});

		it('omits the icon when icon is not set', () => {
			const { container } = render(MenuItemWrapper, { props: { label: 'Item' } });
			expect(container.querySelector('.menu-item-icon')).not.toBeInTheDocument();
		});

		it('marks the item with role menuitem and tabindex -1', () => {
			render(MenuItemWrapper, { props: { label: 'Item' } });
			expect(screen.getByRole('menuitem')).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('Behavior', () => {
		it('calls onclick when activated', async () => {
			const onclick = vi.fn();
			render(MenuItemWrapper, { props: { label: 'Tap', onclick } });
			await fireEvent.click(screen.getByRole('menuitem'));
			expect(onclick).toHaveBeenCalledOnce();
		});
	});

	describe('Styling', () => {
		it('applies the destructive class', () => {
			const { container } = render(MenuItemWrapper, {
				props: { label: 'Delete', destructive: true }
			});
			expect(container.querySelector('.menu-item.destructive')).toBeInTheDocument();
		});
	});
});
