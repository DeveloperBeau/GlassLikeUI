<script lang="ts">
	import { TabView } from '$lib';

	interface Props {
		activeTab?: string;
		position?: 'top' | 'bottom';
		inline?: boolean;
		onchange?: (id: string) => void;
		withContent?: boolean;
		withIcons?: boolean;
		class?: string;
	}

	let {
		activeTab = 'one',
		position = 'bottom',
		inline = false,
		onchange,
		withContent = false,
		withIcons = false,
		class: className = ''
	}: Props = $props();

	const tabs = $derived([
		{ id: 'one', label: 'One', ...(withIcons ? { icon: iconSnippet } : {}) },
		{ id: 'two', label: 'Two' },
		{ id: 'three', label: 'Three' }
	]);

	// Spread conditionally so an omitted prop stays omitted, which
	// `exactOptionalPropertyTypes` distinguishes from an explicit undefined.
	const rest = $derived({
		...(onchange === undefined ? {} : { onchange }),
		...(withContent ? { children: contentSnippet } : {})
	});
</script>

{#snippet iconSnippet()}
	<i data-testid="tab-icon">*</i>
{/snippet}

{#snippet contentSnippet(active: string)}
	<p data-testid="tab-content">Showing {active}</p>
{/snippet}

<TabView {tabs} {activeTab} {position} {inline} {...rest} class={className} />
