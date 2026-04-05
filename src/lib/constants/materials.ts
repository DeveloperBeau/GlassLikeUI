/**
 * Glass material design tokens
 * Configurations for LiquidGlass component materials
 */

export interface MaterialConfig {
	blur: number;
	saturation: number;
	bgOpacity: number;
	borderOpacity: number;
}

/** Glass material presets */
export const MATERIAL_CONFIG: Record<string, MaterialConfig> = {
	ultraThin: {
		blur: 8,
		saturation: 1.2,
		bgOpacity: 0.15,
		borderOpacity: 0.08
	},
	thin: {
		blur: 16,
		saturation: 1.4,
		bgOpacity: 0.25,
		borderOpacity: 0.12
	},
	regular: {
		blur: 24,
		saturation: 1.8,
		bgOpacity: 0.4,
		borderOpacity: 0.18
	},
	thick: {
		blur: 40,
		saturation: 2.0,
		bgOpacity: 0.55,
		borderOpacity: 0.25
	},
	ultraThick: {
		blur: 60,
		saturation: 2.2,
		bgOpacity: 0.7,
		borderOpacity: 0.3
	},
	chrome: {
		blur: 30,
		saturation: 2.5,
		bgOpacity: 0.3,
		borderOpacity: 0.4
	}
} as const;

export type MaterialType = keyof typeof MATERIAL_CONFIG;
