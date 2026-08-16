/**
 * Label styles, mirroring SwiftUI's LabelStyle set.
 *
 * `iconOnly` hides the title *visually* -- the text stays in the DOM so the
 * control keeps its accessible name. Nothing here may drop the title.
 */

export const LABEL_STYLES = ['automatic', 'titleAndIcon', 'iconOnly', 'titleOnly'] as const;

export type LabelStyle = (typeof LABEL_STYLES)[number];

export const DEFAULT_LABEL_STYLE: LabelStyle = 'automatic';

export interface LabelVisibility {
	showIcon: boolean;
	/** Title is rendered but visually hidden (still read by assistive tech). */
	titleHidden: boolean;
}

export function labelVisibility(style: LabelStyle): LabelVisibility {
	return {
		showIcon: style !== 'titleOnly',
		titleHidden: style === 'iconOnly'
	};
}
