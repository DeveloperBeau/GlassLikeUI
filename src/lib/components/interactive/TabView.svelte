<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { Glass } from '../glass';
	import { HStack } from '../layout';

	interface Tab {
		id: string;
		label: string;
		icon?: Snippet;
	}

	interface Props {
		tabs: Tab[];
		activeTab?: string;
		children?: Snippet<[string]>;
		position?: 'top' | 'bottom';
		inline?: boolean;
		onchange?: (id: string) => void;
		class?: string;
	}

	let {
		tabs,
		activeTab = $bindable(tabs[0]?.id || ''),
		children,
		position = 'bottom',
		inline = false,
		onchange,
		class: className = ''
	}: Props = $props();

	function selectTab(tabId: string) {
		activeTab = tabId;
		onchange?.(tabId);
	}

	let wrapperEl = $state<HTMLDivElement | undefined>();
	let indicatorLeft = $state(0);
	let indicatorWidth = $state(0);
	let indicatorReady = $state(false);

	function measure() {
		const wrapper = wrapperEl;
		if (!wrapper) {
			indicatorReady = false;
			return;
		}
		const idx = tabs.findIndex((t) => t.id === activeTab);
		if (idx < 0) {
			indicatorReady = false;
			return;
		}
		const buttons = wrapper.querySelectorAll<HTMLButtonElement>('.tab-item');
		const btn = buttons[idx];
		if (!btn) {
			indicatorReady = false;
			return;
		}
		const wrapperRect = wrapper.getBoundingClientRect();
		const btnRect = btn.getBoundingClientRect();
		if (btnRect.width === 0) {
			// Layout not settled (font load, off-screen, HMR); retry next frame.
			indicatorReady = false;
			if (typeof requestAnimationFrame !== 'undefined') {
				requestAnimationFrame(measure);
			}
			return;
		}
		indicatorLeft = btnRect.left - wrapperRect.left;
		indicatorWidth = btnRect.width;
		indicatorReady = true;
	}

	$effect(() => {
		// Re-measure whenever the active tab changes; RAF lets the DOM settle first.
		void activeTab;
		if (typeof requestAnimationFrame === 'undefined') return;
		const id = requestAnimationFrame(measure);
		return () => cancelAnimationFrame(id);
	});

	onMount(() => {
		const initialFrame =
			typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(measure) : 0;
		if (typeof ResizeObserver === 'undefined' || !wrapperEl) {
			return () => {
				if (initialFrame && typeof cancelAnimationFrame !== 'undefined') {
					cancelAnimationFrame(initialFrame);
				}
			};
		}
		const ro = new ResizeObserver(() => measure());
		ro.observe(wrapperEl);
		return () => {
			if (initialFrame && typeof cancelAnimationFrame !== 'undefined') {
				cancelAnimationFrame(initialFrame);
			}
			ro.disconnect();
		};
	});
</script>

<div
	class="tab-view {className}"
	class:position-bottom={position === 'bottom' && !inline}
	class:inline
>
	{#if children}
		<div class="tab-content">
			{@render children(activeTab)}
		</div>
	{/if}

	<div
		class="tab-bar-container"
		class:inline
		style:position={inline ? 'static' : 'fixed'}
		style:bottom={inline ? null : 'var(--spacing-md)'}
		style:left={inline ? null : 'var(--spacing-md)'}
		style:right={inline ? null : 'var(--spacing-md)'}
		style:z-index={inline ? null : '50'}
	>
		<Glass variant="regular" intensity="prominent" cornerRadius="full" padding="xs">
			<div class="tab-bar-wrapper" bind:this={wrapperEl} style:position="relative" style:width="100%">
				<span
					class="tab-indicator"
					class:ready={indicatorReady}
					style="transform: translateX({indicatorLeft}px); width: {indicatorWidth}px;"
					aria-hidden="true"
				></span>
				<HStack spacing="xs" justify="center" class="tab-bar">
					{#each tabs as tab}
						<button
							class="tab-item"
							class:active={activeTab === tab.id}
							onclick={() => selectTab(tab.id)}
						>
							{#if tab.icon}
								<span class="tab-icon">{@render tab.icon()}</span>
							{/if}
							<span class="tab-label">{tab.label}</span>
						</button>
					{/each}
				</HStack>
			</div>
		</Glass>
	</div>
</div>

<style>
	.tab-view {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.tab-view.position-bottom {
		flex-direction: column-reverse;
	}

	.tab-content {
		flex: 1;
		overflow: auto;
	}

	.tab-bar-container {
		position: fixed;
		bottom: var(--spacing-md);
		left: var(--spacing-md);
		right: var(--spacing-md);
		z-index: 50;
	}

	.tab-bar-container.inline {
		position: static;
		left: auto;
		right: auto;
		bottom: auto;
		display: block;
	}

	.tab-view.inline {
		display: block;
		min-height: 0;
	}

	.tab-bar-wrapper {
		position: relative;
		display: block;
		width: 100%;
	}

	:global(.tab-bar) {
		min-width: 0;
		position: relative;
		z-index: 1;
		width: 100%;
	}

	.tab-indicator {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 0;
		border-radius: var(--glass-radius-full);
		background: var(--glass-active-bg);
		pointer-events: none;
		opacity: 0;
		z-index: 0;
		transition-property: transform, width, opacity;
		transition-duration: 0.4s, 0.4s, 0.15s;
		transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1), cubic-bezier(0.32, 0.72, 0, 1), cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.tab-indicator.ready {
		opacity: 1;
	}

	.tab-item {
		flex: 1 1 0;
		min-width: 0;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 10px 4px;
		background: transparent;
		border: none;
		border-radius: var(--glass-radius-full);
		color: var(--color-text-secondary);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition-property: color;
		transition-duration: 0.15s;
		transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.tab-item:not(.active):hover {
		color: var(--color-text);
	}

	.tab-item.active {
		color: var(--color-accent);
	}

	.tab-icon,
	.tab-label {
		display: inline-block;
		transform-origin: center center;
		transform: scale(1);
		transition-property: transform;
		transition-duration: 0.4s;
		transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.tab-indicator,
		.tab-item,
		.tab-icon,
		.tab-label {
			transition-duration: 0s;
		}
	}

	.tab-item.active .tab-icon {
		transform: scale(1.18);
	}

	.tab-item.active .tab-label {
		transform: scale(1.06);
	}

	.tab-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.tab-label {
		white-space: nowrap;
	}
</style>
