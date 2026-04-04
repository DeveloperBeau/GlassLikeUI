<script lang="ts">
	import type { Snippet } from 'svelte';
	import { HStack } from '../layout';
	import { VStack } from '../layout';
	import { SymbolImage } from '../media';

	interface Props {
		children: Snippet;
		leading?: Snippet;
		trailing?: Snippet;
		subtitle?: string;
		showDivider?: boolean;
		interactive?: boolean;
		href?: string;
		onclick?: () => void;
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
		class: className = ''
	}: Props = $props();

	const isInteractive = $derived(interactive || !!href || !!onclick);
</script>

{#if href}
	<a {href} class="list-row {className}" class:interactive={isInteractive} class:has-divider={showDivider}>
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
			{:else if isInteractive}
				<SymbolImage name="chevron.right" size="sm" color="tertiary" />
			{/if}
		</HStack>
	</a>
{:else if onclick}
	<button class="list-row {className}" class:interactive={isInteractive} class:has-divider={showDivider} {onclick}>
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
			{:else if isInteractive}
				<SymbolImage name="chevron.right" size="sm" color="tertiary" />
			{/if}
		</HStack>
	</button>
{:else}
	<div class="list-row {className}" class:has-divider={showDivider}>
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
			{/if}
		</HStack>
	</div>
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
</style>
