<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		axis?: 'vertical' | 'horizontal' | 'both';
		showsIndicators?: boolean;
		class?: string;
	}

	let {
		children,
		axis = 'vertical',
		showsIndicators = true,
		class: className = ''
	}: Props = $props();
</script>

<div class="scroll-view axis-{axis} {className}" class:hide-indicators={!showsIndicators}>
	<div class="scroll-content">
		{@render children()}
	</div>
</div>

<style>
	.scroll-view {
		overflow: hidden;
		-webkit-overflow-scrolling: touch;
	}

	.scroll-view.axis-vertical {
		overflow-y: auto;
	}

	.scroll-view.axis-horizontal {
		overflow-x: auto;
	}

	.scroll-view.axis-both {
		overflow: auto;
	}

	.scroll-view.hide-indicators {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.scroll-view.hide-indicators::-webkit-scrollbar {
		display: none;
	}

	.scroll-content {
		min-height: 100%;
	}

	.scroll-view.axis-horizontal .scroll-content {
		display: flex;
		width: max-content;
	}
</style>
