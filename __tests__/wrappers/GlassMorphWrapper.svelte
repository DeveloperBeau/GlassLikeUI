<script lang="ts">
	import { GlassMorph } from '$lib';

	interface Props {
		id?: string;
		tag?: 'div' | 'span' | 'section';
		content?: string;
		class?: string;
	}

	let { id = 'hero', tag = 'div', content = 'Morphing content', class: className = '' }: Props = $props();
</script>

<GlassMorph {id} {tag} class={className}>
	{#snippet children()}
		<span>{content}</span>
	{/snippet}
</GlassMorph>
