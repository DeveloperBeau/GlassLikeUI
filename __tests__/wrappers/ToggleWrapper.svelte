<script lang="ts">
	import { Toggle } from '$lib';
	import { untrack } from 'svelte';

	interface Props {
		label?: string;
		initial?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	let {
		label = 'Wi-Fi',
		initial = false,
		disabled = false,
		onchange,
		class: className = ''
	}: Props = $props();

	// Held here so the test can observe the two-way binding, not just the DOM.
	let checked = $state(untrack(() => initial));
</script>

<Toggle bind:checked {label} {disabled} {onchange} class={className} />
<span data-testid="bound-value">{String(checked)}</span>
