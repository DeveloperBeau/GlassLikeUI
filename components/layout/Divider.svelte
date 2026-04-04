<script lang="ts">
	interface Props {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	}

	let {
		orientation = 'horizontal',
		class: className = ''
	}: Props = $props();
</script>

<div class="divider {orientation} {className}"></div>

<style>
	.divider {
		background: var(--glass-divider);
		flex-shrink: 0;
	}

	.divider.horizontal {
		width: 100%;
		height: 1px;
	}

	.divider.vertical {
		width: 1px;
		height: 100%;
		min-height: 16px;
	}
</style>
