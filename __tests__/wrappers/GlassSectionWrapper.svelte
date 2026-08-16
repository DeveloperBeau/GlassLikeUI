<script lang="ts">
	import { GlassSection } from '$lib';
	import type { GlassVariant, GlassIntensity } from '$lib';

	interface Props {
		text?: string;
		title?: string;
		subtitle?: string;
		variant?: GlassVariant;
		intensity?: GlassIntensity;
		fullWidth?: boolean;
		class?: string;
	}

	let {
		text = 'Body',
		title,
		subtitle,
		variant,
		intensity,
		fullWidth,
		class: className = ''
	}: Props = $props();

	// Spread conditionally so an omitted prop stays omitted and the component's
	// own default is what gets exercised.
	const rest = $derived({
		...(title === undefined ? {} : { title }),
		...(subtitle === undefined ? {} : { subtitle }),
		...(variant === undefined ? {} : { variant }),
		...(intensity === undefined ? {} : { intensity }),
		...(fullWidth === undefined ? {} : { fullWidth })
	});
</script>

<GlassSection {...rest} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</GlassSection>
