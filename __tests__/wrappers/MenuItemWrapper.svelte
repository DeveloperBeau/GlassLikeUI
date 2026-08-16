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

	// Spread conditionally so an omitted prop stays omitted, which
	// `exactOptionalPropertyTypes` distinguishes from an explicit undefined.
	const rest = $derived({
		...(icon === undefined ? {} : { icon }),
		...(href === undefined ? {} : { href }),
		...(onclick === undefined ? {} : { onclick })
	});
</script>

<MenuItem {...rest} {destructive} class={className}>
	{#snippet children()}
		{label}
	{/snippet}
</MenuItem>
