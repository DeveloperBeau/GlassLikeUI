<script lang="ts">
	import type { Snippet } from 'svelte';
	import { glassButtonVars, type ButtonVariant } from '../../constants/variants';

	interface Props {
		children: Snippet;
		variant?: ButtonVariant;
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		disabled?: boolean;
		href?: string | undefined;
		/** Anchor target (href only). target="_blank" gets rel="noopener noreferrer" unless rel is set. */
		target?: '_blank' | '_self' | '_parent' | '_top' | undefined;
		rel?: string | undefined;
		onclick?: ((e: MouseEvent) => void) | undefined;
		/** Native button type. Left unset, a button inside a form submits it (browser default). */
		type?: 'button' | 'submit' | 'reset' | undefined;
		class?: string;
	}

	let {
		children,
		variant = 'filled',
		size = 'md',
		fullWidth = false,
		disabled = false,
		href,
		target,
		rel,
		onclick,
		type,
		class: className = ''
	}: Props = $props();

	const sizeStyles = {
		sm: { padding: '8px 16px', fontSize: '0.875rem' },
		md: { padding: '12px 24px', fontSize: '1rem' },
		lg: { padding: '16px 32px', fontSize: '1.0625rem' }
	};

	const styles = $derived(sizeStyles[size]);

	// null for the solid variants, so they emit no backdrop-filter layer.
	const glass = $derived(glassButtonVars(variant));
	const glassStyle = $derived(
		glass
			? `--btn-glass-blur: ${glass.blur}px;
			--btn-glass-saturation: ${glass.saturation};
			--btn-glass-opacity: ${glass.opacity};`
			: ''
	);
</script>

{#if href}
	<a
		{href}
		{target}
		rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
		class="button variant-{variant} size-{size} {className}"
		class:full-width={fullWidth}
		class:disabled
		class:is-glass={!!glass}
		class:is-tinted={glass?.tinted}
		onclick={onclick}
		style="
			--btn-padding: {styles.padding};
			--btn-font-size: {styles.fontSize};
			{glassStyle}
		"
	>
		{@render children()}
	</a>
{:else}
	<button
		class="button variant-{variant} size-{size} {className}"
		class:full-width={fullWidth}
		class:is-glass={!!glass}
		class:is-tinted={glass?.tinted}
		{disabled}
		{onclick}
		{type}
		style="
			--btn-padding: {styles.padding};
			--btn-font-size: {styles.fontSize};
			{glassStyle}
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

	/* Glass variants (SwiftUI .glass / .glassProminent) */
	.button.is-glass {
		background: transparent;
		color: var(--color-text);
		isolation: isolate;
	}

	.button.is-glass::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: inherit;
		background: rgba(255, 255, 255, var(--btn-glass-opacity));
		backdrop-filter: blur(var(--btn-glass-blur)) saturate(var(--btn-glass-saturation));
		-webkit-backdrop-filter: blur(var(--btn-glass-blur)) saturate(var(--btn-glass-saturation));
		pointer-events: none;
	}

	.button.is-glass::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
		pointer-events: none;
		border: var(--glass-border-width) solid var(--glass-border);
		box-shadow: inset 0 1px 0 0 var(--glass-highlight);
	}

	.button.is-glass > :global(*) {
		position: relative;
		z-index: 2;
	}

	.button.is-glass:hover::before {
		background: rgba(255, 255, 255, calc(var(--btn-glass-opacity) * 1.35));
	}

	.button.is-glass:active::before {
		background: rgba(255, 255, 255, calc(var(--btn-glass-opacity) * 0.8));
	}

	.button.is-glass.is-tinted {
		color: var(--color-accent);
	}

	.button.is-glass.is-tinted::before {
		background: color-mix(
			in srgb,
			var(--color-accent) calc(var(--btn-glass-opacity) * 100%),
			transparent
		);
	}

	.button.is-glass.is-tinted:hover::before {
		background: color-mix(
			in srgb,
			var(--color-accent) calc(var(--btn-glass-opacity) * 135%),
			transparent
		);
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
