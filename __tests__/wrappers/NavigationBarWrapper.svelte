<script lang="ts">
	import { NavigationBar } from '$lib';

	interface Props {
		title?: string;
		largeTitle?: boolean;
		transparent?: boolean;
		scrolled?: boolean;
		leadingText?: string;
		trailingText?: string;
		class?: string;
	}

	let {
		title = '',
		largeTitle = false,
		transparent = false,
		scrolled = false,
		leadingText = '',
		trailingText = '',
		class: className = ''
	}: Props = $props();
</script>

<NavigationBar {title} {largeTitle} {transparent} {scrolled} class={className}>
	{#snippet leading()}
		{#if leadingText}<span class="leading">{leadingText}</span>{/if}
	{/snippet}
	{#snippet trailing()}
		{#if trailingText}<span class="trailing">{trailingText}</span>{/if}
	{/snippet}
</NavigationBar>
