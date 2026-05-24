<script lang="ts">
	import { Menu, MenuItem } from '$lib';

	interface Props {
		align?: 'start' | 'end';
		class?: string;
	}

	let { align = 'start', class: className = '' }: Props = $props();
</script>

<Menu {align} class={className}>
	{#snippet label()}
		Projects
	{/snippet}
	{#snippet children()}
		<MenuItem href="/plainly-weather" icon="cloud.sun">Plainly Weather</MenuItem>
		<MenuItem href="/murmur" icon="waveform">Murmur</MenuItem>
	{/snippet}
</Menu>
