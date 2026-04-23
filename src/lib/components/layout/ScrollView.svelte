<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		scrollEdge,
		type ScrollEdgeEffect,
		type ScrollEdgeWhich
	} from '../../actions/scrollEdge';

	interface Props {
		children: Snippet;
		axis?: 'vertical' | 'horizontal' | 'both';
		showsIndicators?: boolean;
		edgeEffect?: 'none' | ScrollEdgeEffect;
		edges?: ScrollEdgeWhich;
		edgeSize?: string;
		class?: string;
	}

	let {
		children,
		axis = 'vertical',
		showsIndicators = true,
		edgeEffect = 'none',
		edges = 'bottom',
		edgeSize,
		class: className = ''
	}: Props = $props();
</script>

{#if edgeEffect === 'none'}
	<div class="scroll-view axis-{axis} {className}" class:hide-indicators={!showsIndicators}>
		<div class="scroll-content">
			{@render children()}
		</div>
	</div>
{:else}
	<div
		class="scroll-view axis-{axis} {className}"
		class:hide-indicators={!showsIndicators}
		use:scrollEdge={{ edges, effect: edgeEffect, size: edgeSize }}
	>
		<div class="scroll-content">
			{@render children()}
		</div>
	</div>
{/if}

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
