<!--
  Groups adjacent glass surfaces so they read as a single merged chrome.
  Children inherit the container's gap spacing and layout direction.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SPACING, type Spacing } from '../../constants';

	interface Props {
		children: Snippet;
		spacing?: Spacing;
		direction?: 'horizontal' | 'vertical';
		merge?: boolean;
		class?: string;
	}

	let {
		children,
		spacing = 'xs',
		direction = 'horizontal',
		merge = true,
		class: className = ''
	}: Props = $props();
</script>

<div
	class="glass-effect-container {direction} {className}"
	class:is-merged={merge}
	style="--container-gap: {SPACING[spacing]};"
>
	{@render children()}
</div>

<style>
	.glass-effect-container {
		display: inline-flex;
		gap: var(--container-gap);
		position: relative;
		isolation: isolate;
	}
	.glass-effect-container.vertical {
		flex-direction: column;
	}
	.glass-effect-container.horizontal {
		flex-direction: row;
	}
	/* In merged mode, individual children drop their own shadow so the
	   container's shared drop shadow reads as one elevated surface. */
	.glass-effect-container.is-merged :global(.glass-surface.has-shadow) {
		box-shadow: none;
	}
	.glass-effect-container.is-merged {
		box-shadow:
			0 8px 32px -8px var(--glass-shadow),
			0 2px 8px -2px var(--glass-shadow);
		border-radius: var(--glass-radius-lg);
	}
</style>
