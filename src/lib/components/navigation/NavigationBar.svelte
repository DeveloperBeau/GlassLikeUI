<script lang="ts">
	import type { Snippet } from 'svelte';
	import { HStack } from '../layout';

	interface Props {
		title?: string;
		leading?: Snippet;
		trailing?: Snippet;
		largeTitle?: boolean;
		transparent?: boolean;
		scrolled?: boolean;
		class?: string;
	}

	let {
		title = '',
		leading,
		trailing,
		largeTitle = false,
		transparent = false,
		scrolled = $bindable(false),
		class: className = ''
	}: Props = $props();

	let sentinelEl = $state<HTMLElement | undefined>();
	let collapsed = $state(false);

	$effect(() => {
		if (!largeTitle || !sentinelEl || typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					collapsed = !entry.isIntersecting;
				}
			},
			{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
		);
		observer.observe(sentinelEl);
		return () => observer.disconnect();
	});
</script>

{#if largeTitle}
	<div class="nav-large {className}" class:is-collapsed={collapsed}>
		<header class="navigation-bar large" class:transparent class:scrolled={collapsed || scrolled}>
			<nav class="nav-content">
				<HStack spacing="sm" alignment="center" justify="between">
					<div class="nav-leading">
						{#if leading}
							{@render leading()}
						{/if}
					</div>

					{#if title}
						<h1 class="nav-title-compact">{title}</h1>
					{/if}

					<div class="nav-trailing">
						{#if trailing}
							{@render trailing()}
						{/if}
					</div>
				</HStack>
			</nav>
		</header>

		<div class="nav-large-title-block">
			<h1 class="nav-large-title">{title}</h1>
			<div bind:this={sentinelEl} class="nav-title-sentinel" aria-hidden="true"></div>
		</div>
	</div>
{:else}
	<header class="navigation-bar {className}" class:transparent class:scrolled>
		<nav class="nav-content">
			<HStack spacing="sm" alignment="center" justify="between">
				<div class="nav-leading">
					{#if leading}
						{@render leading()}
					{/if}
				</div>

				{#if title}
					<h1 class="nav-title-compact">{title}</h1>
				{/if}

				<div class="nav-trailing">
					{#if trailing}
						{@render trailing()}
					{/if}
				</div>
			</HStack>
		</nav>
	</header>
{/if}

<style>
	.navigation-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		height: 56px;
		display: flex;
		align-items: center;
		background: var(--glass-nav-bg);
		backdrop-filter: blur(var(--glass-blur-nav)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur-nav)) saturate(var(--glass-saturation));
		border-bottom: 1px solid var(--glass-border);
		transition: all var(--transition);
		font-family: var(--font-system);
	}

	.navigation-bar.transparent {
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		border-bottom-color: transparent;
	}

	.navigation-bar.transparent.scrolled {
		background: var(--glass-nav-bg);
		backdrop-filter: blur(var(--glass-blur-nav)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur-nav)) saturate(var(--glass-saturation));
		border-bottom-color: var(--glass-border);
	}

	.nav-content {
		width: 100%;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--spacing-md);
	}

	.nav-leading,
	.nav-trailing {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		min-width: 80px;
	}

	.nav-trailing {
		justify-content: flex-end;
	}

	.nav-title-compact {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 0;
		transition: opacity var(--transition);
	}

	.nav-large {
		position: relative;
	}

	.navigation-bar.large .nav-title-compact {
		opacity: 0;
	}

	.nav-large.is-collapsed .navigation-bar.large .nav-title-compact {
		opacity: 1;
	}

	.nav-large-title-block {
		padding: calc(56px + var(--spacing-sm)) var(--spacing-md) var(--spacing-md);
	}

	.nav-large-title {
		font-size: clamp(1.75rem, 5vw, 2.25rem);
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.02em;
		margin: 0;
		font-family: var(--font-system);
		transition: opacity var(--transition);
	}

	.nav-large.is-collapsed .nav-large-title {
		opacity: 0;
	}

	.nav-title-sentinel {
		height: 1px;
		width: 100%;
	}
</style>
