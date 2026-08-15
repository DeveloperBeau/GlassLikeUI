import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import fc from 'fast-check';
import ToggleWrapper from '../wrappers/ToggleWrapper.svelte';

const sw = () => screen.getByRole('switch') as HTMLInputElement;
const bound = () => screen.getByTestId('bound-value').textContent;

describe('Toggle Component', () => {
	describe('Rendering', () => {
		it('renders as a switch, not a bare checkbox', () => {
			render(ToggleWrapper, { props: { label: 'Wi-Fi' } });

			expect(sw()).toBeInTheDocument();
			expect(sw().type).toBe('checkbox');
		});

		it('takes its accessible name from the label', () => {
			render(ToggleWrapper, { props: { label: 'Aeroplane Mode' } });

			expect(screen.getByRole('switch', { name: 'Aeroplane Mode' })).toBeInTheDocument();
		});

		it('renders the label text visibly', () => {
			render(ToggleWrapper, { props: { label: 'Bluetooth' } });

			expect(screen.getByText('Bluetooth')).toBeInTheDocument();
		});

		it('applies a custom class alongside its own', () => {
			const { container } = render(ToggleWrapper, { props: { class: 'mine' } });

			const el = container.querySelector('.toggle');
			expect(el).toHaveClass('toggle');
			expect(el).toHaveClass('mine');
		});

		it('starts off by default', () => {
			render(ToggleWrapper, {});

			expect(sw().checked).toBe(false);
			expect(sw()).toHaveAttribute('aria-checked', 'false');
		});

		it('honours an initial checked value', () => {
			render(ToggleWrapper, { props: { initial: true } });

			expect(sw().checked).toBe(true);
			expect(sw()).toHaveAttribute('aria-checked', 'true');
		});
	});

	describe('Interaction', () => {
		it('flips on when clicked', async () => {
			render(ToggleWrapper, { props: { initial: false } });

			await fireEvent.click(sw());

			expect(sw().checked).toBe(true);
			expect(sw()).toHaveAttribute('aria-checked', 'true');
		});

		it('flips off when clicked again', async () => {
			render(ToggleWrapper, { props: { initial: true } });

			await fireEvent.click(sw());

			expect(sw().checked).toBe(false);
		});

		it('writes through the two-way binding', async () => {
			render(ToggleWrapper, { props: { initial: false } });
			expect(bound()).toBe('false');

			await fireEvent.click(sw());

			expect(bound()).toBe('true');
		});

		it('calls onchange with the new value', async () => {
			const onchange = vi.fn();
			render(ToggleWrapper, { props: { initial: false, onchange } });

			await fireEvent.click(sw());

			expect(onchange).toHaveBeenCalledTimes(1);
			expect(onchange).toHaveBeenCalledWith(true);
		});

		it('calls onchange with false when switching off', async () => {
			const onchange = vi.fn();
			render(ToggleWrapper, { props: { initial: true, onchange } });

			await fireEvent.click(sw());

			expect(onchange).toHaveBeenCalledWith(false);
		});

		it('does not call onchange on render', () => {
			const onchange = vi.fn();
			render(ToggleWrapper, { props: { initial: true, onchange } });

			expect(onchange).not.toHaveBeenCalled();
		});

		it('works without an onchange handler', async () => {
			render(ToggleWrapper, { props: { initial: false } });

			await fireEvent.click(sw());

			expect(sw().checked).toBe(true);
		});
	});

	describe('Disabled', () => {
		it('marks the control disabled', () => {
			render(ToggleWrapper, { props: { disabled: true } });

			expect(sw()).toBeDisabled();
		});

		it('does not change when a disabled switch is clicked', async () => {
			render(ToggleWrapper, { props: { initial: false, disabled: true } });

			await fireEvent.click(sw());

			expect(sw().checked).toBe(false);
			expect(bound()).toBe('false');
		});

		it('does not call onchange when disabled', async () => {
			const onchange = vi.fn();
			render(ToggleWrapper, { props: { disabled: true, onchange } });

			await fireEvent.click(sw());

			expect(onchange).not.toHaveBeenCalled();
		});

		it('marks the wrapper so it can be dimmed', () => {
			const { container } = render(ToggleWrapper, { props: { disabled: true } });

			expect(container.querySelector('.toggle')).toHaveClass('is-disabled');
		});
	});

	describe('Keyboard', () => {
		it('is reachable by keyboard', () => {
			render(ToggleWrapper, {});

			sw().focus();

			expect(sw()).toHaveFocus();
		});

		// A div-based switch would need a manual key handler; a real checkbox gets
		// Space activation from the platform. Assert the element type that grants it.
		it('uses a native input so the platform handles Space', () => {
			render(ToggleWrapper, {});

			expect(sw().tagName).toBe('INPUT');
		});
	});

	describe('fuzz', () => {
		// FALSE NEGATIVE validation: no click may be swallowed. After n clicks the
		// state must be the parity of n, and every click must have reported.
		it('tracks click parity exactly, for any number of clicks', async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.integer({ min: 0, max: 24 }),
					fc.boolean(),
					async (clicks, initial) => {
						const onchange = vi.fn();
						const { unmount } = render(ToggleWrapper, { props: { initial, onchange } });
						const el = screen.getByRole('switch') as HTMLInputElement;

						for (let i = 0; i < clicks; i++) await fireEvent.click(el);

						const expected = clicks % 2 === 0 ? initial : !initial;
						expect(el.checked).toBe(expected);
						expect(el.getAttribute('aria-checked')).toBe(String(expected));
						expect(onchange).toHaveBeenCalledTimes(clicks);
						unmount();
					}
				),
				{ numRuns: 40 }
			);
		});

		// FALSE POSITIVE validation: a disabled switch must never report a change,
		// however hard it is clicked.
		it('never reports a change while disabled', async () => {
			await fc.assert(
				fc.asyncProperty(
					fc.integer({ min: 1, max: 20 }),
					fc.boolean(),
					async (clicks, initial) => {
						const onchange = vi.fn();
						const { unmount } = render(ToggleWrapper, {
							props: { initial, disabled: true, onchange }
						});
						const el = screen.getByRole('switch') as HTMLInputElement;

						for (let i = 0; i < clicks; i++) await fireEvent.click(el);

						expect(el.checked).toBe(initial);
						expect(onchange).not.toHaveBeenCalled();
						unmount();
					}
				),
				{ numRuns: 30 }
			);
		});

		// The three views of the same state must never disagree: DOM property,
		// ARIA attribute, and the value handed to the parent.
		it('keeps checked, aria-checked and the binding in agreement', async () => {
			await fc.assert(
				fc.asyncProperty(fc.array(fc.constant(0), { maxLength: 15 }), async (arr) => {
					const seen: boolean[] = [];
					const { unmount } = render(ToggleWrapper, {
						props: { initial: false, onchange: (v: boolean) => seen.push(v) }
					});
					const el = screen.getByRole('switch') as HTMLInputElement;

					for (let i = 0; i < arr.length; i++) {
						await fireEvent.click(el);
						expect(el.getAttribute('aria-checked')).toBe(String(el.checked));
						expect(screen.getByTestId('bound-value').textContent).toBe(String(el.checked));
						expect(seen[seen.length - 1]).toBe(el.checked);
					}
					unmount();
				}),
				{ numRuns: 30 }
			);
		});
	});

	describe('Edge cases', () => {
		it('renders an empty label without losing the control', () => {
			render(ToggleWrapper, { props: { label: '' } });

			expect(sw()).toBeInTheDocument();
		});

		it('escapes markup in the label rather than rendering it', () => {
			const { container } = render(ToggleWrapper, {
				props: { label: '<img src=x onerror=alert(1)>' }
			});

			expect(container.querySelector('.toggle img')).toBeNull();
			expect(container.querySelector('.toggle')).toHaveTextContent(
				'<img src=x onerror=alert(1)>'
			);
		});
	});
});
