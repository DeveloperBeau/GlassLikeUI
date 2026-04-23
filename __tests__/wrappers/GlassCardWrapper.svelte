<script lang="ts">
	import { GlassCard } from '$lib';

	interface Props {
		content?: string;
		material?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick' | 'chrome';
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		interactive?: boolean;
		class?: string;
	}

	let {
		content = 'Card Content',
		material = 'regular',
		padding = 'none',
		interactive = false,
		class: className = ''
	}: Props = $props();
</script>

<GlassCard {material} {padding} {interactive} class={className}>
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
</GlassCard>
