<script lang="ts">
	import { Grid } from '$lib/liquidglass';

	interface Props {
		content?: string;
		columns?: number | 'auto';
		minItemWidth?: string;
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let {
		content = 'Content',
		columns = 'auto',
		minItemWidth = '300px',
		spacing = 'md',
		class: className = ''
	}: Props = $props();
</script>

<Grid {columns} {minItemWidth} {spacing} class={className}>
	{#snippet children()}
		<div class="child">{content}</div>
	{/snippet}
</Grid>
