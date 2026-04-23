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
