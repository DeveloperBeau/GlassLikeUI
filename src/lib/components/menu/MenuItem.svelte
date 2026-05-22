<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getIconPath } from '../../icons';

	interface Props {
		children: Snippet;
		icon?: string;
		href?: string;
		onclick?: () => void;
		destructive?: boolean;
		class?: string;
	}

	let {
		children,
		icon,
		href,
		onclick,
		destructive = false,
		class: className = ''
	}: Props = $props();

	// Security Note: iconPath is always from the hardcoded ICONS map, never user input.
	const iconPath = $derived(icon ? getIconPath(icon) : '');
</script>

{#snippet rowContent()}
	{#if icon}
		<svg
			class="menu-item-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			{@html iconPath}
		</svg>
	{/if}
	<span class="menu-item-label">{@render children()}</span>
{/snippet}

{#if href}
	<a
		{href}
		role="menuitem"
		tabindex="-1"
		class="menu-item {className}"
		class:destructive
	>
		{@render rowContent()}
	</a>
{:else}
	<button
		type="button"
		role="menuitem"
		tabindex="-1"
		class="menu-item {className}"
		class:destructive
		{onclick}
	>
		{@render rowContent()}
	</button>
{/if}

<style>
	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 9px 14px;
		background: none;
		border: none;
		border-radius: 0;
		font: inherit;
		font-size: 0.95rem;
		text-align: left;
		text-decoration: none;
		color: var(--color-text);
		cursor: pointer;
	}

	.menu-item:hover {
		background: var(--glass-hover-subtle);
	}

	.menu-item:active {
		background: var(--glass-active-subtle);
	}

	.menu-item:focus-visible {
		background: var(--glass-hover-subtle);
		outline: none;
	}

	.menu-item.destructive {
		color: var(--color-danger);
	}

	.menu-item-icon {
		flex-shrink: 0;
	}

	.menu-item-label {
		flex: 1;
		min-width: 0;
	}
</style>
