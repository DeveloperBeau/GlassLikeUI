import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncAccessibilityPreferences } from '../../src/lib/actions/a11ySync';

type Listener = (event: Event) => void;

function mockMatchMedia(matches: Record<string, boolean>) {
	const listeners: Record<string, Listener[]> = {};

	const mm = vi.fn((query: string) => {
		listeners[query] ??= [];
		const mql = {
			get matches() {
				return matches[query] ?? false;
			},
			media: query,
			onchange: null,
			// Only 'change' registers: a listener bound to any other event name
			// would never fire in a real browser.
			addEventListener: (type: string, cb: Listener) => {
				if (type !== 'change') return;
				(listeners[query] ??= []).push(cb);
			},
			removeEventListener: (type: string, cb: Listener) => {
				if (type !== 'change') return;
				listeners[query] = (listeners[query] ?? []).filter((fn) => fn !== cb);
			},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false
		};
		return mql as unknown as MediaQueryList;
	});

	return {
		mm,
		trigger(query: string, nextMatches: boolean) {
			matches[query] = nextMatches;
			for (const cb of listeners[query] ?? []) {
				cb({ matches: nextMatches, media: query } as unknown as Event);
			}
		}
	};
}

describe('syncAccessibilityPreferences', () => {
	let originalMatchMedia: typeof window.matchMedia;

	beforeEach(() => {
		originalMatchMedia = window.matchMedia;
		document.documentElement.removeAttribute('data-reduced-transparency');
		document.documentElement.removeAttribute('data-contrast');
		document.documentElement.removeAttribute('data-reduced-motion');
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
		document.documentElement.removeAttribute('data-reduced-transparency');
		document.documentElement.removeAttribute('data-contrast');
		document.documentElement.removeAttribute('data-reduced-motion');
	});

	it('sets reduced-transparency attr when preference is on', () => {
		const { mm } = mockMatchMedia({
			'(prefers-reduced-transparency: reduce)': true
		});
		window.matchMedia = mm;

		syncAccessibilityPreferences();
		expect(document.documentElement.getAttribute('data-reduced-transparency')).toBe('true');
	});

	it('sets contrast=more attr when preference is on', () => {
		const { mm } = mockMatchMedia({
			'(prefers-contrast: more)': true
		});
		window.matchMedia = mm;

		syncAccessibilityPreferences();
		expect(document.documentElement.getAttribute('data-contrast')).toBe('more');
	});

	it('sets reduced-motion attr when preference is on', () => {
		const { mm } = mockMatchMedia({
			'(prefers-reduced-motion: reduce)': true
		});
		window.matchMedia = mm;

		syncAccessibilityPreferences();
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
	});

	it('does not set attrs when no preferences match', () => {
		const { mm } = mockMatchMedia({});
		window.matchMedia = mm;

		syncAccessibilityPreferences();
		expect(document.documentElement.getAttribute('data-reduced-transparency')).toBeNull();
		expect(document.documentElement.getAttribute('data-contrast')).toBeNull();
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBeNull();
	});

	it('responds to preference changes', () => {
		const { mm, trigger } = mockMatchMedia({
			'(prefers-reduced-motion: reduce)': false
		});
		window.matchMedia = mm;

		syncAccessibilityPreferences();
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBeNull();

		trigger('(prefers-reduced-motion: reduce)', true);
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');

		trigger('(prefers-reduced-motion: reduce)', false);
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBeNull();
	});

	it('cleanup detaches listeners', () => {
		const { mm, trigger } = mockMatchMedia({
			'(prefers-reduced-motion: reduce)': false
		});
		window.matchMedia = mm;

		const cleanup = syncAccessibilityPreferences();
		cleanup();

		trigger('(prefers-reduced-motion: reduce)', true);
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBeNull();
	});

	it('returns a noop when matchMedia is unavailable', () => {
		window.matchMedia = undefined as unknown as typeof window.matchMedia;
		const cleanup = syncAccessibilityPreferences();
		expect(typeof cleanup).toBe('function');
		expect(() => cleanup()).not.toThrow();
	});

	it('sets no attributes when matchMedia is unavailable', () => {
		window.matchMedia = undefined as unknown as typeof window.matchMedia;
		syncAccessibilityPreferences();
		expect(document.documentElement.getAttribute('data-reduced-transparency')).toBeNull();
		expect(document.documentElement.getAttribute('data-contrast')).toBeNull();
		expect(document.documentElement.getAttribute('data-reduced-motion')).toBeNull();
	});

	describe('server-side rendering', () => {
		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('returns a noop when window is undefined', () => {
			vi.stubGlobal('window', undefined);
			const cleanup = syncAccessibilityPreferences();
			expect(typeof cleanup).toBe('function');
			expect(() => cleanup()).not.toThrow();
		});

		it('returns a noop when document is undefined', () => {
			const { mm } = mockMatchMedia({});
			vi.stubGlobal('window', { matchMedia: mm });
			vi.stubGlobal('document', undefined);

			const cleanup = syncAccessibilityPreferences();
			expect(typeof cleanup).toBe('function');
			// The guard must short-circuit before any media query is registered.
			expect(mm).not.toHaveBeenCalled();
		});
	});

	describe('media query registration', () => {
		it('queries exactly the three documented preferences', () => {
			const { mm } = mockMatchMedia({});
			window.matchMedia = mm;

			syncAccessibilityPreferences();

			expect(mm.mock.calls.map(([q]) => q)).toEqual([
				'(prefers-reduced-transparency: reduce)',
				'(prefers-contrast: more)',
				'(prefers-reduced-motion: reduce)'
			]);
		});

		it('writes "true" for boolean preferences and "more" for contrast', () => {
			const { mm } = mockMatchMedia({
				'(prefers-reduced-transparency: reduce)': true,
				'(prefers-contrast: more)': true,
				'(prefers-reduced-motion: reduce)': true
			});
			window.matchMedia = mm;

			syncAccessibilityPreferences();

			expect(document.documentElement.getAttribute('data-reduced-transparency')).toBe('true');
			expect(document.documentElement.getAttribute('data-contrast')).toBe('more');
			expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
		});

		it('removes a stale attribute when the preference is off', () => {
			document.documentElement.setAttribute('data-contrast', 'more');
			const { mm } = mockMatchMedia({ '(prefers-contrast: more)': false });
			window.matchMedia = mm;

			syncAccessibilityPreferences();

			expect(document.documentElement.getAttribute('data-contrast')).toBeNull();
		});
	});

	describe('legacy listener API', () => {
		/** A MediaQueryList exposing only the deprecated addListener/removeListener. */
		function legacyMatchMedia(matches: Record<string, boolean>) {
			const listeners: Record<string, Listener[]> = {};
			const added: string[] = [];
			const removed: string[] = [];

			const mm = vi.fn((query: string) => {
				listeners[query] ??= [];
				return {
					get matches() {
						return matches[query] ?? false;
					},
					media: query,
					onchange: null,
					addListener: (cb: Listener) => {
						added.push(query);
						(listeners[query] ??= []).push(cb);
					},
					removeListener: (cb: Listener) => {
						removed.push(query);
						listeners[query] = (listeners[query] ?? []).filter((fn) => fn !== cb);
					},
					dispatchEvent: () => false
				} as unknown as MediaQueryList;
			});

			return {
				mm,
				added,
				removed,
				trigger(query: string, next: boolean) {
					matches[query] = next;
					for (const cb of listeners[query] ?? []) {
						cb({ matches: next, media: query } as unknown as Event);
					}
				}
			};
		}

		it('falls back to addListener when addEventListener is missing', () => {
			const { mm, added } = legacyMatchMedia({});
			window.matchMedia = mm;

			syncAccessibilityPreferences();

			expect(added).toEqual([
				'(prefers-reduced-transparency: reduce)',
				'(prefers-contrast: more)',
				'(prefers-reduced-motion: reduce)'
			]);
		});

		it('responds to changes through the legacy listener', () => {
			const { mm, trigger } = legacyMatchMedia({
				'(prefers-reduced-motion: reduce)': false
			});
			window.matchMedia = mm;

			syncAccessibilityPreferences();
			trigger('(prefers-reduced-motion: reduce)', true);

			expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
		});

		it('detaches legacy listeners on cleanup', () => {
			const { mm, removed, trigger } = legacyMatchMedia({
				'(prefers-reduced-motion: reduce)': false
			});
			window.matchMedia = mm;

			syncAccessibilityPreferences()();

			expect(removed).toContain('(prefers-reduced-motion: reduce)');
			trigger('(prefers-reduced-motion: reduce)', true);
			expect(document.documentElement.getAttribute('data-reduced-motion')).toBeNull();
		});

		it('still applies the initial state when no listener API exists at all', () => {
			const mm = vi.fn(
				(query: string) =>
					({
						matches: query === '(prefers-contrast: more)',
						media: query,
						onchange: null,
						dispatchEvent: () => false
					}) as unknown as MediaQueryList
			);
			window.matchMedia = mm;

			const cleanup = syncAccessibilityPreferences();

			expect(document.documentElement.getAttribute('data-contrast')).toBe('more');
			expect(() => cleanup()).not.toThrow();
		});
	});
});
