<script lang="ts">
	import type { Snippet } from 'svelte';
	import { HStack } from '../layout';

	interface Props {
		title?: string;
		leading?: Snippet;
		trailing?: Snippet;
		transparent?: boolean;
		scrolled?: boolean;
		class?: string;
	}

	let {
		title = '',
		leading,
		trailing,
		transparent = false,
		scrolled = false,
		class: className = ''
	}: Props = $props();
</script>

<header class="navigation-bar {className}" class:transparent class:scrolled>
	<nav class="nav-content">
		<HStack spacing="sm" alignment="center" justify="between">
			<div class="nav-leading">
				{#if leading}
					{@render leading()}
				{/if}
			</div>

			{#if title}
				<h1 class="nav-title">{title}</h1>
			{/if}

			<div class="nav-trailing">
				{#if trailing}
					{@render trailing()}
				{/if}
			</div>
		</HStack>
	</nav>
</header>

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
		backdrop-filter: blur(var(--glass-nav-blur)) saturate(1.8);
		-webkit-backdrop-filter: blur(var(--glass-nav-blur)) saturate(1.8);
		border-bottom: 1px solid var(--glass-border);
		transition: all var(--transition);
	}

	.navigation-bar.transparent {
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		border-bottom-color: transparent;
	}

	.navigation-bar.transparent.scrolled {
		background: var(--glass-nav-bg);
		backdrop-filter: blur(var(--glass-nav-blur)) saturate(1.8);
		-webkit-backdrop-filter: blur(var(--glass-nav-blur)) saturate(1.8);
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

	.nav-title {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
