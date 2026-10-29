/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { compile } from 'svelte/compiler';
import buttonSource from '../../src/lib/components/interactive/Button.svelte?raw';
import listRowSource from '../../src/lib/components/list/ListRow.svelte?raw';
import hStackSource from '../../src/lib/components/layout/HStack.svelte?raw';

/**
 * Two cascade bugs jsdom cannot see, because it neither paints nor resolves
 * specificity across components. Both are asserted on the compiled CSS instead:
 *
 * 1. A glass button's frost layer (::before) was a positioned z-index 0 box,
 *    which paints above the button's unpositioned label - washing the text out.
 * 2. ListRow inset its content with `.row-content`, but HStack's own scoped
 *    `.hstack.svelte-x { padding }` has higher specificity and reset it to 0.
 */

interface Rule {
	selector: string;
	body: string;
}

function rules(source: string, filename: string): Rule[] {
	const css = compile(source, { filename, css: 'external' }).css?.code ?? '';
	return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
		selector: (m[1] ?? '').trim(),
		body: m[2] ?? ''
	}));
}

function declaration(body: string, property: string): string | undefined {
	return new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+)`).exec(body)?.[1]?.trim();
}

/** [ids, classes/attributes/pseudo-classes, types/pseudo-elements] for a simple compound selector chain. */
function specificity(selector: string): [number, number, number] {
	const withoutPseudoElements = selector.replace(/::[\w-]+/g, ' ');
	const ids = (withoutPseudoElements.match(/#[\w-]+/g) ?? []).length;
	const classes = (withoutPseudoElements.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
	const types =
		(withoutPseudoElements.match(/(?:^|[\s>+~])[a-z][\w-]*/gi) ?? []).length +
		(selector.match(/::[\w-]+/g) ?? []).length;
	return [ids, classes, types];
}

const beats = (a: [number, number, number], b: [number, number, number]) =>
	a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] > b[2];

const zIndex = (rule: Rule | undefined) => Number(declaration(rule?.body ?? '', 'z-index') ?? 0);

describe('specificity helper', () => {
	it.each([
		['.a', [0, 1, 0]],
		['.a.b', [0, 2, 0]],
		['.a.svelte-x .b', [0, 3, 0]],
		['.a::before', [0, 1, 1]],
		['.a:hover', [0, 2, 0]],
		['#id .a', [1, 1, 0]],
		["div[data-x='y']", [0, 1, 1]]
	] as const)('scores %s as %j', (selector, expected) => {
		expect(specificity(selector)).toEqual(expected);
	});

	it('orders by ids, then classes, then types', () => {
		expect(beats([1, 0, 0], [0, 9, 9])).toBe(true);
		expect(beats([0, 3, 0], [0, 2, 5])).toBe(true);
		expect(beats([0, 2, 0], [0, 2, 0])).toBe(false);
		expect(beats([0, 2, 1], [0, 2, 0])).toBe(true);
	});

	// FALSE NEGATIVE / FALSE POSITIVE validation: adding a class always raises
	// the score, and never lowers it.
	it('scores one more class strictly higher', () => {
		fc.assert(
			fc.property(fc.array(fc.stringMatching(/^[a-z][a-z0-9-]{0,8}$/), { minLength: 1, maxLength: 5 }), (names) => {
				const base = names.map((n) => `.${n}`).join('');
				expect(beats(specificity(`${base}.extra`), specificity(base))).toBe(true);
				expect(beats(specificity(base), specificity(`${base}.extra`))).toBe(false);
			}),
			{ numRuns: 200 }
		);
	});
});

describe('Button glass layering', () => {
	const css = rules(buttonSource, 'Button.svelte');
	const find = (pattern: RegExp) => css.find((r) => pattern.test(r.selector));
	const surface = find(/\.is-glass(\.[\w-]+)?$/);
	const frost = find(/\.is-glass[^\s]*::before$/);
	const rim = find(/\.is-glass[^\s]*::after$/);

	it('has the three glass rules', () => {
		expect(surface).toBeDefined();
		expect(frost).toBeDefined();
		expect(rim).toBeDefined();
	});

	// isolate makes the button its own stacking context, so a negative z-index
	// sits above the page and only below the button's own content.
	it('isolates the button so its layers cannot escape behind the page', () => {
		expect(declaration(surface!.body, 'isolation')).toBe('isolate');
	});

	it('paints the frost behind the label', () => {
		expect(zIndex(frost)).toBeLessThan(0);
	});

	it('paints the rim behind the label', () => {
		expect(zIndex(rim)).toBeLessThan(0);
	});

	it('keeps the rim above the frost', () => {
		expect(zIndex(rim)).toBeGreaterThanOrEqual(zIndex(frost));
	});

	it('still positions both layers to cover the button', () => {
		for (const layer of [frost, rim]) {
			expect(declaration(layer!.body, 'position')).toBe('absolute');
			expect(declaration(layer!.body, 'inset')).toBe('0');
			expect(declaration(layer!.body, 'pointer-events')).toBe('none');
		}
	});
});

describe('ListRow inset', () => {
	const rowCss = rules(listRowSource, 'ListRow.svelte');
	const stackCss = rules(hStackSource, 'HStack.svelte');
	const rowInset = rowCss.find((r) => /\.row-content$/.test(r.selector));
	const stackPadding = stackCss.find((r) => /^\.hstack\.svelte-[\w-]+$/.test(r.selector));

	it('declares an inset for the row content', () => {
		expect(declaration(rowInset!.body, 'padding')).toBe('var(--spacing-sm) var(--spacing-md)');
	});

	it('HStack resets its own padding (the rule the inset has to beat)', () => {
		expect(declaration(stackPadding!.body, 'padding')).toBe('var(--hstack-padding)');
	});

	// Equal specificity would leave the winner to stylesheet order, which differs
	// between dev, SSR and bundled builds.
	it('outranks HStack outright rather than relying on stylesheet order', () => {
		expect(beats(specificity(rowInset!.selector), specificity(stackPadding!.selector))).toBe(true);
	});

	it('keeps the 44pt minimum touch target', () => {
		expect(declaration(rowInset!.body, 'min-height')).toBe('44px');
	});
});
