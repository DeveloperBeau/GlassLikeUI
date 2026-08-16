<script lang="ts">
	import { Label } from '$lib';
	import type { LabelStyle } from '$lib';

	interface Props {
		title?: string;
		systemImage?: string;
		labelStyle?: LabelStyle;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		title = 'Favourites',
		systemImage,
		labelStyle = 'automatic',
		size = 'md',
		class: className = ''
	}: Props = $props();
</script>

<Label {title} {systemImage} {labelStyle} {size} class={className} />
