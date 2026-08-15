/**
 * Glass surface shapes, mirroring SwiftUI's
 * `glassEffect(_ glass: Glass, in shape: some Shape)`.
 *
 * A shape overrides the corner-radius token entirely -- once you ask for a
 * capsule or a circle, the radius knob no longer applies.
 */

import { CORNER_RADIUS, type CornerRadius } from './sizes';

export const GLASS_SHAPES = ['rect', 'capsule', 'circle'] as const;

export type GlassShape = (typeof GLASS_SHAPES)[number];

export const DEFAULT_GLASS_SHAPE: GlassShape = 'rect';

export interface GlassShapeStyle {
	/** CSS border-radius value. */
	radius: string;
	/** CSS aspect-ratio, or null to leave the box unconstrained. */
	aspectRatio: string | null;
}

/** Radius used when a caller passes a corner-radius key that is not a token. */
const FALLBACK_RADIUS = CORNER_RADIUS.lg;

function rectRadius(cornerRadius: CornerRadius): string {
	// hasOwnProperty, not `?? fallback`: 'toString' resolves to a function.
	return Object.prototype.hasOwnProperty.call(CORNER_RADIUS, cornerRadius)
		? CORNER_RADIUS[cornerRadius]
		: FALLBACK_RADIUS;
}

export function glassShapeStyle(shape: GlassShape, cornerRadius: CornerRadius): GlassShapeStyle {
	if (shape === 'capsule') return { radius: CORNER_RADIUS.full, aspectRatio: null };
	// 50% alone renders an ellipse on a non-square box, so pin the ratio too.
	if (shape === 'circle') return { radius: '50%', aspectRatio: '1 / 1' };
	return { radius: rectRadius(cornerRadius), aspectRatio: null };
}
