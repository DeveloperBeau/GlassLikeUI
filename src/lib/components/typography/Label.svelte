<script lang="ts">
	import { SymbolImage } from '../media';
	import {
		labelVisibility,
		DEFAULT_LABEL_STYLE,
		type LabelStyle
	} from '../../constants/label';
	import type { IconSize } from '../../constants';

	interface Props {
		title: string;
		systemImage?: string | undefined;
		labelStyle?: LabelStyle;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		title,
		systemImage,
		labelStyle = DEFAULT_LABEL_STYLE,
		size = 'md',
		class: className = ''
	}: Props = $props();

	const visibility = $derived(labelVisibility(labelStyle));
	const iconSize: Record<'sm' | 'md' | 'lg', IconSize> = {
		sm: 'sm',
		md: 'md',
		lg: 'lg'
	};
</script>

<span class="label size-{size} {className}" data-label-style={labelStyle}>
	{#if visibility.showIcon && systemImage}
		<span class="label-icon" aria-hidden="true">
			<SymbolImage name={systemImage} size={iconSize[size]} />
		</span>
	{/if}
	<span class="label-title" class:is-hidden={visibility.titleHidden}>{title}</span>
</span>

<style>
	.label {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-family: var(--font-system);
		color: inherit;
	}

	.label.size-sm {
		font-size: 0.875rem;
	}

	.label.size-md {
		font-size: 1rem;
	}

	.label.size-lg {
		font-size: 1.0625rem;
	}

	.label-icon {
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
	}

	/* Visually hidden, still announced: iconOnly must keep its accessible name. */
	.label-title.is-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
