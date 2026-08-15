import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import NavigationLinkWrapper from '../wrappers/NavigationLinkWrapper.svelte';

describe('NavigationLink Component', () => {
	describe('Rendering', () => {
		it('should render an anchor', () => {
			render(NavigationLinkWrapper, { props: { text: 'About', href: '/about' } });
			const link = screen.getByRole('link', { name: 'About' });
			expect(link.tagName).toBe('A');
			expect(link).toHaveAttribute('href', '/about');
		});

		it('should render its children', () => {
			render(NavigationLinkWrapper, { props: { text: 'Contact' } });
			expect(screen.getByText('Contact')).toBeInTheDocument();
		});

		it('should carry the base class', () => {
			const { container } = render(NavigationLinkWrapper, { props: { href: '/' } });
			expect(container.querySelector('a')).toHaveClass('navigation-link');
		});
	});

	describe('Active state', () => {
		it('should mark the active link with aria-current', () => {
			render(NavigationLinkWrapper, { props: { active: true } });
			expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
		});

		it('should apply the active class when active', () => {
			render(NavigationLinkWrapper, { props: { active: true } });
			expect(screen.getByRole('link')).toHaveClass('active');
		});

		// Assistive tech treats a stray aria-current as "you are here", so an
		// inactive link must omit the attribute entirely rather than set "false".
		it('should omit aria-current when inactive', () => {
			render(NavigationLinkWrapper, { props: { active: false } });
			expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
		});

		it('should be inactive by default', () => {
			render(NavigationLinkWrapper, { props: { href: '/' } });
			const link = screen.getByRole('link');
			expect(link).not.toHaveAttribute('aria-current');
			expect(link).not.toHaveClass('active');
		});
	});

	describe('Custom Props', () => {
		it('should apply a custom class alongside the base class', () => {
			render(NavigationLinkWrapper, { props: { class: 'my-link' } });
			const link = screen.getByRole('link');
			expect(link).toHaveClass('my-link');
			expect(link).toHaveClass('navigation-link');
		});
	});
});
