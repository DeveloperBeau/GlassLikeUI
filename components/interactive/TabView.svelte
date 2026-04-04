<script lang="ts">
	import type { Snippet } from 'svelte';
	import { LiquidGlass } from '../glass';
	import { HStack } from '../layout';

	interface Tab {
		id: string;
		label: string;
		icon?: Snippet;
	}

	interface Props {
		tabs: Tab[];
		activeTab?: string;
		children: Snippet<[string]>;
		position?: 'top' | 'bottom';
		class?: string;
	}

	let {
		tabs,
		activeTab = $bindable(tabs[0]?.id || ''),
		children,
		position = 'bottom',
		class: className = ''
	}: Props = $props();

	function selectTab(tabId: string) {
		activeTab = tabId;
	}
</script>

<div class="tab-view {className}" class:position-bottom={position === 'bottom'}>
	<div class="tab-content">
		{@render children(activeTab)}
	</div>

	<LiquidGlass material="thick" cornerRadius="full" padding="xs" class="tab-bar-container">
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
	</LiquidGlass>
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

	:global(.tab-bar) {
		min-width: 0;
	}

	.tab-item {
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
		transition: all var(--transition-fast);
	}

	.tab-item:hover {
		color: var(--color-text);
		background: var(--glass-hover-subtle);
	}

	.tab-item.active {
		color: var(--color-accent);
		background: var(--glass-active-bg);
	}

	.tab-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.tab-label {
		white-space: nowrap;
	}
</style>
