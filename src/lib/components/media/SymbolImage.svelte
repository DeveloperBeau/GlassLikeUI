<script lang="ts">
	import { ICON_SIZES, TEXT_COLORS } from '../../constants';
	import { getIconPath } from '../../icons';
	import type { IconSize, TextColor } from '../../constants';

	interface Props {
		name: string;
		size?: IconSize;
		color?: TextColor;
		class?: string;
	}

	let {
		name,
		size = 'md',
		color = 'primary',
		class: className = ''
	}: Props = $props();

	// Security Note: iconPath is always from hardcoded ICONS map, never user input
	const iconPath = $derived(getIconPath(name));
	const pixelSize = $derived(ICON_SIZES[size]);
	const colorValue = $derived(TEXT_COLORS[color]);
</script>

<svg
	class="symbol-image {className}"
	xmlns="http://www.w3.org/2000/svg"
	width={pixelSize}
	height={pixelSize}
	viewBox="0 0 24 24"
	fill="none"
	stroke={colorValue}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	style="color: {colorValue}"
>
	{@html iconPath}
</svg>

<style>
	.symbol-image {
		flex-shrink: 0;
	}
</style>
