<script lang="ts">
	import type { Snippet } from 'svelte';
	import { HStack, Spacer } from '../layout';

	// Browser detection without SvelteKit dependency
	const isBrowser = typeof window !== 'undefined';

	interface Props {
		isOpen?: boolean;
		title?: string;
		children: Snippet;
		onClose?: () => void;
		size?: 'small' | 'medium' | 'large' | 'fullscreen';
		showHandle?: boolean;
		class?: string;
	}

	let {
		isOpen = $bindable(false),
		title = '',
		children,
		onClose,
		size = 'large',
		showHandle = true,
		class: className = ''
	}: Props = $props();

	function close() {
		isOpen = false;
		onClose?.();
		if (isBrowser) {
			document.body.style.overflow = '';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	$effect(() => {
		if (isBrowser && isOpen) {
			document.body.style.overflow = 'hidden';
		}
		return () => {
			if (isBrowser) {
				document.body.style.overflow = '';
			}
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="sheet-backdrop"
		class:open={isOpen}
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="presentation"
	>
		<div class="sheet-container {className} size-{size}" class:open={isOpen}>
			{#if showHandle}
				<div class="sheet-handle-container">
					<div class="sheet-handle"></div>
				</div>
			{/if}

			{#if title}
				<header class="sheet-header">
					<HStack alignment="center">
						<button class="sheet-close-btn" onclick={close} aria-label="Close">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
							<span>Back</span>
						</button>
						<Spacer />
						<h2 class="sheet-title">{title}</h2>
						<Spacer />
						<div class="sheet-spacer"></div>
					</HStack>
				</header>
			{/if}

			<div class="sheet-content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 1000;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s ease;
	}

	.sheet-backdrop.open {
		opacity: 1;
		visibility: visible;
	}

	.sheet-container {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--glass-sheet-bg);
		backdrop-filter: blur(60px) saturate(2);
		-webkit-backdrop-filter: blur(60px) saturate(2);
		border-radius: var(--glass-radius-xl) var(--glass-radius-xl) 0 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transform: translateY(100%);
		transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
		z-index: 1001;
		border-top: 1px solid var(--glass-border);
		box-shadow:
			0 -8px 32px -8px var(--glass-shadow),
			inset 0 1px 0 0 var(--glass-highlight);
	}

	.sheet-container.open {
		transform: translateY(0);
	}

	.sheet-container.size-small {
		top: 60%;
	}

	.sheet-container.size-medium {
		top: 40%;
	}

	.sheet-container.size-large {
		top: 10%;
	}

	.sheet-container.size-fullscreen {
		top: 0;
		border-radius: 0;
	}

	.sheet-handle-container {
		display: flex;
		justify-content: center;
		padding: 8px 0;
	}

	.sheet-handle {
		width: 36px;
		height: 5px;
		background: var(--glass-handle);
		border-radius: 3px;
	}

	.sheet-header {
		padding: 0 var(--spacing-md);
		height: 56px;
		border-bottom: 1px solid var(--glass-divider);
		display: flex;
		align-items: center;
	}

	.sheet-close-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		color: var(--color-accent);
		font-size: 17px;
		font-weight: 400;
		cursor: pointer;
		padding: 8px 0;
		transition: opacity var(--transition-fast);
	}

	.sheet-close-btn:hover {
		opacity: 0.7;
	}

	.sheet-close-btn svg {
		margin-left: -6px;
	}

	.sheet-title {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
	}

	.sheet-spacer {
		width: 80px;
	}

	.sheet-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
	}

	@media (min-width: 769px) {
		.sheet-container {
			left: 50%;
			right: auto;
			transform: translateX(-50%) translateY(100%);
			width: 100%;
			max-width: 900px;
			border-radius: var(--glass-radius-xl) var(--glass-radius-xl) 0 0;
		}

		.sheet-container.open {
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
