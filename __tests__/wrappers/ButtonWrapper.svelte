<script lang="ts">
	import { Button } from '$lib';

	interface Props {
		text?: string;
		variant?: 'filled' | 'outlined' | 'plain' | 'tinted' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		disabled?: boolean;
		href?: string;
		target?: '_blank' | '_self' | '_parent' | '_top';
		rel?: string;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
	}

	let {
		text = 'Button',
		variant = 'filled',
		size = 'md',
		fullWidth = false,
		disabled = false,
		href,
		target,
		rel,
		onclick,
		type,
		class: className = ''
	}: Props = $props();
</script>

<Button {variant} {size} {fullWidth} {disabled} {href} {target} {rel} {onclick} {type} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</Button>
