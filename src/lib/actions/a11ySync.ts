/**
 * Sync browser accessibility preferences (reduced transparency, more contrast,
 * reduced motion) onto data-attributes on the document root. Call once at app
 * startup so the library's CSS fallbacks activate in browsers that don't
 * support the matching @media queries natively.
 *
 * Returns a cleanup function. Call it to detach the listeners.
 */

interface Mapping {
	media: string;
	attr: string;
	value?: string;
}

const MAPPINGS: Mapping[] = [
	{ media: '(prefers-reduced-transparency: reduce)', attr: 'data-reduced-transparency' },
	{ media: '(prefers-contrast: more)', attr: 'data-contrast', value: 'more' },
	{ media: '(prefers-reduced-motion: reduce)', attr: 'data-reduced-motion' }
];

export function syncAccessibilityPreferences(): () => void {
	if (
		typeof window === 'undefined' ||
		typeof document === 'undefined' ||
		typeof window.matchMedia !== 'function'
	) {
		return () => {};
	}

	const cleanups = MAPPINGS.map(({ media, attr, value }) => {
		const mql = window.matchMedia(media);

		const apply = () => {
			if (mql.matches) {
				document.documentElement.setAttribute(attr, value ?? 'true');
			} else {
				document.documentElement.removeAttribute(attr);
			}
		};

		apply();

		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', apply);
			return () => mql.removeEventListener('change', apply);
		}

		// Legacy Safari support
		if (typeof mql.addListener === 'function') {
			mql.addListener(apply);
			return () => mql.removeListener(apply);
		}

		return () => {};
	});

	return () => {
		for (const fn of cleanups) fn();
	};
}
