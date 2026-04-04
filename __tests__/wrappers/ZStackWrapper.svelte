<script lang="ts">
	import { ZStack } from '$lib/liquidglass';

	interface Props {
		content?: string;
		alignment?: 'topLeading' | 'top' | 'topTrailing' | 'leading' | 'center' | 'trailing' | 'bottomLeading' | 'bottom' | 'bottomTrailing';
		class?: string;
	}

	let {
		content = 'Content',
		alignment = 'center',
		class: className = ''
	}: Props = $props();
</script>

<ZStack {alignment} class={className}>
	{#snippet children()}
		<div class="child">{content}</div>
	{/snippet}
</ZStack>
