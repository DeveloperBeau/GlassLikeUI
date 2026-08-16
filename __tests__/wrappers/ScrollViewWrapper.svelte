<script lang="ts">
	import { ScrollView } from '$lib';
	import type { ScrollEdgeEffect, ScrollEdgeWhich } from '$lib';

	interface Props {
		text?: string;
		axis?: 'vertical' | 'horizontal' | 'both';
		showsIndicators?: boolean;
		edgeEffect?: 'none' | ScrollEdgeEffect;
		edges?: ScrollEdgeWhich;
		edgeSize?: string;
		onRefresh?: () => void | Promise<void>;
		refreshThreshold?: number;
		class?: string;
	}

	let {
		text = 'Content',
		axis,
		showsIndicators,
		edgeEffect,
		edges,
		edgeSize,
		onRefresh,
		refreshThreshold,
		class: className = ''
	}: Props = $props();

	// Spread conditionally so an omitted prop stays omitted and the component's
	// own default is what gets exercised.
	const rest = $derived({
		...(axis === undefined ? {} : { axis }),
		...(showsIndicators === undefined ? {} : { showsIndicators }),
		...(edgeEffect === undefined ? {} : { edgeEffect }),
		...(edges === undefined ? {} : { edges }),
		...(edgeSize === undefined ? {} : { edgeSize }),
		...(onRefresh === undefined ? {} : { onRefresh }),
		...(refreshThreshold === undefined ? {} : { refreshThreshold })
	});
</script>

<ScrollView {...rest} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</ScrollView>
