/**
 * Glass variant + intensity design tokens.
 *
 * Two-axis model:
 *   variant   — regular or clear
 *   intensity — subtle, standard, or prominent (modulates blur/displacement/saturation)
 */

export type GlassVariant = 'regular' | 'clear';
export type GlassIntensity = 'subtle' | 'standard' | 'prominent';

export interface IntensityConfig {
	blur: number;
	displacementScale: number;
	saturation: number;
}

export interface VariantConfig {
	opacityDark: number;
	opacityLight: number;
	requiresDimLayer: boolean;
}

export const INTENSITY_CONFIG: Record<GlassIntensity, IntensityConfig> = {
	subtle: { blur: 10, displacementScale: 4, saturation: 1.4 },
	standard: { blur: 20, displacementScale: 8, saturation: 1.8 },
	prominent: { blur: 32, displacementScale: 14, saturation: 2.2 }
} as const;

export const VARIANT_CONFIG: Record<GlassVariant, VariantConfig> = {
	regular: { opacityDark: 0.30, opacityLight: 0.22, requiresDimLayer: false },
	clear: { opacityDark: 0.08, opacityLight: 0.06, requiresDimLayer: true }
} as const;

export const DEFAULT_VARIANT: GlassVariant = 'regular';
export const DEFAULT_INTENSITY: GlassIntensity = 'standard';

/**
 * Button styles, mirroring SwiftUI's ButtonStyle set. `glass` and
 * `glassProminent` correspond to iOS 26's GlassButtonStyle /
 * GlassProminentButtonStyle.
 */
export type ButtonVariant =
	| 'filled'
	| 'outlined'
	| 'plain'
	| 'tinted'
	| 'destructive'
	| 'glass'
	| 'glassProminent';

export interface GlassButtonStyle {
	variant: GlassVariant;
	intensity: GlassIntensity;
	/** Prominent glass carries the accent tint; plain glass stays neutral. */
	tinted: boolean;
}

/** Which glass surface each glass button style renders. */
export const BUTTON_GLASS_STYLE = {
	glass: { variant: 'regular', intensity: 'subtle', tinted: false },
	glassProminent: { variant: 'regular', intensity: 'standard', tinted: true }
} as const satisfies Record<string, GlassButtonStyle>;

export type GlassButtonVariant = keyof typeof BUTTON_GLASS_STYLE;

export interface GlassButtonVars {
	blur: number;
	saturation: number;
	opacity: number;
	tinted: boolean;
}

export function isGlassButtonVariant(variant: string): variant is GlassButtonVariant {
	// hasOwnProperty, not `in`: 'toString' would otherwise pass.
	return Object.prototype.hasOwnProperty.call(BUTTON_GLASS_STYLE, variant);
}

/**
 * Resolve a glass button style into the CSS values Button renders, reading the
 * shared tokens so button glass cannot drift from surface glass. Returns null
 * for the solid variants, which need no backdrop layer.
 */
export function glassButtonVars(variant: ButtonVariant): GlassButtonVars | null {
	if (!isGlassButtonVariant(variant)) return null;
	const style = BUTTON_GLASS_STYLE[variant];
	const intensity = INTENSITY_CONFIG[style.intensity];
	return {
		blur: intensity.blur,
		saturation: intensity.saturation,
		opacity: VARIANT_CONFIG[style.variant].opacityDark,
		tinted: style.tinted
	};
}
