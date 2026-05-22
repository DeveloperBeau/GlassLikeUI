<script lang="ts">
	import { MenuItem } from '$lib';

	interface Props {
		label?: string;
		icon?: string;
		href?: string;
		onclick?: () => void;
		destructive?: boolean;
		class?: string;
	}

	let {
		label = 'Item',
		icon,
		href,
		onclick,
		destructive = false,
		class: className = ''
	}: Props = $props();
</script>

<MenuItem {icon} {href} {onclick} {destructive} class={className}>
	{#snippet children()}
		{label}
	{/snippet}
</MenuItem>
