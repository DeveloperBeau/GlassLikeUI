<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		variant?: 'filled' | 'outlined' | 'plain' | 'tinted' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		disabled?: boolean;
		href?: string | undefined;
		onclick?: ((e: MouseEvent) => void) | undefined;
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
		box-shadow: 0 4px 16px -4px var(--color-accent-50);
	}

	.button.variant-filled:hover {
		background: var(--color-accent-hover);
		box-shadow: 0 8px 28px -6px var(--color-accent-50);
	}

	.button.variant-filled:active {
		background: var(--color-accent-active);
		box-shadow: 0 2px 10px -4px var(--color-accent-50);
	}

	/* Outlined variant */
	.button.variant-outlined {
		background: transparent;
		color: var(--color-accent);
		border: 1.5px solid var(--color-accent);
	}

	.button.variant-outlined:hover {
		background: var(--color-accent-10);
		border-color: var(--color-accent-hover);
		color: var(--color-accent-hover);
	}

	.button.variant-outlined:active {
		background: var(--color-accent-15);
	}

	/* Plain variant */
	.button.variant-plain {
		background: transparent;
		color: var(--color-accent);
	}

	.button.variant-plain:hover {
		color: var(--color-accent-hover);
		text-decoration: underline;
	}

	/* Tinted variant */
	.button.variant-tinted {
		background: var(--color-accent-15);
		color: var(--color-accent);
	}

	.button.variant-tinted:hover {
		background: var(--color-accent-25);
		color: var(--color-accent-hover);
	}

	.button.variant-tinted:active {
		background: var(--color-accent-10);
	}

	/* Destructive variant */
	.button.variant-destructive {
		background: var(--color-danger);
		color: white;
		box-shadow: 0 4px 16px -4px color-mix(in srgb, var(--color-danger) 50%, transparent);
	}

	.button.variant-destructive:hover {
		background: var(--color-danger-hover);
		box-shadow: 0 8px 28px -6px color-mix(in srgb, var(--color-danger) 50%, transparent);
	}

	.button.variant-destructive:active {
		background: var(--color-danger-active);
		box-shadow: 0 2px 10px -4px color-mix(in srgb, var(--color-danger) 50%, transparent);
	}
</style>
