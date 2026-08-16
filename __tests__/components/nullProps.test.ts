import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import type { Component } from 'svelte';
import AnyComponentWrapper from '../wrappers/AnyComponentWrapper.svelte';
import {
	Badge,
	Divider,
	GlassCard,
	GlassDimLayer,
	GlassEffectContainer,
	GlassMorph,
	GlassSection,
	Grid,
	HStack,
	IconButton,
	List,
	MenuItem,
	NavigationLink,
	ScrollView,
	SymbolImage,
	Text,
	VStack,
	ZStack
} from '$lib';

/**
 * Svelte compiles every `{value}` interpolation to `${value ?? ''}` so a nullish
 * prop renders as nothing rather than the literal text "null". A TypeScript
 * default only applies to `undefined`, so a JavaScript caller passing `null`
 * reaches that guard directly.
 *
 * Each case below hands the component `null` for its optional props and asserts
 * nothing nullish leaks into the markup.
 */
/** Each component has its own prop type; the wrapper takes them structurally. */
type AnyComponent = Component<Record<string, unknown>>;

const CASES: [string, unknown, Record<string, unknown>][] = [
	['Badge', Badge, { label: null, variant: null, size: null, class: null }],
	['Divider', Divider, { orientation: null, class: null }],
	['GlassCard', GlassCard, { variant: null, intensity: null, padding: null, class: null }],
	['GlassDimLayer', GlassDimLayer, { class: null }],
	['GlassEffectContainer', GlassEffectContainer, { spacing: null, class: null }],
	['GlassMorph', GlassMorph, { class: null }],
	[
		'GlassSection',
		GlassSection,
		{ title: null, subtitle: null, variant: null, intensity: null, class: null }
	],
	// `columns` is numeric; null there is a type error with no sensible fallback,
	// so only the string props are exercised.
	['Grid', Grid, { spacing: null, minColumnWidth: null, class: null }],
	[
		'HStack',
		HStack,
		{ spacing: null, alignment: null, justify: null, padding: null, class: null }
	],
	['IconButton', IconButton, { icon: null, size: null, variant: null, class: null }],
	['List', List, { style: null, class: null }],
	['MenuItem', MenuItem, { icon: null, href: null, class: null }],
	['NavigationLink', NavigationLink, { href: '/x', class: null }],
	['ScrollView', ScrollView, { axis: null, edgeSize: null, edges: null, class: null }],
	['SymbolImage', SymbolImage, { name: 'star', size: null, color: null, class: null }],
	['Text', Text, { variant: null, color: null, align: null, weight: null, class: null }],
	[
		'VStack',
		VStack,
		{ spacing: null, alignment: null, justify: null, padding: null, class: null }
	],
	['ZStack', ZStack, { alignment: null, class: null }]
];

describe('nullish prop handling', () => {
	it.each(CASES)('%s renders without leaking "null" into the DOM', (_name, component, props) => {
		const { container } = render(AnyComponentWrapper, {
			props: { component: component as AnyComponent, props }
		});

		expect(container.innerHTML).not.toContain('null');
		expect(container.innerHTML).not.toContain('undefined');
	});

	it.each(CASES)('%s still renders an element', (_name, component, props) => {
		const { container } = render(AnyComponentWrapper, {
			props: { component: component as AnyComponent, props }
		});

		expect(container.firstElementChild).not.toBeNull();
	});
});
