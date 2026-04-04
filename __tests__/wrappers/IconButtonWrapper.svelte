<script lang="ts">
	import { IconButton, SymbolImage } from '$lib/liquidglass';

	interface Props {
		icon?: string;
		variant?: 'plain' | 'glass' | 'filled';
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let {
		icon = 'star',
		variant = 'plain',
		size = 'md',
		label = 'Icon Button',
		onclick,
		class: className = ''
	}: Props = $props();
</script>

<IconButton {variant} {size} {label} {onclick} class={className}>
	{#snippet children()}
		<SymbolImage name={icon} />
	{/snippet}
</IconButton>
