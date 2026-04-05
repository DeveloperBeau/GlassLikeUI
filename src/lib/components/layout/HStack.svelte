<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		alignment?: 'top' | 'center' | 'bottom' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
		wrap?: boolean;
		padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let {
		children,
		spacing = 'md',
		alignment = 'center',
		justify = 'start',
		wrap = false,
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
		top: 'flex-start',
		center: 'center',
		bottom: 'flex-end',
		stretch: 'stretch'
	};

	const justifyMap = {
		start: 'flex-start',
		center: 'center',
		end: 'flex-end',
		between: 'space-between',
		around: 'space-around',
		evenly: 'space-evenly'
	};
</script>

<div
	class="hstack {className}"
	class:wrap
	style="
		--hstack-spacing: {spacingMap[spacing]};
		--hstack-alignment: {alignmentMap[alignment]};
		--hstack-justify: {justifyMap[justify]};
		--hstack-padding: {spacingMap[padding]};
	"
>
	{@render children()}
</div>

<style>
	.hstack {
		display: flex;
		flex-direction: row;
		gap: var(--hstack-spacing);
		align-items: var(--hstack-alignment);
		justify-content: var(--hstack-justify);
		padding: var(--hstack-padding);
	}

	.hstack.wrap {
		flex-wrap: wrap;
	}
</style>
