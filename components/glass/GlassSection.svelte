<script lang="ts">
	import type { Snippet } from 'svelte';
	import LiquidGlass from './LiquidGlass.svelte';

	interface Props {
		children: Snippet;
		title?: string;
		subtitle?: string;
		material?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick';
		fullWidth?: boolean;
		class?: string;
	}

	let {
		children,
		title = '',
		subtitle = '',
		material = 'thin',
		fullWidth = false,
		class: className = ''
	}: Props = $props();
</script>

<section class="glass-section {className}" class:full-width={fullWidth}>
	{#if title || subtitle}
		<div class="section-header">
			{#if title}
				<h2 class="section-title">{title}</h2>
			{/if}
			{#if subtitle}
				<p class="section-subtitle">{subtitle}</p>
			{/if}
		</div>
	{/if}

	<LiquidGlass {material} padding="lg" cornerRadius="xl">
		{@render children()}
	</LiquidGlass>
</section>

<style>
	.glass-section {
		padding: var(--spacing-xl) var(--spacing-md);
		max-width: var(--max-width-wide);
		margin: 0 auto;
	}

	.glass-section.full-width {
		max-width: none;
		padding-left: 0;
		padding-right: 0;
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--spacing-lg);
	}

	.section-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		margin-bottom: var(--spacing-xs);
		background: var(--glass-text-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.section-subtitle {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		max-width: 600px;
		margin: 0 auto;
	}
</style>
