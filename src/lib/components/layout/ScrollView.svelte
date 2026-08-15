<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fromAction } from 'svelte/attachments';
	import {
		scrollEdge,
		type ScrollEdgeEffect,
		type ScrollEdgeWhich
	} from '../../actions/scrollEdge';
	import { refreshable } from '../../actions/refreshable';

	interface Props {
		children: Snippet;
		axis?: 'vertical' | 'horizontal' | 'both';
		showsIndicators?: boolean;
		edgeEffect?: 'none' | ScrollEdgeEffect;
		edges?: ScrollEdgeWhich;
		edgeSize?: string;
		/** Pull-to-refresh handler. Mirrors SwiftUI's .refreshable. */
		onRefresh?: (() => void | Promise<void>) | undefined;
		refreshThreshold?: number | undefined;
		class?: string;
	}

	let {
		children,
		axis = 'vertical',
		showsIndicators = true,
		edgeEffect = 'none',
		edges = 'bottom',
		edgeSize,
		onRefresh,
		refreshThreshold,
		class: className = ''
	}: Props = $props();

	// An attachment that does nothing, so each feature can opt out without
	// multiplying the markup into one branch per combination.
	const noAttachment = () => {};

	const edgeAttachment = $derived(
		edgeEffect === 'none'
			? noAttachment
			: fromAction(scrollEdge, () => ({ edges, effect: edgeEffect, size: edgeSize }))
	);

	const refreshAttachment = $derived(
		onRefresh
			? fromAction(refreshable, () => ({ onRefresh, threshold: refreshThreshold }))
			: noAttachment
	);
</script>

<div
	class="scroll-view axis-{axis} {className}"
	class:hide-indicators={!showsIndicators}
	{@attach edgeAttachment}
	{@attach refreshAttachment}
>
	{#if onRefresh}
		<div class="refresh-indicator" aria-hidden="true">
			<span class="refresh-spinner"></span>
		</div>
	{/if}
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

	/* Pull to refresh. data-refresh-phase is written by the action, so :global
	   keeps these rules from being pruned as unused. */
	.scroll-view:global([data-refresh-phase]) .scroll-content {
		transform: translateY(var(--refresh-pull, 0));
	}

	.scroll-view:global([data-refresh-phase='idle']) .scroll-content,
	.scroll-view:global([data-refresh-phase='refreshing']) .scroll-content {
		transition: transform var(--transition-fast);
	}

	.refresh-indicator {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--refresh-pull, 0);
		overflow: hidden;
		pointer-events: none;
	}

	.refresh-spinner {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid var(--color-text-tertiary);
		border-top-color: transparent;
	}

	.scroll-view:global([data-refresh-phase='refreshing']) .refresh-spinner {
		animation: refresh-spin 0.8s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-view:global([data-refresh-phase='refreshing']) .refresh-spinner {
			animation: none;
		}
	}

	@keyframes refresh-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
