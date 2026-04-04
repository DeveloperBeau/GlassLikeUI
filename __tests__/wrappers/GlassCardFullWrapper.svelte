<script lang="ts">
	import { GlassCard } from '$lib/liquidglass';

	interface Props {
		content?: string;
		headerText?: string;
		footerText?: string;
		material?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick' | 'chrome';
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		interactive?: boolean;
		class?: string;
	}

	let {
		content = 'Card Content',
		headerText = 'Header',
		footerText = 'Footer',
		material = 'regular',
		padding = 'none',
		interactive = false,
		class: className = ''
	}: Props = $props();
</script>

<GlassCard {material} {padding} {interactive} class={className}>
	{#snippet header()}
		<div class="header">{headerText}</div>
	{/snippet}
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
	{#snippet footer()}
		<div class="footer">{footerText}</div>
	{/snippet}
</GlassCard>
