<script lang="ts">
	import { IconButton, SymbolImage } from '$lib';

	interface Props {
		icon?: string;
		variant?: 'plain' | 'filled';
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
	}

	let {
		icon = 'star',
		variant = 'plain',
		size = 'md',
		label = 'Icon Button',
		onclick,
		disabled = false,
		type,
		class: className = ''
	}: Props = $props();
</script>

<IconButton {variant} {size} {label} {onclick} {disabled} {type} class={className}>
	{#snippet children()}
		<SymbolImage name={icon} />
	{/snippet}
</IconButton>
