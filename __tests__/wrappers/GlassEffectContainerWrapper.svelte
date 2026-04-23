<script lang="ts">
	import { GlassEffectContainer, Glass } from '$lib';

	interface Props {
		spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
		direction?: 'horizontal' | 'vertical';
		merge?: boolean;
		count?: number;
		class?: string;
	}

	let {
		spacing = 'xs',
		direction = 'horizontal',
		merge = true,
		count = 2,
		class: className = ''
	}: Props = $props();
</script>

<GlassEffectContainer {spacing} {direction} {merge} class={className}>
	{#snippet children()}
		{#each Array.from({ length: count }) as _, i (i)}
			<Glass>
				{#snippet children()}
					<span>Child {i + 1}</span>
				{/snippet}
			</Glass>
		{/each}
	{/snippet}
</GlassEffectContainer>
