<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		INTENSITY_CONFIG,
		VARIANT_CONFIG,
		DEFAULT_VARIANT,
		DEFAULT_INTENSITY,
		type GlassVariant,
		type GlassIntensity
	} from '../../constants/variants';
	import { CORNER_RADIUS, PADDING, type CornerRadius, type Padding } from '../../constants';
	import { deviceMotion } from '../../actions/deviceMotion';

	interface Props {
		children: Snippet;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		tint?: string;
		cornerRadius?: CornerRadius;
		padding?: Padding;
		shadow?: boolean;
		interactive?: boolean;
		motion?: boolean;
		class?: string;
		style?: string;
	}

	let {
		children,
		variant = DEFAULT_VARIANT,
		intensity = DEFAULT_INTENSITY,
		tint = '',
		cornerRadius = 'lg',
		padding = 'md',
		shadow = true,
		interactive = false,
		motion = false,
		class: className = '',
		style: customStyle = ''
	}: Props = $props();

	const cfg = $derived(INTENSITY_CONFIG[intensity]);
	const vcfg = $derived(VARIANT_CONFIG[variant]);
</script>

{#if motion}
	<div
		class="glass-surface {variant} {className}"
		class:has-lensing={cfg.displacementScale > 0}
		class:has-shadow={shadow}
		class:is-interactive={interactive}
		use:deviceMotion
		style="
			--glass-blur: {cfg.blur}px;
			--glass-saturation: {cfg.saturation};
			--glass-displacement-scale: {cfg.displacementScale};
			--glass-opacity: {vcfg.opacityDark};
			--glass-radius: {CORNER_RADIUS[cornerRadius]};
			{tint ? `--glass-surface-bg: ${tint};` : ''}
			padding: {PADDING[padding]};
			{customStyle}
		"
	>
		<div class="glass-content">
			{@render children()}
		</div>
	</div>
{:else}
	<div
		class="glass-surface {variant} {className}"
		class:has-lensing={cfg.displacementScale > 0}
		class:has-shadow={shadow}
		class:is-interactive={interactive}
		style="
			--glass-blur: {cfg.blur}px;
			--glass-saturation: {cfg.saturation};
			--glass-displacement-scale: {cfg.displacementScale};
			--glass-opacity: {vcfg.opacityDark};
			--glass-radius: {CORNER_RADIUS[cornerRadius]};
			{tint ? `--glass-surface-bg: ${tint};` : ''}
			padding: {PADDING[padding]};
			{customStyle}
		"
	>
		<div class="glass-content">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.glass-surface {
		position: relative;
		isolation: isolate;
		background: var(--glass-surface-bg);
		border-radius: var(--glass-radius, var(--glass-radius-lg));
		overflow: hidden;
		color: inherit;
		font-family: var(--font-system);
	}

	.glass-surface::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: inherit;
		backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		pointer-events: none;
	}

	.glass-surface.has-lensing::before {
		filter: url(#glass-lens-refract);
	}

	.glass-surface::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
		pointer-events: none;
		border: var(--glass-border-width) solid var(--glass-border);
		box-shadow:
			inset 0 1px 0 0 var(--glass-highlight),
			inset 0 -1px 0 0 var(--glass-shadow-inner);
		background: linear-gradient(
			var(--glass-highlight-angle),
			rgba(255, 255, 255, calc(0.08 * var(--glass-motion-enabled))) 0%,
			transparent 40%,
			transparent 60%,
			rgba(0, 0, 0, calc(0.04 * var(--glass-motion-enabled))) 100%
		);
		mix-blend-mode: overlay;
	}

	.glass-content {
		position: relative;
		z-index: 2;
		height: 100%;
	}

	.glass-surface.has-shadow {
		box-shadow:
			0 8px 32px -8px var(--glass-shadow),
			0 2px 8px -2px var(--glass-shadow);
	}

	.glass-surface.is-interactive {
		cursor: pointer;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}
	.glass-surface.is-interactive:hover {
		transform: scale(calc(1 + 0.01 * var(--glass-motion-enabled)));
		box-shadow:
			0 12px 40px -8px var(--glass-shadow),
			0 4px 12px -2px var(--glass-shadow),
			0 0 0 1px var(--glass-highlight);
	}
	.glass-surface.is-interactive:active {
		transform: scale(calc(1 - 0.005 * var(--glass-motion-enabled)));
	}
</style>
