<script lang="ts">
	import type { Snippet } from 'svelte';
	import { HStack } from '../layout';
	import { VStack } from '../layout';
	import { SymbolImage } from '../media';
	import { fromAction } from 'svelte/attachments';
	import {
		swipeActions as swipeGesture,
		type SwipeEdge
	} from '../../actions/swipeActions';

	interface Props {
		children: Snippet;
		leading?: Snippet;
		trailing?: Snippet;
		subtitle?: string;
		showDivider?: boolean;
		interactive?: boolean;
		href?: string;
		onclick?: () => void;
		/** Actions revealed by swiping. Mirrors SwiftUI's .swipeActions. */
		swipeActions?: Snippet;
		swipeEdge?: SwipeEdge;
		allowsFullSwipe?: boolean;
		onFullSwipe?: () => void;
		class?: string;
	}

	let {
		children,
		leading,
		trailing,
		subtitle = '',
		showDivider = true,
		interactive = false,
		href,
		onclick,
		swipeActions,
		swipeEdge = 'trailing',
		allowsFullSwipe = false,
		onFullSwipe,
		class: className = ''
	}: Props = $props();

	const isInteractive = $derived(interactive || !!href || !!onclick);

	let actionsElement = $state<HTMLElement | null>(null);
</script>

{#snippet rowInner()}
	<HStack spacing="sm" alignment="center" class="row-content">
		{#if leading}
			<div class="row-leading">
				{@render leading()}
			</div>
		{/if}

		<VStack spacing="none" alignment="leading" class="row-main">
			<div class="row-title">
				{@render children()}
			</div>
			{#if subtitle}
				<div class="row-subtitle">{subtitle}</div>
			{/if}
		</VStack>

		{#if trailing}
			<div class="row-trailing">
				{@render trailing()}
			</div>
		{:else if isInteractive && (href || onclick)}
			<SymbolImage name="chevron.right" size="sm" color="tertiary" />
		{/if}
	</HStack>
{/snippet}

{#snippet row()}
	{#if href}
		<a
			{href}
			class="list-row {className}"
			class:interactive={isInteractive}
			class:has-divider={showDivider}
		>
			{@render rowInner()}
		</a>
	{:else if onclick}
		<button
			type="button"
			class="list-row {className}"
			class:interactive={isInteractive}
			class:has-divider={showDivider}
			{onclick}
		>
			{@render rowInner()}
		</button>
	{:else}
		<div
			class="list-row {className}"
			class:interactive={isInteractive}
			class:has-divider={showDivider}
		>
			{@render rowInner()}
		</div>
	{/if}
{/snippet}

{#if swipeActions}
	<div class="swipe-row">
		<!-- Behind the row until revealed, so it stays out of the reading order. -->
		<div
			class="swipe-actions"
			data-swipe-edge={swipeEdge}
			aria-hidden="true"
			bind:this={actionsElement}
		>
			{@render swipeActions()}
		</div>
		<div
			class="swipe-content"
			{@attach fromAction(swipeGesture, () => ({
				edge: swipeEdge,
				actionsElement,
				allowsFullSwipe,
				onFullSwipe
			}))}
		>
			{@render row()}
		</div>
	</div>
{:else}
	{@render row()}
{/if}

<style>
	.list-row {
		display: block;
		width: 100%;
		padding: 0;
		background: transparent;
		border: none;
		text-decoration: none;
		color: inherit;
		text-align: left;
		font-family: inherit;
		cursor: default;
	}

	.list-row.interactive {
		cursor: pointer;
	}

	.list-row.interactive:hover {
		background: var(--glass-hover-subtle);
	}

	.list-row.interactive:active {
		background: var(--glass-active-subtle);
	}

	:global(.row-content) {
		padding: var(--spacing-sm) var(--spacing-md);
		min-height: 44px;
	}

	.list-row.has-divider {
		border-bottom: 1px solid var(--glass-divider);
	}

	.list-row:last-child {
		border-bottom: none;
	}

	.row-leading {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.row-main) {
		flex: 1;
		min-width: 0;
	}

	.row-title {
		font-size: 1rem;
		color: var(--color-text);
	}

	.row-subtitle {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-top: 2px;
	}

	.row-trailing {
		display: flex;
		align-items: center;
		color: var(--color-text-tertiary);
	}

	/* Swipe actions */
	.swipe-row {
		position: relative;
		overflow: hidden;
	}

	.swipe-actions {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: stretch;
	}

	.swipe-actions[data-swipe-edge='trailing'] {
		right: 0;
	}

	.swipe-actions[data-swipe-edge='leading'] {
		left: 0;
	}

	.swipe-content {
		position: relative;
		background: var(--color-bg, transparent);
		transform: translateX(var(--swipe-x, 0));
		touch-action: pan-y;
	}

	/* Settled positions animate; the drag itself tracks the finger.
	   data-swipe-state is written by the action, so the compiler cannot see it
	   in the markup -- :global keeps these rules from being pruned away. */
	.swipe-content:global([data-swipe-state='closed']),
	.swipe-content:global([data-swipe-state='open']),
	.swipe-content:global([data-swipe-state='fullSwipe']) {
		transition: transform var(--transition-fast);
	}
</style>
