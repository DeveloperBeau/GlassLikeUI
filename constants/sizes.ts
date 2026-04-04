/**
 * Size and spacing design tokens
 * Centralized constants for consistent sizing across components
 */

/** Icon/symbol pixel sizes */
export const ICON_SIZES = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 32
} as const;

/** Corner radius CSS values */
export const CORNER_RADIUS = {
	none: '0',
	sm: 'var(--glass-radius-sm)',
	md: 'var(--glass-radius-md)',
	lg: 'var(--glass-radius-lg)',
	xl: 'var(--glass-radius-xl)',
	full: 'var(--glass-radius-full)'
} as const;

/** Padding CSS values */
export const PADDING = {
	none: '0',
	xs: 'var(--spacing-xs)',
	sm: 'var(--spacing-sm)',
	md: 'var(--spacing-md)',
	lg: 'var(--spacing-lg)',
	xl: 'var(--spacing-xl)'
} as const;

/** Gap/spacing CSS values */
export const SPACING = {
	none: '0',
	xs: 'var(--spacing-xs)',
	sm: 'var(--spacing-sm)',
	md: 'var(--spacing-md)',
	lg: 'var(--spacing-lg)',
	xl: 'var(--spacing-xl)',
	'2xl': 'var(--spacing-2xl)'
} as const;

// Type exports for component props
export type IconSize = keyof typeof ICON_SIZES;
export type CornerRadius = keyof typeof CORNER_RADIUS;
export type Padding = keyof typeof PADDING;
export type Spacing = keyof typeof SPACING;
