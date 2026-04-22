<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		size?: 'xs' | 'sm' | 'body' | 'callout' | 'headline' | 'title1' | 'title2' | 'title3' | 'largeTitle' | 'hero';
		weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
		color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'white' | 'danger';
		alignment?: 'leading' | 'center' | 'trailing';
		gradient?: boolean;
		class?: string;
		id?: string;
	}

	let {
		children,
		size = 'body',
		weight = 'regular',
		color = 'primary',
		alignment = 'leading',
		gradient = false,
		class: className = '',
		id
	}: Props = $props();

	const sizeMap = {
		xs: { fontSize: '0.6875rem', lineHeight: '1.4' },
		sm: { fontSize: '0.8125rem', lineHeight: '1.4' },
		body: { fontSize: '1rem', lineHeight: '1.6' },
		callout: { fontSize: '1.0625rem', lineHeight: '1.5' },
		headline: { fontSize: '1.125rem', lineHeight: '1.4' },
		title3: { fontSize: '1.25rem', lineHeight: '1.3' },
		title2: { fontSize: '1.5rem', lineHeight: '1.25' },
		title1: { fontSize: 'clamp(1.75rem, 4vw, 2rem)', lineHeight: '1.2' },
		largeTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: '1.1' },
		hero: { fontSize: 'clamp(3rem, 12vw, 6rem)', lineHeight: '1' }
	};

	const weightMap = {
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
		heavy: 800
	};

	const colorMap = {
		primary: 'var(--color-text)',
		secondary: 'var(--color-text-secondary)',
		tertiary: 'var(--color-text-tertiary)',
		accent: 'var(--color-accent)',
		white: '#ffffff',
		danger: 'var(--color-danger, #ef4444)'
	};

	const alignmentMap = {
		leading: 'left',
		center: 'center',
		trailing: 'right'
	};

	const styles = $derived(sizeMap[size]);
</script>

<span
	{id}
	class="text {className}"
	class:gradient
	style="
		--text-size: {styles.fontSize};
		--text-line-height: {styles.lineHeight};
		--text-weight: {weightMap[weight]};
		--text-color: {colorMap[color]};
		--text-align: {alignmentMap[alignment]};
	"
>
	{@render children()}
</span>

<style>
	.text {
		display: block;
		font-size: var(--text-size);
		line-height: var(--text-line-height);
		font-weight: var(--text-weight);
		color: var(--text-color);
		text-align: var(--text-align);
		letter-spacing: -0.01em;
	}

	.text.gradient {
		background: var(--glass-text-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
