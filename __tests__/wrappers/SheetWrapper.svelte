<script lang="ts">
	import { Sheet } from '$lib';
	import type { SheetDetentName } from '$lib';

	interface Props {
		isOpen?: boolean;
		title?: string;
		content?: string;
		detents?: readonly SheetDetentName[];
		initialDetent?: SheetDetentName;
		showHandle?: boolean;
		draggable?: boolean;
		class?: string;
	}

	let {
		isOpen = $bindable(true),
		title = '',
		content = 'Sheet content',
		detents = ['medium', 'large'],
		initialDetent = 'medium',
		showHandle = true,
		draggable = true,
		class: className = ''
	}: Props = $props();
</script>

<Sheet
	bind:isOpen
	{title}
	{detents}
	{initialDetent}
	{showHandle}
	{draggable}
	class={className}
>
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
</Sheet>
