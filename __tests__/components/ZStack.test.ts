import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ZStackWrapper from '../wrappers/ZStackWrapper.svelte';

describe('ZStack Component', () => {
	describe('Rendering', () => {
		it('should render a div with zstack class', () => {
			const { container } = render(ZStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.zstack');
			expect(element).toBeInTheDocument();
		});

		it('should render children content', () => {
			const { container } = render(ZStackWrapper, {
				props: { content: 'ZStack Content' }
			});

			expect(container.textContent).toContain('ZStack Content');
		});
	});

	describe('Alignment', () => {
		const alignments = [
			{ name: 'topLeading' as const, justify: 'flex-start', align: 'flex-start' },
			{ name: 'top' as const, justify: 'center', align: 'flex-start' },
			{ name: 'topTrailing' as const, justify: 'flex-end', align: 'flex-start' },
			{ name: 'leading' as const, justify: 'flex-start', align: 'center' },
			{ name: 'center' as const, justify: 'center', align: 'center' },
			{ name: 'trailing' as const, justify: 'flex-end', align: 'center' },
			{ name: 'bottomLeading' as const, justify: 'flex-start', align: 'flex-end' },
			{ name: 'bottom' as const, justify: 'center', align: 'flex-end' },
			{ name: 'bottomTrailing' as const, justify: 'flex-end', align: 'flex-end' }
		];

		it.each(alignments)('should apply $name alignment', ({ name, justify, align }) => {
			const { container } = render(ZStackWrapper, {
				props: { content: 'Content', alignment: name }
			});

			const element = container.querySelector('.zstack');
			const style = element?.getAttribute('style');
			expect(style).toContain(`--zstack-justify: ${justify}`);
			expect(style).toContain(`--zstack-align: ${align}`);
		});

		it('should default to center alignment', () => {
			const { container } = render(ZStackWrapper, {
				props: { content: 'Content' }
			});

			const element = container.querySelector('.zstack');
			const style = element?.getAttribute('style');
			expect(style).toContain('--zstack-justify: center');
			expect(style).toContain('--zstack-align: center');
		});
	});

	describe('Custom Props', () => {
		it('should apply custom class', () => {
			const { container } = render(ZStackWrapper, {
				props: { content: 'Content', class: 'custom-zstack' }
			});

			const element = container.querySelector('.zstack');
			expect(element).toHaveClass('custom-zstack');
		});
	});
});
