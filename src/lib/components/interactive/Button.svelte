<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		variant?: 'filled' | 'glass' | 'outlined' | 'plain' | 'tinted' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		disabled?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let {
		children,
		variant = 'filled',
		size = 'md',
		fullWidth = false,
		disabled = false,
		href,
		onclick,
		class: className = ''
	}: Props = $props();

	const sizeStyles = {
		sm: { padding: '8px 16px', fontSize: '0.875rem' },
		md: { padding: '12px 24px', fontSize: '1rem' },
		lg: { padding: '16px 32px', fontSize: '1.0625rem' }
	};

	const styles = $derived(sizeStyles[size]);
</script>

{#if href}
	<a
		{href}
		class="button variant-{variant} size-{size} {className}"
		class:full-width={fullWidth}
		class:disabled
		onclick={onclick}
		style="
			--btn-padding: {styles.padding};
			--btn-font-size: {styles.fontSize};
		"
	>
		{@render children()}
	</a>
{:else}
	<button
		class="button variant-{variant} size-{size} {className}"
		class:full-width={fullWidth}
		{disabled}
		{onclick}
		style="
			--btn-padding: {styles.padding};
			--btn-font-size: {styles.fontSize};
		"
	>
		{@render children()}
	</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: var(--btn-padding);
		font-size: var(--btn-font-size);
		font-weight: 500;
		font-family: inherit;
		border: none;
		border-radius: var(--glass-radius-full);
		cursor: pointer;
		text-decoration: none;
		transition: all var(--transition-fast);
		position: relative;
		overflow: hidden;
	}

	.button.full-width {
		width: 100%;
	}

	.button.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	/* Filled variant */
	.button.variant-filled {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 4px 16px -4px rgba(0, 113, 227, 0.5);
	}

	.button.variant-filled:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px -4px rgba(0, 113, 227, 0.5);
	}

	.button.variant-filled:active {
		transform: translateY(0);
	}

	/* Glass variant */
	.button.variant-glass {
		background: var(--glass-button-bg);
		backdrop-filter: blur(20px) saturate(1.8);
		-webkit-backdrop-filter: blur(20px) saturate(1.8);
		color: var(--color-text);
		border: 1px solid var(--glass-border);
		box-shadow:
			inset 0 1px 0 0 var(--glass-highlight),
			0 4px 16px -4px var(--glass-shadow);
	}

	.button.variant-glass:hover {
		background: var(--glass-button-hover);
		transform: translateY(-2px);
	}

	/* Outlined variant */
	.button.variant-outlined {
		background: transparent;
		color: var(--color-accent);
		border: 1.5px solid var(--color-accent);
	}

	.button.variant-outlined:hover {
		background: rgba(0, 113, 227, 0.1);
	}

	/* Plain variant */
	.button.variant-plain {
		background: transparent;
		color: var(--color-accent);
	}

	.button.variant-plain:hover {
		text-decoration: underline;
	}

	/* Tinted variant */
	.button.variant-tinted {
		background: rgba(0, 113, 227, 0.15);
		color: var(--color-accent);
	}

	.button.variant-tinted:hover {
		background: rgba(0, 113, 227, 0.25);
	}

	/* Destructive variant */
	.button.variant-destructive {
		background: var(--color-danger, #ef4444);
		color: white;
		box-shadow: 0 4px 16px -4px rgba(239, 68, 68, 0.5);
	}

	.button.variant-destructive:hover {
		background: var(--color-danger-hover, #dc2626);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px -4px rgba(239, 68, 68, 0.5);
	}

	.button.variant-destructive:active {
		transform: translateY(0);
	}
</style>
