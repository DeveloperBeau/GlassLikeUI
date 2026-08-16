import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LabelWrapper from '../wrappers/LabelWrapper.svelte';

describe('Label Component', () => {
	describe('Rendering', () => {
		it('renders the title text', () => {
			render(LabelWrapper, { props: { title: 'Favourites' } });

			expect(screen.getByText('Favourites')).toBeInTheDocument();
		});

		it('renders the icon when a systemImage is given', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star' }
			});

			expect(container.querySelector('.label-icon svg')).toBeInTheDocument();
		});

		it('renders no icon element when systemImage is omitted', () => {
			const { container } = render(LabelWrapper, { props: { title: 'Favourites' } });

			expect(container.querySelector('.label-icon')).toBeNull();
		});

		it('tags the element with its style for styling hooks', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'x', labelStyle: 'iconOnly', systemImage: 'star' }
			});

			expect(container.querySelector('.label')).toHaveAttribute('data-label-style', 'iconOnly');
		});

		it('applies a custom class alongside its own', () => {
			const { container } = render(LabelWrapper, { props: { title: 'x', class: 'mine' } });

			const el = container.querySelector('.label');
			expect(el).toHaveClass('label');
			expect(el).toHaveClass('mine');
		});
	});

	describe('Label styles', () => {
		it('shows both icon and title for automatic', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star', labelStyle: 'automatic' }
			});

			expect(container.querySelector('.label-icon')).toBeInTheDocument();
			expect(screen.getByText('Favourites')).toBeVisible();
		});

		it('shows both icon and title for titleAndIcon', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star', labelStyle: 'titleAndIcon' }
			});

			expect(container.querySelector('.label-icon')).toBeInTheDocument();
			expect(container.querySelector('.label-title')).not.toHaveClass('is-hidden');
		});

		it('drops the icon for titleOnly even when a systemImage is given', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star', labelStyle: 'titleOnly' }
			});

			expect(container.querySelector('.label-icon')).toBeNull();
			expect(screen.getByText('Favourites')).toBeInTheDocument();
		});

		it('shows the icon for iconOnly', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star', labelStyle: 'iconOnly' }
			});

			expect(container.querySelector('.label-icon')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		// The reason iconOnly hides rather than removes: an icon-only control must
		// keep an accessible name.
		it('keeps the title in the DOM when iconOnly hides it', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star', labelStyle: 'iconOnly' }
			});

			const title = container.querySelector('.label-title');
			expect(title).toBeInTheDocument();
			expect(title).toHaveTextContent('Favourites');
			expect(title).toHaveClass('is-hidden');
		});

		it('exposes the title as the element text for every style', () => {
			for (const labelStyle of ['automatic', 'titleAndIcon', 'iconOnly', 'titleOnly'] as const) {
				const { container } = render(LabelWrapper, {
					props: { title: 'Favourites', systemImage: 'star', labelStyle }
				});

				expect(container.querySelector('.label')).toHaveTextContent('Favourites');
			}
		});

		// The icon duplicates the title; announcing both reads it twice.
		it('hides the decorative icon from assistive technology', () => {
			const { container } = render(LabelWrapper, {
				props: { title: 'Favourites', systemImage: 'star' }
			});

			expect(container.querySelector('.label-icon')).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Sizes', () => {
		it.each(['sm', 'md', 'lg'] as const)('applies the %s size class', (size) => {
			const { container } = render(LabelWrapper, { props: { title: 'x', size } });

			expect(container.querySelector('.label')).toHaveClass(`size-${size}`);
		});

		it('defaults to md', () => {
			const { container } = render(LabelWrapper, { props: { title: 'x' } });

			expect(container.querySelector('.label')).toHaveClass('size-md');
		});
	});

	describe('Edge cases', () => {
		it('renders an empty title without crashing', () => {
			const { container } = render(LabelWrapper, { props: { title: '', systemImage: 'star' } });

			expect(container.querySelector('.label')).toBeInTheDocument();
			expect(container.querySelector('.label-title')).toHaveTextContent('');
		});

		it('escapes markup in the title rather than rendering it', () => {
			const { container } = render(LabelWrapper, {
				props: { title: '<img src=x onerror=alert(1)>' }
			});

			expect(container.querySelector('.label-title img')).toBeNull();
			expect(container.querySelector('.label-title')).toHaveTextContent(
				'<img src=x onerror=alert(1)>'
			);
		});
	});
});
