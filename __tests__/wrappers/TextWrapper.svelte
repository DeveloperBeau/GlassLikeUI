<script lang="ts">
	import { Text } from '$lib';

	interface Props {
		content?: string;
		size?: 'xs' | 'sm' | 'body' | 'callout' | 'headline' | 'title1' | 'title2' | 'title3' | 'largeTitle' | 'hero';
		weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
		color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'white';
		alignment?: 'leading' | 'center' | 'trailing';
		gradient?: boolean;
		class?: string;
		id?: string;
	}

	let {
		content = 'Text',
		size = 'body',
		weight = 'regular',
		color = 'primary',
		alignment = 'leading',
		gradient = false,
		class: className = '',
		id
	}: Props = $props();
</script>

<Text {size} {weight} {color} {alignment} {gradient} class={className} {id}>
	{#snippet children()}
		{content}
	{/snippet}
</Text>
