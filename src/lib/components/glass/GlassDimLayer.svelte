<!--
  Dim layer companion for variant="clear". Apply beneath clear glass over
  media-rich content to keep controls legible.
-->
<script lang="ts">
	interface Props {
		opacity?: number;
		gradient?: boolean;
		class?: string;
	}

	let { opacity = 0.35, gradient = true, class: className = '' }: Props = $props();
</script>

<div
	class="glass-dim-layer {className}"
	class:solid={!gradient}
	style="--dim-opacity: {opacity};"
	aria-hidden="true"
></div>

<style>
	.glass-dim-layer {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, calc(var(--dim-opacity) * 0.5)) 0%,
			rgba(0, 0, 0, var(--dim-opacity)) 100%
		);
	}
	.glass-dim-layer.solid {
		background: rgba(0, 0, 0, var(--dim-opacity));
	}
</style>
