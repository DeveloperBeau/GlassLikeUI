<script module>
	let counter = 0;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';

	interface Props {
		label: Snippet;
		children: Snippet;
		align?: 'start' | 'end';
		class?: string;
	}

	let { label, children, align = 'start', class: className = '' }: Props = $props();

	// Note: counter resets between SSR and client hydration; aria-controls mismatch
	// is inert because the panel is not rendered on initial load (open defaults false).
	const panelId = `glass-menu-${++counter}`;
	const isBrowser = typeof window !== 'undefined';

	let open = $state(false);
	let triggerEl = $state<HTMLButtonElement>();
	let panelEl = $state<HTMLDivElement>();

	function menuItems(): HTMLElement[] {
		if (!panelEl) return [];
		return Array.from(panelEl.querySelectorAll<HTMLElement>('[role="menuitem"]'));
	}

	async function openMenu() {
		open = true;
		await tick();
		menuItems()[0]?.focus();
	}

	function closeMenu(focusTrigger = false) {
		open = false;
		if (focusTrigger) triggerEl?.focus();
	}

	function toggle() {
		if (open) closeMenu();
		else openMenu();
	}

	function handlePanelKeydown(e: KeyboardEvent) {
		const items = menuItems();
		if (items.length === 0) return;
		const current = items.indexOf(document.activeElement as HTMLElement);

		if (e.key === 'Escape') {
			e.preventDefault();
			closeMenu(true);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			items[(current + 1) % items.length]?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			items[(current - 1 + items.length) % items.length]?.focus();
		} else if (e.key === 'Home') {
			e.preventDefault();
			items[0]?.focus();
		} else if (e.key === 'End') {
			e.preventDefault();
			items[items.length - 1]?.focus();
		}
	}

	function handlePanelClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('[role="menuitem"]')) {
			closeMenu();
		}
	}

	$effect(() => {
		if (!open || !isBrowser) return;
		const panel = panelEl;
		if (!panel) return;

		function onPointerDown(e: PointerEvent) {
			const target = e.target as Node;
			if (triggerEl?.contains(target) || panel.contains(target)) return;
			closeMenu();
		}

		panel.addEventListener('keydown', handlePanelKeydown);
		panel.addEventListener('click', handlePanelClick);
		document.addEventListener('pointerdown', onPointerDown, true);

		return () => {
			panel.removeEventListener('keydown', handlePanelKeydown);
			panel.removeEventListener('click', handlePanelClick);
			document.removeEventListener('pointerdown', onPointerDown, true);
		};
	});
</script>

<div class="glass-menu">
	<button
		bind:this={triggerEl}
		type="button"
		class="glass-menu-trigger {className}"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls={panelId}
		onclick={toggle}
	>
		{@render label()}
	</button>

	{#if open}
		<div
			bind:this={panelEl}
			id={panelId}
			role="menu"
			class="glass-menu-panel"
			class:align-end={align === 'end'}
		>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.glass-menu {
		position: relative;
		display: inline-flex;
	}

	.glass-menu-trigger {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.glass-menu-panel {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		min-width: 220px;
		padding: 0;
		overflow: hidden;
		background: var(--glass-sheet-bg);
		backdrop-filter: blur(var(--glass-blur-nav)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur-nav)) saturate(var(--glass-saturation));
		border: var(--glass-border-width) solid var(--glass-border);
		border-radius: var(--glass-radius-md);
		box-shadow:
			0 12px 40px -8px var(--glass-shadow),
			0 4px 12px -2px var(--glass-shadow);
		z-index: 200;
		transform-origin: top left;
		animation: glass-menu-pop 0.18s cubic-bezier(0.32, 0.72, 0, 1);
	}

	.glass-menu-panel.align-end {
		left: auto;
		right: 0;
		transform-origin: top right;
	}

	/* Hairline divider between consecutive items. */
	.glass-menu-panel :global(.menu-item + .menu-item) {
		border-top: var(--glass-border-width) solid var(--glass-divider);
	}

	@keyframes glass-menu-pop {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glass-menu-panel {
			animation: glass-menu-fade 0.01s linear;
		}
	}

	:global([data-reduced-motion='true']) .glass-menu-panel {
		animation: glass-menu-fade 0.01s linear;
	}

	@keyframes glass-menu-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
