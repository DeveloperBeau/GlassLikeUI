import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TabViewWrapper from '../wrappers/TabViewWrapper.svelte';

describe('TabView', () => {
	describe('Rendering', () => {
		it('renders one button per tab', () => {
			const { container } = render(TabViewWrapper);
			expect(container.querySelectorAll('.tab-item')).toHaveLength(3);
		});

		it('renders tab labels', () => {
			const { container } = render(TabViewWrapper);
			const labels = Array.from(container.querySelectorAll('.tab-label')).map(
				(el) => el.textContent
			);
			expect(labels).toEqual(['One', 'Two', 'Three']);
		});

		it('marks the active tab with the active class', () => {
			const { container } = render(TabViewWrapper, { props: { activeTab: 'two' } });
			const items = container.querySelectorAll('.tab-item');
			expect(items[0]).not.toHaveClass('active');
			expect(items[1]).toHaveClass('active');
			expect(items[2]).not.toHaveClass('active');
		});
	});

	describe('Indicator pill', () => {
		it('renders a single indicator element', () => {
			const { container } = render(TabViewWrapper);
			expect(container.querySelectorAll('.tab-indicator')).toHaveLength(1);
		});

		it('marks the indicator aria-hidden', () => {
			const { container } = render(TabViewWrapper);
			expect(container.querySelector('.tab-indicator')).toHaveAttribute('aria-hidden', 'true');
		});

		it('positions the indicator with transform and width inline styles', () => {
			const { container } = render(TabViewWrapper);
			const indicator = container.querySelector('.tab-indicator') as HTMLElement;
			expect(indicator.style.transform).toMatch(/translateX\(/);
			expect(indicator.style.width).toMatch(/px$/);
		});
	});

	describe('Selection', () => {
		it('calls onchange with the new tab id when clicked', async () => {
			const handleChange = vi.fn();
			const { container } = render(TabViewWrapper, {
				props: { activeTab: 'one', onchange: handleChange }
			});
			const items = container.querySelectorAll('.tab-item');
			await fireEvent.click(items[2]);
			expect(handleChange).toHaveBeenCalledWith('three');
		});

		it('updates the active class after a click', async () => {
			const { container } = render(TabViewWrapper, { props: { activeTab: 'one' } });
			const items = container.querySelectorAll('.tab-item');
			await fireEvent.click(items[1]);
			expect(items[0]).not.toHaveClass('active');
			expect(items[1]).toHaveClass('active');
		});
	});

	describe('Custom class', () => {
		it('appends custom class to the wrapping container', () => {
			const { container } = render(TabViewWrapper, { props: { class: 'my-tabs' } });
			expect(container.querySelector('.tab-view')).toHaveClass('my-tabs');
		});
	});
});
