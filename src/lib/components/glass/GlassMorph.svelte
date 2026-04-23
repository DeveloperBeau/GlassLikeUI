<!--
  Marks a subtree with a view-transition-name so that calls to
  withGlassTransition() animate matched glassIds across route or state
  changes. A no-op on browsers without View Transitions API.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		children: Snippet;
		tag?: 'div' | 'span' | 'section';
		class?: string;
	}

	let { id, children, tag = 'div', class: className = '' }: Props = $props();
</script>

{#if tag === 'span'}
	<span class="glass-morph {className}" style="view-transition-name: glass-{id};">
		{@render children()}
	</span>
{:else if tag === 'section'}
	<section class="glass-morph {className}" style="view-transition-name: glass-{id};">
		{@render children()}
	</section>
{:else}
	<div class="glass-morph {className}" style="view-transition-name: glass-{id};">
		{@render children()}
	</div>
{/if}

<style>
	.glass-morph {
		/* View Transitions needs a rendered box, so no display: contents here.
		   Keep this wrapper transparent to layout by inheriting flow. */
		display: inline;
	}
	.glass-morph:where(div, section) {
		display: block;
	}
</style>
