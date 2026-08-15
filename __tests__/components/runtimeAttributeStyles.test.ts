/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { compile } from 'svelte/compiler';
// ?raw keeps this dependency-free: no node:fs, so no @types/node.
import listRowSource from '../../src/lib/components/list/ListRow.svelte?raw';
import scrollViewSource from '../../src/lib/components/layout/ScrollView.svelte?raw';
import glassSource from '../../src/lib/components/glass/Glass.svelte?raw';
import buttonSource from '../../src/lib/components/interactive/Button.svelte?raw';

/**
 * Svelte comments out CSS selectors it cannot match against the markup:
 *
 *     /* (unused) .swipe-content[data-swipe-state='open'] { ... }
 *
 * Attributes written at runtime by an action are invisible to that analysis,
 * so those rules ship dead -- no error, no failing render, just a transition
 * that silently never runs. Wrapping the attribute in :global() keeps them.
 *
 * Asserting the selector text is *present* would not catch this: the text
 * survives inside the comment. The signals that actually change are the
 * compiler's css_unused_selector warning and the "(unused)" marker.
 */

const SOURCES: Record<string, string> = {
	'ListRow.svelte': listRowSource,
	'ScrollView.svelte': scrollViewSource,
	'Glass.svelte': glassSource,
	'Button.svelte': buttonSource
};

function compileComponent(filename: string) {
	const result = compile(SOURCES[filename] as string, { filename, css: 'external' });
	return {
		css: result.css?.code ?? '',
		unusedSelectors: result.warnings
			.filter((w) => w.code === 'css_unused_selector')
			.map((w) => w.message)
	};
}

const COMPONENTS = Object.keys(SOURCES);

describe('styles driven by runtime attributes', () => {
	// The primary guard. Naming the selectors makes a regression self-describing.
	it.each(COMPONENTS)('%s ships no dead CSS rules', (file) => {
		expect(compileComponent(file).unusedSelectors).toEqual([]);
	});

	it.each(COMPONENTS)('%s emits no "(unused)" markers', (file) => {
		expect(compileComponent(file).css).not.toContain('(unused)');
	});

	// Deletion guards: the rules above can only be "not dead" if they exist.
	describe('the rules themselves', () => {
		it('ListRow translates by --swipe-x and animates each settled state', () => {
			const { css } = compileComponent('ListRow.svelte');
			expect(css).toContain('--swipe-x');
			for (const state of ['closed', 'open', 'fullSwipe']) {
				expect(css).toContain(`[data-swipe-state='${state}']`);
			}
		});

		it('ScrollView offsets content by --refresh-pull and spins while refreshing', () => {
			const { css } = compileComponent('ScrollView.svelte');
			expect(css).toContain('--refresh-pull');
			expect(css).toContain("[data-refresh-phase='refreshing']");
			expect(css).toContain('refresh-spin');
		});

		it('ScrollView honours reduced motion', () => {
			expect(compileComponent('ScrollView.svelte').css).toContain(
				'prefers-reduced-motion'
			);
		});

		it('Glass centres content in a circular surface', () => {
			expect(compileComponent('Glass.svelte').css).toContain(
				"[data-glass-shape='circle']"
			);
		});

		it('Button backs its glass variants with the shared blur token', () => {
			const { css } = compileComponent('Button.svelte');
			expect(css).toContain('is-glass');
			expect(css).toContain('is-tinted');
			expect(css).toContain('--btn-glass-blur');
		});
	});

	// Proves the guard above is wired to the real signal rather than to text that
	// survives inside the "(unused)" comment.
	describe('the guard itself', () => {
		it('fails when :global is dropped from a runtime attribute selector', () => {
			const source = listRowSource.replace(
				/:global\(\[data-swipe-state='(\w+)'\]\)/g,
				"[data-swipe-state='$1']"
			);
			const result = compile(source, { filename: 'ListRow.svelte', css: 'external' });

			const unused = result.warnings.filter((w) => w.code === 'css_unused_selector');
			expect(unused.length).toBeGreaterThan(0);
			expect(result.css?.code).toContain('(unused)');
		});
	});
});
