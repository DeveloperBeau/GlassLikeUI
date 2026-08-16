import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ScrollViewWrapper from '../wrappers/ScrollViewWrapper.svelte';

function firePointer(target: HTMLElement, type: string, init: PointerEventInit) {
	const ev = new Event(type, { bubbles: true, cancelable: true }) as unknown as PointerEvent;
	Object.assign(ev, { pointerId: 1, button: 0, clientX: 0, clientY: 0, ...init });
	target.dispatchEvent(ev as unknown as Event);
}

describe('ScrollView Component', () => {
	describe('Rendering', () => {
		it('should render its children inside the scroll content', () => {
			const { container } = render(ScrollViewWrapper, { props: { text: 'Scrollable' } });
			expect(screen.getByText('Scrollable')).toBeInTheDocument();
			expect(container.querySelector('.scroll-content')).toHaveTextContent('Scrollable');
		});

		it('should carry the base class', () => {
			const { container } = render(ScrollViewWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.scroll-view')).toBeInTheDocument();
		});
	});

	describe('Axis', () => {
		it('should default to the vertical axis', () => {
			const { container } = render(ScrollViewWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.scroll-view')).toHaveClass('axis-vertical');
		});

		it.each(['vertical', 'horizontal', 'both'] as const)('should apply the %s axis', (axis) => {
			const { container } = render(ScrollViewWrapper, { props: { axis } });
			expect(container.querySelector('.scroll-view')).toHaveClass(`axis-${axis}`);
		});

		it('should apply exactly one axis class', () => {
			const { container } = render(ScrollViewWrapper, { props: { axis: 'horizontal' } });
			const el = container.querySelector('.scroll-view')!;
			const axisClasses = [...el.classList].filter((c) => c.startsWith('axis-'));
			expect(axisClasses).toEqual(['axis-horizontal']);
		});
	});

	describe('Indicators', () => {
		it('should show indicators by default', () => {
			const { container } = render(ScrollViewWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.scroll-view')).not.toHaveClass('hide-indicators');
		});

		it('should hide indicators when showsIndicators is false', () => {
			const { container } = render(ScrollViewWrapper, { props: { showsIndicators: false } });
			expect(container.querySelector('.scroll-view')).toHaveClass('hide-indicators');
		});
	});

	describe('Edge effect', () => {
		it('should render without the scrollEdge attachment by default', () => {
			const { container } = render(ScrollViewWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.scroll-view')).toBeInTheDocument();
		});

		it.each(['soft', 'hard'] as const)('should still render children with the %s edge effect', (effect) => {
			const { container } = render(ScrollViewWrapper, {
				props: { edgeEffect: effect, text: 'Edged' }
			});
			expect(container.querySelector('.scroll-content')).toHaveTextContent('Edged');
		});

		it('should keep axis and indicator classes when an edge effect is active', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { edgeEffect: 'soft', axis: 'both', showsIndicators: false }
			});
			const el = container.querySelector('.scroll-view')!;
			expect(el).toHaveClass('axis-both');
			expect(el).toHaveClass('hide-indicators');
		});
	});

	describe('Pull to refresh', () => {
		// Regression guard: a plain ScrollView must keep the markup it had before
		// the feature existed.
		it('adds no refresh machinery without an onRefresh handler', () => {
			const { container } = render(ScrollViewWrapper, { props: { text: 'x' } });

			expect(container.querySelector('.refresh-indicator')).toBeNull();
			expect(container.querySelector('[data-refresh-phase]')).toBeNull();
		});

		it('attaches the gesture once a handler is given', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn() }
			});

			expect(container.querySelector('.scroll-view')).toHaveAttribute(
				'data-refresh-phase',
				'idle'
			);
		});

		it('renders an indicator when refreshable', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn() }
			});

			expect(container.querySelector('.refresh-indicator')).toBeInTheDocument();
		});

		it('keeps the content alongside the indicator', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'Hello', onRefresh: vi.fn() }
			});

			expect(container.querySelector('.scroll-content')).toHaveTextContent('Hello');
		});

		it('keeps the axis and indicator classes when refreshable', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn(), axis: 'both', showsIndicators: false }
			});

			const el = container.querySelector('.scroll-view')!;
			expect(el).toHaveClass('axis-both');
			expect(el).toHaveClass('hide-indicators');
		});

		it('keeps a custom class when refreshable', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn(), class: 'my-scroll' }
			});

			expect(container.querySelector('.scroll-view')).toHaveClass('my-scroll');
		});

		// Both features attach to the same node, so they must not displace one
		// another.
		it('combines with an edge effect', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn(), edgeEffect: 'soft' }
			});

			const el = container.querySelector('.scroll-view') as HTMLElement;
			expect(el).toHaveAttribute('data-refresh-phase', 'idle');
			expect(el.style.maskImage).not.toBe('');
		});

		it('runs the handler on a completed pull', () => {
			const onRefresh = vi.fn();
			const { container } = render(ScrollViewWrapper, { props: { text: 'x', onRefresh } });
			const el = container.querySelector('.scroll-view') as HTMLElement;

			firePointer(el, 'pointerdown', { clientY: 0 });
			firePointer(el, 'pointermove', { clientY: 300 });
			firePointer(el, 'pointerup', { clientY: 300 });

			expect(onRefresh).toHaveBeenCalledTimes(1);
		});

		it('does not run the handler on a short pull', () => {
			const onRefresh = vi.fn();
			const { container } = render(ScrollViewWrapper, { props: { text: 'x', onRefresh } });
			const el = container.querySelector('.scroll-view') as HTMLElement;

			firePointer(el, 'pointerdown', { clientY: 0 });
			firePointer(el, 'pointermove', { clientY: 20 });
			firePointer(el, 'pointerup', { clientY: 20 });

			expect(onRefresh).not.toHaveBeenCalled();
		});

		it('passes a custom threshold through to the gesture', () => {
			const onRefresh = vi.fn();
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh, refreshThreshold: 5 }
			});
			const el = container.querySelector('.scroll-view') as HTMLElement;

			firePointer(el, 'pointerdown', { clientY: 0 });
			firePointer(el, 'pointermove', { clientY: 20 });
			firePointer(el, 'pointerup', { clientY: 20 });

			expect(onRefresh).toHaveBeenCalledTimes(1);
		});

		it('reflects the phase on the container during a pull', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn() }
			});
			const el = container.querySelector('.scroll-view') as HTMLElement;

			firePointer(el, 'pointerdown', { clientY: 0 });
			firePointer(el, 'pointermove', { clientY: 300 });

			expect(el).toHaveAttribute('data-refresh-phase', 'ready');
		});

		// The spinner is decorative; the phase is announced by the app, not by a
		// stray graphic in the reading order.
		it('hides the indicator from assistive technology', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn() }
			});

			expect(container.querySelector('.refresh-indicator')).toHaveAttribute(
				'aria-hidden',
				'true'
			);
		});

		it('clears the gesture state when unmounted', () => {
			const { container, unmount } = render(ScrollViewWrapper, {
				props: { text: 'x', onRefresh: vi.fn() }
			});
			expect(container.querySelector('[data-refresh-phase]')).toBeInTheDocument();

			unmount();

			expect(container.querySelector('[data-refresh-phase]')).toBeNull();
		});
	});

	describe('Custom Props', () => {
		it('should apply a custom class', () => {
			const { container } = render(ScrollViewWrapper, { props: { class: 'my-scroll' } });
			expect(container.querySelector('.scroll-view')).toHaveClass('my-scroll');
		});

		it('should apply a custom class with an edge effect active', () => {
			const { container } = render(ScrollViewWrapper, {
				props: { class: 'my-scroll', edgeEffect: 'soft' }
			});
			expect(container.querySelector('.scroll-view')).toHaveClass('my-scroll');
		});
	});
});
