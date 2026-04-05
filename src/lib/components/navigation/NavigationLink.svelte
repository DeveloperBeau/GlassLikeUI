<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		href: string;
		active?: boolean;
		class?: string;
	}

	let {
		children,
		href,
		active = false,
		class: className = ''
	}: Props = $props();
</script>

<a {href} class="navigation-link {className}" class:active aria-current={active ? 'page' : undefined}>
	{@render children()}
</a>

<style>
	.navigation-link {
		display: inline-flex;
		align-items: center;
		padding: 8px 16px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: var(--glass-radius-full);
		transition: color var(--transition-spring);
		position: relative;
		z-index: 1;
	}

	.navigation-link:hover {
		color: var(--color-text);
	}

	.navigation-link.active {
		color: white;
	}
</style>
