<script lang="ts">
	import { VStack } from '$lib/liquidglass';

	interface Props {
		content?: string;
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		alignment?: 'leading' | 'center' | 'trailing' | 'stretch';
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let {
		content = 'Content',
		spacing = 'md',
		alignment = 'stretch',
		padding = 'none',
		class: className = ''
	}: Props = $props();
</script>

<VStack {spacing} {alignment} {padding} class={className}>
	{#snippet children()}
		<div class="child">{content}</div>
	{/snippet}
</VStack>
