<script lang="ts">
	import { Glass } from '$lib';
	import type { GlassVariant, GlassIntensity } from '$lib';

	interface Props {
		content?: string;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		tint?: string;
		cornerRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		shadow?: boolean;
		interactive?: boolean;
		class?: string;
		style?: string;
	}

	let {
		content = 'Glass Content',
		variant = 'regular',
		intensity = 'standard',
		tint = '',
		cornerRadius = 'lg',
		padding = 'md',
		shadow = true,
		interactive = false,
		class: className = '',
		style = ''
	}: Props = $props();
</script>

<Glass
	{variant}
	{intensity}
	{tint}
	{cornerRadius}
	{padding}
	{shadow}
	{interactive}
	class={className}
	{style}
>
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
</Glass>
