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
		onClose?: () => void;
		onDetentChange?: (name: SheetDetentName) => void;
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
		onClose,
		onDetentChange,
		class: className = ''
	}: Props = $props();

	const rest = $derived({
		...(onClose === undefined ? {} : { onClose }),
		...(onDetentChange === undefined ? {} : { onDetentChange })
	});
</script>

<Sheet
	bind:isOpen
	{title}
	{detents}
	{initialDetent}
	{showHandle}
	{draggable}
	{...rest}
	class={className}
>
	{#snippet children()}
		<div class="content">{content}</div>
	{/snippet}
</Sheet>
