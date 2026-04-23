<script lang="ts">
	import type { Snippet } from 'svelte';
	import Glass from './Glass.svelte';
	import type { GlassVariant, GlassIntensity } from '../../constants/variants';

	// Note: GlassCard wraps content in a glass surface. Prefer reserving glass
	// for navigation-layer chrome; for pure content, a solid fill is usually
	// the right call.

	interface Props {
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		interactive?: boolean;
		class?: string;
	}

	let {
		children,
		header,
		footer,
		variant = 'regular',
		intensity = 'standard',
		padding = 'none',
		interactive = false,
		class: className = ''
	}: Props = $props();
</script>

<Glass {variant} {intensity} {padding} {interactive} class="glass-card {className}">
	{#if header}
		<div class="card-header">
			{@render header()}
		</div>
	{/if}

	<div class="card-body">
		{@render children()}
	</div>

	{#if footer}
		<div class="card-footer">
			{@render footer()}
		</div>
	{/if}
</Glass>

<style>
	:global(.glass-card) {
		display: flex;
		flex-direction: column;
	}

	.card-header {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--glass-divider);
	}

	.card-body {
		padding: var(--spacing-md);
		flex: 1;
	}

	.card-footer {
		padding: var(--spacing-md);
		border-top: 1px solid var(--glass-divider);
	}
</style>
