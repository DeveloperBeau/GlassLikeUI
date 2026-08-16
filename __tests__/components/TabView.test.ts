import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
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
			await fireEvent.click(items[2]!);
			expect(handleChange).toHaveBeenCalledWith('three');
		});

		it('updates the active class after a click', async () => {
			const { container } = render(TabViewWrapper, { props: { activeTab: 'one' } });
			const items = container.querySelectorAll('.tab-item');
			await fireEvent.click(items[1]!);
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

	describe('Content snippet', () => {
		it('renders no content region when no children are supplied', () => {
			const { container } = render(TabViewWrapper, { props: {} });
			expect(container.querySelector('.tab-content')).toBeNull();
		});

		it('renders the content region when children are supplied', () => {
			const { container } = render(TabViewWrapper, { props: { withContent: true } });
			expect(container.querySelector('.tab-content')).toBeInTheDocument();
		});

		it('passes the active tab id to the content snippet', () => {
			render(TabViewWrapper, { props: { withContent: true, activeTab: 'two' } });
			expect(screen.getByTestId('tab-content')).toHaveTextContent('Showing two');
		});

		it('re-renders the content when another tab is selected', async () => {
			const { container } = render(TabViewWrapper, { props: { withContent: true } });
			expect(screen.getByTestId('tab-content')).toHaveTextContent('Showing one');

			await fireEvent.click(container.querySelectorAll('.tab-item')[2]!);

			expect(screen.getByTestId('tab-content')).toHaveTextContent('Showing three');
		});
	});

	describe('Tab icons', () => {
		it('renders no icon span when a tab has no icon', () => {
			const { container } = render(TabViewWrapper, { props: {} });
			expect(container.querySelector('.tab-icon')).toBeNull();
		});

		it('renders the icon snippet when a tab supplies one', () => {
			const { container } = render(TabViewWrapper, { props: { withIcons: true } });
			expect(container.querySelector('.tab-icon')).toBeInTheDocument();
			expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
		});

		it('renders the label alongside the icon', () => {
			const { container } = render(TabViewWrapper, { props: { withIcons: true } });
			expect(container.querySelector('.tab-label')).toHaveTextContent('One');
		});
	});

	describe('Selection indicator', () => {
		// onMount measures synchronously, so the indicator is positioned on the
		// first paint rather than sliding in from zero.
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('measures on mount, without waiting for a frame', () => {
			const { container } = render(TabViewWrapper, { props: {} });
			expect(container.querySelector('.tab-indicator')).toHaveClass('ready');
		});

		it('stays measured after a frame has run', async () => {
			const { container } = render(TabViewWrapper, { props: {} });
			await new Promise((r) => requestAnimationFrame(r));
			expect(container.querySelector('.tab-indicator')).toHaveClass('ready');
		});

		// jsdom reports zero offsets, so assert the style is written rather than
		// a specific pixel value.
		it('writes a transform and width onto the indicator', () => {
			const { container } = render(TabViewWrapper, { props: {} });
			const style = container.querySelector('.tab-indicator')!.getAttribute('style') ?? '';
			expect(style).toContain('translateX');
			expect(style).toContain('width');
		});

		// No button matches, so there is nothing to measure and the indicator
		// must stay hidden rather than parking at zero width.
		it('stays unmeasured when the active tab matches no button', () => {
			const { container } = render(TabViewWrapper, { props: { activeTab: 'nope' } });
			expect(container.querySelector('.tab-indicator')).not.toHaveClass('ready');
		});

		it('survives an environment with no requestAnimationFrame', () => {
			const original = globalThis.requestAnimationFrame;
			(globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame = undefined;
			try {
				expect(() => render(TabViewWrapper, { props: {} })).not.toThrow();
			} finally {
				(globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame = original;
			}
		});
	});

	describe('Resize handling', () => {
		it('observes the tab bar so the indicator follows layout changes', () => {
			const observe = vi.fn();
			const disconnect = vi.fn();
			const original = globalThis.ResizeObserver;
			(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
				observe = observe;
				disconnect = disconnect;
				unobserve = vi.fn();
			};
			try {
				const { unmount } = render(TabViewWrapper, { props: {} });
				expect(observe).toHaveBeenCalledTimes(1);

				unmount();
				expect(disconnect).toHaveBeenCalledTimes(1);
			} finally {
				(globalThis as { ResizeObserver?: unknown }).ResizeObserver = original;
			}
		});

		it('re-measures when the observer fires', () => {
			let trigger: (() => void) | undefined;
			const original = globalThis.ResizeObserver;
			(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
				constructor(cb: () => void) {
					trigger = cb;
				}
				observe = vi.fn();
				disconnect = vi.fn();
				unobserve = vi.fn();
			};
			try {
				render(TabViewWrapper, { props: {} });
				expect(trigger).toBeTypeOf('function');
				expect(() => trigger!()).not.toThrow();
			} finally {
				(globalThis as { ResizeObserver?: unknown }).ResizeObserver = original;
			}
		});

		it('renders without a ResizeObserver at all', () => {
			const original = globalThis.ResizeObserver;
			(globalThis as { ResizeObserver?: unknown }).ResizeObserver = undefined;
			try {
				expect(() => render(TabViewWrapper, { props: {} })).not.toThrow();
			} finally {
				(globalThis as { ResizeObserver?: unknown }).ResizeObserver = original;
			}
		});
	});
});
