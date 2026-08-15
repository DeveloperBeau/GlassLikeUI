import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ListRowWrapper from '../wrappers/ListRowWrapper.svelte';

describe('ListRow Component', () => {
	describe('Element selection', () => {
		it('should render a div by default', () => {
			const { container } = render(ListRowWrapper, { props: { text: 'Plain' } });
			expect(container.querySelector('div.list-row')).toBeInTheDocument();
		});

		it('should render an anchor when href is provided', () => {
			render(ListRowWrapper, { props: { href: '/settings' } });
			const link = screen.getByRole('link');
			expect(link.tagName).toBe('A');
			expect(link).toHaveAttribute('href', '/settings');
		});

		it('should render a button when onclick is provided', () => {
			render(ListRowWrapper, { props: { onclick: vi.fn() } });
			const button = screen.getByRole('button');
			expect(button.tagName).toBe('BUTTON');
			expect(button).toHaveAttribute('type', 'button');
		});

		it('should prefer the anchor when both href and onclick are provided', () => {
			render(ListRowWrapper, { props: { href: '/x', onclick: vi.fn() } });
			expect(screen.getByRole('link')).toBeInTheDocument();
			expect(screen.queryByRole('button')).not.toBeInTheDocument();
		});

		it('should not render an interactive element for a plain row', () => {
			render(ListRowWrapper, { props: { text: 'Plain' } });
			expect(screen.queryByRole('link')).not.toBeInTheDocument();
			expect(screen.queryByRole('button')).not.toBeInTheDocument();
		});
	});

	describe('Content', () => {
		it('should render the title', () => {
			render(ListRowWrapper, { props: { text: 'Wi-Fi' } });
			expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
		});

		it('should render a subtitle when provided', () => {
			const { container } = render(ListRowWrapper, { props: { subtitle: 'Connected' } });
			expect(container.querySelector('.row-subtitle')).toHaveTextContent('Connected');
		});

		it('should not render a subtitle element when omitted', () => {
			const { container } = render(ListRowWrapper, { props: { text: 'No sub' } });
			expect(container.querySelector('.row-subtitle')).toBeNull();
		});

		it('should not render a subtitle element for an empty subtitle', () => {
			const { container } = render(ListRowWrapper, { props: { subtitle: '' } });
			expect(container.querySelector('.row-subtitle')).toBeNull();
		});

		it('should render a leading slot when provided', () => {
			render(ListRowWrapper, { props: { withLeading: true } });
			expect(screen.getByTestId('leading')).toBeInTheDocument();
		});

		it('should not render a leading container when omitted', () => {
			const { container } = render(ListRowWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.row-leading')).toBeNull();
		});

		it('should render a trailing slot when provided', () => {
			render(ListRowWrapper, { props: { withTrailing: true } });
			expect(screen.getByTestId('trailing')).toBeInTheDocument();
		});
	});

	describe('Interactivity', () => {
		it('should mark an href row as interactive', () => {
			expect(
				render(ListRowWrapper, { props: { href: '/x' } }).container.querySelector('.list-row')
			).toHaveClass('interactive');
		});

		it('should mark an onclick row as interactive', () => {
			expect(
				render(ListRowWrapper, { props: { onclick: vi.fn() } }).container.querySelector(
					'.list-row'
				)
			).toHaveClass('interactive');
		});

		it('should not mark a plain row as interactive', () => {
			expect(
				render(ListRowWrapper, { props: { text: 'x' } }).container.querySelector('.list-row')
			).not.toHaveClass('interactive');
		});

		it('should call onclick when the row is clicked', async () => {
			const onclick = vi.fn();
			render(ListRowWrapper, { props: { onclick } });
			await fireEvent.click(screen.getByRole('button'));
			expect(onclick).toHaveBeenCalledTimes(1);
		});

		// The chevron is an affordance: it must appear only when the row leads
		// somewhere and only when nothing else occupies the trailing slot.
		it('should show a chevron on an interactive row with no trailing slot', () => {
			const { container } = render(ListRowWrapper, { props: { href: '/x' } });
			expect(container.querySelector('.row-trailing')).toBeNull();
			expect(container.querySelector('svg.symbol-image')).toBeInTheDocument();
		});

		it('should not show a chevron when a trailing slot is supplied', () => {
			const { container } = render(ListRowWrapper, {
				props: { href: '/x', withTrailing: true }
			});
			expect(screen.getByTestId('trailing')).toBeInTheDocument();
			expect(container.querySelector('svg.symbol-image')).toBeNull();
		});

		it('should not show a chevron on a plain row', () => {
			const { container } = render(ListRowWrapper, { props: { text: 'x' } });
			expect(container.querySelector('svg.symbol-image')).toBeNull();
		});

		it('should mark a row interactive when explicitly flagged', () => {
			expect(
				render(ListRowWrapper, { props: { interactive: true } }).container.querySelector(
					'.list-row'
				)
			).toHaveClass('interactive');
		});
	});

	describe('Divider', () => {
		it('should show a divider by default', () => {
			expect(
				render(ListRowWrapper, { props: { text: 'x' } }).container.querySelector('.list-row')
			).toHaveClass('has-divider');
		});

		it('should hide the divider when showDivider is false', () => {
			expect(
				render(ListRowWrapper, { props: { showDivider: false } }).container.querySelector(
					'.list-row'
				)
			).not.toHaveClass('has-divider');
		});

		it.each([
			['anchor', { href: '/x' }],
			['button', { onclick: vi.fn() }]
		])('should honour showDivider on the %s variant', (_label, props) => {
			expect(
				render(ListRowWrapper, {
					props: { ...props, showDivider: false }
				}).container.querySelector('.list-row')
			).not.toHaveClass('has-divider');
		});
	});

	// The three element variants (div / anchor / button) each re-declare the
	// slot markup, so every slot must be proven on every variant.
	describe('slot rendering across all variants', () => {
		const variants = [
			['plain', {}],
			['anchor', { href: '/x' }],
			['button', { onclick: () => {} }]
		] as const;

		it.each(variants)('renders the title on the %s variant', (_label, props) => {
			const { container } = render(ListRowWrapper, {
				props: { ...props, text: 'The Title' }
			});
			expect(container.querySelector('.row-title')).toHaveTextContent('The Title');
		});

		it.each(variants)('renders a subtitle on the %s variant', (_label, props) => {
			const { container } = render(ListRowWrapper, {
				props: { ...props, subtitle: 'The Subtitle' }
			});
			expect(container.querySelector('.row-subtitle')).toHaveTextContent('The Subtitle');
		});

		it.each(variants)('omits the subtitle on the %s variant when absent', (_label, props) => {
			const { container } = render(ListRowWrapper, { props: { ...props } });
			expect(container.querySelector('.row-subtitle')).toBeNull();
		});

		it.each(variants)('renders a leading slot on the %s variant', (_label, props) => {
			render(ListRowWrapper, { props: { ...props, withLeading: true } });
			expect(screen.getByTestId('leading')).toBeInTheDocument();
		});

		it.each(variants)('omits the leading container on the %s variant', (_label, props) => {
			const { container } = render(ListRowWrapper, { props: { ...props } });
			expect(container.querySelector('.row-leading')).toBeNull();
		});

		it.each(variants)('renders a trailing slot on the %s variant', (_label, props) => {
			render(ListRowWrapper, { props: { ...props, withTrailing: true } });
			expect(screen.getByTestId('trailing')).toBeInTheDocument();
		});

		it.each(variants)('renders every slot together on the %s variant', (_label, props) => {
			const { container } = render(ListRowWrapper, {
				props: { ...props, subtitle: 'Sub', withLeading: true, withTrailing: true }
			});
			expect(screen.getByTestId('leading')).toBeInTheDocument();
			expect(screen.getByTestId('trailing')).toBeInTheDocument();
			expect(container.querySelector('.row-subtitle')).toHaveTextContent('Sub');
		});
	});

	describe('Swipe actions', () => {
		const variants: [string, Record<string, unknown>][] = [
			['plain', {}],
			['anchor', { href: '/x' }],
			['button', { onclick: vi.fn() }]
		];

		// Regression guard: rows without swipe actions must keep the exact markup
		// they had before the feature existed.
		it('adds no swipe wrapper when no actions are given', () => {
			const { container } = render(ListRowWrapper, { props: { text: 'Title' } });

			expect(container.querySelector('.swipe-row')).toBeNull();
			expect(container.querySelector('.swipe-actions')).toBeNull();
			expect(container.querySelector('.list-row')).toBeInTheDocument();
		});

		it('wraps the row once actions are given', () => {
			const { container } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true }
			});

			expect(container.querySelector('.swipe-row')).toBeInTheDocument();
			expect(container.querySelector('.swipe-row .list-row')).toBeInTheDocument();
		});

		it('renders the action strip content', () => {
			render(ListRowWrapper, { props: { text: 'Title', withSwipeActions: true } });

			expect(screen.getByTestId('swipe-delete')).toBeInTheDocument();
		});

		it('places the strip inside the swipe wrapper, not the row', () => {
			const { container } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true }
			});

			expect(container.querySelector('.swipe-row > .swipe-actions')).toBeInTheDocument();
			expect(container.querySelector('.list-row .swipe-actions')).toBeNull();
		});

		it('defaults to the trailing edge', () => {
			const { container } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true }
			});

			expect(container.querySelector('.swipe-actions')).toHaveAttribute(
				'data-swipe-edge',
				'trailing'
			);
		});

		it('honours the leading edge', () => {
			const { container } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true, swipeEdge: 'leading' }
			});

			expect(container.querySelector('.swipe-actions')).toHaveAttribute(
				'data-swipe-edge',
				'leading'
			);
		});

		// data-swipe-state is written by the action on attach, so its presence is
		// proof the gesture is wired to the moving element rather than the wrapper.
		it('attaches the gesture to the sliding content', () => {
			const { container } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true }
			});

			const content = container.querySelector('.swipe-content');
			expect(content).toBeInTheDocument();
			expect(content).toHaveAttribute('data-swipe-state', 'closed');
			expect(container.querySelector('.swipe-content .list-row')).toBeInTheDocument();
		});

		it('does not attach the gesture when there are no actions', () => {
			const { container } = render(ListRowWrapper, { props: { text: 'Title' } });

			expect(container.querySelector('[data-swipe-state]')).toBeNull();
		});

		it.each(variants)('supports swipe actions on the %s variant', (_label, props) => {
			const { container } = render(ListRowWrapper, {
				props: { ...props, text: 'Title', withSwipeActions: true }
			});

			expect(container.querySelector('.swipe-content')).toHaveAttribute(
				'data-swipe-state',
				'closed'
			);
			expect(screen.getByTestId('swipe-delete')).toBeInTheDocument();
		});

		it('keeps the anchor navigable while swipeable', () => {
			render(ListRowWrapper, { props: { text: 'Title', href: '/x', withSwipeActions: true } });

			expect(screen.getByRole('link')).toHaveAttribute('href', '/x');
		});

		it('keeps the row click handler working while swipeable', async () => {
			const onclick = vi.fn();
			render(ListRowWrapper, { props: { text: 'Title', onclick, withSwipeActions: true } });

			await fireEvent.click(screen.getByRole('button', { name: 'Title' }));

			expect(onclick).toHaveBeenCalledTimes(1);
		});

		it('keeps the other slots working while swipeable', () => {
			const { container } = render(ListRowWrapper, {
				props: {
					text: 'Title',
					subtitle: 'Sub',
					withLeading: true,
					withTrailing: true,
					withSwipeActions: true
				}
			});

			expect(screen.getByTestId('leading')).toBeInTheDocument();
			expect(screen.getByTestId('trailing')).toBeInTheDocument();
			expect(container.querySelector('.row-subtitle')).toHaveTextContent('Sub');
		});

		// The strip sits behind the row; exposing it to the reading order would
		// announce actions the user has not revealed.
		it('hides the unrevealed strip from assistive technology', () => {
			const { container } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true }
			});

			expect(container.querySelector('.swipe-actions')).toHaveAttribute('aria-hidden', 'true');
		});

		it('removes the gesture state when unmounted', () => {
			const { container, unmount } = render(ListRowWrapper, {
				props: { text: 'Title', withSwipeActions: true }
			});
			expect(container.querySelector('.swipe-content')).toBeInTheDocument();

			unmount();

			expect(container.querySelector('[data-swipe-state]')).toBeNull();
		});
	});

	describe('Custom Props', () => {
		it.each([
			['plain', {}],
			['anchor', { href: '/x' }],
			['button', { onclick: vi.fn() }]
		])('should apply a custom class on the %s variant', (_label, props) => {
			expect(
				render(ListRowWrapper, {
					props: { ...props, class: 'my-row' }
				}).container.querySelector('.list-row')
			).toHaveClass('my-row');
		});
	});
});
