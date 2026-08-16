<script lang="ts">
	import { List } from '$lib';

	type ListStyle = 'plain' | 'inset' | 'grouped' | 'insetGrouped';

	interface Props {
		text?: string;
		style?: ListStyle;
		class?: string;
	}

	let { text = 'Row', style, class: className = '' }: Props = $props();

	// Spread conditionally so an omitted prop stays omitted and the component's
	// own default is what gets exercised.
	const styleProp = $derived(style === undefined ? {} : { style });
</script>

<List {...styleProp} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</List>
