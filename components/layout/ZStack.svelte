<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		alignment?: 'topLeading' | 'top' | 'topTrailing' | 'leading' | 'center' | 'trailing' | 'bottomLeading' | 'bottom' | 'bottomTrailing';
		class?: string;
	}

	let {
		children,
		alignment = 'center',
		class: className = ''
	}: Props = $props();

	const alignmentStyles = {
		topLeading: { justifyContent: 'flex-start', alignItems: 'flex-start' },
		top: { justifyContent: 'center', alignItems: 'flex-start' },
		topTrailing: { justifyContent: 'flex-end', alignItems: 'flex-start' },
		leading: { justifyContent: 'flex-start', alignItems: 'center' },
		center: { justifyContent: 'center', alignItems: 'center' },
		trailing: { justifyContent: 'flex-end', alignItems: 'center' },
		bottomLeading: { justifyContent: 'flex-start', alignItems: 'flex-end' },
		bottom: { justifyContent: 'center', alignItems: 'flex-end' },
		bottomTrailing: { justifyContent: 'flex-end', alignItems: 'flex-end' }
	};

	const style = $derived(alignmentStyles[alignment]);
</script>

<div
	class="zstack {className}"
	style="
		--zstack-justify: {style.justifyContent};
		--zstack-align: {style.alignItems};
	"
>
	{@render children()}
</div>

<style>
	.zstack {
		display: grid;
		place-items: center;
		position: relative;
	}

	.zstack > :global(*) {
		grid-area: 1 / 1;
	}
</style>
