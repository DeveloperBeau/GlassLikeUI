<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		columns?: number | 'auto';
		minItemWidth?: string;
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let {
		children,
		columns = 'auto',
		minItemWidth = '300px',
		spacing = 'md',
		class: className = ''
	}: Props = $props();

	const spacingMap = {
		none: '0',
		xs: 'var(--spacing-xs)',
		sm: 'var(--spacing-sm)',
		md: 'var(--spacing-md)',
		lg: 'var(--spacing-lg)',
		xl: 'var(--spacing-xl)'
	};

	const gridTemplate = $derived(
		columns === 'auto'
			? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
			: `repeat(${columns}, 1fr)`
	);
</script>

<div
	class="grid {className}"
	style="
		--grid-template: {gridTemplate};
		--grid-spacing: {spacingMap[spacing]};
	"
>
	{@render children()}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: var(--grid-template);
		gap: var(--grid-spacing);
	}
</style>
