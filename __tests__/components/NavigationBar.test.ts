import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import NavigationBarWrapper from '../wrappers/NavigationBarWrapper.svelte';

describe('NavigationBar', () => {
	describe('Compact mode (default)', () => {
		it('renders a single header element', () => {
			const { container } = render(NavigationBarWrapper, { props: { title: 'Home' } });
			expect(container.querySelector('header.navigation-bar')).toBeInTheDocument();
		});

		it('renders title in compact slot', () => {
			const { container } = render(NavigationBarWrapper, { props: { title: 'Home' } });
			const titleEl = container.querySelector('.nav-title-compact');
			expect(titleEl).toBeInTheDocument();
			expect(titleEl?.textContent).toContain('Home');
		});

		it('does not render large title wrapper', () => {
			const { container } = render(NavigationBarWrapper, { props: { title: 'Home' } });
			expect(container.querySelector('.nav-large')).not.toBeInTheDocument();
		});

		it('omits title element when title is empty', () => {
			const { container } = render(NavigationBarWrapper);
			expect(container.querySelector('.nav-title-compact')).not.toBeInTheDocument();
		});
	});

	describe('Transparent', () => {
		it('applies transparent class when transparent=true', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', transparent: true }
			});
			expect(container.querySelector('.navigation-bar')).toHaveClass('transparent');
		});

		it('applies scrolled class when scrolled=true', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', scrolled: true }
			});
			expect(container.querySelector('.navigation-bar')).toHaveClass('scrolled');
		});
	});

	describe('Large title mode', () => {
		it('renders both inline and large title blocks', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'Large Title', largeTitle: true }
			});
			expect(container.querySelector('.nav-large')).toBeInTheDocument();
			expect(container.querySelector('.nav-large-title')).toBeInTheDocument();
			expect(container.querySelector('.nav-title-compact')).toBeInTheDocument();
		});

		it('renders large title text', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'Photos', largeTitle: true }
			});
			expect(container.querySelector('.nav-large-title')?.textContent).toContain('Photos');
		});

		it('includes sentinel element for intersection observing', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', largeTitle: true }
			});
			expect(container.querySelector('.nav-title-sentinel')).toBeInTheDocument();
		});

		it('sentinel is aria-hidden', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', largeTitle: true }
			});
			expect(container.querySelector('.nav-title-sentinel')).toHaveAttribute('aria-hidden', 'true');
		});

		it('does not start collapsed', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', largeTitle: true }
			});
			expect(container.querySelector('.nav-large')).not.toHaveClass('is-collapsed');
		});
	});

	describe('Leading and trailing snippets', () => {
		it('renders leading content when provided', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', leadingText: 'Back' }
			});
			expect(container.querySelector('.leading')?.textContent).toBe('Back');
		});

		it('renders trailing content when provided', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', trailingText: 'Edit' }
			});
			expect(container.querySelector('.trailing')?.textContent).toBe('Edit');
		});
	});

	describe('Custom class', () => {
		it('appends custom class in compact mode', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', class: 'my-nav' }
			});
			expect(container.querySelector('.navigation-bar')).toHaveClass('my-nav');
		});

		it('appends custom class on large-title wrapper', () => {
			const { container } = render(NavigationBarWrapper, {
				props: { title: 'x', largeTitle: true, class: 'my-nav' }
			});
			expect(container.querySelector('.nav-large')).toHaveClass('my-nav');
		});
	});
});
