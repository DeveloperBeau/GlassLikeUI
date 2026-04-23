<script lang="ts">
	import { Button } from '$lib';

	interface Props {
		text?: string;
		variant?: 'filled' | 'glass' | 'outlined' | 'plain' | 'tinted';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		disabled?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let {
		text = 'Button',
		variant = 'filled',
		size = 'md',
		fullWidth = false,
		disabled = false,
		href,
		onclick,
		class: className = ''
	}: Props = $props();
</script>

<Button {variant} {size} {fullWidth} {disabled} {href} {onclick} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</Button>
