<script lang="ts">
	import { HStack } from '$lib';

	interface Props {
		content?: string;
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		alignment?: 'top' | 'center' | 'bottom' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
		wrap?: boolean;
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let {
		content = 'Content',
		spacing = 'md',
		alignment = 'center',
		justify = 'start',
		wrap = false,
		padding = 'none',
		class: className = ''
	}: Props = $props();
</script>

<HStack {spacing} {alignment} {justify} {wrap} {padding} class={className}>
	{#snippet children()}
		<div class="child">{content}</div>
	{/snippet}
</HStack>
