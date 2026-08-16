<script lang="ts">
	import { NavigationLink } from '$lib';

	interface Props {
		text?: string;
		href?: string;
		active?: boolean;
		class?: string;
	}

	let { text = 'Home', href = '/', active, class: className = '' }: Props = $props();

	const activeProp = $derived(active === undefined ? {} : { active });
</script>

<NavigationLink {href} {...activeProp} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</NavigationLink>
