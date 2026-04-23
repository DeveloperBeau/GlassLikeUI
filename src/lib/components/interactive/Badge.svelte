<script lang="ts">
	interface Props {
		label: string;
		variant?: 'default' | 'accent';
		size?: 'sm' | 'md';
		class?: string;
	}

	let {
		label,
		variant = 'default',
		size = 'md',
		class: className = ''
	}: Props = $props();
</script>

<span class="badge variant-{variant} size-{size} {className}">
	{label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--glass-radius-full);
		font-weight: 500;
		white-space: nowrap;
	}

	.badge.size-sm {
		padding: 4px 10px;
		font-size: 0.6875rem;
	}

	.badge.size-md {
		padding: 6px 14px;
		font-size: 0.75rem;
	}

	.badge.variant-default {
		background: var(--glass-badge-bg);
		color: var(--color-text-secondary);
		border: 1px solid var(--glass-border);
	}

	.badge.variant-accent {
		background: var(--color-accent-15);
		color: var(--color-accent);
		border: 1px solid var(--color-accent-25);
	}
</style>
