import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
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

	describe('Dismissal', () => {
		afterEach(() => {
			document.body.style.overflow = '';
		});

		it('closes on Escape', async () => {
			const onClose = vi.fn();
			const { container } = render(SheetWrapper, { props: { isOpen: true, onClose } });

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onClose).toHaveBeenCalledTimes(1);
			expect(container.querySelector('.sheet-container')).toBeNull();
		});

		it('ignores other keys', async () => {
			const onClose = vi.fn();
			const { container } = render(SheetWrapper, { props: { isOpen: true, onClose } });

			await fireEvent.keyDown(window, { key: 'Enter' });
			await fireEvent.keyDown(window, { key: 'a' });

			expect(onClose).not.toHaveBeenCalled();
			expect(container.querySelector('.sheet-container')).toBeInTheDocument();
		});

		it('closes when the backdrop itself is clicked', async () => {
			const onClose = vi.fn();
			const { container } = render(SheetWrapper, { props: { isOpen: true, onClose } });

			await fireEvent.click(container.querySelector('.sheet-backdrop')!);

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		// Clicks bubble from the sheet body to the backdrop; only a click that
		// originated on the backdrop should dismiss.
		it('stays open when the sheet body is clicked', async () => {
			const onClose = vi.fn();
			const { container } = render(SheetWrapper, { props: { isOpen: true, onClose } });

			await fireEvent.click(container.querySelector('.sheet-container')!);

			expect(onClose).not.toHaveBeenCalled();
			expect(container.querySelector('.sheet-container')).toBeInTheDocument();
		});

		it('closes on Escape pressed while the backdrop has focus', async () => {
			const onClose = vi.fn();
			const { container } = render(SheetWrapper, { props: { isOpen: true, onClose } });

			await fireEvent.keyDown(container.querySelector('.sheet-backdrop')!, { key: 'Escape' });

			expect(onClose).toHaveBeenCalled();
		});

		it('closes via the header close button', async () => {
			const onClose = vi.fn();
			render(SheetWrapper, { props: { isOpen: true, title: 'Options', onClose } });

			await fireEvent.click(screen.getByRole('button', { name: /close/i }));

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('does not require an onClose handler', async () => {
			const { container } = render(SheetWrapper, { props: { isOpen: true } });
			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(container.querySelector('.sheet-container')).toBeNull();
		});

		it('does nothing on Escape when already closed', async () => {
			const onClose = vi.fn();
			render(SheetWrapper, { props: { isOpen: false, onClose } });
			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('Body scroll lock', () => {
		afterEach(() => {
			document.body.style.overflow = '';
		});

		it('locks body scrolling while open', () => {
			render(SheetWrapper, { props: { isOpen: true } });
			expect(document.body.style.overflow).toBe('hidden');
		});

		it('leaves body scrolling alone while closed', () => {
			render(SheetWrapper, { props: { isOpen: false } });
			expect(document.body.style.overflow).toBe('');
		});

		it('restores body scrolling when dismissed', async () => {
			render(SheetWrapper, { props: { isOpen: true } });
			expect(document.body.style.overflow).toBe('hidden');

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(document.body.style.overflow).toBe('');
		});

		it('restores body scrolling when unmounted while still open', () => {
			const { unmount } = render(SheetWrapper, { props: { isOpen: true } });
			expect(document.body.style.overflow).toBe('hidden');

			unmount();

			expect(document.body.style.overflow).toBe('');
		});
	});
});
