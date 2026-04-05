<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MATERIAL_CONFIG, CORNER_RADIUS, PADDING } from '../../constants';
	import type { MaterialType, CornerRadius, Padding } from '../../constants';

	interface Props {
		children: Snippet;
		material?: MaterialType;
		tint?: string;
		cornerRadius?: CornerRadius;
		padding?: Padding;
		border?: boolean;
		shadow?: boolean;
		interactive?: boolean;
		class?: string;
		style?: string;
	}

	let {
		children,
		material = 'regular',
		tint = '',
		cornerRadius = 'lg',
		padding = 'md',
		border = true,
		shadow = true,
		interactive = false,
		class: className = '',
		style: customStyle = ''
	}: Props = $props();

	const config = $derived(MATERIAL_CONFIG[material]);
</script>

<div
	class="liquid-glass {className}"
	class:interactive
	class:has-border={border}
	class:has-shadow={shadow}
	class:chrome={material === 'chrome'}
	style="
		--glass-blur: {config.blur}px;
		--glass-saturation: {config.saturation};
		--glass-bg-opacity: {config.bgOpacity};
		--glass-border-opacity: {config.borderOpacity};
		--glass-radius: {CORNER_RADIUS[cornerRadius]};
		--glass-padding: {PADDING[padding]};
		{tint ? `--glass-tint: ${tint};` : ''}
		{customStyle}
	"
>
	<div class="glass-content">
		{@render children()}
	</div>
</div>

<style>
	.liquid-glass {
		position: relative;
		border-radius: var(--glass-radius);
		padding: var(--glass-padding);
		overflow: hidden;
		isolation: isolate;
		background: var(--glass-tint, var(--glass-bg));
		backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		transition: all var(--transition);
	}

	.liquid-glass.has-border {
		border: 1px solid var(--glass-border);
		box-shadow:
			inset 0 1px 0 0 var(--glass-highlight),
			inset 0 -1px 0 0 var(--glass-shadow-inner);
	}

	.liquid-glass.has-shadow {
		box-shadow:
			0 8px 32px -8px var(--glass-shadow),
			0 2px 8px -2px var(--glass-shadow),
			inset 0 1px 0 0 var(--glass-highlight),
			inset 0 -1px 0 0 var(--glass-shadow-inner);
	}

	.liquid-glass.chrome {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.05) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		border: 1px solid var(--glass-chrome-border);
		box-shadow:
			0 0 0 1px var(--glass-chrome-outer),
			inset 0 1px 2px 0 rgba(255, 255, 255, 0.3),
			0 8px 40px -8px var(--glass-shadow),
			0 20px 60px -20px var(--glass-shadow);
	}

	.liquid-glass.interactive {
		cursor: pointer;
	}

	.liquid-glass.interactive:hover {
		background: var(--glass-hover-bg);
		transform: translateY(-2px);
		box-shadow:
			0 12px 40px -8px var(--glass-shadow),
			0 4px 12px -2px var(--glass-shadow),
			inset 0 1px 0 0 var(--glass-highlight);
	}

	.liquid-glass.interactive:active {
		transform: translateY(0);
		background: var(--glass-active-bg);
	}

	.glass-content {
		position: relative;
		z-index: 1;
		height: 100%;
	}
</style>
