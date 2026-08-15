import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import GlassSectionWrapper from '../wrappers/GlassSectionWrapper.svelte';

describe('GlassSection Component', () => {
	describe('Rendering', () => {
		it('should render a section element', () => {
			const { container } = render(GlassSectionWrapper, { props: { text: 'x' } });
			expect(container.querySelector('section.glass-section')).toBeInTheDocument();
		});

		it('should render its children', () => {
			render(GlassSectionWrapper, { props: { text: 'Section body' } });
			expect(screen.getByText('Section body')).toBeInTheDocument();
		});

		it('should wrap children in glass', () => {
			const { container } = render(GlassSectionWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.glass-content')).toBeInTheDocument();
		});
	});

	describe('Header', () => {
		it('should render the title as a level-2 heading', () => {
			render(GlassSectionWrapper, { props: { title: 'Features' } });
			const heading = screen.getByRole('heading', { level: 2 });
			expect(heading).toHaveTextContent('Features');
		});

		it('should render the subtitle', () => {
			const { container } = render(GlassSectionWrapper, { props: { subtitle: 'Why it works' } });
			expect(container.querySelector('.section-subtitle')).toHaveTextContent('Why it works');
		});

		it('should render a header when only a title is given', () => {
			const { container } = render(GlassSectionWrapper, { props: { title: 'Only title' } });
			expect(container.querySelector('.section-header')).toBeInTheDocument();
			expect(container.querySelector('.section-subtitle')).toBeNull();
		});

		it('should render a header when only a subtitle is given', () => {
			const { container } = render(GlassSectionWrapper, { props: { subtitle: 'Only sub' } });
			expect(container.querySelector('.section-header')).toBeInTheDocument();
			expect(container.querySelector('.section-title')).toBeNull();
		});

		// An empty header block would add stray vertical rhythm above the content.
		it('should not render a header when neither is given', () => {
			const { container } = render(GlassSectionWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.section-header')).toBeNull();
		});

		it('should not render a header for empty strings', () => {
			const { container } = render(GlassSectionWrapper, {
				props: { title: '', subtitle: '' }
			});
			expect(container.querySelector('.section-header')).toBeNull();
		});
	});

	describe('Full width', () => {
		it('should not be full width by default', () => {
			const { container } = render(GlassSectionWrapper, { props: { text: 'x' } });
			expect(container.querySelector('.glass-section')).not.toHaveClass('full-width');
		});

		it('should apply the full-width class when requested', () => {
			const { container } = render(GlassSectionWrapper, { props: { fullWidth: true } });
			expect(container.querySelector('.glass-section')).toHaveClass('full-width');
		});
	});

	describe('Custom Props', () => {
		it('should apply a custom class', () => {
			const { container } = render(GlassSectionWrapper, { props: { class: 'my-section' } });
			expect(container.querySelector('.glass-section')).toHaveClass('my-section');
		});
	});
});
