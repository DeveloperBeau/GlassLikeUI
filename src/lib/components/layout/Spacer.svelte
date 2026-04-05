<script lang="ts">
	interface Props {
		minLength?: number;
		class?: string;
	}

	let { minLength = 0, class: className = '' }: Props = $props();
</script>

<div class="spacer {className}" style="--spacer-min: {minLength}px"></div>

<style>
	.spacer {
		flex: 1 1 auto;
		min-width: var(--spacer-min);
		min-height: var(--spacer-min);
	}
</style>
