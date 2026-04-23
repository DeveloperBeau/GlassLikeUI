<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Glass } from '../glass';

	interface Props {
		children: Snippet;
		style?: 'plain' | 'inset' | 'grouped' | 'insetGrouped';
		class?: string;
	}

	let {
		children,
		style: listStyle = 'insetGrouped',
		class: className = ''
	}: Props = $props();
</script>

{#if listStyle === 'plain'}
	<div class="list list-plain {className}">
		{@render children()}
	</div>
{:else}
	<Glass variant="regular" intensity="standard" padding="none" cornerRadius="xl" class="list list-{listStyle} {className}">
		{@render children()}
	</Glass>
{/if}

<style>
	:global(.list) {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	:global(.list-plain) {
		background: transparent;
	}

	:global(.list-inset) {
		margin: 0 var(--spacing-md);
	}

	:global(.list-grouped) {
		border-radius: 0;
	}

	:global(.list-insetGrouped) {
		margin: 0;
	}
</style>
