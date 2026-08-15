<script lang="ts">
	import { ListRow } from '$lib';

	interface Props {
		text?: string;
		subtitle?: string;
		showDivider?: boolean;
		interactive?: boolean;
		href?: string;
		onclick?: () => void;
		withLeading?: boolean;
		withTrailing?: boolean;
		withSwipeActions?: boolean;
		swipeEdge?: 'leading' | 'trailing';
		allowsFullSwipe?: boolean;
		onFullSwipe?: () => void;
		class?: string;
	}

	let {
		text = 'Title',
		subtitle,
		showDivider,
		interactive,
		href,
		onclick,
		withLeading = false,
		withTrailing = false,
		withSwipeActions = false,
		swipeEdge,
		allowsFullSwipe,
		onFullSwipe,
		class: className = ''
	}: Props = $props();

	// Spread conditionally so an omitted prop stays omitted and the component's
	// own default is what gets exercised.
	const rest = $derived({
		...(subtitle === undefined ? {} : { subtitle }),
		...(showDivider === undefined ? {} : { showDivider }),
		...(interactive === undefined ? {} : { interactive }),
		...(href === undefined ? {} : { href }),
		...(onclick === undefined ? {} : { onclick }),
		...(withLeading ? { leading: leadingSnippet } : {}),
		...(withTrailing ? { trailing: trailingSnippet } : {}),
		...(withSwipeActions ? { swipeActions: swipeActionsSnippet } : {}),
		...(swipeEdge === undefined ? {} : { swipeEdge }),
		...(allowsFullSwipe === undefined ? {} : { allowsFullSwipe }),
		...(onFullSwipe === undefined ? {} : { onFullSwipe })
	});
</script>

{#snippet leadingSnippet()}
	<span data-testid="leading">L</span>
{/snippet}

{#snippet trailingSnippet()}
	<span data-testid="trailing">T</span>
{/snippet}

{#snippet swipeActionsSnippet()}
	<button type="button" data-testid="swipe-delete">Delete</button>
{/snippet}

<ListRow {...rest} class={className}>
	{#snippet children()}
		{text}
	{/snippet}
</ListRow>
