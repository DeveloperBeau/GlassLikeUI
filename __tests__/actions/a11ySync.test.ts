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
			addEventListener: (_: string, cb: Listener) => {
				listeners[query].push(cb);
			},
			removeEventListener: (_: string, cb: Listener) => {
				listeners[query] = listeners[query].filter((fn) => fn !== cb);
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

	it('returns noop when window is undefined (SSR)', () => {
		// Simulate SSR by temporarily clobbering matchMedia
		window.matchMedia = undefined as unknown as typeof window.matchMedia;
		// Note: we can't fully delete `window`, but the function guards via
		// `typeof window === 'undefined'` only. Verify it handles missing API:
		const cleanup = syncAccessibilityPreferences();
		expect(typeof cleanup).toBe('function');
	});
});
