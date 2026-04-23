<script lang="ts">
	import { GlassCard } from '$lib';
	import type { GlassVariant, GlassIntensity } from '$lib';

	interface Props {
		content?: string;
		footerText?: string;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		interactive?: boolean;
		class?: string;
	}

	let {
		content = 'Card Content',
		footerText = 'Footer',
		variant = 'regular',
		intensity = 'standard',
		padding = 'none',
		interactive = false,
		class: className = ''
	}: Props = $props();
</script>

<GlassCard {variant} {intensity} {padding} {interactive} class={className}>
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
	{#snippet footer()}
		<div class="footer">{footerText}</div>
	{/snippet}
</GlassCard>
