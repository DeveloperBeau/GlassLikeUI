<script lang="ts">
	import { Glass } from '$lib';
	import type { GlassVariant, GlassIntensity, GlassShape } from '$lib';

	interface Props {
		content?: string;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		tint?: string;
		cornerRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
		shape?: GlassShape;
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		shadow?: boolean;
		interactive?: boolean;
		motion?: boolean;
		class?: string;
		style?: string;
	}

	let {
		content = 'Glass Content',
		variant = 'regular',
		intensity = 'standard',
		tint = '',
		cornerRadius = 'lg',
		shape = 'rect',
		padding = 'md',
		shadow = true,
		interactive = false,
		motion = false,
		class: className = '',
		style = ''
	}: Props = $props();
</script>

<Glass
	{variant}
	{intensity}
	{tint}
	{cornerRadius}
	{shape}
	{padding}
	{shadow}
	{interactive}
	{motion}
	class={className}
	{style}
>
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
</Glass>
