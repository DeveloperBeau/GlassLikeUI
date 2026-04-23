import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SheetWrapper from '../wrappers/SheetWrapper.svelte';

describe('Sheet', () => {
	describe('Rendering', () => {
		it('renders sheet container when open', () => {
			const { container } = render(SheetWrapper, { props: { isOpen: true } });
			expect(container.querySelector('.sheet-container')).toBeInTheDocument();
		});

		it('does not render when closed', () => {
			const { container } = render(SheetWrapper, { props: { isOpen: false } });
			expect(container.querySelector('.sheet-container')).not.toBeInTheDocument();
		});

		it('renders slotted content', () => {
			const { container } = render(SheetWrapper, {
				props: { isOpen: true, content: 'Hello sheet' }
			});
			expect(container.textContent).toContain('Hello sheet');
		});

		it('renders backdrop when open', () => {
			const { container } = render(SheetWrapper, { props: { isOpen: true } });
			expect(container.querySelector('.sheet-backdrop')).toBeInTheDocument();
		});
	});

	describe('Handle', () => {
		it('renders handle by default', () => {
			const { container } = render(SheetWrapper, { props: { isOpen: true } });
			expect(container.querySelector('.sheet-handle')).toBeInTheDocument();
		});

		it('hides handle when showHandle=false', () => {
			const { container } = render(SheetWrapper, { props: { isOpen: true, showHandle: false } });
			expect(container.querySelector('.sheet-handle')).not.toBeInTheDocument();
		});
	});

	describe('Title', () => {
		it('does not render header when no title', () => {
			const { container } = render(SheetWrapper, { props: { isOpen: true } });
			expect(container.querySelector('.sheet-header')).not.toBeInTheDocument();
		});

		it('renders title in header', () => {
			const { container } = render(SheetWrapper, {
				props: { isOpen: true, title: 'My Sheet' }
			});
			const header = container.querySelector('.sheet-header');
			expect(header).toBeInTheDocument();
			expect(header?.textContent).toContain('My Sheet');
		});

		it('renders close button when title is present', () => {
			const { container } = render(SheetWrapper, {
				props: { isOpen: true, title: 'Sheet' }
			});
			expect(container.querySelector('.sheet-close-btn')).toBeInTheDocument();
		});
	});

	describe('Detents', () => {
		it('accepts a single detent', () => {
			const { container } = render(SheetWrapper, {
				props: { isOpen: true, detents: ['medium'], initialDetent: 'medium' }
			});
			expect(container.querySelector('.sheet-container')).toBeInTheDocument();
		});

		it('accepts small, medium, large, fullscreen', () => {
			const { container } = render(SheetWrapper, {
				props: {
					isOpen: true,
					detents: ['small', 'medium', 'large', 'fullscreen'],
					initialDetent: 'large'
				}
			});
			expect(container.querySelector('.sheet-container')).toBeInTheDocument();
		});

		it('handle is cursor: grab when draggable', () => {
			const { container } = render(SheetWrapper, {
				props: { isOpen: true, draggable: true }
			});
			expect(container.querySelector('.sheet-handle-container')).toBeInTheDocument();
		});
	});

	describe('Custom class', () => {
		it('appends custom class on container', () => {
			const { container } = render(SheetWrapper, {
				props: { isOpen: true, class: 'my-sheet' }
			});
			expect(container.querySelector('.sheet-container')).toHaveClass('my-sheet');
		});
	});
});
