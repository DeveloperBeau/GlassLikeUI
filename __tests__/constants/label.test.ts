import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
	LABEL_STYLES,
	DEFAULT_LABEL_STYLE,
	labelVisibility,
	type LabelStyle
} from '../../src/lib/constants/label';

describe('label', () => {
	describe('LABEL_STYLES', () => {
		it('exposes the four SwiftUI label styles', () => {
			expect(LABEL_STYLES).toEqual(['automatic', 'titleAndIcon', 'iconOnly', 'titleOnly']);
		});

		it('defaults to automatic', () => {
			expect(DEFAULT_LABEL_STYLE).toBe('automatic');
		});

		it('lists the default style', () => {
			expect(LABEL_STYLES).toContain(DEFAULT_LABEL_STYLE);
		});
	});

	describe('labelVisibility', () => {
		it('shows icon and title for automatic', () => {
			expect(labelVisibility('automatic')).toEqual({ showIcon: true, titleHidden: false });
		});

		it('shows icon and title for titleAndIcon', () => {
			expect(labelVisibility('titleAndIcon')).toEqual({ showIcon: true, titleHidden: false });
		});

		it('hides the title visually but keeps the icon for iconOnly', () => {
			expect(labelVisibility('iconOnly')).toEqual({ showIcon: true, titleHidden: true });
		});

		it('drops the icon and shows the title for titleOnly', () => {
			expect(labelVisibility('titleOnly')).toEqual({ showIcon: false, titleHidden: false });
		});

		it('treats automatic and titleAndIcon identically', () => {
			expect(labelVisibility('automatic')).toEqual(labelVisibility('titleAndIcon'));
		});

		it('falls back to the automatic layout for an unknown style', () => {
			expect(labelVisibility('sideways' as LabelStyle)).toEqual({
				showIcon: true,
				titleHidden: false
			});
		});

		it('ignores inherited Object keys', () => {
			for (const key of ['toString', 'constructor', '__proto__']) {
				expect(labelVisibility(key as LabelStyle)).toEqual({
					showIcon: true,
					titleHidden: false
				});
			}
		});

		it('never throws', () => {
			expect(() => labelVisibility(undefined as unknown as LabelStyle)).not.toThrow();
		});

		describe('fuzz', () => {
			const style = fc.constantFrom<LabelStyle>(...LABEL_STYLES);

			// FALSE NEGATIVE validation -- the accessibility invariant this function
			// exists to protect: `titleHidden` means visually hidden, never removed.
			// No style may ever instruct the component to drop the title outright,
			// or an icon-only control loses its accessible name.
			it('never reports a state that would remove the title from the DOM', () => {
				fc.assert(
					fc.property(style, (s) => {
						const v = labelVisibility(s);
						expect(Object.keys(v).sort()).toEqual(['showIcon', 'titleHidden']);
						expect(typeof v.titleHidden).toBe('boolean');
					}),
					{ numRuns: 500 }
				);
			});

			// FALSE POSITIVE validation: a hidden title with no icon would render an
			// empty, unreachable control.
			it('never hides the title while also hiding the icon', () => {
				fc.assert(
					fc.property(fc.string(), (s) => {
						const v = labelVisibility(s as LabelStyle);
						expect(v.titleHidden && !v.showIcon).toBe(false);
					}),
					{ numRuns: 1000 }
				);
			});

			it('only ever hides the title for iconOnly', () => {
				fc.assert(
					fc.property(fc.string(), (s) => {
						expect(labelVisibility(s as LabelStyle).titleHidden).toBe(s === 'iconOnly');
					}),
					{ numRuns: 1000 }
				);
			});

			it('only ever drops the icon for titleOnly', () => {
				fc.assert(
					fc.property(fc.string(), (s) => {
						expect(labelVisibility(s as LabelStyle).showIcon).toBe(s !== 'titleOnly');
					}),
					{ numRuns: 1000 }
				);
			});

			it('returns booleans, never truthy strings or numbers', () => {
				fc.assert(
					fc.property(fc.string(), (s) => {
						const v = labelVisibility(s as LabelStyle);
						expect(typeof v.showIcon).toBe('boolean');
						expect(typeof v.titleHidden).toBe('boolean');
					}),
					{ numRuns: 500 }
				);
			});
		});
	});
});
