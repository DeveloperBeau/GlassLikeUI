/**
 * Color design tokens
 * Centralized color constants for consistent theming
 */

/** Text color CSS values */
export const TEXT_COLORS = {
	primary: 'var(--color-text)',
	secondary: 'var(--color-text-secondary)',
	tertiary: 'var(--color-text-tertiary)',
	accent: 'var(--color-accent)',
	white: '#ffffff'
} as const;

/** Background color variants */
export const BG_COLORS = {
	primary: 'var(--color-bg)',
	secondary: 'var(--color-bg-secondary)',
	tertiary: 'var(--color-bg-tertiary)',
	accent: 'var(--color-accent)',
	transparent: 'transparent'
} as const;

// Type exports
export type TextColor = keyof typeof TEXT_COLORS;
export type BgColor = keyof typeof BG_COLORS;
