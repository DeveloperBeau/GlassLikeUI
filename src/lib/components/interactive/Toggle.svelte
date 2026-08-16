<script lang="ts">
	interface Props {
		/** Two-way bound on/off state. */
		checked?: boolean;
		label: string;
		disabled?: boolean;
		onchange?: ((checked: boolean) => void) | undefined;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label,
		disabled = false,
		onchange,
		class: className = ''
	}: Props = $props();

	function handleChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		// A disabled control must never report a value the user could not set.
		// Browsers suppress the event; a programmatic dispatch does not.
		if (disabled) {
			input.checked = checked;
			return;
		}
		checked = input.checked;
		onchange?.(checked);
	}
</script>

<label class="toggle {className}" class:is-disabled={disabled}>
	<span class="toggle-label">{label}</span>
	<input
		type="checkbox"
		role="switch"
		class="toggle-input"
		checked={checked}
		aria-checked={checked}
		{disabled}
		onchange={handleChange}
	/>
	<span class="toggle-track" aria-hidden="true">
		<span class="toggle-thumb"></span>
	</span>
</label>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		font-family: var(--font-system);
		font-size: 1rem;
		color: var(--color-text);
		cursor: pointer;
	}

	.toggle.is-disabled {
		opacity: 0.5;
		cursor: default;
	}

	/* The native input stays in the layout for focus and hit-testing; the track
	   below is the visible control. */
	.toggle-input {
		position: absolute;
		width: 51px;
		height: 31px;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}

	.toggle-track {
		position: relative;
		flex-shrink: 0;
		width: 51px;
		height: 31px;
		border-radius: var(--glass-radius-full);
		background: var(--glass-track, rgba(120, 120, 128, 0.32));
		transition: background var(--transition-fast);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 27px;
		height: 27px;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
		transition: transform var(--transition-fast);
	}

	.toggle-input:checked ~ .toggle-track {
		background: var(--color-accent);
	}

	.toggle-input:checked ~ .toggle-track .toggle-thumb {
		transform: translateX(20px);
	}

	.toggle-input:focus-visible ~ .toggle-track {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
