<script lang="ts">
	import type { Snippet } from 'svelte';
	import LiquidGlass from './LiquidGlass.svelte';

	interface Props {
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		material?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick' | 'chrome';
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		interactive?: boolean;
		class?: string;
	}

	let {
		children,
		header,
		footer,
		material = 'regular',
		padding = 'none',
		interactive = false,
		class: className = ''
	}: Props = $props();
</script>

<LiquidGlass {material} {padding} {interactive} class="glass-card {className}">
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
</LiquidGlass>

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
