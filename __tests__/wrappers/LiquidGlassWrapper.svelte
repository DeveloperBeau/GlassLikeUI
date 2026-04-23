<script lang="ts">
	import { LiquidGlass } from '$lib';
	import type { MaterialType, CornerRadius, Padding } from '$lib/constants';

	interface Props {
		content?: string;
		material?: MaterialType;
		tint?: string;
		cornerRadius?: CornerRadius;
		padding?: Padding;
		border?: boolean;
		shadow?: boolean;
		interactive?: boolean;
		class?: string;
		style?: string;
	}

	let {
		content = 'Glass Content',
		material = 'regular',
		tint = '',
		cornerRadius = 'lg',
		padding = 'md',
		border = true,
		shadow = true,
		interactive = false,
		class: className = '',
		style = ''
	}: Props = $props();
</script>

<LiquidGlass {material} {tint} {cornerRadius} {padding} {border} {shadow} {interactive} class={className} {style}>
	{#snippet children()}
		{content}
	{/snippet}
</LiquidGlass>
