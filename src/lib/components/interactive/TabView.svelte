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
	let buttonEls: Record<string, HTMLButtonElement | undefined> = $state({});
	let indicatorLeft = $state(0);
	let indicatorWidth = $state(0);
	let indicatorReady = $state(false);

	function measure() {
		const wrapper = wrapperEl;
		const btn = buttonEls[activeTab];
		if (!wrapper || !btn) {
			indicatorReady = false;
			return;
		}
		indicatorLeft = btn.offsetLeft;
		indicatorWidth = btn.offsetWidth;
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
		measure();
		if (typeof ResizeObserver === 'undefined' || !wrapperEl) return;
		const ro = new ResizeObserver(() => measure());
		ro.observe(wrapperEl);
		return () => ro.disconnect();
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

	<Glass
		variant="regular"
		intensity="prominent"
		cornerRadius="full"
		padding="xs"
		class={inline ? 'tab-bar-container-inline' : 'tab-bar-container'}
	>
		<div class="tab-bar-wrapper" bind:this={wrapperEl}>
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
						bind:this={buttonEls[tab.id]}
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

	:global(.tab-bar-container) {
		position: fixed;
		bottom: var(--spacing-md);
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
	}

	:global(.tab-bar-container-inline) {
		display: block;
	}

	.tab-view.inline {
		display: block;
		min-height: 0;
	}

	.tab-bar-wrapper {
		position: relative;
		display: block;
	}

	:global(.tab-bar) {
		min-width: 0;
		position: relative;
		z-index: 1;
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
		transition:
			transform var(--transition-spring),
			width var(--transition-spring),
			opacity var(--transition-fast);
	}

	.tab-indicator.ready {
		opacity: 1;
	}

	.tab-item {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 10px 20px;
		background: transparent;
		border: none;
		border-radius: var(--glass-radius-full);
		color: var(--color-text-secondary);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: color var(--transition-fast);
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
		transform-origin: center;
		transform: scale(1);
		transition: transform var(--transition-spring);
		will-change: transform;
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
