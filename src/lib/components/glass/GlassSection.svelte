<script lang="ts">
	import type { Snippet } from 'svelte';
	import Glass from './Glass.svelte';
	import type { GlassVariant, GlassIntensity } from '../../constants/variants';

	// Prefer reserving glass for navigation-layer chrome. Content-heavy
	// sections usually read better with a solid or tonal background.

	interface Props {
		children: Snippet;
		title?: string;
		subtitle?: string;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		fullWidth?: boolean;
		class?: string;
	}

	let {
		children,
		title = '',
		subtitle = '',
		variant = 'regular',
		intensity = 'subtle',
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

	<Glass {variant} {intensity} padding="lg" cornerRadius="xl">
		{@render children()}
	</Glass>
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
