<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		variant?: 'plain' | 'glass' | 'filled';
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let {
		children,
		variant = 'plain',
		size = 'md',
		label = '',
		onclick,
		class: className = ''
	}: Props = $props();

	const sizeMap = {
		sm: 32,
		md: 40,
		lg: 48
	};
</script>

<button
	class="icon-button variant-{variant} size-{size} {className}"
	aria-label={label}
	title={label}
	{onclick}
	style="--btn-size: {sizeMap[size]}px"
>
	{@render children()}
</button>

<style>
	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--btn-size);
		height: var(--btn-size);
		border: none;
		border-radius: var(--glass-radius-full);
		cursor: pointer;
		transition: all var(--transition-fast);
		background: transparent;
		color: var(--color-text-secondary);
	}

	.icon-button:hover {
		color: var(--color-text);
	}

	.icon-button.variant-plain {
		background: transparent;
	}

	.icon-button.variant-plain:hover {
		background: var(--glass-hover-subtle);
	}

	.icon-button.variant-glass {
		background: var(--glass-button-bg);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--glass-border);
	}

	.icon-button.variant-glass:hover {
		background: var(--glass-button-hover);
	}

	.icon-button.variant-filled {
		background: var(--color-accent);
		color: white;
	}

	.icon-button.variant-filled:hover {
		background: var(--color-accent-hover);
	}
</style>
