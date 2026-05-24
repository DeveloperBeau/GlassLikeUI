import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import MenuWrapper from '../wrappers/MenuWrapper.svelte';

const openTrigger = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Projects' }));

describe('Menu Component', () => {
	describe('Rendering', () => {
		it('renders a trigger button with menu ARIA', () => {
			render(MenuWrapper);
			const trigger = screen.getByRole('button', { name: 'Projects' });
			expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
			expect(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		it('does not render the panel initially', () => {
			render(MenuWrapper);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});
	});

	describe('Open and close', () => {
		it('opens the panel on trigger click', async () => {
			render(MenuWrapper);
			await openTrigger();
			expect(screen.getByRole('menu')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: 'Projects' })
			).toHaveAttribute('aria-expanded', 'true');
		});

		it('renders both menu items when open', async () => {
			render(MenuWrapper);
			await openTrigger();
			const items = screen.getAllByRole('menuitem');
			expect(items).toHaveLength(2);
			expect(items[0]).toHaveAttribute('href', '/plainly-weather');
			expect(items[1]).toHaveAttribute('href', '/murmur');
		});

		it('closes the panel when the trigger is clicked again', async () => {
			render(MenuWrapper);
			await openTrigger();
			await openTrigger();
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('closes on Escape and restores focus to the trigger', async () => {
			render(MenuWrapper);
			await openTrigger();
			await fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
			expect(document.activeElement).toBe(
				screen.getByRole('button', { name: 'Projects' })
			);
		});

		it('closes on outside pointerdown', async () => {
			render(MenuWrapper);
			await openTrigger();
			await fireEvent.pointerDown(document.body);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('closes when a menu item is selected', async () => {
			render(MenuWrapper);
			await openTrigger();
			await fireEvent.click(screen.getAllByRole('menuitem')[0]);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});
	});

	describe('Keyboard navigation', () => {
		it('focuses the first item when opened', async () => {
			render(MenuWrapper);
			await openTrigger();
			const items = screen.getAllByRole('menuitem');
			await waitFor(() => expect(document.activeElement).toBe(items[0]));
		});

		it('moves focus to the next item on ArrowDown', async () => {
			render(MenuWrapper);
			await openTrigger();
			const panel = screen.getByRole('menu');
			const items = screen.getAllByRole('menuitem');
			items[0]?.focus();
			await fireEvent.keyDown(panel, { key: 'ArrowDown' });
			expect(document.activeElement).toBe(items[1]);
		});

		it('wraps from the last item to the first on ArrowDown', async () => {
			render(MenuWrapper);
			await openTrigger();
			const panel = screen.getByRole('menu');
			const items = screen.getAllByRole('menuitem');
			items[1]?.focus();
			await fireEvent.keyDown(panel, { key: 'ArrowDown' });
			expect(document.activeElement).toBe(items[0]);
		});

		it('moves focus to the previous item on ArrowUp', async () => {
			render(MenuWrapper);
			await openTrigger();
			const panel = screen.getByRole('menu');
			const items = screen.getAllByRole('menuitem');
			items[1]?.focus();
			await fireEvent.keyDown(panel, { key: 'ArrowUp' });
			expect(document.activeElement).toBe(items[0]);
		});

		it('jumps to last on End and first on Home', async () => {
			render(MenuWrapper);
			await openTrigger();
			const panel = screen.getByRole('menu');
			const items = screen.getAllByRole('menuitem');
			items[0]?.focus();
			await fireEvent.keyDown(panel, { key: 'End' });
			expect(document.activeElement).toBe(items[1]);
			await fireEvent.keyDown(panel, { key: 'Home' });
			expect(document.activeElement).toBe(items[0]);
		});
	});

	describe('Alignment', () => {
		it('applies the align-end class when align is end', async () => {
			render(MenuWrapper, { props: { align: 'end' } });
			await openTrigger();
			expect(screen.getByRole('menu')).toHaveClass('align-end');
		});

		it('omits the align-end class for the default start alignment', async () => {
			render(MenuWrapper);
			await openTrigger();
			expect(screen.getByRole('menu')).not.toHaveClass('align-end');
		});
	});
});
