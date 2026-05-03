<script lang="ts">
	import { TabView } from '$lib';

	interface Props {
		activeTab?: string;
		position?: 'top' | 'bottom';
		inline?: boolean;
		onchange?: (id: string) => void;
		class?: string;
	}

	let {
		activeTab = 'one',
		position = 'bottom',
		inline = false,
		onchange,
		class: className = ''
	}: Props = $props();

	const tabs = [
		{ id: 'one', label: 'One' },
		{ id: 'two', label: 'Two' },
		{ id: 'three', label: 'Three' }
	];
</script>

<TabView {tabs} {activeTab} {position} {inline} {onchange} class={className} />
