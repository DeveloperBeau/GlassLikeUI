<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		component: Component<Record<string, unknown>>;
		props?: Record<string, unknown>;
		text?: string;
	}

	let { component: Comp, props = {}, text = 'content' }: Props = $props();
</script>

<Comp {...props}>
	{#snippet children()}
		{text}
	{/snippet}
</Comp>
