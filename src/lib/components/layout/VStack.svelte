<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		alignment?: 'leading' | 'center' | 'trailing' | 'stretch';
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let {
		children,
		spacing = 'md',
		alignment = 'stretch',
		padding = 'none',
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

	const alignmentMap = {
		leading: 'flex-start',
		center: 'center',
		trailing: 'flex-end',
		stretch: 'stretch'
	};
</script>

<div
	class="vstack {className}"
	style="
		--vstack-spacing: {spacingMap[spacing]};
		--vstack-alignment: {alignmentMap[alignment]};
		--vstack-padding: {spacingMap[padding]};
	"
>
	{@render children()}
</div>

<style>
	.vstack {
		display: flex;
		flex-direction: column;
		gap: var(--vstack-spacing);
		align-items: var(--vstack-alignment);
		padding: var(--vstack-padding);
	}
</style>
